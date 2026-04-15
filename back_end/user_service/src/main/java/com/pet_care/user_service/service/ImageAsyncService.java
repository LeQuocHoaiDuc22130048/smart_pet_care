package com.pet_care.user_service.service;

import com.pet_care.user_service.dto.ImageUploadData;
import com.pet_care.user_service.entity.Pet;
import com.pet_care.user_service.entity.UserProfile;
import com.pet_care.user_service.repository.PetRepository;
import com.pet_care.user_service.repository.UserProfileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ImageAsyncService {

    CloudinaryService cloudinaryService;
    UserProfileRepository userProfileRepository;
    PetRepository petRepository;

    @Async
    public void uploadUserAvatarAsync(String userId, ImageUploadData imageData) {
        try {
            log.info("Starting async avatar upload for user id: {}", userId);
            String avatarUrl = cloudinaryService.uploadUserAvatar(imageData.getImage());

            UserProfile user = userProfileRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            user.setAvatarUrl(avatarUrl);
            userProfileRepository.save(user);

            log.info("Completed avatar upload for user id: {} -> {}", userId, avatarUrl);
        } catch (Exception e) {
            log.error("Error uploading avatar for user: {}", userId, e);
        }
    }

    @Async
    public void uploadPetImageAsync(String petId, ImageUploadData imageData) {
        try {
            log.info("Starting async pet image upload for pet id: {}", petId);
            String imageUrl = cloudinaryService.uploadPetImage(imageData.getImage());

            Pet pet = petRepository.findById(petId)
                    .orElseThrow(() -> new RuntimeException("Pet not found: " + petId));

            pet.setImageUrl(imageUrl);
            petRepository.save(pet);

            log.info("Completed pet image upload for pet id: {} -> {}", petId, imageUrl);
        } catch (Exception e) {
            log.error("Error uploading image for pet: {}", petId, e);
        }
    }
}
