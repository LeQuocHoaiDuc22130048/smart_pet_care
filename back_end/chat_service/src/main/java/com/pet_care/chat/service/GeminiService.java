package com.pet_care.chat.service;

import com.pet_care.chat.configuration.GeminiConfig;
import com.pet_care.chat.dto.request.ChatMessage;
import com.pet_care.chat.dto.request.ChatRequest;
import com.pet_care.chat.dto.request.UserContext;
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
            3. Câu trả lời ngắn gọn, súc tích (tối đa 3-4 câu trừ khi cần giải thích chi tiết)
            4. Dùng emoji phù hợp để tạo cảm giác thân thiện 🐾
            5. Nếu không biết thông tin cụ thể (giá, tồn kho), hướng dẫn user xem trang sản phẩm hoặc gọi hotline
            6. KHÔNG bịa đặt thông tin về sản phẩm, giá cả cụ thể
            7. Nếu câu hỏi không liên quan đến thú cưng/PetCare, lịch sự từ chối và hướng về chủ đề chính
            """;

    /**
     * Gọi Gemini API và trả về câu trả lời.
     */
    public String chat(ChatRequest request) {
        try {
            String url = geminiConfig.getApiUrl() + "?key=" + geminiConfig.getApiKey();

            // Build contents array (lịch sử + tin nhắn hiện tại)
            List<Map<String, Object>> contents = buildContents(request);

            // Build request body
            Map<String, Object> body = new HashMap<>();
            body.put("contents", contents);
            body.put("systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", buildSystemPrompt(request.getUserContext())))
            ));
            body.put("generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 512,
                    "topP", 0.9
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

            return extractReply(response.getBody());

        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage(), e);
            return "Xin lỗi bạn, mình đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc gọi hotline (84) 702 500 551 để được hỗ trợ nhé! 🙏";
        }
    }

    /**
     * Xây dựng system prompt có thêm context của user nếu có.
     */
    private String buildSystemPrompt(UserContext ctx) {
        if (ctx == null) return SYSTEM_PROMPT;

        StringBuilder sb = new StringBuilder(SYSTEM_PROMPT);
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
                return "Mình chưa hiểu câu hỏi của bạn. Bạn có thể nói rõ hơn không? 😊";
            }
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return "Mình chưa hiểu câu hỏi của bạn. Bạn có thể nói rõ hơn không? 😊";
        }
    }
}
