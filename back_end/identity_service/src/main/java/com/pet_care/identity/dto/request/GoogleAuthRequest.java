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
    
    @NotBlank(message = "ID token is required")
    String idToken;  // Google ID Token from frontend
    
    String accessToken;  // Optional: Google Access Token for Gmail API
    
    String refreshToken; // Optional: Google Refresh Token for long-term access
}
