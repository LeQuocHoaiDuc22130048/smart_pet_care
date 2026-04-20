package com.pet_care.identity.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.pet_care.identity.dto.request.GoogleAuthRequest;
import com.pet_care.identity.dto.response.AuthenticationResponse;
import com.pet_care.identity.dto.response.GoogleUserInfo;
import com.pet_care.identity.entity.Role;
import com.pet_care.identity.entity.User;
import com.pet_care.identity.enums.AuthProvider;
import com.pet_care.identity.event.UserCreatedEvent;
import com.pet_care.identity.exception.AppException;
import com.pet_care.identity.exception.ErrorCode;
import com.pet_care.identity.publisher.UserEventPublisher;
import com.pet_care.identity.repository.RoleRepository;
import com.pet_care.identity.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

/**
 * Service for handling Google OAuth2 authentication
 */
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class GoogleOAuthService {
    
    UserRepository userRepository;
    RoleRepository roleRepository;
    AuthenticationService authenticationService;
    UserEventPublisher userEventPublisher;
    
    @NonFinal
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    String googleClientId;
    
    /**
     * Authenticate user with Google ID Token
     * If user doesn't exist, create new account
     */
    @Transactional
    public AuthenticationResponse authenticateWithGoogle(GoogleAuthRequest request) {
        try {
            // Verify and decode Google ID Token
            GoogleUserInfo googleUserInfo = verifyGoogleToken(request.getIdToken());
            
            // Find or create user
            User user = userRepository.findByEmail(googleUserInfo.getEmail())
                    .map(existingUser -> {
                        // If user exists but not linked to Google, link it
                        if (existingUser.getGoogleId() == null) {
                            log.info("Linking existing user {} to Google account", existingUser.getUsername());
                            existingUser.setGoogleId(googleUserInfo.getGoogleId());
                            existingUser.setAuthProvider(AuthProvider.GOOGLE);
                            existingUser.setAvatarUrl(googleUserInfo.getPicture());
                            return userRepository.save(existingUser);
                        }
                        return existingUser;
                    })
                    .orElseGet(() -> createGoogleUser(googleUserInfo));
            
            // Update Google tokens if provided
            if (request.getAccessToken() != null || request.getRefreshToken() != null) {
                updateGoogleTokens(user, request.getAccessToken(), request.getRefreshToken());
            }
            
            // Generate JWT token
            String jwtToken = authenticationService.generateTokenForUser(user);
            
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .authenticated(true)
                    .build();
            
        } catch (GeneralSecurityException | IOException e) {
            log.error("Failed to verify Google token", e);
            throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
    }
    
    /**
     * Verify Google ID Token and extract user information
     */
    private GoogleUserInfo verifyGoogleToken(String idTokenString) 
            throws GeneralSecurityException, IOException {
        
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), 
                GsonFactory.getDefaultInstance())
                .setAudience(Collections.singletonList(googleClientId))
                .build();
        
        GoogleIdToken idToken = verifier.verify(idTokenString);
        
        if (idToken == null) {
            throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
        
        GoogleIdToken.Payload payload = idToken.getPayload();
        
        // Verify email is verified by Google
        if (!payload.getEmailVerified()) {
            log.warn("Google email not verified: {}", payload.getEmail());
            throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
        
        return GoogleUserInfo.builder()
                .googleId(payload.getSubject())
                .email(payload.getEmail())
                .emailVerified(payload.getEmailVerified())
                .name((String) payload.get("name"))
                .givenName((String) payload.get("given_name"))
                .familyName((String) payload.get("family_name"))
                .picture((String) payload.get("picture"))
                .locale((String) payload.get("locale"))
                .build();
    }
    
    /**
     * Create new user from Google account
     */
    private User createGoogleUser(GoogleUserInfo googleUserInfo) {
        log.info("Creating new user from Google account: {}", googleUserInfo.getEmail());
        
        // Get default USER role
        Role userRole = roleRepository.findById("USER")
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));
        
        Set<Role> roles = new HashSet<>();
        roles.add(userRole);
        
        // Handle null names
        String firstName = googleUserInfo.getGivenName() != null 
                ? googleUserInfo.getGivenName() 
                : "User";
        String lastName = googleUserInfo.getFamilyName() != null 
                ? googleUserInfo.getFamilyName() 
                : "";
        
        // Create user with Google information
        User user = User.builder()
                .username(generateUsernameFromEmail(googleUserInfo.getEmail()))
                .email(googleUserInfo.getEmail())
                .firstName(firstName)
                .lastName(lastName)
                .avatarUrl(googleUserInfo.getPicture())
                .authProvider(AuthProvider.GOOGLE)
                .googleId(googleUserInfo.getGoogleId())
                .isActive(true)
                .roles(roles)
                .build();
        
        user = userRepository.save(user);
        
        // Publish user created event for User Service
        UserCreatedEvent event = UserCreatedEvent.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .birthday(user.getBirthDate())
                .build();
        
        userEventPublisher.publishUserCreated(event);
        
        log.info("Successfully created Google user: {}", user.getUsername());
        return user;
    }
    
    /**
     * Update Google access and refresh tokens
     */
    private void updateGoogleTokens(User user, String accessToken, String refreshToken) {
        boolean updated = false;
        
        if (accessToken != null && !accessToken.equals(user.getGoogleAccessToken())) {
            user.setGoogleAccessToken(accessToken);
            updated = true;
        }
        
        if (refreshToken != null && !refreshToken.equals(user.getGoogleRefreshToken())) {
            user.setGoogleRefreshToken(refreshToken);
            updated = true;
        }
        
        if (updated) {
            userRepository.save(user);
            log.info("Updated Google tokens for user: {}", user.getUsername());
        }
    }
    
    /**
     * Generate unique username from email
     */
    private String generateUsernameFromEmail(String email) {
        String baseUsername = email.split("@")[0];
        String username = baseUsername;
        int counter = 1;
        
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + counter;
            counter++;
        }
        
        return username;
    }
    
    /**
     * Link existing account with Google
     */
    @Transactional
    public void linkGoogleAccount(String userId, GoogleAuthRequest request) {
        try {
            GoogleUserInfo googleUserInfo = verifyGoogleToken(request.getIdToken());
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
            
            // Check if Google account is already linked to another user
            userRepository.findByGoogleId(googleUserInfo.getGoogleId())
                    .ifPresent(existingUser -> {
                        if (!existingUser.getId().equals(userId)) {
                            throw new AppException(ErrorCode.GOOGLE_ACCOUNT_ALREADY_LINKED);
                        }
                    });
            
            // Link Google account
            user.setGoogleId(googleUserInfo.getGoogleId());
            user.setEmail(googleUserInfo.getEmail());
            user.setGoogleAccessToken(request.getAccessToken());
            user.setGoogleRefreshToken(request.getRefreshToken());
            
            userRepository.save(user);
            log.info("Linked Google account to user: {}", user.getUsername());
            
        } catch (GeneralSecurityException | IOException e) {
            log.error("Failed to link Google account", e);
            throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
    }
    
    /**
     * Unlink Google account
     */
    @Transactional
    public void unlinkGoogleAccount(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        if (user.getAuthProvider() == AuthProvider.GOOGLE && user.getPassword() == null) {
            throw new AppException(ErrorCode.CANNOT_UNLINK_PRIMARY_AUTH);
        }
        
        user.setGoogleId(null);
        user.setGoogleAccessToken(null);
        user.setGoogleRefreshToken(null);
        
        userRepository.save(user);
        log.info("Unlinked Google account from user: {}", user.getUsername());
    }
}
