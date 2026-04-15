package com.pet_care.product.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pet_care.product.enums.ProductStatus;
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
    ProductStatus status;
    Set<CategoryResponseCreateProduct> category;
    List<ImageResponse> images;

    @JsonFormat(
            shape = JsonFormat.Shape.STRING,
            pattern = "dd-MM-yyyy HH:mm:ss",
            timezone = "Asia/Ho_Chi_Minh"
    )
    LocalDateTime createdAt;

    @JsonFormat(
            shape = JsonFormat.Shape.STRING,
            pattern = "dd-MM-yyyy HH:mm:ss",
            timezone = "Asia/Ho_Chi_Minh"
    )
    LocalDateTime updatedAt;
}
