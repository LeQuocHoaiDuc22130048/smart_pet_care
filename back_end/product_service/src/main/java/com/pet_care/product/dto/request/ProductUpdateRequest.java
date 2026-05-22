package com.pet_care.product.dto.request;

import com.pet_care.product.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {
    @NotBlank
    String productName;

    String description;

    BigDecimal price;

    Integer stockQuantity;

    ProductStatus status;

    @NotEmpty(message = "At least one category is required")
    Set<String> categoryId;

    Integer primaryImageIndex;
}
