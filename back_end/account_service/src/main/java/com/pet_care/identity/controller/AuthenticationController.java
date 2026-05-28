package com.pet_care.identity.controller;

import java.text.ParseException;

import jakarta.validation.Valid;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import com.pet_care.identity.dto.request.*;
import com.pet_care.identity.dto.response.ApiResponse;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pet_care.identity.dto.response.AuthenticationResponse;
import com.pet_care.identity.dto.response.IntrospectResponse;
import com.pet_care.identity.service.AuthenticationService;
import com.pet_care.identity.service.GoogleOAuthService;
import com.nimbusds.jose.JOSEException;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {
    AuthenticationService authenticationService;
    GoogleOAuthService googleOAuthService;

    @PostMapping("/token")
    @RateLimiter(name = "authentication")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody @Valid AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }
    
    @PostMapping("/google")
    @RateLimiter(name = "authentication")
    public ApiResponse<AuthenticationResponse> authenticateWithGoogle(@RequestBody @Valid GoogleAuthRequest request) {
        var result = googleOAuthService.authenticateWithGoogle(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> authenticate(@RequestBody @Valid IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }

    @PostMapping("/log-out")
    public ApiResponse<Void> logout(@RequestBody @Valid LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/refresh")
    @RateLimiter(name = "authentication")
    public ApiResponse<AuthenticationResponse> authenticate(@RequestBody @Valid RefreshRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.refreshToken(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }
}
