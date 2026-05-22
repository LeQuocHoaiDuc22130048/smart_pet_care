package com.pet_care.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImageSearchResponse {

    private String summary;
    private List<String> observations;
    private List<String> careTips;
    private List<String> warnings;
    private List<String> searchKeywords;
    private List<DiseaseMatch> diseaseMatches;
    private List<SuggestionCard> productSuggestions;
    private List<SuggestionCard> serviceSuggestions;
    private String disclaimer;
    private List<SuggestionCard> suggestions;
}
