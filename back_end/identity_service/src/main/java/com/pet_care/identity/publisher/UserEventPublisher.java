package com.pet_care.identity.publisher;

import com.pet_care.identity.configuration.RabbitMQConfig;
import com.pet_care.identity.event.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publishUserCreated(UserCreatedEvent event) {
        log.info("Publishing UserCreatedEvent for userId: {}", event.getUserId());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.USER_CREATED_EXCHANGE,
                RabbitMQConfig.USER_CREATED_ROUTING_KEY,
                event
        );
    }
}
