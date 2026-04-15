package com.pet_care.user_service.service;

import com.pet_care.user_service.dto.ImageUploadData;
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

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileService {

    UserProfileRepository userProfileRepository;
    ImageAsyncService imageAsyncService;
    UserProfileMapper mapper;

    public UserProfileResponse getMyProfile() {
        String username = getCurrentUsername();
        UserProfile profile = userProfileRepository.findByUsername(username)
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
        String username = getCurrentUsername();
        UserProfile profile = userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_PROFILE_NOT_FOUND));

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getEmail() != null) profile.setEmail(request.getEmail());
        if (request.getBirthday() != null) profile.setBirthday(request.getBirthday());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());

        UserProfile saved = userProfileRepository.saveAndFlush(profile);

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            imageAsyncService.uploadUserAvatarAsync(saved.getId(),
                    ImageUploadData.builder().image(request.getAvatar().getBytes()).build());
        }

        return mapper.toUserProfileResponse(saved);
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
