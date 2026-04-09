package com.pet_care.payment_service.dto.request;

import com.pet_care.payment_service.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreatePaymentRequest {
    @NotBlank(message = "INVALID_KEY")
    String orderId;

    @NotNull(message = "INVALID_KEY")
    @DecimalMin(value = "0.01", message = "PAYMENT_AMOUNT_INVALID")
    BigDecimal amount;

    @NotNull(message = "INVALID_KEY")
    PaymentMethod paymentMethod;

    String description;
}

