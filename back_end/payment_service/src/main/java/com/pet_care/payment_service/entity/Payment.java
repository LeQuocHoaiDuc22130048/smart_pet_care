package com.pet_care.payment_service.entity;

import com.pet_care.payment_service.enums.PaymentMethod;
import com.pet_care.payment_service.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, length = 50, unique = true)
    String transactionId;

    @Column(nullable = false)
    String orderId; // Logical FK -> Order Service

    @Column(nullable = false)
    String userId; // Logical FK -> User/Identity Service

    @Column(nullable = false, precision = 10, scale = 2)
    BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    PaymentStatus status;

    @Column(length = 500)
    String description;

    @Column(length = 255)
    String referenceCode; // Mã tham chiếu từ gateway (VNPay, MoMo)

    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;

    @Column(nullable = false)
    LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

