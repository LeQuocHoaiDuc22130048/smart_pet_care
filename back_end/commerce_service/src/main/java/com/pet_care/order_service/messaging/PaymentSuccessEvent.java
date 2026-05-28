package com.pet_care.order_service.messaging;

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
public class PaymentSuccessEvent {
    String transactionId;
    String orderId;
    String userId;
    BigDecimal amount;
    String message;
    LocalDateTime timestamp;
}
