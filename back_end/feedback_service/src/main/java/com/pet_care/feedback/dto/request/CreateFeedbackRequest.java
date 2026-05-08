package com.pet_care.feedback.dto.request;

import com.pet_care.feedback.enums.FeedbackType;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO for creating feedback
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateFeedbackRequest {
    
    @NotNull(message = "Feedback type is required")
    FeedbackType type;
    
    // Reference IDs (required based on type)
    String productId;
    String orderId;
    String bookingId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    Integer rating;
    
    @NotBlank(message = "Comment is required")
    @Size(min = 10, max = 1000, message = "Comment must be between 10 and 1000 characters")
    String comment;
}
