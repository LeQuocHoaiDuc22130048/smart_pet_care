package com.pet_care.notification.dto;

import com.pet_care.notification.enums.NotificationType;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String userId;
    String title;
    String message;
    NotificationType type;
    String referenceId;
    boolean read;
    LocalDateTime createdAt;
}
