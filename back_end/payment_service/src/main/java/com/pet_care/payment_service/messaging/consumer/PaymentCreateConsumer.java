package com.pet_care.payment_service.messaging.consumer;

import com.pet_care.payment_service.configuration.RabbitMQConfig;
import com.pet_care.payment_service.entity.Payment;
import com.pet_care.payment_service.enums.PaymentMethod;
import com.pet_care.payment_service.enums.PaymentStatus;
import com.pet_care.payment_service.messaging.event.PaymentFailedEvent;
import com.pet_care.payment_service.messaging.event.PaymentResultEvent;
import com.pet_care.payment_service.messaging.publisher.PaymentEventPublisher;
import com.pet_care.payment_service.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Lắng nghe event payment.create từ order_service.
 * Khi order_service nhận được stock.reserved, nó publish payment.create
 * để payment_service tự động xử lý thanh toán.
 *
 * Với MockGateway: tự động approve → publish payment.success
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentCreateConsumer {

    PaymentRepository paymentRepository;
    PaymentEventPublisher paymentEventPublisher;

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_CREATE_QUEUE)
    @Transactional
    public void handlePaymentCreate(Map<String, Object> payload) {
        try {
            String orderId  = payload.get("orderId").toString();
            String userId   = payload.get("userId").toString();
            double amount   = Double.parseDouble(payload.get("totalPrice").toString());

            log.info("Received payment.create for orderId={} amount={}", orderId, amount);

            // Idempotent: bỏ qua nếu đã có payment cho order này
            if (paymentRepository.findByOrderId(orderId).isPresent()) {
                log.warn("Payment already exists for orderId={}, skipping", orderId);
                return;
            }

            String transactionId = "TXN-" + System.currentTimeMillis() + "-"
                    + UUID.randomUUID().toString().substring(0, 8);

            Payment payment = Payment.builder()
                    .transactionId(transactionId)
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new java.math.BigDecimal(amount).setScale(2, java.math.RoundingMode.HALF_UP))
                    .paymentMethod(PaymentMethod.CASH_ON_DELIVERY) // default COD, user có thể chọn sau
                    .status(PaymentStatus.SUCCESS) // MockGateway: auto approve
                    .description("Auto payment for order " + orderId)
                    .build();

            paymentRepository.save(payment);
            log.info("Payment created and approved: transactionId={}", transactionId);

            // Publish payment.success → order_service cập nhật status
            paymentEventPublisher.publishPaymentSuccess(
                    PaymentResultEvent.builder()
                            .transactionId(transactionId)
                            .orderId(orderId)
                            .userId(userId)
                            .amount(payment.getAmount())
                            .status(PaymentStatus.SUCCESS)
                            .message("Payment successful (Mock)")
                            .timestamp(LocalDateTime.now())
                            .build()
            );

        } catch (Exception e) {
            log.error("Failed to process payment.create: {}", e.getMessage(), e);

            // Cố gắng lấy orderId để publish failed event
            try {
                String orderId = payload.get("orderId").toString();
                String userId  = payload.get("userId").toString();
                paymentEventPublisher.publishPaymentFailed(
                        PaymentFailedEvent.builder()
                                .transactionId("FAILED-" + System.currentTimeMillis())
                                .orderId(orderId)
                                .userId(userId)
                                .reason(e.getMessage())
                                .timestamp(LocalDateTime.now())
                                .build()
                );
            } catch (Exception ex) {
                log.error("Could not publish payment failed event: {}", ex.getMessage());
            }
        }
    }
}
