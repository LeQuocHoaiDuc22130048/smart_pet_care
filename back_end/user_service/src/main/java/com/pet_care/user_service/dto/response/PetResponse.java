package com.pet_care.user_service.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pet_care.user_service.enums.Gender;
import com.pet_care.user_service.enums.PetSpecies;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetResponse {

    private String id;

    @JsonProperty("user_id")
    private String userId;

    private String name;

    private PetSpecies species;

    private String breed;

    private Integer age;

    private Double weight;

    private Gender gender;

    @JsonProperty("is_neutered")
    private Boolean isNeutered;

    @JsonProperty("health_notes")
    private String healthNotes;

    @JsonProperty("image_url")
    private String imageUrl;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;
}
