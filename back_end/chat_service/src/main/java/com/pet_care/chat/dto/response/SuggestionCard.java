package com.pet_care.chat.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestionCard {

    private String type;
    private String id;
    private String name;
    private Integer price;
    private String imageUrl;
    private String link;
    private String description;
    private Integer durationMinutes;
}
