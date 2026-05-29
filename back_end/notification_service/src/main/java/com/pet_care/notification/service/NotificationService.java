package com.pet_care.notification.service;

import com.pet_care.notification.dto.NotificationCreateRequest;
import com.pet_care.notification.dto.NotificationResponse;
import com.pet_care.notification.dto.UnreadCountResponse;
import com.pet_care.notification.entity.Notification;
import com.pet_care.notification.enums.NotificationType;
import com.pet_care.notification.repository.NotificationRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {
    public static final String ADMIN_AUDIENCE = "ADMIN";

    NotificationRepository notificationRepository;
    EmailNotificationService emailNotificationService;

    public NotificationResponse create(NotificationCreateRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType())
                .referenceId(request.getReferenceId())
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification saved = notificationRepository.save(notification);
        emailNotificationService.sendIfEligible(saved);
        return toResponse(saved);
    }

    public NotificationResponse createSystemNotification(
            String userId,
            String title,
            String message,
            NotificationType type,
            String referenceId
    ) {
        return create(NotificationCreateRequest.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .referenceId(referenceId)
                .build());
    }

    public List<NotificationResponse> getMyNotifications(String userId, boolean unreadOnly) {
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId)
                : notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        return notifications.stream()
                .map(this::toResponse)
                .toList();
    }

    public List<NotificationResponse> getMyNotifications(String userId, boolean admin, boolean unreadOnly) {
        if (!admin) {
            return getMyNotifications(userId, unreadOnly);
        }

        List<String> userIds = List.of(userId, ADMIN_AUDIENCE);
        List<Notification> notifications = unreadOnly
                ? notificationRepository.findByUserIdInAndReadFalseOrderByCreatedAtDesc(userIds)
                : notificationRepository.findByUserIdInOrderByCreatedAtDesc(userIds);

        return notifications.stream()
                .map(this::toResponse)
                .toList();
    }

    public UnreadCountResponse countUnread(String userId) {
        return UnreadCountResponse.builder()
                .unreadCount(notificationRepository.countByUserIdAndReadFalse(userId))
                .build();
    }

    public UnreadCountResponse countUnread(String userId, boolean admin) {
        if (!admin) {
            return countUnread(userId);
        }

        return UnreadCountResponse.builder()
                .unreadCount(notificationRepository.countByUserIdInAndReadFalse(List.of(userId, ADMIN_AUDIENCE)))
                .build();
    }

    public NotificationResponse markAsRead(String userId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        if (!notification.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Notification does not belong to current user");
        }

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    public NotificationResponse markAsRead(String userId, boolean admin, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));

        boolean belongsToUser = notification.getUserId().equals(userId);
        boolean belongsToAdminAudience = admin && notification.getUserId().equals(ADMIN_AUDIENCE);
        if (!belongsToUser && !belongsToAdminAudience) {
            throw new IllegalArgumentException("Notification does not belong to current user");
        }

        notification.setRead(true);
        return toResponse(notificationRepository.save(notification));
    }

    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    public void markAllAsRead(String userId, boolean admin) {
        if (!admin) {
            markAllAsRead(userId);
            return;
        }

        List<Notification> notifications = notificationRepository
                .findByUserIdInAndReadFalseOrderByCreatedAtDesc(List.of(userId, ADMIN_AUDIENCE));
        notifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationResponse toResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .referenceId(notification.getReferenceId())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
