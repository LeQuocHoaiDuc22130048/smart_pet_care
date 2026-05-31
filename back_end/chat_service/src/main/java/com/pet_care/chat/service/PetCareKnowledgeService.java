package com.pet_care.chat.service;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

@Slf4j
@Service
public class PetCareKnowledgeService {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{M}+");
    private static final Set<String> STOP_WORDS = Set.of(
            "toi", "minh", "ban", "cua", "cho", "thu", "cung", "bi", "la", "co", "va", "con",
            "thi", "nen", "can", "lam", "gi", "khong", "hoi", "ve", "mot", "nhieu", "nay", "kia"
    );
    private static final int MAX_CONTEXT_ITEMS = 4;

    private final List<KnowledgeEntry> entries = new ArrayList<>();

    @PostConstruct
    void loadKnowledgeBase() {
        loadCsv("data.csv");
        loadCsv("mauBenh.csv");
        log.info("Loaded {} chat knowledge entries", entries.size());
    }

    public String buildRelevantContext(String question) {
        if (question == null || question.isBlank() || entries.isEmpty()) {
            return "";
        }

        List<ScoredEntry> matched = findRelevantEntries(question);
        if (matched.isEmpty()) {
            return "";
        }

        StringBuilder context = new StringBuilder();
        context.append("\n\nKIẾN THỨC PHÙ HỢP TỪ DATASET PETCARE:\n");
        context.append("Bắt buộc ưu tiên các dòng dữ liệu này khi trả lời. Không trả lời chung chung nếu có Lời khuyên hoặc Chăm sóc phù hợp.\n");
        context.append("Dòng số 1 là mục khớp nhất với câu hỏi của khách.\n");
        for (int i = 0; i < matched.size(); i++) {
            KnowledgeEntry entry = matched.get(i).entry();
            context.append(i + 1).append(". ");
            if (!entry.getSpecies().isBlank()) context.append("Loài: ").append(entry.getSpecies()).append("; ");
            if (!entry.getCategory().isBlank()) context.append("Vấn đề: ").append(entry.getCategory()).append("; ");
            if (!entry.getDescription().isBlank()) context.append("Mô tả: ").append(entry.getDescription()).append("; ");
            if (!entry.getAdvice().isBlank() && !"Không áp dụng".equalsIgnoreCase(entry.getAdvice())) {
                context.append("Lời khuyên: ").append(entry.getAdvice()).append("; ");
            }
            if (!entry.getCareGuide().isBlank()) context.append("Chăm sóc: ").append(entry.getCareGuide()).append(".");
            context.append("\n");
        }
        return context.toString();
    }

    public String buildDatasetAnswer(String question) {
        List<ScoredEntry> matched = findRelevantEntries(question);
        if (matched.isEmpty()) {
            return buildGenericVeterinaryFallback(question);
        }

        KnowledgeEntry entry = matched.get(0).entry();
        String species = entry.getSpecies().isBlank() ? "thú cưng" : entry.getSpecies();
        String displaySpecies = normalizeSpeciesLabel(species);
        String category = entry.getCategory().isBlank() ? "vấn đề sức khỏe" : entry.getCategory();
        String intent = inferIntent(question);
        String care = !entry.getCareGuide().isBlank()
                ? entry.getCareGuide()
                : entry.getAdvice();

        StringBuilder answer = new StringBuilder();
        answer.append("Tình trạng bạn mô tả khá phù hợp với nhóm ")
                .append(category)
                .append(" ở ")
                .append(displaySpecies)
                .append(". ");

        if (care != null && !care.isBlank() && !"Không áp dụng".equalsIgnoreCase(care)) {
            answer.append("Biện pháp tại nhà: ").append(care).append(" ");
        }

        answer.append(buildCareDetails(intent, displaySpecies));
        return answer.toString();
    }

