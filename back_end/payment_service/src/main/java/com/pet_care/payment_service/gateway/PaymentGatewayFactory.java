package com.pet_care.payment_service.gateway;

import com.pet_care.payment_service.enums.PaymentMethod;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentGatewayFactory {
    VNPayGateway vnPayGateway;
    MockGateway mockGateway;

    public PaymentGateway getGateway(PaymentMethod method) {
        return switch (method) {
            case VNPAY -> vnPayGateway;
            case MOCK -> mockGateway;
        };
    }
}
