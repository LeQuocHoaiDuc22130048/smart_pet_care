package com.pet_care.identity.configuration;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Base class for common security configuration across all services.
 * This class provides shared beans and utilities for security setup.
 */
@Slf4j
public abstract class CommonSecurityConfig {

    @Value("${app.security.cors-allowed-origins:http://localhost:3000,http://localhost:3001}")
    protected String corsAllowedOrigins;

    /**
     * Password encoder bean
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /**
     * CORS Configuration Source
     * Configurable via property: app.security.cors-allowed-origins
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        log.info("Configuring CORS with allowed origins: {}", corsAllowedOrigins);

        CorsConfiguration corsConfig = new CorsConfiguration();

        // Parse CORS allowed origins from property (comma-separated)
        List<String> allowedOrigins = Arrays.asList(corsAllowedOrigins.split(","));
        allowedOrigins.forEach(origin -> corsConfig.addAllowedOrigin(origin.trim()));

        corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        corsConfig.setAllowedHeaders(Arrays.asList("*"));
        corsConfig.setExposedHeaders(Arrays.asList(
                HttpHeaders.AUTHORIZATION,
                HttpHeaders.CONTENT_TYPE,
                "X-Total-Count", // For pagination
                "X-Page-Number"
        ));
        corsConfig.setAllowCredentials(true);
        corsConfig.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfig);

        return source;
    }

    /**
     * Get CORS allowed origins as list
     */
    protected List<String> getAllowedOrigins() {
        return Arrays.asList(corsAllowedOrigins.split(","));
    }

    /**
     * Check if origin is allowed
     */
    protected boolean isOriginAllowed(String origin) {
        if (origin == null) {
            return false;
        }
        return getAllowedOrigins().stream()
                .map(String::trim)
                .anyMatch(allowed -> allowed.equals(origin));
    }
}

