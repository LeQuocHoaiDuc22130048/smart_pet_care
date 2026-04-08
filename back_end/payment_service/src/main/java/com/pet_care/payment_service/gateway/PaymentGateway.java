package com.pet_care.payment_service.gateway;

import com.pet_care.payment_service.entity.Payment;
import com.pet_care.payment_service.enums.PaymentStatus;

import java.util.Map;

public interface PaymentGateway {
    String createPaymentUrl(Payment payment);

    PaymentStatus handleCallback(Map<String, String> params);
}
