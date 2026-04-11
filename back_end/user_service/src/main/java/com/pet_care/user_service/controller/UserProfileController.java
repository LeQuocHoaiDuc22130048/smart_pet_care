package com.pet_care.user_service.controller;

import com.pet_care.user_service.dto.ApiResponse;
import com.pet_care.user_service.dto.request.UserProfileInitRequest;
import com.pet_care.user_service.dto.request.UserProfileUpdateRequest;
import com.pet_care.user_service.dto.response.UserProfileResponse;
import com.pet_care.user_service.service.UserProfileService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserProfileController {

    UserProfileService userProfileService;

    // Internal endpoint: called by identity_service after user registration
    @PostMapping("/init")
    public ApiResponse<UserProfileResponse> initProfile(@RequestBody UserProfileInitRequest request) {
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.initializeOrUpdateProfile(request))
                .build();
    }

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
        return ApiResponse.<UserProfileResponse>builder()
                .result(userProfileService.updateMyProfile(request))
                .build();
    }
}
