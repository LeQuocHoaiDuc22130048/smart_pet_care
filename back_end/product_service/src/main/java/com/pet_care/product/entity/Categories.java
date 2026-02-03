package com.pet_care.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Categories {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String categoryId;

    String categoryName;

    @Column(length = 500)
    String description;

    @ManyToMany(mappedBy = "categories", fetch = FetchType.LAZY)
    Set<Products> products;

    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
}
