package com.pet_care.payment_service.dto.request;

import com.pet_care.payment_service.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    String orderId;
    BigDecimal amount;
    PaymentMethod paymentMethod;
}
