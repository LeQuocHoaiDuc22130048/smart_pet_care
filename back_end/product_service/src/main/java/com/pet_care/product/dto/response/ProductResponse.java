package com.pet_care.product.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    String id;
    String productName;
    String description;
    BigDecimal price;
    Integer stockQuantity;
    Set<CategoryResponseCreateProduct> category;
    LocalDateTime createdAt;
}
