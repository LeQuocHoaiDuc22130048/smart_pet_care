package com.pet_care.cart.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    String id;
    String productName;
    BigDecimal price;
    Integer stockQuantity;
    String status;
}
