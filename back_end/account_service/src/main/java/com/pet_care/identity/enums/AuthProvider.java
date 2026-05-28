package com.pet_care.identity.enums;

/**
 * Authentication Provider Enum
 * Defines the authentication method used by the user
 */
public enum AuthProvider {
    LOCAL,      // Traditional username/password
    GOOGLE,     // Google OAuth2
    FACEBOOK,   // Facebook OAuth2 (future)
    APPLE       // Apple Sign In (future)
}
