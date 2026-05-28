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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileService {

    private static final long MAX_AVATAR_SIZE_BYTES = 10 * 1024 * 1024;

    UserProfileRepository userProfileRepository;
    ImageAsyncService imageAsyncService;
    CloudinaryService cloudinaryService;
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
        log.info("updateMyProfile called for user '{}' | firstName='{}' lastName='{}' email='{}' phone='{}'",
                username, request.getFirstName(), request.getLastName(), request.getEmail(), request.getPhone());

        UserProfile profile = userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_PROFILE_NOT_FOUND));

        if (request.getFirstName() != null) profile.setFirstName(request.getFirstName());
        if (request.getLastName() != null) profile.setLastName(request.getLastName());
        if (request.getEmail() != null) profile.setEmail(request.getEmail());
        if (request.getBirthday() != null) profile.setBirthday(request.getBirthday());
        if (request.getPhone() != null) profile.setPhone(request.getPhone());
        if (request.getAvatar() != null) {
            validateAvatar(request.getAvatar());
            profile.setAvatarUrl(cloudinaryService.uploadUserAvatar(request.getAvatar().getBytes(), profile.getId()));
        }

        UserProfile saved = userProfileRepository.saveAndFlush(profile);
        log.info("Profile saved for user '{}': firstName='{}' lastName='{}'",
                username, saved.getFirstName(), saved.getLastName());

        return mapper.toUserProfileResponse(saved);
    }

    /**
     * Upload avatar đồng bộ: upload Cloudinary → lưu avatar_url vào DB → trả về profile đã cập nhật.
     * Khác với updateMyProfile, method này KHÔNG dùng @Async nên client nhận được avatar_url ngay.
     */
    @Transactional
    public UserProfileResponse updateMyAvatar(MultipartFile avatar) throws IOException {
        validateAvatar(avatar);

        String username = getCurrentUsername();
        UserProfile profile = userProfileRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.USER_PROFILE_NOT_FOUND));

        String avatarUrl = cloudinaryService.uploadUserAvatar(avatar.getBytes(), profile.getId());
        profile.setAvatarUrl(avatarUrl);

        UserProfile saved = userProfileRepository.saveAndFlush(profile);
        log.info("Avatar updated for user '{}': {}", username, avatarUrl);

        return mapper.toUserProfileResponse(saved);
    }

    private void validateAvatar(MultipartFile avatar) {
        String contentType = avatar == null ? null : avatar.getContentType();
        if (avatar == null
                || avatar.isEmpty()
                || avatar.getSize() > MAX_AVATAR_SIZE_BYTES
                || contentType == null
                || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.INVALID_AVATAR_FILE);
        }
    }

    private String getCurrentUsername() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
