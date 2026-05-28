package com.pet_care.cart.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    String id;
    String productId;
    String productName;
    BigDecimal unitPrice;
    Integer quantity;
    BigDecimal subtotal;

    @JsonFormat(pattern = "dd-MM-yyyy HH:mm:ss", timezone = "Asia/Ho_Chi_Minh")
    LocalDateTime addedAt;
}
