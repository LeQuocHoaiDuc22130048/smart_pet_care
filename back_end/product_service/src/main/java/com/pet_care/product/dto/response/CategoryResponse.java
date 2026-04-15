package com.pet_care.product.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Bỏ Set<Products> entity — tránh leak entity ra ngoài API
 * và tránh LazyInitializationException + vòng lặp JSON serialize.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    String categoryId;
    String categoryName;
    String description;

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
