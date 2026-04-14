package com.pet_care.user_service.consumer;

import com.pet_care.user_service.configuration.RabbitMQConfig;
import com.pet_care.user_service.entity.UserProfile;
import com.pet_care.user_service.event.UserCreatedEvent;
import com.pet_care.user_service.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserCreatedConsumer {

    private final UserProfileRepository userProfileRepository;

    @RabbitListener(queues = RabbitMQConfig.USER_CREATED_QUEUE)
    public void handleUserCreated(UserCreatedEvent event) {
        log.info("Received UserCreatedEvent for userId: {}", event.getUserId());

        // Idempotent: bỏ qua nếu profile đã tồn tại
        if (userProfileRepository.existsById(event.getUserId())) {
            log.warn("Profile already exists for userId: {}, skipping", event.getUserId());
            return;
        }

        UserProfile profile = UserProfile.builder()
                .id(event.getUserId())
                .username(event.getUsername())
                .firstName(event.getFirstName())
                .lastName(event.getLastName())
                .email(event.getEmail())
                .birthday(event.getBirthday() != null
                        ? event.getBirthday().atStartOfDay()
                        : null)
                .phone("")
                .syncedAt(LocalDateTime.now())
                .build();

        userProfileRepository.save(profile);
        log.info("Profile created for userId: {}", event.getUserId());
    }
}
