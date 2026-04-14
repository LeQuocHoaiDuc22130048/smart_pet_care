package com.pet_care.user_service.controller;

import com.pet_care.user_service.dto.ApiResponse;
import com.pet_care.user_service.dto.request.PetRequest;
import com.pet_care.user_service.dto.response.PetResponse;
import com.pet_care.user_service.service.PetService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PetController {

    PetService petService;

    @GetMapping
    public ApiResponse<List<PetResponse>> getMyPets() {
        return ApiResponse.<List<PetResponse>>builder()
                .result(petService.getMyPets())
                .build();
    }

    @GetMapping("/{petId}")
    public ApiResponse<PetResponse> getPetById(@PathVariable String petId) {
        return ApiResponse.<PetResponse>builder()
                .result(petService.getPetById(petId))
                .build();
    }

    @PostMapping
    public ApiResponse<PetResponse> createPet(@ModelAttribute PetRequest request) throws IOException {
        return ApiResponse.<PetResponse>builder()
                .result(petService.createPet(request))
                .build();
    }

    @PutMapping("/{petId}")
    public ApiResponse<PetResponse> updatePet(@PathVariable String petId,
                                               @ModelAttribute PetRequest request) throws IOException {
        return ApiResponse.<PetResponse>builder()
                .result(petService.updatePet(petId, request))
                .build();
    }

    @DeleteMapping("/{petId}")
    public ApiResponse<String> deletePet(@PathVariable String petId) {
        petService.deletePet(petId);
        return ApiResponse.<String>builder().result("Pet deleted").build();
    }
}
