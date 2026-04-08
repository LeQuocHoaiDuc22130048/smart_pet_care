package com.pet_care.payment_service.messaging.publisher;

import com.pet_care.payment_service.entity.Payment;
import com.pet_care.payment_service.messaging.event.PaymentFailedEvent;
import com.pet_care.payment_service.messaging.event.PaymentSuccessEvent;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentPublisher {
    RabbitTemplate rabbitTemplate;

    public void sendSuccess(Payment payment) {
        rabbitTemplate.convertAndSend("payment.exchange", "payment.success", new PaymentSuccessEvent(payment.getOrderId()));
    }

    public void sendFailed(Payment payment) {
        rabbitTemplate.convertAndSend("payment.exchange", "payment.failed", new PaymentFailedEvent(payment.getOrderId()));
    }
}
