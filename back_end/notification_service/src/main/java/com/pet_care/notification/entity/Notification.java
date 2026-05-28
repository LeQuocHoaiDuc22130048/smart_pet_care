package com.pet_care.notification.entity;

import com.pet_care.notification.enums.NotificationType;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "notifications")
public class Notification {
    @Id
    String id;

    @Indexed
    String userId;

    String title;
    String message;
    NotificationType type;
    String referenceId;

    @Builder.Default
    boolean read = false;

    @Builder.Default
    LocalDateTime createdAt = LocalDateTime.now();
}
