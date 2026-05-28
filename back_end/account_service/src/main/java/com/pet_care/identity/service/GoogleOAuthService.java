package com.pet_care.identity.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
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
    ObjectMapper objectMapper;

    @NonFinal
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    String googleClientId;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";
    
    /**
     * Authenticate user with Google ID Token.
     * If user doesn't exist, create new account.
     */
    @Transactional
    public AuthenticationResponse authenticateWithGoogle(GoogleAuthRequest request) {
        // Verify token via Google tokeninfo endpoint (no local crypto needed)
        GoogleUserInfo googleUserInfo = verifyGoogleToken(request.getIdToken());

        // Find or create user
        User user = userRepository.findByEmail(googleUserInfo.getEmail())
                .map(existingUser -> {
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

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        String jwtToken = authenticationService.generateTokenForUser(user);
        return AuthenticationResponse.builder()
                .token(jwtToken)
                .authenticated(true)
                .build();
    }

    /**
     * Verify Google ID Token by calling Google's tokeninfo endpoint.
     * This avoids local crypto and certificate-fetching issues.
     */
    private GoogleUserInfo verifyGoogleToken(String idTokenString) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GOOGLE_TOKENINFO_URL
                            + URLEncoder.encode(idTokenString, StandardCharsets.UTF_8)))
                    .GET()
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Google tokeninfo returned HTTP {}: {}", response.statusCode(), response.body());
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }

            JsonNode json = objectMapper.readTree(response.body());

            // Validate audience matches our client ID
            String aud = json.path("aud").asText("");
            if (!googleClientId.equals(aud)) {
                log.warn("Token audience mismatch. Expected: {}, Got: {}", googleClientId, aud);
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }

            // Validate email is verified
            boolean emailVerified = json.path("email_verified").asText("false").equals("true");
            if (!emailVerified) {
                log.warn("Google email not verified for token");
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }

            String email = json.path("email").asText(null);
            if (email == null || email.isBlank()) {
                log.warn("No email in Google token");
                throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
            }

            return GoogleUserInfo.builder()
                    .googleId(json.path("sub").asText())
                    .email(email)
                    .emailVerified(emailVerified)
                    .name(json.path("name").asText(null))
                    .givenName(json.path("given_name").asText(null))
                    .familyName(json.path("family_name").asText(null))
                    .picture(json.path("picture").asText(null))
                    .locale(json.path("locale").asText(null))
                    .build();

        } catch (AppException e) {
            throw e;
        } catch (IOException | InterruptedException e) {
            log.error("Failed to call Google tokeninfo endpoint: {}", e.getMessage());
            if (e instanceof InterruptedException) Thread.currentThread().interrupt();
            throw new AppException(ErrorCode.INVALID_GOOGLE_TOKEN);
        }
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
        
        try {
            userEventPublisher.publishUserCreated(event);
        } catch (Exception e) {
            log.warn("Could not publish UserCreatedEvent for Google user {}: {}", user.getId(), e.getMessage());
        }
        
        log.info("Successfully created Google user: {}", user.getUsername());
        return user;
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

        user.setGoogleId(googleUserInfo.getGoogleId());
        user.setEmail(googleUserInfo.getEmail());

        userRepository.save(user);
        log.info("Linked Google account to user: {}", user.getUsername());
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

        userRepository.save(user);
        log.info("Unlinked Google account from user: {}", user.getUsername());
    }
}
