package com.pet_care.identity.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO for Google OAuth2 authentication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleAuthRequest {
    
    @NotBlank(message = "FIELD_REQUIRED")
    String idToken;  // Google ID Token from frontend
    
    String accessToken;  // Accepted for backward compatibility; never persisted.
    
    String refreshToken; // Accepted for backward compatibility; never persisted.
}
