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
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductSuggestionService {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
    private static final Pattern HTML_TAGS = Pattern.compile("<[^>]*>");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final Set<String> HEALTH_KEYWORDS = Set.of(
            "da", "do", "ngua", "kich", "ung", "viem", "nep", "gap", "mui", "hoi",
            "ve", "bo", "chet", "nam", "tai", "long", "ray", "tam", "sua", "ve sinh",
            "khang", "khuan", "di ung", "thuoc"
    );
    private static final Set<String> SHOPPING_STOP_WORDS = Set.of(
            "toi", "minh", "ban", "can", "mua", "tim", "goi", "tu", "van", "cho", "meo",
            "cun", "thu", "cung", "co", "khong", "mot", "vai", "san", "pham"
    );

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${services.product.url:http://product-service:8081/pet_care_product}")
    private String productServiceUrl;

    public List<SuggestionCard> suggestProducts(String question, String knowledgeContext) {
        Set<String> terms = buildSearchTerms(question, knowledgeContext);
        if (terms.isEmpty()) {
            return List.of();
        }
        CompanionSpecies requestedSpecies = inferCompanionSpecies(question);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    productServiceUrl + "/products",
                    HttpMethod.GET,
                    null,
                    String.class
            );
            JsonNode result = objectMapper.readTree(response.getBody()).path("result");
            if (!result.isArray()) {
                return List.of();
            }

            List<ScoredProduct> scoredProducts = new ArrayList<>();
            for (JsonNode product : result) {
                if (!"ACTIVE".equalsIgnoreCase(product.path("status").asText())
                        || !isSuitableForCompanionSpecies(product, requestedSpecies)) {
                    continue;
                }
                int score = scoreProduct(product, terms);
                if (score >= 3) {
                    scoredProducts.add(new ScoredProduct(product, score));
                }
            }

            return scoredProducts.stream()
                    .sorted(Comparator.comparingInt(ScoredProduct::score).reversed())
                    .limit(3)
                    .map(item -> toSuggestionCard(item.product()))
                    .toList();
        } catch (Exception e) {
            log.warn("Cannot load product suggestions for chat: {}", e.getMessage());
            return List.of();
        }
    }

    public List<SuggestionCard> suggestLivestockProducts(String question, String knowledgeContext, int limit) {
        Set<String> terms = buildSearchTerms(question, knowledgeContext);
        terms.addAll(Set.of(
                "gia suc", "con bo", "bo sua", "bo thit", "thuc an bo", "trau", "de", "heo", "chuong trai", "sat trung",
                "iodine", "con trung", "vitamin", "khoang", "dien giai", "lon"
        ));

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    productServiceUrl + "/products",
                    HttpMethod.GET,
                    null,
                    String.class
            );
            JsonNode result = objectMapper.readTree(response.getBody()).path("result");
            if (!result.isArray()) {
                return List.of();
            }

            List<ScoredProduct> scoredProducts = new ArrayList<>();
            for (JsonNode product : result) {
                if (!"ACTIVE".equalsIgnoreCase(product.path("status").asText()) || !isLivestockSuitableProduct(product)) {
                    continue;
                }
                int score = scoreProduct(product, terms);
                if (score >= 3) {
                    scoredProducts.add(new ScoredProduct(product, score));
                }
            }

            return scoredProducts.stream()
                    .sorted(Comparator.comparingInt(ScoredProduct::score).reversed())
                    .limit(Math.max(1, limit))
                    .map(item -> toSuggestionCard(item.product()))
                    .toList();
        } catch (Exception e) {
            log.warn("Cannot load livestock product suggestions for chat: {}", e.getMessage());
            return List.of();
        }
    }

    public List<SuggestionCard> findProductsByIds(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return List.of();
        }

        Set<String> orderedIds = new LinkedHashSet<>(productIds);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    productServiceUrl + "/products",
                    HttpMethod.GET,
                    null,
                    String.class
            );
            JsonNode result = objectMapper.readTree(response.getBody()).path("result");
            if (!result.isArray()) {
                return List.of();
            }

            List<SuggestionCard> suggestions = new ArrayList<>();
            for (String id : orderedIds) {
                for (JsonNode product : result) {
                    if (id.equals(product.path("id").asText())
                            && "ACTIVE".equalsIgnoreCase(product.path("status").asText())) {
                        suggestions.add(toSuggestionCard(product));
                        break;
                    }
                }
            }
            return suggestions;
        } catch (Exception e) {
            log.warn("Cannot load products by image AI ids: {}", e.getMessage());
            return List.of();
        }
    }

    public List<SuggestionCard> findLivestockProductsByIds(List<String> productIds) {
        if (productIds == null || productIds.isEmpty()) {
            return List.of();
        }

        Set<String> orderedIds = new LinkedHashSet<>(productIds);
        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    productServiceUrl + "/products",
                    HttpMethod.GET,
                    null,
                    String.class
            );
            JsonNode result = objectMapper.readTree(response.getBody()).path("result");
            if (!result.isArray()) {
                return List.of();
            }

            List<SuggestionCard> suggestions = new ArrayList<>();
            for (String id : orderedIds) {
                for (JsonNode product : result) {
                    if (id.equals(product.path("id").asText())
                            && "ACTIVE".equalsIgnoreCase(product.path("status").asText())
                            && isLivestockSuitableProduct(product)) {
                        suggestions.add(toSuggestionCard(product));
                        break;
                    }
                }
            }
            return suggestions;
        } catch (Exception e) {
            log.warn("Cannot load livestock products by image AI ids: {}", e.getMessage());
            return List.of();
        }
    }

    private Set<String> buildSearchTerms(String question, String knowledgeContext) {
        String normalizedQuestion = normalize(question == null ? "" : question);
        String intent = inferIntent(normalizedQuestion);
        if ("shopping".equals(intent)) {
            return buildShoppingTerms(normalizedQuestion);
        }
        if ("mobility".equals(intent) || intent.isBlank()) {
            return new HashSet<>();
        }

        String combined = normalize((question == null ? "" : question) + " " + (knowledgeContext == null ? "" : knowledgeContext));
        Set<String> terms = new HashSet<>();
        for (String term : HEALTH_KEYWORDS) {
            String normalizedTerm = normalize(term);
            if (matchesTerm(combined, normalizedTerm)) {
                terms.add(normalizedTerm);
            }
        }

        if ("skin".equals(intent)) {
            terms.addAll(Set.of("da", "tam", "sua", "ve sinh", "khang", "khuan", "di ung"));
        }
        if ("parasite".equals(intent)) {
            terms.addAll(Set.of("ve", "bo", "chet", "thuoc", "xịt", "tam"));
        }
        if ("digestive".equals(intent)) {
            terms.addAll(Set.of("tieu hoa", "men", "thuc an", "hat", "pate"));
        }
        return terms;
    }

    private String inferIntent(String normalizedQuestion) {
        if (isShoppingRequest(normalizedQuestion)) {
            return "shopping";
        }
        if (containsAny(normalizedQuestion, "gay", "chan", "khap khieng", "liet", "di lai", "tai nan", "te nga")) {
            return "mobility";
        }
        if (containsAny(normalizedQuestion, "da", "do", "kich ung", "ngua", "nep", "long", "vay", "nam", "phat ban", "mui hoi")) {
            return "skin";
        }
        if (containsAny(normalizedQuestion, "non", "tieu chay", "phan", "bung", "bo an", "tao bon", "day hoi", "an phai")) {
            return "digestive";
        }
        if (containsAny(normalizedQuestion, "ve", "bo chet", "ghe", "ky sinh", "giun")) {
            return "parasite";
        }
        if (containsAny(normalizedQuestion, "tai", "lac dau", "ray tai", "mui tai")) {
            return "ear";
        }
        return "";
    }

    private boolean isShoppingRequest(String normalizedQuestion) {
        boolean hasShoppingVerb = containsAny(normalizedQuestion,
                "can", "mua", "tim", "goi y", "tu van", "ban", "co", "co khong", "dat");
        boolean hasProductWord = containsAny(normalizedQuestion,
                "banh thuong", "snack", "thuc an", "hat", "pate", "sua tam", "do choi",
                "phu kien", "vong co", "day deo", "balo", "tui", "tui dung", "chuong",
                "khay", "cat ve sinh", "thuoc", "men", "vitamin", "san pham");
        return hasShoppingVerb && hasProductWord;
    }

    private Set<String> buildShoppingTerms(String normalizedQuestion) {
        Set<String> terms = new HashSet<>();
        String[] parts = normalizedQuestion.split("[^a-z0-9]+");
        for (String part : parts) {
            if (part.length() >= 3 && !SHOPPING_STOP_WORDS.contains(part)) {
                terms.add(part);
            }
        }

        if (normalizedQuestion.contains("banh thuong")) {
            terms.addAll(Set.of("banh", "thuong", "snack", "treat"));
        }
        if (normalizedQuestion.contains("thuc an")) {
            terms.addAll(Set.of("thuc", "an", "hat", "pate"));
        }
        if (normalizedQuestion.contains("sua tam")) {
            terms.addAll(Set.of("sua", "tam", "shampoo"));
        }
        if (normalizedQuestion.contains("do choi")) {
            terms.addAll(Set.of("choi", "bong", "gặm", "gam"));
        }
        if (normalizedQuestion.contains("tui") || normalizedQuestion.contains("balo")) {
            terms.addAll(Set.of("tui", "dung", "balo", "van", "chuyen", "meo"));
        }
        return terms;
    }

    private boolean containsAny(String value, String... terms) {
        for (String term : terms) {
            if (matchesTerm(value, normalize(term))) {
                return true;
            }
        }
        return false;
    }

    private int scoreProduct(JsonNode product, Set<String> terms) {
        String productName = normalize(product.path("productName").asText());
        String productText = productSearchText(product);
        if (isSkinCareQuery(terms) && !looksLikeCareProduct(productName)) {
            return 0;
        }

        int productScore = scoreText(productText, terms);
        if (productScore <= 0) {
            return 0;
        }

        StringBuilder categoryText = new StringBuilder();
        for (JsonNode category : product.path("category")) {
            categoryText.append(category.path("categoryName").asText()).append(' ');
            categoryText.append(category.path("name").asText()).append(' ');
            categoryText.append(category.path("description").asText()).append(' ');
        }

        int score = productScore + Math.min(3, scoreText(normalize(categoryText.toString()), terms));

        String name = normalize(product.path("productName").asText());
        if (name.contains("tam") || name.contains("sua") || name.contains("ve sinh")) {
            score += 3;
        }
        if (name.contains("thuoc") || name.contains("xịt") || name.contains("xit")) {
            score += 2;
        }
        return score;
    }

    private boolean isLivestockSuitableProduct(JsonNode product) {
        String categoryText = productCategoryText(product);
        if (containsAny(categoryText,
                "cho", "meo", "dog", "cat", "puppy", "kitten", "thu cung")) {
            return false;
        }
        if (containsAny(categoryText,
                "gia suc", "bo", "trau", "de", "heo", "lon", "cattle", "livestock")) {
            return true;
        }

        String text = productSearchText(product);
        if (containsAny(text,
                "cho meo", "cho va meo", "danh cho cho", "danh cho meo", "cho con",
                "meo con", "dog", "cat", "puppy", "kitten", "banh thuong", "snack",
                "treat", "pate", "thuc an hat", "hat cho", "cat ve sinh", "khay ve sinh",
                "do choi", "vong co", "day dat", "balo", "tui van chuyen", "sua tam cho",
                "sua tam meo")) {
            return false;
        }

        return containsAny(text,
                "gia suc", "con bo", "bo sua", "bo thit", "thuc an bo", "trau",
                "de sua", "de thit", "heo", "lon", "cattle", "livestock",
                "chuong trai", "sat trung chuong", "khu trung chuong", "iodine gia suc",
                "vitamin gia suc", "vitamin heo", "khoang gia suc", "khoang heo",
                "dien giai gia suc", "dien giai heo", "premix gia suc", "premix heo");
    }

    private CompanionSpecies inferCompanionSpecies(String question) {
        String raw = question == null ? "" : question.toLowerCase(Locale.ROOT);
        String normalized = normalize(raw);

        boolean hasDog = raw.contains("chó")
                || containsAny(normalized, "dog", "puppy", "cun", "cún");
        boolean hasCat = raw.contains("mèo")
                || containsAny(normalized, "meo", "cat", "kitten");

        if (hasDog && !hasCat) {
            return CompanionSpecies.DOG;
        }
        if (hasCat && !hasDog) {
            return CompanionSpecies.CAT;
        }
        return CompanionSpecies.UNKNOWN;
    }

    private boolean isSuitableForCompanionSpecies(JsonNode product, CompanionSpecies requestedSpecies) {
        if (requestedSpecies == CompanionSpecies.UNKNOWN) {
            return true;
        }

        String rawText = productRawText(product).toLowerCase(Locale.ROOT);
        String normalizedText = normalize(rawText);
        boolean dogProduct = rawText.contains("chó")
                || containsAny(normalizedText, "dog", "puppy", "cun");
        boolean catProduct = rawText.contains("mèo")
                || containsAny(normalizedText, "meo", "cat", "kitten");

        if (requestedSpecies == CompanionSpecies.DOG) {
            return !catProduct || dogProduct;
        }
        if (requestedSpecies == CompanionSpecies.CAT) {
            return !dogProduct || catProduct;
        }
        return true;
    }

    private String productRawText(JsonNode product) {
        StringBuilder text = new StringBuilder();
        text.append(product.path("productName").asText()).append(' ');
        text.append(product.path("description").asText()).append(' ');
        for (JsonNode category : product.path("category")) {
            text.append(category.path("categoryName").asText()).append(' ');
            text.append(category.path("name").asText()).append(' ');
            text.append(category.path("description").asText()).append(' ');
        }
        return text.toString();
    }

    private String productSearchText(JsonNode product) {
        StringBuilder text = new StringBuilder();
        text.append(product.path("productName").asText()).append(' ');
        text.append(product.path("description").asText()).append(' ');
        for (JsonNode category : product.path("category")) {
            text.append(category.path("categoryName").asText()).append(' ');
            text.append(category.path("name").asText()).append(' ');
            text.append(category.path("description").asText()).append(' ');
        }
        return normalize(text.toString());
    }

    private String productCategoryText(JsonNode product) {
        StringBuilder text = new StringBuilder();
        for (JsonNode category : product.path("category")) {
            text.append(category.path("categoryName").asText()).append(' ');
            text.append(category.path("name").asText()).append(' ');
        }
        return normalize(text.toString());
    }

    private boolean isSkinCareQuery(Set<String> terms) {
        return terms.contains("da") || terms.contains("kich") || terms.contains("ung") || terms.contains("ngua")
                || terms.contains("viem") || terms.contains("khang") || terms.contains("khuan");
    }

    private boolean looksLikeCareProduct(String productText) {
        if (productText.contains("balo") || productText.contains("tui") || productText.contains("day deo")
                || productText.contains("vong co") || productText.contains("do choi")) {
            return false;
        }
        return productText.contains("tam")
                || productText.contains("sua")
                || productText.contains("thuoc")
                || productText.contains("xit")
                || productText.contains("ve sinh")
                || productText.contains("khang")
                || productText.contains("khuan")
                || productText.contains("shampoo")
                || productText.contains("bacter");
    }

    private int scoreText(String normalized, Set<String> terms) {
        int score = 0;
        for (String term : terms) {
            if (matchesTerm(normalized, term)) {
                score += term.length() <= 2 ? 1 : 3;
            }
        }
        return score;
    }

    private boolean matchesTerm(String normalized, String term) {
        if (term.length() <= 2) {
            return (" " + normalized + " ").contains(" " + term + " ");
        }
        return normalized.contains(term);
    }

    private SuggestionCard toSuggestionCard(JsonNode product) {
        String id = product.path("id").asText();
        JsonNode primaryImage = null;
        for (JsonNode image : product.path("images")) {
            if (image.path("isPrimary").asBoolean(false)) {
                primaryImage = image;
                break;
            }
            if (primaryImage == null) {
                primaryImage = image;
            }
        }

        return SuggestionCard.builder()
                .type("product")
                .id(id)
                .name(product.path("productName").asText())
                .price(toIntegerPrice(product.path("price")))
                .imageUrl(primaryImage == null ? null : primaryImage.path("imageUrl").asText(null))
                .link("/products/" + id)
                .description(shorten(product.path("description").asText("")))
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
        return plainText.length() <= 90 ? plainText : plainText.substring(0, 87).trim() + "...";
    }

    private String toPlainText(String value) {
        if (value == null || value.isBlank()) return null;
        String unescaped = HtmlUtils.htmlUnescape(value);
        String withoutTags = HTML_TAGS.matcher(unescaped).replaceAll(" ");
        String normalized = WHITESPACE.matcher(withoutTags.replace('\u00A0', ' ')).replaceAll(" ").trim();
        return normalized.isBlank() ? null : normalized;
    }

    private String normalize(String value) {
        String normalized = Normalizer.normalize(value.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        normalized = DIACRITICS.matcher(normalized).replaceAll("");
        return normalized.replace('đ', 'd');
    }

    private record ScoredProduct(JsonNode product, int score) {
    }

    private enum CompanionSpecies {
        DOG,
        CAT,
        UNKNOWN
    }
}
