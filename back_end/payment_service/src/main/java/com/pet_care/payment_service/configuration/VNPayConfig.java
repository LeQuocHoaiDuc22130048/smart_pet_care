package com.pet_care.payment_service.configuration;

import org.springframework.stereotype.Component;

@Component
public class VNPayConfig {
    public static final String PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String RETURN_URL = "http://localhost:8085/pet_care_payment/payments/vnpay-callback";

    public static final String TMN_CODE = "WZOHMQT5";
    public static final String SECRET_KEY = "GS4JZ6GBJE8NP3K54S3252I1FXURC8AA";
}
