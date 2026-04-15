package com.pet_care.user_service.dto.request;

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

    // multipart field name: isNeutered
    private Boolean isNeutered;

    // multipart field name: healthNotes
    private String healthNotes;

    private MultipartFile image;
}
