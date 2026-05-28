package com.pet_care.notification.controller;

import com.pet_care.notification.dto.ApiResponse;
import com.pet_care.notification.dto.NotificationCreateRequest;
import com.pet_care.notification.dto.NotificationResponse;
import com.pet_care.notification.dto.UnreadCountResponse;
import com.pet_care.notification.service.NotificationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    @GetMapping("/my")
    public ApiResponse<List<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "false") boolean unreadOnly
    ) {
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getMyNotifications(resolveUserId(jwt), isAdmin(jwt), unreadOnly))
                .build();
    }

    @GetMapping("/my/unread-count")
    public ApiResponse<UnreadCountResponse> countUnread(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.<UnreadCountResponse>builder()
                .result(notificationService.countUnread(resolveUserId(jwt), isAdmin(jwt)))
                .build();
    }

    @PatchMapping("/{notificationId}/read")
    public ApiResponse<NotificationResponse> markAsRead(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String notificationId
    ) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.markAsRead(resolveUserId(jwt), isAdmin(jwt), notificationId))
                .build();
    }

    @PatchMapping("/my/read-all")
    public ApiResponse<Void> markAllAsRead(@AuthenticationPrincipal Jwt jwt) {
        notificationService.markAllAsRead(resolveUserId(jwt), isAdmin(jwt));
        return ApiResponse.<Void>builder()
                .message("All notifications marked as read")
                .build();
    }

    @PostMapping
    public ApiResponse<NotificationResponse> create(@RequestBody @Valid NotificationCreateRequest request) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.create(request))
                .build();
    }

    private String resolveUserId(Jwt jwt) {
        String userId = jwt.getClaimAsString("userId");
        if (userId == null || userId.isBlank()) {
            userId = jwt.getSubject();
        }
        return userId;
    }

    private boolean isAdmin(Jwt jwt) {
        String scope = jwt.getClaimAsString("scope");
        return scope != null && scope.contains("ROLE_ADMIN");
    }
}
