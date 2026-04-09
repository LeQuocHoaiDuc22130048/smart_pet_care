package com.pet_care.order_service.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.order_service.dto.request.PaymentRequest;
import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import com.pet_care.order_service.exception.AppException;
import com.pet_care.order_service.exception.ErrorCode;
import com.pet_care.order_service.messaging.BaseEvent;
import com.pet_care.order_service.repository.OrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class StockEventConsumer {
    OrderRepository orderRepository;
    OrderEventPublisher orderEventPublisher;
    ObjectMapper objectMapper = new ObjectMapper();

    @RabbitListener(queues = "order.queue")
    public void consume(BaseEvent<?> event) {
        switch (event.getType()) {
            case "stock.reserved" -> handleReserved(event);

            case "stock.failed" -> handleFailed(event);
        }
    }

    private void handleFailed(BaseEvent<?> event) {
        String orderId = objectMapper.convertValue(event.getData(), Map.class).get("orderId").toString();

        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
    }

    private void handleReserved(BaseEvent<?> event) {
        String orderId = objectMapper.convertValue(event.getData(), Map.class).get("orderId").toString();

        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        order.setStatus(OrderStatus.RESERVED);
        orderRepository.save(order);

        orderEventPublisher.publish("payment.create",
                new PaymentRequest(order.getId(), order.getTotalPrice(), order.getUserId()));
    }


}
