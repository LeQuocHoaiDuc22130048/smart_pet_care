package com.pet_care.order_service.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.order_service.dto.request.PaymentRequest;
import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import com.pet_care.order_service.messaging.BaseEvent;
import com.pet_care.order_service.repository.OrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StockEventConsumer {

    OrderRepository orderRepository;
    OrderEventPublisher orderEventPublisher;
    ObjectMapper objectMapper;

    @RabbitListener(queues = "order.queue")
    public void consume(BaseEvent<?> event) {
        log.info("Received stock event: {}", event.getType());
        switch (event.getType()) {
            case "stock.reserved" -> handleReserved(event);
            case "stock.failed"   -> handleFailed(event);
            default -> log.warn("Unknown event type: {}", event.getType());
        }
    }

    private void handleFailed(BaseEvent<?> event) {
        String orderId = extractOrderId(event);
        if (orderId == null) return;

        Optional<Orders> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            // Stale message — order không tồn tại, bỏ qua (acknowledge)
            log.warn("stock.failed: order {} not found, skipping stale message", orderId);
            return;
        }

        Orders order = orderOpt.get();
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
        log.info("Order {} marked as FAILED due to stock reservation failure", orderId);
    }

    private void handleReserved(BaseEvent<?> event) {
        String orderId = extractOrderId(event);
        if (orderId == null) return;

        Optional<Orders> orderOpt = orderRepository.findById(orderId);
        if (orderOpt.isEmpty()) {
            log.warn("stock.reserved: order {} not found, skipping stale message", orderId);
            return;
        }

        Orders order = orderOpt.get();
        order.setStatus(OrderStatus.RESERVED);
        orderRepository.save(order);
        log.info("Order {} marked as RESERVED, publishing payment request", orderId);

        orderEventPublisher.publish("payment.create",
                new PaymentRequest(order.getId(), order.getTotalPrice(), order.getUserId()));
    }

    private String extractOrderId(BaseEvent<?> event) {
        try {
            Object orderId = objectMapper.convertValue(event.getData(), Map.class).get("orderId");
            if (orderId == null) {
                log.error("Event {} missing orderId field", event.getType());
                return null;
            }
            return orderId.toString();
        } catch (Exception e) {
            log.error("Failed to extract orderId from event {}: {}", event.getType(), e.getMessage());
            return null;
        }
    }
}
