package com.pet_care.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImageAiSearchResult {

    private String productId;
    private Double score;
    private String productName;
    private String imageUrl;
}
