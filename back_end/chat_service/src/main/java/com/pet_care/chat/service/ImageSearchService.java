package com.pet_care.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.chat.configuration.GeminiConfig;
import com.pet_care.chat.dto.response.DiseaseMatch;
import com.pet_care.chat.dto.response.ImageAiAnalysisResponse;
import com.pet_care.chat.dto.response.ImageAiSearchResult;
import com.pet_care.chat.dto.response.ImageSearchResponse;
import com.pet_care.chat.dto.response.SuggestionCard;
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
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageSearchService {

    private static final String DISCLAIMER = "Kết quả chỉ mang tính tham khảo và có thể sai sót. Nếu vật nuôi có dấu hiệu bất thường, hãy liên hệ bác sĩ thú y hoặc hotline PetCare (84) 702 500 551.";
    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
    private static final Duration GEMINI_QUOTA_BACKOFF = Duration.ofMinutes(2);

    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ProductSuggestionService productSuggestionService;
    private final ServiceSuggestionService serviceSuggestionService;
    private final ImageAiClientService imageAiClientService;
    private volatile Instant geminiBackoffUntil = Instant.MIN;

    public ImageSearchResponse searchByImage(MultipartFile image) {
        validateImage(image);

        if (!geminiConfig.hasApiKey() || isGeminiBackoffActive()) {
            return fallbackResponse(image);
        }

        try {
            String rawReply = callGemini(image);
            ImageSearchResponse analysis = parseResponse(rawReply);
            analysis = refineWithLocalImageAnalysis(image, analysis);
            populateSearchGroups(image, analysis);
            return analysis;
        } catch (Exception e) {
            if (isQuotaException(e)) {
                geminiBackoffUntil = Instant.now().plus(GEMINI_QUOTA_BACKOFF);
                log.warn("Gemini quota exceeded for image search. Falling back to local image analysis until {}.", geminiBackoffUntil);
            } else {
                log.error("Image search failed: {}", e.getMessage(), e);
            }
            return fallbackResponse(image);
        }
    }

    private boolean isGeminiBackoffActive() {
        return Instant.now().isBefore(geminiBackoffUntil);
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn một ảnh để tìm kiếm.");
        }

        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Tệp tải lên phải là hình ảnh.");
        }
    }

    private String callGemini(MultipartFile image) throws Exception {
        String url = geminiConfig.getApiUrl() + "?key=" + geminiConfig.getApiKey();
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        String mimeType = image.getContentType() == null ? MediaType.IMAGE_JPEG_VALUE : image.getContentType();

        Map<String, Object> textPart = Map.of("text", """
                Hãy phân tích ảnh người dùng gửi trong ngữ cảnh chăm sóc vật nuôi, gồm chó, mèo và gia súc như bò, trâu, dê, heo.
                Trước tiên hãy nhận diện loài vật hoặc loại sản phẩm trong ảnh. Nếu ảnh là vật nuôi đang có dấu hiệu bất thường,
                hãy nêu nhận định cụ thể dựa trên dấu hiệu nhìn thấy được và các bước xử lý tham khảo phù hợp với loài đó.
                Với gia súc, nếu thấy nhiều nốt sần/cục trên da, vết loét, sưng, bỏ ăn, yếu hoặc dấu hiệu bệnh truyền nhiễm,
                phải ưu tiên khuyến cáo cách ly, vệ sinh/khử trùng chuồng trại, kiểm soát côn trùng truyền bệnh và liên hệ thú y.
                Nếu ảnh là bò/trâu/dê/heo hoặc vật nuôi trang trại, tuyệt đối không gọi là chó/mèo hoặc thú cưng; hãy dùng đúng ngữ cảnh gia súc.
                Nếu ảnh là bò/gia súc có nhiều nốt sần trên da, phải nêu rõ "gia súc có nhiều nốt sần/cục trên da" thay vì trả lời chung là da/lông/vệ sinh.
                Nếu ảnh là heo/lợn có mảng đỏ, tím đỏ, xuất huyết trên da hoặc nghi dịch tả heo châu Phi, phải nhận diện là heo/lợn và khuyến cáo cách ly, không vận chuyển/giết mổ, sát trùng chuồng trại và báo thú y/cơ quan chuyên môn.
                Không tự giới hạn vào chó/mèo. Không trả lời chung chung kiểu "da, lông hoặc vệ sinh" nếu ảnh có dấu hiệu bệnh cụ thể.
                Không chẩn đoán chắc chắn chỉ từ ảnh; dùng cách nói "có thể liên quan", "gợi ý", "cần thú y kiểm tra".
                Nếu ảnh là sản phẩm/phụ kiện/thức ăn, nhận diện loại sản phẩm và nhu cầu mua sắm liên quan.
                Nếu ảnh có dấu hiệu bệnh hoặc triệu chứng, hãy trả thêm diseaseMatches để phục vụ chức năng tìm kiếm bệnh theo hình ảnh.
                Luôn trả về JSON hợp lệ, không markdown, không text ngoài JSON:
                {
                  "summary": "nhận định cụ thể, tự nhiên như một câu trả lời tư vấn ngắn",
                  "observations": ["điểm quan sát được từ ảnh, nêu cụ thể theo loài vật"],
                  "diseaseMatches": [{"name": "tên bệnh/tình trạng nghi ngờ", "description": "vì sao ảnh gợi ý tình trạng này", "matchedLabel": "nhãn ngắn không dấu hoặc tiếng Anh nếu có", "confidence": 0.0}],
                  "careTips": ["biện pháp hoặc thông tin tham khảo, ưu tiên các bước xử lý thực tế"],
                  "warnings": ["dấu hiệu cần gọi thú y, cách ly hoặc xử lý khẩn cấp"],
                  "searchKeywords": ["từ khóa sản phẩm cần gợi ý theo careTips, ví dụ: thức ăn hạt, pate, men tiêu hóa, sữa tắm, vệ sinh tai"]
                }
                """);
        Map<String, Object> imagePart = Map.of(
                "inline_data", Map.of(
                        "mime_type", mimeType,
                        "data", base64Image
                )
        );

        Map<String, Object> body = new HashMap<>();
        body.put("contents", List.of(Map.of(
                "role", "user",
                "parts", List.of(textPart, imagePart)
        )));
        body.put("generationConfig", Map.of(
                "temperature", 0.2,
                "maxOutputTokens", 1800,
                "topP", 0.9,
                "responseMimeType", "application/json"
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        log.debug("Calling Gemini vision model {} for image search.", geminiConfig.getModel());
        ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
        );
        return extractReply(response.getBody());
    }

    @SuppressWarnings("unchecked")
    private String extractReply(Map<?, ?> responseBody) {
        try {
            if (responseBody == null) {
                throw new IllegalStateException("Gemini returned empty response");
            }
            if (responseBody.containsKey("error")) {
                throw new IllegalStateException("Gemini error: " + responseBody.get("error"));
            }
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                throw new IllegalStateException("Gemini returned no candidates: " + responseBody);
            }
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Gemini image response: " + e.getMessage(), e);
        }
    }

    private boolean isQuotaException(Exception e) {
        String text = (e.getMessage() == null ? "" : e.getMessage()).toLowerCase(Locale.ROOT);
        return text.contains("429")
                || text.contains("quota")
                || text.contains("rate limit")
                || text.contains("too many requests");
    }

    private ImageSearchResponse parseResponse(String rawReply) {
        try {
            JsonNode root = objectMapper.readTree(cleanJsonText(rawReply));
            return ImageSearchResponse.builder()
                    .summary(textOrDefault(root.path("summary"), "Mình đã phân tích ảnh và chuẩn bị một số thông tin tham khảo cho bạn."))
                    .observations(readStringList(root.path("observations")))
                    .diseaseMatches(readDiseaseMatches(root.path("diseaseMatches")))
                    .careTips(readStringList(root.path("careTips")))
                    .warnings(readStringList(root.path("warnings")))
                    .searchKeywords(readStringList(root.path("searchKeywords")))
                    .disclaimer(DISCLAIMER)
                    .productSuggestions(List.of())
                    .serviceSuggestions(List.of())
                    .suggestions(List.of())
                    .build();
        } catch (Exception e) {
            log.warn("Gemini image response is not valid JSON: {}", e.getMessage());
            throw new IllegalStateException("Gemini image response is not valid JSON", e);
        }
    }

    private ImageSearchResponse refineWithLocalImageAnalysis(MultipartFile image, ImageSearchResponse aiAnalysis) {
        return imageAiClientService.analyzeImage(image)
                .filter(localAnalysis -> shouldPreferLocalAnalysis(localAnalysis, aiAnalysis))
                .map(this::toImageSearchResponse)
                .orElse(aiAnalysis);
    }

    private boolean shouldPreferLocalAnalysis(ImageAiAnalysisResponse localAnalysis, ImageSearchResponse aiAnalysis) {
        String label = localAnalysis.getMatchedLabel() == null ? "" : localAnalysis.getMatchedLabel();
        double confidence = localAnalysis.getConfidence() == null ? 0.0 : localAnalysis.getConfidence();

        if ("swine_african_swine_fever_like".equals(label) && confidence >= 0.54) {
            return true;
        }

        if ("cattle_skin_nodules".equals(label) && confidence >= 0.54 && !isSwineFocusedAnswer(aiAnalysis)) {
            return true;
        }

        if ("livestock_general_health".equals(label) && confidence >= 0.57) {
            return isPetFocusedOrGenericSkinAnswer(aiAnalysis);
        }

        return false;
    }

    private boolean isSwineFocusedAnswer(ImageSearchResponse response) {
        String text = normalize(String.join(" ",
                response.getSummary() == null ? "" : response.getSummary(),
                String.join(" ", response.getObservations() == null ? List.of() : response.getObservations()),
                String.join(" ", response.getCareTips() == null ? List.of() : response.getCareTips()),
                String.join(" ", response.getWarnings() == null ? List.of() : response.getWarnings()),
                String.join(" ", response.getSearchKeywords() == null ? List.of() : response.getSearchKeywords())
        ));

        return containsAny(text, "heo", "lon", "lợn", "pig", "swine", "dich ta heo", "dich ta lon");
    }

    private boolean isPetFocusedOrGenericSkinAnswer(ImageSearchResponse response) {
        String text = String.join(" ",
                response.getSummary() == null ? "" : response.getSummary(),
                String.join(" ", response.getObservations() == null ? List.of() : response.getObservations()),
                String.join(" ", response.getCareTips() == null ? List.of() : response.getCareTips()),
                String.join(" ", response.getSearchKeywords() == null ? List.of() : response.getSearchKeywords())
        ).toLowerCase();

        return text.contains("thú cưng")
                || text.contains("chó/mèo")
                || text.contains("da/lông")
                || text.contains("sữa tắm")
                || text.contains("vệ sinh cơ thể");
    }

    private String buildCareSuggestionQuery(ImageSearchResponse response) {
        List<String> parts = new ArrayList<>();
        parts.addAll(response.getCareTips() == null ? List.of() : response.getCareTips());
        parts.addAll(response.getSearchKeywords() == null ? List.of() : response.getSearchKeywords());
        parts.addAll(response.getWarnings() == null ? List.of() : response.getWarnings());
        parts.add("gợi ý sản phẩm theo biện pháp chăm sóc tham khảo");
        return String.join(" ", parts);
    }

    private List<SuggestionCard> findProductsForCareTips(MultipartFile image, ImageSearchResponse analysis) {
        String careQuery = buildCareSuggestionQuery(analysis);
        AnimalContext context = inferAnimalContext(analysis);
        List<SuggestionCard> careSuggestions = context == AnimalContext.LIVESTOCK
                ? productSuggestionService.suggestLivestockProducts(careQuery, careQuery, 6)
                : productSuggestionService.suggestProducts(careQuery, careQuery);

        List<String> productIds = imageAiClientService.searchSimilarProducts(image, 6).stream()
                .map(ImageAiSearchResult::getProductId)
                .filter(id -> id != null && !id.isBlank())
                .toList();
        List<SuggestionCard> vectorSuggestions = context == AnimalContext.LIVESTOCK
                ? productSuggestionService.findLivestockProductsByIds(productIds)
                : productSuggestionService.findProductsByIds(productIds);

        return mergeSuggestions(careSuggestions, vectorSuggestions, 12).stream()
                .limit(6)
                .toList();
    }

    private AnimalContext inferAnimalContext(ImageSearchResponse analysis) {
        String text = normalize(String.join(" ",
                analysis.getSummary() == null ? "" : analysis.getSummary(),
                String.join(" ", analysis.getObservations() == null ? List.of() : analysis.getObservations()),
                String.join(" ", analysis.getCareTips() == null ? List.of() : analysis.getCareTips()),
                String.join(" ", analysis.getWarnings() == null ? List.of() : analysis.getWarnings()),
                String.join(" ", analysis.getSearchKeywords() == null ? List.of() : analysis.getSearchKeywords())
        ));

        if (containsAny(text,
                "gia suc", "vat nuoi trang trai", "con bo", "trau", "heo",
                "cattle", "livestock", "chuong trai", "con trung", "iodine")) {
            return AnimalContext.LIVESTOCK;
        }
        return AnimalContext.COMPANION_PET;
    }

    private boolean containsAny(String value, String... terms) {
        String paddedValue = " " + value + " ";
        for (String term : terms) {
            String normalizedTerm = normalize(term);
            if (normalizedTerm.length() <= 3 && paddedValue.contains(" " + normalizedTerm + " ")) {
                return true;
            }
            if (normalizedTerm.length() > 3 && value.contains(normalizedTerm)) {
                return true;
            }
        }
        return false;
    }

    private String normalize(String value) {
        String normalized = Normalizer.normalize(value.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        normalized = DIACRITICS.matcher(normalized).replaceAll("");
        return normalized.replace('đ', 'd');
    }

    private enum AnimalContext {
        COMPANION_PET,
        LIVESTOCK
    }

    private List<SuggestionCard> mergeSuggestions(
            List<SuggestionCard> prioritySuggestions,
            List<SuggestionCard> secondarySuggestions,
            int limit
    ) {
        Map<String, SuggestionCard> merged = new LinkedHashMap<>();
        addSuggestions(merged, prioritySuggestions);
        addSuggestions(merged, secondarySuggestions);
        return merged.values().stream().limit(limit).toList();
    }

    private void addSuggestions(Map<String, SuggestionCard> target, List<SuggestionCard> suggestions) {
        if (suggestions == null) {
            return;
        }
        for (SuggestionCard suggestion : suggestions) {
            if (suggestion.getId() != null && !suggestion.getId().isBlank()) {
                target.putIfAbsent(suggestion.getId(), suggestion);
            }
        }
    }

    private void populateSearchGroups(MultipartFile image, ImageSearchResponse analysis) {
        List<SuggestionCard> products = findProductsForCareTips(image, analysis);
        List<SuggestionCard> services = serviceSuggestionService.suggestServices(buildAnalysisText(analysis), 3);
        analysis.setProductSuggestions(products);
        analysis.setServiceSuggestions(services);
        analysis.setDiseaseMatches(ensureDiseaseMatches(analysis));
        analysis.setSuggestions(mergeSuggestions(products, services, 12));
        analysis.setDisclaimer(DISCLAIMER);
    }

    private String buildAnalysisText(ImageSearchResponse analysis) {
        return String.join(" ",
                analysis.getSummary() == null ? "" : analysis.getSummary(),
                String.join(" ", analysis.getObservations() == null ? List.of() : analysis.getObservations()),
                String.join(" ", analysis.getCareTips() == null ? List.of() : analysis.getCareTips()),
                String.join(" ", analysis.getWarnings() == null ? List.of() : analysis.getWarnings()),
                String.join(" ", analysis.getSearchKeywords() == null ? List.of() : analysis.getSearchKeywords())
        );
    }

    private List<DiseaseMatch> ensureDiseaseMatches(ImageSearchResponse analysis) {
        if (analysis.getDiseaseMatches() != null && !analysis.getDiseaseMatches().isEmpty()) {
            return analysis.getDiseaseMatches();
        }
        String text = buildAnalysisText(analysis);
        if (text.isBlank() || !looksHealthRelated(text)) {
            return List.of();
        }
        return List.of(DiseaseMatch.builder()
                .name("Tình trạng sức khỏe nghi ngờ từ ảnh")
                .description(analysis.getSummary())
                .matchedLabel("image_health_observation")
                .confidence(null)
                .build());
    }

    private boolean looksHealthRelated(String text) {
        String value = normalize(text);
        return containsAny(value,
                "benh", "viem", "ngua", "loet", "sot", "bo an", "non", "tieu chay",
                "xuat huyet", "do da", "noi san", "vet thuong", "dau", "nhiem trung",
                "ghe", "ve", "bo chet", "ky sinh");
    }

    private ImageSearchResponse fallbackResponse(MultipartFile image) {
        ImageSearchResponse analysis = imageAiClientService.analyzeImage(image)
                .map(this::toImageSearchResponse)
                .orElseGet(this::neutralAnalysisResponse);
        populateSearchGroups(image, analysis);
        return analysis;
    }

    private ImageSearchResponse toImageSearchResponse(ImageAiAnalysisResponse response) {
        return ImageSearchResponse.builder()
                .summary(response.getSummary())
                .observations(response.getObservations() == null ? List.of() : response.getObservations())
                .diseaseMatches(toDiseaseMatches(response))
                .careTips(response.getCareTips() == null ? List.of() : response.getCareTips())
                .warnings(response.getWarnings() == null ? List.of() : response.getWarnings())
                .searchKeywords(response.getSearchKeywords() == null ? List.of() : response.getSearchKeywords())
                .disclaimer(DISCLAIMER)
                .productSuggestions(List.of())
                .serviceSuggestions(List.of())
                .suggestions(List.of())
                .build();
    }

    private ImageSearchResponse neutralAnalysisResponse() {
        return ImageSearchResponse.builder()
                .summary("Mình chưa nhận được kết quả phân tích hình ảnh đủ tin cậy từ AI trong lần xử lý này.")
                .observations(List.of("Hệ thống chưa thể đưa ra quan sát chắc chắn từ ảnh, nên mình không kết luận nội dung ảnh để tránh sai sót."))
                .diseaseMatches(List.of())
                .careTips(List.of("Bạn có thể thử lại sau vài giây. Nếu ảnh liên quan đến ăn uống, hãy kiểm tra khẩu phần, đổi thức ăn từ từ và theo dõi biểu hiện của vật nuôi."))
                .warnings(List.of("Nếu vật nuôi có dấu hiệu đau, khó thở, bỏ ăn, nôn/tiêu chảy kéo dài, chảy máu hoặc nghi bệnh truyền nhiễm, hãy liên hệ thú y ngay."))
                .searchKeywords(List.of("thức ăn", "dinh dưỡng", "chăm sóc thú cưng", "phụ kiện"))
                .disclaimer(DISCLAIMER)
                .productSuggestions(List.of())
                .serviceSuggestions(List.of())
                .suggestions(List.of())
                .build();
    }

    private List<SuggestionCard> findFallbackProducts(MultipartFile image, ImageSearchResponse analysis) {
        List<SuggestionCard> suggestions = findProductsForCareTips(image, analysis);
        if (!suggestions.isEmpty()) {
            return suggestions;
        }

        if (inferAnimalContext(analysis) == AnimalContext.LIVESTOCK) {
            String livestockQuery = "sản phẩm cho gia súc heo lợn bò sát trùng chuồng trại iodine thuốc diệt côn trùng vitamin khoáng điện giải";
            return productSuggestionService.suggestLivestockProducts(livestockQuery, livestockQuery, 6);
        }

        String filename = image.getOriginalFilename() == null ? "" : image.getOriginalFilename();
        String query = filename + " thức ăn dinh dưỡng hạt pate chó mèo chăm sóc thú cưng";
        return productSuggestionService.suggestProducts(query, query);
    }

    private List<String> readStringList(JsonNode node) {
        if (!node.isArray()) {
            return List.of();
        }
        List<String> values = new ArrayList<>();
        for (JsonNode item : node) {
            String value = item.asText("");
            if (!value.isBlank()) {
                values.add(value);
            }
        }
        return values;
    }

    private List<DiseaseMatch> readDiseaseMatches(JsonNode node) {
        if (!node.isArray()) {
            return List.of();
        }
        List<DiseaseMatch> values = new ArrayList<>();
        for (JsonNode item : node) {
            String name = item.path("name").asText("");
            String description = item.path("description").asText("");
            if (name.isBlank() && description.isBlank()) {
                continue;
            }
            values.add(DiseaseMatch.builder()
                    .name(name.isBlank() ? "Tình trạng nghi ngờ từ ảnh" : name)
                    .description(description)
                    .matchedLabel(item.path("matchedLabel").asText(null))
                    .confidence(item.path("confidence").isNumber() ? item.path("confidence").asDouble() : null)
                    .build());
        }
        return values;
    }

    private List<DiseaseMatch> toDiseaseMatches(ImageAiAnalysisResponse response) {
        if (response == null || response.getMatchedLabel() == null || response.getMatchedLabel().isBlank()) {
            return List.of();
        }
        return List.of(DiseaseMatch.builder()
                .name(toDiseaseName(response.getMatchedLabel()))
                .description(response.getSummary())
                .matchedLabel(response.getMatchedLabel())
                .confidence(response.getConfidence())
                .build());
    }

    private String toDiseaseName(String label) {
        return switch (label) {
            case "swine_african_swine_fever_like" -> "Nghi dấu hiệu dịch tả heo châu Phi";
            case "cattle_skin_nodules" -> "Nghi bệnh da nổi cục/viêm da ở gia súc";
            case "dog_demodex_mange", "dog_skin" -> "Nghi bệnh da/ghẻ/viêm da ở chó";
            case "cat_ear_mites_or_infection", "dog_ear_infection" -> "Nghi viêm tai hoặc ký sinh trùng tai";
            case "rabbit_mange_or_skin_crusts" -> "Nghi ghẻ/đóng vảy da ở thỏ";
            case "dog_flea_tick_infestation" -> "Nghi ve, bọ chét hoặc ký sinh trùng ngoài da";
            default -> "Tình trạng sức khỏe nghi ngờ từ ảnh";
        };
    }

    private String textOrDefault(JsonNode node, String fallback) {
        String value = node.asText("");
        return value.isBlank() ? fallback : value;
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
}
