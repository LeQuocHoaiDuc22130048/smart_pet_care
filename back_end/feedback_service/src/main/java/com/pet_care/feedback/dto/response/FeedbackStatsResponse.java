package com.pet_care.feedback.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Response DTO for feedback statistics
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedbackStatsResponse {
    
    Long totalFeedbacks;
    Double averageRating;
    Map<Integer, Long> ratingDistribution; // Rating (1-5) -> Count
    Long verifiedPurchaseCount;
}
