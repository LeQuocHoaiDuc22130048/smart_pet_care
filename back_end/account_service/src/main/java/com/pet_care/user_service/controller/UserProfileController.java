package com.pet_care.user_service.controller;

import com.pet_care.user_service.dto.ApiResponse;
import com.pet_care.user_service.dto.request.UserProfileUpdateRequest;
import com.pet_care.user_service.dto.response.UserProfileResponse;
import com.pet_care.user_service.service.UserProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {

    UserProfileService userProfileService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile() {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getMyProfile())
                .build();
    }

    @GetMapping("/{userId}")
    public ApiResponse<UserProfileResponse> getProfileById(@PathVariable String userId) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.getProfileById(userId))
                .build();
    }

    @PutMapping("/me")
    public ApiResponse<UserProfileResponse> updateMyProfile(@ModelAttribute UserProfileUpdateRequest request)
            throws IOException {
        log.info("PUT /profiles/me received | firstName='{}' lastName='{}' email='{}' phone='{}'",
                request.getFirstName(), request.getLastName(), request.getEmail(), request.getPhone());
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateMyProfile(request))
                .build();
    }

    /**
     * PUT /profiles/me/avatar — Upload avatar đồng bộ.
     * Trả về profile với avatar_url đã được lưu vào DB ngay lập tức.
     */
    @PutMapping(value = "/me/avatar", consumes = "multipart/form-data")
    public ApiResponse<UserProfileResponse> updateMyAvatar(
            @RequestPart("avatar") MultipartFile avatar) throws IOException {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateMyAvatar(avatar))
                .build();
    }
}
