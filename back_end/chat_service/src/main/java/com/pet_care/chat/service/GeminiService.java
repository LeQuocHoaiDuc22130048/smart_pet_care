package com.pet_care.chat.service;

import com.pet_care.chat.configuration.GeminiConfig;
import com.pet_care.chat.dto.request.ChatMessage;
import com.pet_care.chat.dto.request.ChatRequest;
import com.pet_care.chat.dto.request.UserContext;
import com.pet_care.chat.dto.response.BotReply;
import com.pet_care.chat.dto.response.ChatResponse;
import com.pet_care.chat.dto.response.SuggestionCard;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;
    private final PetCareKnowledgeService petCareKnowledgeService;
    private final ProductSuggestionService productSuggestionService;
    private final ObjectMapper objectMapper;

    /**
     * System prompt — định nghĩa vai trò và kiến thức của bot.
     */
    private static final String SYSTEM_PROMPT = """
            Bạn là trợ lý AI của PetCare Smart — một nền tảng thương mại điện tử chuyên về thú cưng tại Việt Nam.
            
            THÔNG TIN VỀ PETCARE SMART:
            - Bán các sản phẩm: thức ăn, thuốc, phụ kiện, đồ chơi cho chó, mèo và các thú cưng khác
            - Dịch vụ: Tắm & cắt lông, Khám sức khỏe, Tiêm phòng, Huấn luyện, Lưu trú thú cưng
            - Hotline hỗ trợ: (84) 702 500 551 — mở cửa 7:00–18:00 hàng ngày
            - Website: petcaresmart.vn
            - Thanh toán: VNPay, COD
            - Giao hàng toàn quốc, miễn phí đơn từ 300.000đ
            
            NGUYÊN TẮC TRẢ LỜI:
            1. Luôn trả lời bằng tiếng Việt, thân thiện, gần gũi như người bạn đồng hành
            2. Xưng hô: gọi khách là "bạn", tự xưng là "mình" hoặc "PetCare"
            3. Câu trả lời rõ ràng, có thể dùng xuống dòng ngắn khi tư vấn sức khỏe
            4. Nếu không biết thông tin cụ thể (giá, tồn kho), hướng dẫn user xem trang sản phẩm hoặc gọi hotline
            5. KHÔNG bịa đặt thông tin về sản phẩm, giá cả cụ thể
            6. Nếu câu hỏi không liên quan đến thú cưng/PetCare, lịch sự từ chối và hướng về chủ đề chính

            ĐỊNH DẠNG BẮT BUỘC:
            Luôn trả về JSON hợp lệ, không markdown, không text ngoài JSON:
            {
              "text": "câu trả lời thân thiện, có đánh giá mức độ khẩn cấp nếu hỏi về sức khỏe",
              "suggestions": []
            }

            Khi hỏi triệu chứng/bệnh:
            - Nếu có KIẾN THỨC PHÙ HỢP TỪ DATASET PETCARE, bắt buộc dùng đúng ý "Lời khuyên" và "Chăm sóc" từ dataset
            - Không chỉ nói "đưa đi thú y"; phải nêu biện pháp chăm sóc/sơ cứu tại nhà dựa trên dataset nếu có
            - Trình bày theo thứ tự: nhận định ngắn -> biện pháp tại nhà -> khi nào cần đi thú y -> lời mời dùng sản phẩm/dịch vụ PetCare
            - Nêu đây chỉ là tư vấn sơ bộ, không thay thế bác sĩ thú y
            - Nếu có dấu hiệu nguy hiểm như khó thở, co giật, xuất huyết, bỏ ăn kéo dài, liệt, nôn/tiêu chảy liên tục: khuyên đi thú y ngay
            - Gợi ý dịch vụ PetCare phù hợp bằng chữ trong text: Khám sức khỏe, Tiêm phòng, Tắm & cắt lông, Huấn luyện, Lưu trú thú cưng
            - Nếu phù hợp, mời khách ghé cửa hàng PetCare để xem sản phẩm chăm sóc, vệ sinh, hỗ trợ da/lông; không tự nêu giá nếu không có dữ liệu
            """;

    /**
     * Gọi Gemini API và trả về câu trả lời.
     */
    public ChatResponse chat(ChatRequest request) {
        if (isShoppingRequest(request.getMessage())) {
            return buildShoppingResponse(request);
        }

        try {
            String url = geminiConfig.getApiUrl() + "?key=" + geminiConfig.getApiKey();

            // Build contents array (lịch sử + tin nhắn hiện tại)
            List<Map<String, Object>> contents = buildContents(request);

            // Build request body
            Map<String, Object> body = new HashMap<>();
            body.put("contents", contents);
            body.put("systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", buildSystemPrompt(request)))
            ));
            body.put("generationConfig", Map.of(
                    "temperature", 0.25,
                    "maxOutputTokens", 900,
                    "topP", 0.9
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            String rawReply = extractReply(response.getBody());
            BotReply parsed = parseBotReply(rawReply);
            if (looksLikeBrokenJson(parsed.getText())) {
                parsed.setText(petCareKnowledgeService.buildDatasetAnswer(request.getMessage()));
            }
            enrichSuggestions(request, parsed);
            return ChatResponse.builder()
                    .reply(parsed.getText())
                    .parsed(parsed)
                    .build();

        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage(), e);
            String relevantKnowledge = petCareKnowledgeService.buildRelevantContext(request.getMessage());
            List<SuggestionCard> suggestions = productSuggestionService.suggestProducts(request.getMessage(), relevantKnowledge);
            BotReply fallback = BotReply.builder()
                    .text(petCareKnowledgeService.buildDatasetAnswer(request.getMessage()))
                    .suggestions(suggestions)
                    .build();
            return ChatResponse.builder()
                    .reply(fallback.getText())
                    .parsed(fallback)
                    .build();
        }
    }

    private ChatResponse buildShoppingResponse(ChatRequest request) {
        List<SuggestionCard> suggestions = productSuggestionService.suggestProducts(request.getMessage(), "");
        String text = suggestions.isEmpty()
                ? "Mình sẽ giúp bạn tìm sản phẩm phù hợp. Hiện mình chưa thấy sản phẩm khớp rõ với yêu cầu này, bạn có thể thử nói cụ thể hơn như loại thú cưng, độ tuổi hoặc hương vị mong muốn nhé."
                : "Mình gợi ý một vài sản phẩm phù hợp với nhu cầu của bạn. Bạn có thể bấm vào từng sản phẩm để xem chi tiết, giá và tình trạng còn hàng nhé.";

        BotReply reply = BotReply.builder()
                .text(text)
                .suggestions(suggestions)
                .build();
        return ChatResponse.builder()
                .reply(reply.getText())
                .parsed(reply)
                .build();
    }

    /**
     * Xây dựng system prompt có thêm context của user nếu có.
     */
    private String buildSystemPrompt(ChatRequest request) {
        UserContext ctx = request.getUserContext();
        StringBuilder sb = new StringBuilder(SYSTEM_PROMPT);
        String relevantKnowledge = petCareKnowledgeService.buildRelevantContext(request.getMessage());
        if (!relevantKnowledge.isBlank()) {
            sb.append(relevantKnowledge);
        }

        if (ctx == null) return sb.toString();

        sb.append("\n\nTHÔNG TIN KHÁCH HÀNG HIỆN TẠI:\n");

        if (ctx.getUserName() != null && !ctx.getUserName().isBlank()) {
            sb.append("- Tên: ").append(ctx.getUserName()).append("\n");
        }
        if (ctx.getPetNames() != null && !ctx.getPetNames().isEmpty()) {
            sb.append("- Thú cưng: ").append(String.join(", ", ctx.getPetNames())).append("\n");
        }
        if (ctx.getTotalOrders() != null) {
            sb.append("- Tổng đơn hàng: ").append(ctx.getTotalOrders()).append("\n");
        }
        if (ctx.getLastOrderStatus() != null && !ctx.getLastOrderStatus().isBlank()) {
            sb.append("- Trạng thái đơn gần nhất: ").append(ctx.getLastOrderStatus()).append("\n");
        }
        sb.append("Hãy cá nhân hóa câu trả lời dựa trên thông tin này khi phù hợp.");

        return sb.toString();
    }

    private void enrichSuggestions(ChatRequest request, BotReply parsed) {
        if (parsed.getSuggestions() != null && !parsed.getSuggestions().isEmpty()) {
            return;
        }

        String relevantKnowledge = petCareKnowledgeService.buildRelevantContext(request.getMessage());
        List<SuggestionCard> suggestions = productSuggestionService.suggestProducts(request.getMessage(), relevantKnowledge);
        parsed.setSuggestions(suggestions);
    }

    /**
     * Chuyển lịch sử chat + tin nhắn hiện tại thành format Gemini yêu cầu.
     */
    private List<Map<String, Object>> buildContents(ChatRequest request) {
        List<Map<String, Object>> contents = new ArrayList<>();

        // Thêm lịch sử (tối đa 10 tin nhắn gần nhất để tránh vượt token limit)
        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            List<ChatMessage> history = request.getHistory();
            int start = Math.max(0, history.size() - 10);
            for (int i = start; i < history.size(); i++) {
                ChatMessage msg = history.get(i);
                contents.add(Map.of(
                        "role", msg.getRole(),
                        "parts", List.of(Map.of("text", msg.getText()))
                ));
            }
        }

        // Thêm tin nhắn hiện tại
        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", request.getMessage()))
        ));

        return contents;
    }

    /**
     * Trích xuất text từ response của Gemini.
     */
    @SuppressWarnings("unchecked")
    private String extractReply(Map<?, ?> responseBody) {
        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                return "{\"text\":\"Mình chưa hiểu câu hỏi của bạn. Bạn có thể nói rõ hơn không?\",\"suggestions\":[]}";
            }
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return "{\"text\":\"Mình chưa hiểu câu hỏi của bạn. Bạn có thể nói rõ hơn không?\",\"suggestions\":[]}";
        }
    }

    private BotReply parseBotReply(String rawReply) {
        String cleaned = cleanJsonText(rawReply);
        try {
            JsonNode root = objectMapper.readTree(cleaned);
            String text = root.path("text").asText(null);
            if (text != null && !text.isBlank()) {
                return BotReply.builder()
                        .text(text)
                        .suggestions(parseSuggestions(root.path("suggestions")))
                        .build();
            }
        } catch (Exception e) {
            log.debug("Gemini did not return valid JSON, using raw text: {}", e.getMessage());
        }

        return BotReply.builder()
                .text(rawReply == null || rawReply.isBlank()
                        ? "Mình chưa hiểu câu hỏi của bạn. Bạn có thể nói rõ hơn không?"
                        : rawReply.trim())
                .suggestions(List.of())
                .build();
    }

    private List<SuggestionCard> parseSuggestions(JsonNode suggestionsNode) {
        if (!suggestionsNode.isArray()) {
            return List.of();
        }

        List<SuggestionCard> suggestions = new ArrayList<>();
        for (JsonNode item : suggestionsNode) {
            String type = item.path("type").asText("");
            String id = item.path("id").asText("");
            String name = item.path("name").asText("");
            if (type.isBlank() || id.isBlank() || name.isBlank()) {
                continue;
            }
            suggestions.add(SuggestionCard.builder()
                    .type(type)
                    .id(id)
                    .name(name)
                    .price(item.path("price").isNumber() ? item.path("price").asInt() : 0)
                    .imageUrl(item.path("imageUrl").asText(null))
                    .link(item.path("link").asText(""))
                    .description(item.path("description").asText(null))
                    .durationMinutes(item.path("durationMinutes").isNumber() ? item.path("durationMinutes").asInt() : null)
                    .build());
        }
        return suggestions;
    }

    private String cleanJsonText(String rawReply) {
        if (rawReply == null) return "{}";
        String cleaned = rawReply.trim()
                .replaceFirst("(?i)^```json\\s*", "")
                .replaceFirst("(?i)^```\\s*", "")
                .replaceFirst("\\s*```$", "")
                .trim();
        int jsonStart = cleaned.indexOf('{');
        int jsonEnd = cleaned.lastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
            return cleaned.substring(jsonStart, jsonEnd + 1);
        }
        return cleaned;
    }

    private boolean looksLikeBrokenJson(String value) {
        if (value == null) return false;
        String trimmed = value.trim();
        return trimmed.startsWith("{") || trimmed.startsWith("\"text\"") || trimmed.contains("\"suggestions\"");
    }

    private boolean isShoppingRequest(String message) {
        if (message == null || message.isBlank()) {
            return false;
        }

        String value = normalize(message);
        boolean hasShoppingVerb = containsAny(value,
                "can", "mua", "tim", "goi y", "tu van", "ban", "co", "co khong", "dat");
        boolean hasProductWord = containsAny(value,
                "san pham", "banh thuong", "snack", "thuc an", "hat", "pate", "sua tam",
                "do choi", "phu kien", "vong co", "day deo", "balo", "tui", "tui dung",
                "chuong", "khay", "cat ve sinh", "thuoc", "men", "vitamin");
        return hasShoppingVerb && hasProductWord;
    }

    private boolean containsAny(String value, String... terms) {
        for (String term : terms) {
            if (value.contains(normalize(term))) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String value) {
        String normalized = java.text.Normalizer.normalize(value.toLowerCase(Locale.ROOT), java.text.Normalizer.Form.NFD);
        normalized = java.util.regex.Pattern.compile("\\p{M}+").matcher(normalized).replaceAll("");
        return normalized.replace('đ', 'd');
    }
}
