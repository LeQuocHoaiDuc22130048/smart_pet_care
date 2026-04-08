package com.pet_care.payment_service.gateway;

import com.pet_care.payment_service.entity.Payment;
import com.pet_care.payment_service.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class MockGateway implements PaymentGateway {
    @Override
    public String createPaymentUrl(Payment payment) {
        return "http://localhost:8085/mock-pay?paymentId=" + payment.getId();
    }

    @Override
    public PaymentStatus handleCallback(Map<String, String> params) {
        return PaymentStatus.valueOf(params.get("status"));
    }
}
