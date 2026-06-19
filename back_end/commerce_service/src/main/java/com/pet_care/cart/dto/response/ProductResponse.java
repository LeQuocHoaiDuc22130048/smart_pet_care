package com.pet_care.cart.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

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
    List<ImageResponse> images;
}
