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
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiService {

    private static final Duration GEMINI_QUOTA_BACKOFF = Duration.ofMinutes(2);

    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;
    private final PetCareKnowledgeService petCareKnowledgeService;
    private final ProductSuggestionService productSuggestionService;
    private final ObjectMapper objectMapper;
    private volatile Instant geminiBackoffUntil = Instant.MIN;

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
            - Nếu có phần KIẾN THỨC PHÙ HỢP trong system prompt, bắt buộc dùng đúng ý "Lời khuyên" và "Chăm sóc" từ phần đó
            - Không nhắc tới dataset, dữ liệu nội bộ, hệ thống tra cứu hoặc quy trình tìm kiếm trong câu trả lời cho khách
            - Không chỉ nói "đưa đi thú y"; phải nêu biện pháp chăm sóc/sơ cứu tại nhà nếu có thông tin phù hợp
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
        Optional<ChatResponse> localConversation = buildLocalConversationResponse(request);
        if (localConversation.isPresent()) {
            return localConversation.get();
        }

        if (isShoppingRequest(request.getMessage())) {
            return buildShoppingResponse(request);
        }

        if (!geminiConfig.hasApiKey()) {
            return buildFallbackResponse(request);
        }

        if (isGeminiBackoffActive()) {
            return buildAiUnavailableResponse(request);
        }

        try {
            log.debug("Calling Gemini chat model {} for message: {}", geminiConfig.getModel(), request.getMessage());
            String rawReply = callGemini(request);
            BotReply parsed = parseBotReply(rawReply);
            if (isInvalidBotReply(parsed) || looksLikeBrokenJson(parsed.getText())) {
                parsed.setText(petCareKnowledgeService.buildDatasetAnswer(request.getMessage()));
                parsed.setSuggestions(List.of());
            }
            enrichSuggestions(request, parsed);
            return ChatResponse.builder()
                    .reply(parsed.getText())
                    .parsed(parsed)
                    .build();
        } catch (HttpClientErrorException.TooManyRequests e) {
            geminiBackoffUntil = Instant.now().plus(GEMINI_QUOTA_BACKOFF);
            log.warn("Gemini quota exceeded for chat. Falling back to dataset answers until {}.", geminiBackoffUntil);
            return buildAiUnavailableResponse(request);
        } catch (Exception e) {
            if (isQuotaException(e)) {
                geminiBackoffUntil = Instant.now().plus(GEMINI_QUOTA_BACKOFF);
                log.warn("Gemini quota exceeded for chat. Falling back to dataset answers until {}.", geminiBackoffUntil);
                return buildAiUnavailableResponse(request);
            } else {
                log.error("Gemini API error: {}", e.getMessage(), e);
                return buildAiUnavailableResponse(request);
            }
        }
    }

    private String callGemini(ChatRequest request) {
        String url = geminiConfig.getApiUrl() + "?key=" + geminiConfig.getApiKey();

        Map<String, Object> body = new HashMap<>();
        body.put("contents", buildContents(request));
        body.put("systemInstruction", Map.of(
                "parts", List.of(Map.of("text", buildSystemPrompt(request)))
        ));
        body.put("generationConfig", Map.of(
                "temperature", 0.25,
                "maxOutputTokens", 900,
                "topP", 0.9,
                "responseMimeType", "application/json"
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
        );
        return extractReply(response.getBody());
    }

    private boolean isGeminiBackoffActive() {
        return Instant.now().isBefore(geminiBackoffUntil);
    }

    private ChatResponse buildFallbackResponse(ChatRequest request) {
        Optional<ChatResponse> localConversation = buildLocalConversationResponse(request);
        if (localConversation.isPresent()) {
            return localConversation.get();
        }

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

    private ChatResponse buildAiUnavailableResponse(ChatRequest request) {
        Optional<ChatResponse> localConversation = buildLocalConversationResponse(request);
        if (localConversation.isPresent()) {
            return localConversation.get();
        }

        if (isPetCareInfoRequest(request.getMessage())) {
            return simpleResponse("Hiện Gemini đang tạm thời không phản hồi do giới hạn API free-tier. PetCare Smart là nền tảng hỗ trợ mua sắm và chăm sóc thú cưng, có sản phẩm cho chó/mèo/vật nuôi, dịch vụ Khám sức khỏe, Tiêm phòng, Tắm & cắt lông, Huấn luyện và Lưu trú thú cưng. Bạn vẫn có thể hỏi mình về sản phẩm hoặc mô tả triệu chứng, mình sẽ tra dữ liệu nội bộ để hỗ trợ tạm thời.");
        }

        return buildFallbackResponse(request);
    }

    private Optional<ChatResponse> buildLocalConversationResponse(ChatRequest request) {
        String message = request == null ? "" : request.getMessage();
        String value = normalizeForIntent(message);
        if (value.isBlank()) {
            return Optional.empty();
        }

        if (isGreeting(value)) {
            return Optional.of(simpleResponse("Xin chào bạn, mình là trợ lý PetCare Smart. Mình có thể tư vấn chăm sóc chó, mèo và vật nuôi, hỗ trợ tìm sản phẩm phù hợp hoặc phân tích hình ảnh khi bạn gửi ảnh lên."));
        }

        if (isThanks(value)) {
            return Optional.of(simpleResponse("Không có gì đâu bạn. Khi cần tư vấn thêm về sức khỏe, thức ăn, sản phẩm hoặc dịch vụ cho thú cưng, bạn cứ nhắn mình nhé."));
        }

        if (isGoodbye(value)) {
            return Optional.of(simpleResponse("Tạm biệt bạn. Chúc bạn và bé luôn khỏe, khi cần PetCare hỗ trợ thì quay lại nhắn mình nhé."));
        }

        if (asksBotCapabilities(value)) {
            return Optional.of(simpleResponse("Mình có thể hỗ trợ tư vấn chăm sóc thú cưng, gợi ý sản phẩm phù hợp và phân tích ảnh để đưa ra nhận định tham khảo. Nếu bé có triệu chứng cụ thể, bạn mô tả thêm loài, tuổi, biểu hiện và thời gian bị nhé."));
        }

        return Optional.empty();
    }

    private ChatResponse simpleResponse(String text) {
        BotReply reply = BotReply.builder()
                .text(text)
                .suggestions(List.of())
                .build();
        return ChatResponse.builder()
                .reply(text)
                .parsed(reply)
                .build();
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
                        "role", toGeminiRole(msg.getRole()),
                        "parts", List.of(Map.of("text", msg.getText() == null ? "" : msg.getText()))
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

    private String toGeminiRole(String role) {
        if ("assistant".equalsIgnoreCase(role) || "model".equalsIgnoreCase(role)) {
            return "model";
        }
        return "user";
    }

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

    private boolean isQuotaException(Exception e) {
        String text = (e.getMessage() == null ? "" : e.getMessage()).toLowerCase(Locale.ROOT);
        return text.contains("429")
                || text.contains("quota")
                || text.contains("rate limit")
                || text.contains("too many requests");
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
            log.debug("Gemini did not return valid JSON, falling back to dataset answer: {}", e.getMessage());
        }

        return BotReply.builder()
                .text("")
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

    private boolean isInvalidBotReply(BotReply reply) {
        if (reply == null || reply.getText() == null || reply.getText().isBlank()) {
            return true;
        }
        String text = reply.getText().trim();
        return text.length() < 12
                || text.equals("{}")
                || text.equals("[]")
                || text.equalsIgnoreCase("null")
                || text.endsWith("\":")
                || text.endsWith(",");
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

    private boolean isGreeting(String value) {
        return value.matches("^(xin )?(chao|hello|hi|hey|alo|aloo)( ban| shop| petcare| ad| admin)?$")
                || value.matches("^(chao buoi sang|chao buoi trua|chao buoi chieu|chao buoi toi)$");
    }

    private boolean isThanks(String value) {
        return value.matches("^(cam on|cam on ban|thanks|thank you|thank|ok cam on|vang cam on)$");
    }

    private boolean isGoodbye(String value) {
        return value.matches("^(tam biet|bye|goodbye|hen gap lai|chao tam biet)$");
    }

    private boolean asksBotCapabilities(String value) {
        return value.matches("^(ban co the lam gi|ban lam duoc gi|petcare co the lam gi|tro ly co the lam gi)$")
                || value.contains("huong dan su dung");
    }

    private boolean isPetCareInfoRequest(String message) {
        String value = normalizeForIntent(message);
        return containsAny(value,
                "gioi thieu", "petcare smart", "petcare", "cua hang", "dich vu",
                "nen tang", "website", "hotline", "thong tin");
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

    private String normalizeForIntent(String value) {
        return normalize(value == null ? "" : value)
                .replaceAll("[^a-z0-9 ]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
