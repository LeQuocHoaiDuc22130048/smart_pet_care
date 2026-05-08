package com.pet_care.feedback.dto.response;

import com.pet_care.feedback.enums.FeedbackStatus;
import com.pet_care.feedback.enums.FeedbackType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for feedback
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackResponse {
    
    String id;
    String userId;
    String username;
    FeedbackType type;
    String productId;
    String orderId;
    String bookingId;
    Integer rating;
    String comment;
    List<String> imageUrls;
    FeedbackStatus status;
    String adminResponse;
    LocalDateTime adminResponseAt;
    Integer helpfulCount;
    Integer notHelpfulCount;
    Boolean verifiedPurchase;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
