package com.pet_care.user_service.service;

import com.pet_care.user_service.dto.ImageUploadData;
import com.pet_care.user_service.dto.request.PetRequest;
import com.pet_care.user_service.dto.response.PetResponse;
import com.pet_care.user_service.entity.Pet;
import com.pet_care.user_service.exception.AppException;
import com.pet_care.user_service.exception.ErrorCode;
import com.pet_care.user_service.mapper.PetMapper;
import com.pet_care.user_service.repository.PetRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PetService {

    PetRepository petRepository;
    PetMapper petMapper;
    ImageAsyncService imageAsyncService;

    public List<PetResponse> getMyPets() {
        String userId = getCurrentUserId();
        return petRepository.findByUserId(userId).stream()
                .map(petMapper::toPetResponse)
                .toList();
    }

    public PetResponse getPetById(String petId) {
        String userId = getCurrentUserId();
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));
        if (!pet.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return petMapper.toPetResponse(pet);
    }

    @Transactional
    public PetResponse createPet(PetRequest request) throws IOException {
        String userId = getCurrentUserId();

        Pet pet = petMapper.toPet(request);
        pet.setUserId(userId);

        Pet saved = petRepository.save(pet);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imageAsyncService.uploadPetImageAsync(saved.getId(),
                    ImageUploadData.builder().image(request.getImage().getBytes()).build());
        }

        return petMapper.toPetResponse(saved);
    }

    @Transactional
    public PetResponse updatePet(String petId, PetRequest request) throws IOException {
        String userId = getCurrentUserId();
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));

        if (!pet.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        petMapper.updatePet(pet, request);
        Pet saved = petRepository.save(pet);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imageAsyncService.uploadPetImageAsync(saved.getId(),
                    ImageUploadData.builder().image(request.getImage().getBytes()).build());
        }

        return petMapper.toPetResponse(saved);
    }

    public void deletePet(String petId) {
        String userId = getCurrentUserId();
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));

        if (!pet.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        petRepository.delete(pet);
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
