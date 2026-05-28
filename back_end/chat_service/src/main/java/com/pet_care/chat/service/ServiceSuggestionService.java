package com.pet_care.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.chat.dto.response.SuggestionCard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.HtmlUtils;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceSuggestionService {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
    private static final Pattern HTML_TAGS = Pattern.compile("<[^>]*>");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${services.booking.url:http://booking-service:8086/pet_care_booking}")
    private String bookingServiceUrl;

    public List<SuggestionCard> suggestServices(String analysisText, int limit) {
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    bookingServiceUrl + "/service-packages",
                    HttpMethod.GET,
                    null,
                    String.class
            );
            JsonNode result = objectMapper.readTree(response.getBody()).path("result");
            if (!result.isArray()) {
                return List.of();
            }

            Set<String> desiredCategories = inferServiceCategories(analysisText);
            List<ScoredService> scored = new ArrayList<>();
            for (JsonNode service : result) {
                if (!service.path("active").asBoolean(true)) {
                    continue;
                }
                int score = scoreService(service, analysisText, desiredCategories);
                if (score > 0) {
                    scored.add(new ScoredService(service, score));
                }
            }

            return scored.stream()
                    .sorted(Comparator.comparingInt(ScoredService::score).reversed())
                    .limit(Math.max(1, limit))
                    .map(item -> toSuggestionCard(item.service()))
                    .toList();
        } catch (Exception e) {
            log.warn("Cannot load service suggestions for image search: {}", e.getMessage());
            return List.of();
        }
    }

    private Set<String> inferServiceCategories(String text) {
        String value = normalize(text == null ? "" : text);
        if (containsAny(value, "tiem phong", "vaccine", "vac xin")) {
            return Set.of("VACCINATION", "HEALTH_CHECK", "VETERINARY");
        }
        if (containsAny(value, "tam", "long", "da", "ngua", "ghe", "ve sinh", "mui hoi")) {
            return Set.of("GROOMING", "HEALTH_CHECK", "VETERINARY");
        }
        if (containsAny(value, "benh", "sot", "bo an", "non", "tieu chay", "dau", "viem", "loet", "xuat huyet")) {
            return Set.of("HEALTH_CHECK", "VETERINARY");
        }
        return Set.of("HEALTH_CHECK", "GROOMING", "VACCINATION");
    }

    private int scoreService(JsonNode service, String analysisText, Set<String> desiredCategories) {
        String category = service.path("category").asText("");
        int score = desiredCategories.contains(category) ? 10 : 0;

        String serviceText = normalize(service.path("name").asText("") + " " + service.path("description").asText(""));
        String analysis = normalize(analysisText == null ? "" : analysisText);
        for (String token : analysis.split("[^a-z0-9]+")) {
            if (token.length() >= 4 && serviceText.contains(token)) {
                score += 2;
            }
        }
        return score;
    }

    private SuggestionCard toSuggestionCard(JsonNode service) {
        String id = service.path("id").asText();
        return SuggestionCard.builder()
                .type("service")
                .id(id)
                .name(service.path("name").asText())
                .price(toIntegerPrice(service.path("price")))
                .imageUrl(service.path("imageUrl").asText(null))
                .link("/booking")
                .description(shorten(service.path("description").asText("")))
                .durationMinutes(service.path("durationMinutes").isNumber() ? service.path("durationMinutes").asInt() : null)
                .build();
    }

    private Integer toIntegerPrice(JsonNode priceNode) {
        try {
            return new BigDecimal(priceNode.asText("0")).intValue();
        } catch (Exception e) {
            return 0;
        }
    }

    private String shorten(String value) {
        String plainText = toPlainText(value);
        if (plainText == null) return null;
        return plainText.length() <= 100 ? plainText : plainText.substring(0, 97).trim() + "...";
    }

    private String toPlainText(String value) {
        if (value == null || value.isBlank()) return null;
        String unescaped = HtmlUtils.htmlUnescape(value);
        String withoutTags = HTML_TAGS.matcher(unescaped).replaceAll(" ");
        String normalized = WHITESPACE.matcher(withoutTags.replace('\u00A0', ' ')).replaceAll(" ").trim();
        return normalized.isBlank() ? null : normalized;
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
        String normalized = Normalizer.normalize(value.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        normalized = DIACRITICS.matcher(normalized).replaceAll("");
        return normalized.replace('đ', 'd');
    }

    private record ScoredService(JsonNode service, int score) {
    }
}
