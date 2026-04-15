package com.pet_care.user_service.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.pet_care.user_service.enums.Gender;
import com.pet_care.user_service.enums.PetSpecies;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PetRequest {

    private String name;

    private PetSpecies species;

    private String breed;

    private Integer age;

    private Double weight;

    private Gender gender;

    // Chấp nhận cả "isNeutered" (camelCase) và "is_neutered" (snake_case)
    @JsonAlias("is_neutered")
    private Boolean isNeutered;

    // Chấp nhận cả "healthNotes" (camelCase) và "health_notes" (snake_case)
    @JsonAlias("health_notes")
    private String healthNotes;

    private MultipartFile image;

    // Setter alias cho multipart/form-data binding (Spring dùng setter name)
    public void setIs_neutered(Boolean value) {
        this.isNeutered = value;
    }

    public void setHealth_notes(String value) {
        this.healthNotes = value;
    }
}