    private String buildGenericVeterinaryFallback(String question) {
        String species = normalizeSpeciesLabel(inferSpecies(question));
        if (species.isBlank()) {
            species = "thú cưng";
        }

        boolean urgent = hasUrgentSigns(question);
        StringBuilder answer = new StringBuilder();
        answer.append("Mình chưa thể xác định chính xác tình trạng này chỉ qua mô tả, ")
                .append("nên phần dưới đây là tư vấn sơ bộ và không thay thế bác sĩ thú y. ");

        if (urgent) {
            answer.append("Vì bạn có nhắc tới dấu hiệu có thể nguy hiểm, bạn nên đưa ")
                    .append(species)
                    .append(" đi thú y sớm, đặc biệt nếu triệu chứng đang nặng lên. ");
        }

        answer.append("Trước mắt, bạn hãy giữ ")
                .append(species)
                .append(" ở nơi sạch, yên tĩnh, đủ nước, tránh tự dùng thuốc của người hoặc thuốc không rõ liều. ")
                .append("Theo dõi thêm mức ăn uống, tỉnh táo, thân nhiệt, hô hấp, nôn/tiêu chảy, đau, da/lông, mắt/tai và chất thải. ")
                .append("Nếu có khó thở, co giật, xuất huyết, liệt, đau nhiều, lừ đừ rõ, nôn/tiêu chảy liên tục, ")
                .append("bỏ ăn hơn 24 giờ hoặc tình trạng xấu nhanh, bạn nên liên hệ bác sĩ thú y ngay. ")
                .append("Bạn có thể mô tả thêm loài, tuổi, cân nặng, thời gian bị, triệu chứng chính và ảnh nếu có; ")
                .append("PetCare cũng có dịch vụ Khám sức khỏe để hỗ trợ kiểm tra trực tiếp.");

        return answer.toString();
    }

    private List<ScoredEntry> findRelevantEntries(String question) {
        Set<String> queryTokens = tokenize(question);
        if (queryTokens.isEmpty()) {
            return List.of();
        }

        String intent = inferIntent(question);
        if (intent.isBlank()) {
            return List.of();
        }
        String species = inferSpecies(question);
        List<KnowledgeEntry> candidates = entries;

        List<KnowledgeEntry> narrowedByIntent = entries.stream()
                .filter(entry -> matchesIntent(entry, intent))
                .toList();
        if (!narrowedByIntent.isEmpty()) {
            candidates = narrowedByIntent;
        }

        List<KnowledgeEntry> narrowedBySpecies = candidates.stream()
                .filter(entry -> species.isBlank() || normalize(entry.getSpecies()).contains(species))
                .toList();
        if (!narrowedBySpecies.isEmpty()) {
            candidates = narrowedBySpecies;
        }

        return candidates.stream()
                .map(entry -> new ScoredEntry(entry, score(entry, queryTokens)))
                .filter(item -> item.score() > 0)
                .sorted(Comparator.comparingInt(ScoredEntry::score).reversed())
                .limit(MAX_CONTEXT_ITEMS)
                .toList();
    }

