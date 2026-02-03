package com.pet_care.product.entity;

import com.pet_care.product.enums.InventoryChangeType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLog {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String logId;

    @Column(nullable = false)
    String productId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    InventoryChangeType changeType;

    @Column(nullable = false)
    Integer quantity;

    @Column(length = 500)
    String reason;

    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }
}
