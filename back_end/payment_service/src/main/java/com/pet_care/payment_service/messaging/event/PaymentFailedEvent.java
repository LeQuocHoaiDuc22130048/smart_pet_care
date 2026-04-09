package com.pet_care.payment_service.messaging.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFailedEvent {
    String transactionId;
    String orderId;
    String userId;
    String reason;
    LocalDateTime timestamp;
}

