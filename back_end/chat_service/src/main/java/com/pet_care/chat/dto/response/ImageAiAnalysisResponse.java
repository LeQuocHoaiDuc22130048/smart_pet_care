package com.pet_care.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageAiAnalysisResponse {

    private String summary;
    private List<String> observations;
    private List<String> careTips;
    private List<String> warnings;
    private List<String> searchKeywords;
    private Double confidence;
    private String matchedLabel;
}
