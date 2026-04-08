package com.pet_care.payment_service.entity;

import com.pet_care.payment_service.enums.PaymentMethod;
import com.pet_care.payment_service.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    String orderId;

    BigDecimal amount;

    @Enumerated(EnumType.STRING)
    PaymentStatus status;

    @Enumerated(EnumType.STRING)
    PaymentMethod paymentMethod;

    LocalDateTime createdAt;

    LocalDateTime updatedAt;
}
