package com.pet_care.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseMatch {

    private String name;
    private String description;
    private String matchedLabel;
    private Double confidence;
}
