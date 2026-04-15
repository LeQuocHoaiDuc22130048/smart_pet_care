package com.pet_care.order_service.consumer;

import com.pet_care.order_service.messaging.PaymentFailedEvent;
import com.pet_care.order_service.messaging.PaymentSuccessEvent;
import com.pet_care.order_service.service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentEventConsumer {

    OrderService orderService;

    @RabbitListener(queues = "payment.success.queue")
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Received payment success event for order: {}", event.getOrderId());
        try {
            orderService.updateOrderStatusFromPayment(event.getOrderId(), "CONFIRMED");
            log.info("Updated order {} status to CONFIRMED", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to handle payment success event for order: {}", event.getOrderId(), e);
        }
    }

    @RabbitListener(queues = "payment.failed.queue")
    public void handlePaymentFailed(PaymentFailedEvent event) {
        log.info("Received payment failed event for order: {}", event.getOrderId());
        try {
            orderService.cancelOrderDueToPaymentFailure(event.getOrderId());
            log.info("Cancelled order {} due to payment failure", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to handle payment failed event for order: {}", event.getOrderId(), e);
        }
    }
}
