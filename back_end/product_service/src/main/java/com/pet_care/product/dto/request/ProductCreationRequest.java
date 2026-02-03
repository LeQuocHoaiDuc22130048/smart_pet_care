package com.pet_care.product.dto.request;


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
public class ProductCreationRequest {
    @NotBlank
    String productName;

    @Size(max = 500)
    String description;

    Double price;

    @NotBlank
    Set<String> categoryId;

    Integer primaryImageIndex;
}
