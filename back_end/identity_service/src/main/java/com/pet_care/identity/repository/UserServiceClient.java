package com.pet_care.identity.repository;

import com.pet_care.identity.dto.request.ProfileInitRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Slf4j
@Component
public class UserServiceClient {

    private final RestClient restClient;

    public UserServiceClient(@Value("${services.user-service.url}") String userServiceUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(userServiceUrl)
                .build();
    }

    public void initUserProfile(ProfileInitRequest request) {
        try {
            restClient.post()
                    .uri("/profiles/init")
                    .body(request)
                    .retrieve()
                    .toBodilessEntity();
            log.info("Profile initialized for user: {}", request.getUserId());
        } catch (Exception e) {
            // Non-blocking: log lỗi nhưng không fail luồng tạo user
            log.error("Failed to init profile for user {}: {}", request.getUserId(), e.getMessage());
        }
    }
}
