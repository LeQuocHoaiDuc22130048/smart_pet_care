package com.pet_care.product.dto.request;

import com.pet_care.product.enums.ProductStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {
    @NotBlank
    String productName;

    @Size(max = 500)
    String description;

    Double price;

    Integer stockQuantity;

    ProductStatus status;

    @NotBlank
    Set<String> categoryId;

    Integer primaryImageIndex;
}
