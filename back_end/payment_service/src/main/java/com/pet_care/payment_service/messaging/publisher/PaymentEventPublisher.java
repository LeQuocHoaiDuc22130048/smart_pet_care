package com.pet_care.payment_service.messaging.publisher;

import com.pet_care.payment_service.configuration.RabbitMQConfig;
import com.pet_care.payment_service.messaging.event.PaymentFailedEvent;
import com.pet_care.payment_service.messaging.event.PaymentResultEvent;
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
public class PaymentEventPublisher {
    RabbitTemplate rabbitTemplate;

    public void publishPaymentSuccess(PaymentResultEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.PAYMENT_SUCCESS_KEY,
                event
        );
        log.info("Published payment success event for transaction: {}", event.getTransactionId());
    }

    public void publishPaymentFailed(PaymentFailedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.PAYMENT_EXCHANGE,
                RabbitMQConfig.PAYMENT_FAILED_KEY,
                event
        );
        log.info("Published payment failed event for transaction: {}", event.getTransactionId());
    }
}

