package com.pet_care.order_service.dto.response;

import com.pet_care.product.dto.response.CategoryResponseCreateProduct;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductResponse {
    String id;
    String productName;
    BigDecimal price;
}
