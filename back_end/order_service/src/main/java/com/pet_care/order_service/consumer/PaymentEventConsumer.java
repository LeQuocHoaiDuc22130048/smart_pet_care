package com.pet_care.order_service.consumer;

import com.pet_care.order_service.dto.request.PaymentStatusRequest;
import com.pet_care.order_service.service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe các sự kiện thanh toán từ Payment Service
 * và cập nhật trạng thái đơn hàng tương ứng
 */
@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentEventConsumer {
    OrderService orderService;

    /**
     * Xử lý sự kiện thanh toán thành công
     */
    @RabbitListener(queues = "payment.success.queue")
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Received payment success event for order: {}", event.getOrderId());
        try {
            // Cập nhật trạng thái đơn hàng thành CONFIRMED
            orderService.updateOrderStatusFromPayment(event.getOrderId(), "CONFIRMED");
            log.info("Updated order {} status to CONFIRMED", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to handle payment success event for order: {}", event.getOrderId(), e);
            // TODO: Implement retry logic hoặc dead-letter queue
        }
    }

    /**
     * Xử lý sự kiện thanh toán thất bại
     */
    @RabbitListener(queues = "payment.failed.queue")
    public void handlePaymentFailed(PaymentFailedEvent event) {
        log.info("Received payment failed event for order: {}", event.getOrderId());
        try {
            // Cập nhật trạng thái đơn hàng thành PAYMENT_FAILED
            orderService.updateOrderStatusFromPayment(event.getOrderId(), "PAYMENT_FAILED");
            // Rollback stock
            orderService.cancelOrderDueToPaymentFailure(event.getOrderId());
            log.info("Updated order {} status to PAYMENT_FAILED and rolled back stock", event.getOrderId());
        } catch (Exception e) {
            log.error("Failed to handle payment failed event for order: {}", event.getOrderId(), e);
        }
    }

    // Event DTOs - có thể move vào riêng file
    public static class PaymentSuccessEvent {
        private String transactionId;
        private String orderId;
        private String userId;
        private java.math.BigDecimal amount;
        private String message;
        private java.time.LocalDateTime timestamp;

        // Getters
        public String getTransactionId() { return transactionId; }
        public String getOrderId() { return orderId; }
        public String getUserId() { return userId; }
        public java.math.BigDecimal getAmount() { return amount; }
        public String getMessage() { return message; }
        public java.time.LocalDateTime getTimestamp() { return timestamp; }

        // Setters
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public void setUserId(String userId) { this.userId = userId; }
        public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
        public void setMessage(String message) { this.message = message; }
        public void setTimestamp(java.time.LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public static class PaymentFailedEvent {
        private String transactionId;
        private String orderId;
        private String userId;
        private String reason;
        private java.time.LocalDateTime timestamp;

        // Getters
        public String getTransactionId() { return transactionId; }
        public String getOrderId() { return orderId; }
        public String getUserId() { return userId; }
        public String getReason() { return reason; }
        public java.time.LocalDateTime getTimestamp() { return timestamp; }

        // Setters
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
        public void setOrderId(String orderId) { this.orderId = orderId; }
        public void setUserId(String userId) { this.userId = userId; }
        public void setReason(String reason) { this.reason = reason; }
        public void setTimestamp(java.time.LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}

