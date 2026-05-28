package com.pet_care.payment_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdatePaymentStatusRequest {
    @NotBlank(message = "INVALID_KEY")
    String transactionId;

    @NotBlank(message = "INVALID_KEY")
    String status; // SUCCESS, FAILED, CANCELLED

    String referenceCode;
    String message;
}

