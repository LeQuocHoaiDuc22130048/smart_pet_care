package com.pet_care.payment_service.dto.response;

import com.pet_care.payment_service.enums.PaymentMethod;
import com.pet_care.payment_service.enums.PaymentStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PaymentResponse {
    Long id;
    String transactionId;
    String orderId;
    String userId;
    BigDecimal amount;
    PaymentMethod paymentMethod;
    PaymentStatus status;
    String description;
    String referenceCode;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}

