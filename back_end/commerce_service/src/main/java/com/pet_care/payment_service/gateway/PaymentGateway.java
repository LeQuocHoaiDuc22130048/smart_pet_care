package com.pet_care.payment_service.gateway;

import java.math.BigDecimal;

/**
 * Interface để tích hợp với các payment gateway (VNPay, MoMo, etc)
 */
public interface PaymentGateway {
    /**
     * Khởi tạo thanh toán và trả về URL redirect
     *
     * @param transactionId   ID giao dịch trong hệ thống
     * @param amount          Số tiền cần thanh toán
     * @param description     Mô tả giao dịch
     * @param returnUrl       URL quay lại sau khi thanh toán
     * @return URL redirect đến cổng thanh toán
     */
    String initiatePayment(String transactionId, BigDecimal amount, String description, String returnUrl);

    /**
     * Kiểm tra trạng thái thanh toán
     *
     * @param transactionId ID giao dịch
     * @return True nếu thanh toán thành công
     */
    boolean verifyPayment(String transactionId);

    /**
     * Hoàn tiền
     *
     * @param transactionId ID giao dịch cần hoàn
     * @return True nếu hoàn tiền thành công
     */
    boolean refund(String transactionId);
}

