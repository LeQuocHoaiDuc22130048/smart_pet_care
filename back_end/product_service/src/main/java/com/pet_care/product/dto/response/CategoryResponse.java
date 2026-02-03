package com.pet_care.product.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pet_care.product.entity.Products;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    String categoryId;
    String categoryName;
    String description;

    Set<Products> products;
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