    private void loadCsv(String fileName) {
        Path path = resolveDataFile(fileName);
        if (!Files.exists(path)) {
            log.warn("Chat knowledge file not found: {}", fileName);
            return;
        }

        try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            String header = reader.readLine();
            if (header == null) return;

            String line;
            while ((line = reader.readLine()) != null) {
                List<String> columns = parseCsvLine(line);
                if (columns.size() < 6) continue;

                KnowledgeEntry entry = KnowledgeEntry.builder()
                        .description(columns.get(0).trim())
                        .category(columns.get(1).trim())
                        .source(columns.get(2).trim())
                        .advice(columns.get(3).trim())
                        .species(columns.get(4).trim())
                        .careGuide(columns.get(5).trim())
                        .normalizedText(normalize(String.join(" ", columns)))
                        .build();
                entries.add(entry);
            }
        } catch (IOException e) {
            log.error("Failed to load chat knowledge file {}: {}", path, e.getMessage(), e);
        }
    }

    private Path resolveDataFile(String fileName) {
        List<Path> candidates = List.of(
                Path.of("data", fileName),
                Path.of("back_end", "chat_service", "data", fileName)
        );
        return candidates.stream()
                .filter(Files::exists)
                .findFirst()
                .orElse(candidates.get(0));
    }

    private int score(KnowledgeEntry entry, Set<String> queryTokens) {
        int score = 0;
        String description = normalize(entry.getDescription());
        String category = normalize(entry.getCategory());
        String advice = normalize(entry.getAdvice());
        String careGuide = normalize(entry.getCareGuide());
        String species = normalize(entry.getSpecies());

        for (String token : queryTokens) {
            if (description.contains(token)) {
                score += 4;
            }
            if (category.contains(token)) {
                score += 3;
            }
            if (advice.contains(token) || careGuide.contains(token)) {
                score += 2;
            }
            if (species.contains(token)) {
                score += 3;
            }
            if (entry.getNormalizedText().contains(token)) {
                score++;
            }
        }
        return score;
    }

    private String buildCareDetails(String intent, String species) {
        return switch (intent) {
            case "skin" -> "Với vùng da đỏ/kích ứng, bạn nên giữ khu vực đó khô sạch, ngăn bé liếm hoặc gãi, không tự bôi thuốc người và theo dõi mùi hôi, dịch, sưng nóng hoặc vết lan rộng. "
                    + "Nếu vùng da rỉ dịch/mủ, có mùi nặng, bé đau nhiều hoặc không đỡ sau 1-2 ngày, bạn nên đưa bé đi bác sĩ thú y. "
                    + "PetCare có sản phẩm vệ sinh, chăm sóc da lông và dịch vụ Tắm & cắt lông/Khám sức khỏe để hỗ trợ kiểm tra kỹ hơn.";
            case "mobility" -> "Bạn nên hạn chế di chuyển ngay, đặt " + species + " ở nơi yên tĩnh, nền mềm, tránh nắn bóp hoặc tự cố định xương nếu không có hướng dẫn chuyên môn. "
                    + "Nếu nghi gãy chân, liệt, đau nhiều, sưng biến dạng hoặc không đứng được thì đây là tình huống cần đi thú y sớm để chụp kiểm tra và xử lý đau. "
                    + "PetCare có dịch vụ Khám sức khỏe để hỗ trợ đánh giá ban đầu và hướng dẫn chăm sóc sau chấn thương.";
            case "digestive" -> "Bạn nên theo dõi số lần nôn/tiêu chảy, mức uống nước, độ tỉnh táo và không tự dùng thuốc tiêu hóa của người. "
                    + "Nếu có máu trong phân/nôn, bụng chướng, nôn liên tục, lờ đờ, mất nước hoặc bỏ ăn kéo dài thì nên đi thú y ngay. "
                    + "PetCare có thể gợi ý thức ăn dễ tiêu, men hỗ trợ tiêu hóa hoặc dịch vụ Khám sức khỏe khi bé cần kiểm tra thêm.";
            case "ear" -> "Bạn nên giữ tai khô, không ngoáy sâu vào ống tai và theo dõi mùi hôi, dịch tai, lắc đầu hoặc đau khi chạm tai. "
                    + "Nếu tai sưng đỏ, có dịch/mủ, bé đau nhiều hoặc nghi ve tai/nhiễm trùng thì nên đi thú y để soi tai và dùng thuốc đúng loại. "
                    + "PetCare có sản phẩm vệ sinh tai và dịch vụ Khám sức khỏe/Tắm & cắt lông phù hợp.";
            case "parasite" -> "Bạn nên cách ly nhẹ nếu nghi ve/bọ chét/ghẻ, vệ sinh ổ nằm và tránh để bé gãi làm trầy da. "
                    + "Nếu ngứa dữ dội, rụng lông, có vết loét hoặc trong nhà có nhiều thú cưng, nên hỏi bác sĩ thú y để chọn thuốc đúng loài và đúng cân nặng. "
                    + "PetCare có các sản phẩm hỗ trợ kiểm soát ký sinh trùng và vệ sinh môi trường sống.";
            default -> "Bạn nên giữ bé ở nơi yên tĩnh, theo dõi ăn uống, mức tỉnh táo, đau, sốt hoặc triệu chứng nặng thêm. "
                    + "Nếu tình trạng kéo dài, bé đau nhiều, bỏ ăn hoặc có dấu hiệu bất thường rõ, bạn nên đưa bé đi bác sĩ thú y. "
                    + "PetCare có dịch vụ Khám sức khỏe và sản phẩm chăm sóc phù hợp để hỗ trợ bạn.";
        };
    }

    private boolean matchesIntent(KnowledgeEntry entry, String intent) {
        if (intent.isBlank()) {
            return true;
        }

        String category = normalize(entry.getCategory());
        String description = normalize(entry.getDescription());
        return switch (intent) {
            case "skin" -> category.contains("da") || description.contains("da") || description.contains("ngua")
                    || description.contains("kich ung") || description.contains("nep");
            case "mobility" -> category.contains("di chuyen") || category.contains("kha nang di chuyen")
                    || description.contains("gay") || description.contains("chan") || description.contains("liet")
                    || description.contains("khap khieng") || description.contains("dau");
            case "digestive" -> category.contains("tieu hoa") || description.contains("non")
                    || description.contains("tieu chay") || description.contains("bung") || description.contains("phan");
            case "ear" -> category.contains("tai") || description.contains("tai");
            case "parasite" -> category.contains("ky sinh") || description.contains("ve") || description.contains("bo chet")
                    || description.contains("ghe") || description.contains("giun");
            default -> true;
        };
    }

    private String inferIntent(String question) {
        String value = normalize(question);
        if (containsAny(value, "gay", "chan", "khap khieng", "liet", "di lai", "dau chan", "tai nan", "te nga")) {
            return "mobility";
        }
        if (containsAny(value, "da", "do", "kich ung", "ngua", "nep", "long", "vay", "nam", "phat ban", "mui hoi")) {
            return "skin";
        }
        if (containsAny(value, "non", "tieu chay", "phan", "bung", "bo an", "bieng an", "chan an", "kem an",
                "khong an", "an it", "tao bon", "day hoi", "an phai")) {
            return "digestive";
        }
        if (containsAny(value, "tai", "lac dau", "ray tai", "mui tai")) {
            return "ear";
        }
        if (containsAny(value, "ve", "bo chet", "ghe", "ky sinh", "giun")) {
            return "parasite";
        }
        return "";
    }

    private boolean hasUrgentSigns(String question) {
        String value = normalize(question);
        return containsAny(value,
                "kho tho", "tho gap", "ngat", "co giat", "xuat huyet", "chay mau", "non lien tuc",
                "tieu chay lien tuc", "di ngoai ra mau", "phan co mau", "liet", "khong dung duoc",
                "bo an hon 24", "bo an 2 ngay", "bo an nhieu ngay", "sot cao", "lu du", "yeu nhanh",
                "ngo doc", "an phai thuoc", "nuot di vat", "dau nhieu");
    }

    private String inferSpecies(String question) {
        String value = " " + normalize(question) + " ";
        if (value.contains(" meo ")) return "meo";
        if (value.contains(" cun ") || value.contains(" cho con ") || value.contains(" con cho ")
                || value.contains(" cho nha ") || value.contains(" cho cua ")) {
            return "cho";
        }
        if (value.contains(" tho ")) return "tho";
        if (value.contains(" chuot lang ")) return "chuot lang";
        if (value.contains(" hamster ")) return "hamster";
        return "";
    }

    private boolean containsAny(String value, String... terms) {
        for (String term : terms) {
            if (value.contains(normalize(term))) {
                return true;
            }
        }
        return false;
    }

    private String normalizeSpeciesLabel(String species) {
        if (species == null || species.isBlank()) {
            return "thú cưng";
        }
        return species
                .replaceFirst("(?i)^con\\s+", "")
                .trim()
                .toLowerCase(Locale.ROOT);
    }

    private Set<String> tokenize(String value) {
        String normalized = normalize(value);
        String[] parts = normalized.split("[^a-z0-9]+");
        Set<String> tokens = new HashSet<>();
        for (String part : parts) {
            if (part.length() >= 2 && !STOP_WORDS.contains(part)) {
                tokens.add(part);
            }
        }
        return tokens;
    }

    private String normalize(String value) {
        String normalized = Normalizer.normalize(value.toLowerCase(Locale.ROOT), Normalizer.Form.NFD);
        normalized = DIACRITICS.matcher(normalized).replaceAll("");
        return normalized.replace('đ', 'd');
    }

    private List<String> parseCsvLine(String line) {
        List<String> columns = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                columns.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        columns.add(current.toString());
        return columns;
    }

    private record ScoredEntry(KnowledgeEntry entry, int score) {
    }

    @Getter
    @Builder
    private static class KnowledgeEntry {
        private String description;
        private String category;
        private String source;
        private String advice;
        private String species;
        private String careGuide;
        private String normalizedText;
    }
}
