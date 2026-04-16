package com.pet_care.payment_service.configuration;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Component
public class VNPayConfig {

    @Value("${vnpay.pay-url}")
    private String payUrl;

    @Value("${vnpay.return-url}")
    private String returnUrl;

    @Value("${vnpay.tmn-code}")
    private String tmnCode;

    @Value("${vnpay.secret-key:}")
    private String secretKey;
}
