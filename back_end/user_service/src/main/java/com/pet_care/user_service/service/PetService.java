package com.pet_care.user_service.service;

import com.pet_care.user_service.dto.ImageUploadData;
import com.pet_care.user_service.dto.request.PetRequest;
import com.pet_care.user_service.dto.response.PetResponse;
import com.pet_care.user_service.entity.Pet;
import com.pet_care.user_service.exception.AppException;
import com.pet_care.user_service.exception.ErrorCode;
import com.pet_care.user_service.mapper.PetMapper;
import com.pet_care.user_service.repository.PetRepository;
import com.pet_care.user_service.repository.UserProfileRepository;
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
    UserProfileRepository userProfileRepository;

    public List<PetResponse> getMyPets() {
        String userId = getMyUserId();
        return petRepository.findByUserId(userId).stream()
                .map(petMapper::toPetResponse)
                .toList();
    }

    public PetResponse getPetById(String petId) {
        String userId = getMyUserId();
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));
        if (!pet.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }
        return petMapper.toPetResponse(pet);
    }

    @Transactional
    public PetResponse createPet(PetRequest request) throws IOException {
        String userId = getMyUserId();

        Pet pet = petMapper.toPet(request);
        pet.setUserId(userId);

        // saveAndFlush để Hibernate flush ngay, @CreationTimestamp được set trước khi map response
        Pet saved = petRepository.saveAndFlush(pet);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imageAsyncService.uploadPetImageAsync(saved.getId(),
                    ImageUploadData.builder().image(request.getImage().getBytes()).build());
        }

        return petMapper.toPetResponse(saved);
    }

    @Transactional
    public PetResponse updatePet(String petId, PetRequest request) throws IOException {
        String userId = getMyUserId();
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));

        if (!pet.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        petMapper.updatePet(pet, request);
        Pet saved = petRepository.saveAndFlush(pet);

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imageAsyncService.uploadPetImageAsync(saved.getId(),
                    ImageUploadData.builder().image(request.getImage().getBytes()).build());
        }

        return petMapper.toPetResponse(saved);
    }

    public void deletePet(String petId) {
        String userId = getMyUserId();
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new AppException(ErrorCode.PET_NOT_FOUND));

        if (!pet.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        petRepository.delete(pet);
    }

    /** JWT sub = username → lấy userId (UUID) từ UserProfile */
    private String getMyUserId() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_PROFILE_NOT_FOUND))
                .getId();
    }
}
