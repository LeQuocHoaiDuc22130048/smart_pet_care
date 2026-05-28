package com.pet_care.payment_service.gateway.impl;

import com.pet_care.payment_service.gateway.PaymentGateway;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Mock implementation của Payment Gateway để develop/test
 * Thay thế bằng VNPayGateway hoặc MoMoGateway khi triển khai thực
 */
@Slf4j
@Component
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public String initiatePayment(String transactionId, BigDecimal amount, String description, String returnUrl) {
        log.info("Mock: Initiating payment for transaction {} with amount {}", transactionId, amount);
        // Mock: Trả về URL payment
        return "https://mock-payment-gateway.local/pay?txnId=" + transactionId + "&amount=" + amount;
    }

    @Override
    public boolean verifyPayment(String transactionId) {
        log.info("Mock: Verifying payment for transaction {}", transactionId);
        // Mock: Luôn trả về true (simulating successful payment)
        return true;
    }

    @Override
    public boolean refund(String transactionId) {
        log.info("Mock: Refunding payment for transaction {}", transactionId);
        // Mock: Luôn trả về true (simulating successful refund)
        return true;
    }
}

