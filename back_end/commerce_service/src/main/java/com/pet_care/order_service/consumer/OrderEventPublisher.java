package com.pet_care.order_service.consumer;

import com.pet_care.order_service.configuration.RabbitMQConfig;
import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import com.pet_care.order_service.messaging.BaseEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderEventPublisher {
    RabbitTemplate rabbitTemplate;

    public void publish(String routingKey, Object data) {

        BaseEvent<Object> event = new BaseEvent<>();
        event.setEventId(UUID.randomUUID().toString());
        event.setType(routingKey);
        event.setTimestamp(LocalDateTime.now());
        event.setData(data);

        rabbitTemplate.convertAndSend("order.exchange", routingKey, event);
    }

    public void publishOrderStatusChanged(Orders order, OrderStatus oldStatus, OrderStatus newStatus) {
        if (order == null || newStatus == null || oldStatus == newStatus) {
            return;
        }

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.ORDER_STATUS_CHANGED_KEY,
                Map.of(
                        "orderId", order.getId(),
                        "userId", order.getUserId(),
                        "oldStatus", oldStatus.name(),
                        "newStatus", newStatus.name()
                )
        );
    }
}
