package com.pet_care.cart.dto.request;

import jakarta.validation.constraints.Min;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCartItemRequest {

    @Min(value = 0, message = "Quantity must be >= 0 (0 = remove item)")
    Integer quantity;
}
