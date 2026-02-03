package com.pet_care.product.entity;

import com.pet_care.product.enums.ProductStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Products {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;

    @Column(nullable = false)
    String productName;

    @Column(length = 500)
    String description;

    Double price;

    @Column(nullable = false)
    Integer stockQuantity = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ProductStatus status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "product_category",
            joinColumns = @JoinColumn(name = "product_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    Set<Categories> categories;

    @OneToMany(
            mappedBy = "product",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    List<Image> images;


    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = ProductStatus.INACTIVE;
        }

        if (stockQuantity == null) {
            stockQuantity = 0;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
