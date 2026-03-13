package com.pet_care.order_service.event;

import com.pet_care.order_service.configuration.RabbitMQConfig;
import com.pet_care.order_service.entity.Orders;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderEventPublisher {
    RabbitTemplate rabbitTemplate;

    public void publishOrderCreated(OrderCreatedEvent event) {

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_EXCHANGE,
                RabbitMQConfig.ORDER_CREATED_KEY,
                event
        );

        log.info("Published order created event: {}", event);
    }
}
