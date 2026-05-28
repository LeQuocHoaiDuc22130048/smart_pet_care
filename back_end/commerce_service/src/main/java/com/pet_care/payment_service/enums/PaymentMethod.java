package com.pet_care.payment_service.enums;

import lombok.Getter;

@Getter
public enum PaymentMethod {
    VNPAY("VNPay"),
    MOMO("MoMo"),
    BANK_TRANSFER("Bank Transfer"),
    CASH_ON_DELIVERY("COD");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }
}

