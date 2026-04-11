package com.pet_care.user_service.service;

import com.pet_care.user_service.dto.ImageUploadData;
import com.pet_care.user_service.dto.request.UserProfileInitRequest;
import com.pet_care.user_service.dto.request.UserProfileUpdateRequest;
import com.pet_care.user_service.dto.response.UserProfileResponse;
import com.pet_care.user_service.entity.UserProfile;
import com.pet_care.user_service.exception.AppException;
import com.pet_care.user_service.exception.ErrorCode;
import com.pet_care.user_service.mapper.UserProfileMapper;
import com.pet_care.user_service.repository.UserProfileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileService {

    UserProfileRepository userProfileRepository;
    ImageAsyncService imageAsyncService;
    UserProfileMapper mapper;

    @Transactional
    public UserProfileResponse initializeOrUpdateProfile(UserProfileInitRequest request) {
        log.info("Initializing/Updating profile for user: {}", request.getUserId());

        UserProfile profile = userProfileRepository.findById(request.getUserId())
                .orElse(new UserProfile());

        if (profile.getId() == null) {
            profile.setId(request.getUserId());
        }

        profile.setUsername(request.getUsername());
        profile.setFirstName(request.getFirstName());
        profile.setLastName(request.getLastName());
        profile.setEmail(request.getEmail());
        profile.setBirthday(request.getBirthday());
        profile.setSyncedAt(LocalDateTime.now());

        if (profile.getPhone() == null) {
            profile.setPhone("");
        }

        UserProfile saved = userProfileRepository.save(profile);
        return mapper.toUserProfileResponse(saved);
    }

    public UserProfileResponse getMyProfile() {
        String userId = getCurrentUserId();
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_PROFILE_NOT_FOUND));
        return mapper.toUserProfileResponse(profile);
    }

    public UserProfileResponse getProfileById(String userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_PROFILE_NOT_FOUND));
        return mapper.toUserProfileResponse(profile);
    }

    @Transactional
    public UserProfileResponse updateMyProfile(UserProfileUpdateRequest request) throws IOException {
        String userId = getCurrentUserId();
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_PROFILE_NOT_FOUND));

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getEmail() != null) profile.setEmail(request.getEmail());
        if (request.getBirthday() != null) profile.setBirthday(request.getBirthday());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());

        UserProfile saved = userProfileRepository.save(profile);

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            imageAsyncService.uploadUserAvatarAsync(userId,
                    ImageUploadData.builder().image(request.getAvatar().getBytes()).build());
        }

        return mapper.toUserProfileResponse(saved);
    }

    private String getCurrentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
