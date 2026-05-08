package com.pet_care.feedback.entity;

import com.pet_care.feedback.enums.FeedbackStatus;
import com.pet_care.feedback.enums.FeedbackType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Feedback entity stored in MongoDB
 * Supports multiple types: Product, Order, Service, System
 */
@Document(collection = "feedbacks")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Feedback {
    
    @Id
    String id;
    
    @Indexed
    String userId;
    
    String username;
    
    @Indexed
    FeedbackType type;
    
    // Reference IDs based on type
    @Indexed
    String productId;      // For PRODUCT type
    
    @Indexed
    String orderId;        // For ORDER type
    
    @Indexed
    String bookingId;      // For SERVICE type
    
    // Rating (1-5 stars)
    Integer rating;
    
    // Comment text
    String comment;
    
    // Image URLs (uploaded to Cloudinary)
    @Builder.Default
    List<String> imageUrls = new ArrayList<>();
    
    // Status
    @Builder.Default
    FeedbackStatus status = FeedbackStatus.PENDING;
    
    // Admin response
    String adminResponse;
    
    LocalDateTime adminResponseAt;
    
    // Helpful votes
    @Builder.Default
    Integer helpfulCount = 0;
    
    @Builder.Default
    Integer notHelpfulCount = 0;
    
    // Verified purchase (for product/order feedback)
    @Builder.Default
    Boolean verifiedPurchase = false;
    
    @CreatedDate
    LocalDateTime createdAt;
    
    @LastModifiedDate
    LocalDateTime updatedAt;
}
