package com.pet_care.order_service.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import com.pet_care.order_service.messaging.BaseEvent;
import com.pet_care.order_service.messaging.PaymentResultEvent;
import com.pet_care.order_service.repository.OrderRepository;
import com.pet_care.order_service.service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentEventConsumer {
    OrderRepository orderRepository;
    OrderEventPublisher orderEventPublisher;
    ObjectMapper objectMapper = new ObjectMapper();
    OrderService orderService;

    @RabbitListener(queues = "order.queue")
    public void consume(BaseEvent<?> event) {
        switch (event.getType()) {
            case "payment.success" -> success(event);

            case "payment.failed" -> failed(event);
        }
    }

    private void success(BaseEvent<?> event) {

        PaymentResultEvent data =
                objectMapper.convertValue(event.getData(), PaymentResultEvent.class);

        Orders order = orderRepository.findById(data.getOrderId()).orElseThrow();

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
    }

    private void failed(BaseEvent<?> event) {

        PaymentResultEvent data =
                objectMapper.convertValue(event.getData(), PaymentResultEvent.class);

        Orders order = orderRepository.findById(data.getOrderId()).orElseThrow();

        orderService.handlePaymentFailed(order);

        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
    }
}
