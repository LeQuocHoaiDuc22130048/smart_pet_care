package com.pet_care.payment_service.messaging.consumer;

import com.pet_care.payment_service.configuration.RabbitMQConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Lắng nghe event payment.create từ order_service.
 * Payment được tạo từ lựa chọn checkout của người dùng; event này chỉ xác nhận
 * order đã sẵn sàng để thanh toán, không được tự động phê duyệt giao dịch.
 */
@Slf4j
@Component
public class PaymentCreateConsumer {

    @RabbitListener(queues = RabbitMQConfig.PAYMENT_CREATE_QUEUE)
    public void handlePaymentCreate(Map<String, Object> payload) {
        log.info("Order {} reserved and awaiting selected payment method", payload.get("orderId"));
    }
}
