package com.pet_care.notification.messaging;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.notification.configuration.RabbitMQConfig;
import com.pet_care.notification.enums.NotificationType;
import com.pet_care.notification.service.NotificationService;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationEventConsumer {

    NotificationService notificationService;
    ObjectMapper objectMapper;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_PAYMENT_SUCCESS_QUEUE)
    public void handlePaymentSuccess(Message message) {
        Map<String, Object> event = readEvent(message);
        String userId = valueAsString(event.get("userId"));
        String orderId = valueAsString(event.get("orderId"));
        BigDecimal amount = valueAsBigDecimal(event.get("amount"));

        if (userId == null) {
            log.warn("Skip payment success notification because userId is missing: {}", event);
            return;
        }

        String content = amount == null
                ? "Thanh toán cho đơn hàng " + orderId + " đã thành công."
                : "Thanh toán " + amount + " cho đơn hàng " + orderId + " đã thành công.";

        notificationService.createSystemNotification(
                userId,
                "Thanh toán thành công",
                content,
                NotificationType.PAYMENT,
                orderId
        );
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_PAYMENT_FAILED_QUEUE)
    public void handlePaymentFailed(Message message) {
        Map<String, Object> event = readEvent(message);
        String userId = valueAsString(event.get("userId"));
        String orderId = valueAsString(event.get("orderId"));
        String reason = valueAsString(event.get("reason"));

        if (userId == null) {
            log.warn("Skip payment failed notification because userId is missing: {}", event);
            return;
        }

        notificationService.createSystemNotification(
                userId,
                "Thanh toán thất bại",
                "Thanh toán cho đơn hàng " + orderId + " thất bại"
                        + (reason == null ? "." : ": " + reason),
                NotificationType.PAYMENT,
                orderId
        );
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_USER_CREATED_QUEUE)
    public void handleUserCreated(Message message) {
        Map<String, Object> event = readEvent(message);
        String userId = valueAsString(event.get("userId"));
        String firstName = valueAsString(event.get("firstName"));

        if (userId == null) {
            log.warn("Skip welcome notification because userId is missing: {}", event);
            return;
        }

        String displayName = firstName == null || firstName.isBlank() ? "bạn" : firstName;
        notificationService.createSystemNotification(
                userId,
                "Chào mừng đến với PetCare",
                "Xin chào " + displayName + ", tài khoản của bạn đã được tạo thành công.",
                NotificationType.USER,
                userId
        );
    }

    private Map<String, Object> readEvent(Message message) {
        try {
            String json = new String(message.getBody(), StandardCharsets.UTF_8);
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception e) {
            throw new IllegalArgumentException("Cannot read notification event payload", e);
        }
    }

    private String valueAsString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private BigDecimal valueAsBigDecimal(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        try {
            return new BigDecimal(String.valueOf(value));
        } catch (NumberFormatException exception) {
            return null;
        }
    }
}
