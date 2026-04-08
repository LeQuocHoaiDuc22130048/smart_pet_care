package com.pet_care.payment_service.mapper;

import com.pet_care.payment_service.dto.request.PaymentRequest;
import com.pet_care.payment_service.dto.response.PaymentResponse;
import com.pet_care.payment_service.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "status", constant = "PENDING")
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    Payment toPaymentRequest(PaymentRequest request);

    PaymentResponse toPaymentResponse(Payment payment);
}
