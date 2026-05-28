package com.pet_care.payment_service.messaging.event;

import com.pet_care.payment_service.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResultEvent {
    String transactionId;
    String orderId;
    String userId;
    BigDecimal amount;
    PaymentStatus status; // SUCCESS or FAILED
    String message;
    LocalDateTime timestamp;
}

