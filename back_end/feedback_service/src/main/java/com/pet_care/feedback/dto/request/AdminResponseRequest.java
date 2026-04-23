package com.pet_care.feedback.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO for admin response to feedback
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminResponseRequest {
    
    @NotBlank(message = "Response is required")
    @Size(min = 10, max = 500, message = "Response must be between 10 and 500 characters")
    String response;
}
