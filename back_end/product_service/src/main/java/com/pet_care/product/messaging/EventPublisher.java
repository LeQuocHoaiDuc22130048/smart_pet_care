package com.pet_care.product.event;

import com.pet_care.product.messaging.BaseEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class EventPublisher {
    RabbitTemplate rabbitTemplate;

    public void publish(String routingKey, Object data) {
        BaseEvent<Object> event = new BaseEvent<>();
        event.setEventId(java.util.UUID.randomUUID().toString());
        event.setType(routingKey);
        event.setTimestamp(LocalDateTime.now());
        event.setData(data);

        rabbitTemplate.convertAndSend(routingKey, event);
    }
}
