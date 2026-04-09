package com.pet_care.payment_service.mapper;

import com.pet_care.payment_service.dto.response.PaymentResponse;
import com.pet_care.payment_service.entity.Payment;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    PaymentResponse toPaymentResponse(Payment payment);

    Payment toPayment(PaymentResponse paymentResponse);
}

