package com.pet_care.cart.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    Cart cart;

    @Column(name = "product_id", nullable = false)
    String productId;

    // Snapshot tên sản phẩm tại thời điểm thêm vào giỏ
    @Column(name = "product_name")
    String productName;

    // Snapshot ảnh chính tại thời điểm thêm vào giỏ
    @Column(name = "image_url", length = 1000)
    String imageUrl;

    // Snapshot giá tại thời điểm thêm vào giỏ
    @Column(name = "unit_price")
    BigDecimal unitPrice;

    @Column(nullable = false)
    Integer quantity;

    @Column(name = "added_at", nullable = false, updatable = false)
    LocalDateTime addedAt;

    @PrePersist
    public void prePersist() {
        addedAt = LocalDateTime.now();
    }
}
