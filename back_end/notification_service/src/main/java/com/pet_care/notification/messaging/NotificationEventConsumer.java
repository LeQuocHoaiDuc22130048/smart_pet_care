package com.pet_care.notification.messaging;

import com.pet_care.notification.configuration.RabbitMQConfig;
import com.pet_care.notification.enums.NotificationType;
import com.pet_care.notification.service.NotificationService;
import java.math.BigDecimal;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationEventConsumer {

    NotificationService notificationService;

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_PAYMENT_SUCCESS_QUEUE)
    public void handlePaymentSuccess(Map<String, Object> event) {
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
    public void handlePaymentFailed(Map<String, Object> event) {
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
    public void handleUserCreated(Map<String, Object> event) {
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

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_ORDER_STATUS_CHANGED_QUEUE)
    public void handleOrderStatusChanged(Map<String, Object> event) {
        String userId = valueAsString(event.get("userId"));
        String orderId = valueAsString(event.get("orderId"));
        String newStatus = valueAsString(event.get("newStatus"));

        if (userId == null) {
            log.warn("Skip order status notification because userId is missing: {}", event);
            return;
        }

        notificationService.createSystemNotification(
                userId,
                "Đơn hàng đã cập nhật",
                "Đơn hàng " + safeReference(orderId) + " đã chuyển sang trạng thái " + orderStatusLabel(newStatus) + ".",
                NotificationType.ORDER,
                orderId
        );
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_BOOKING_CREATED_QUEUE)
    public void handleBookingCreated(Map<String, Object> event) {
        String bookingId = valueAsString(event.get("bookingId"));
        String customerId = valueAsString(event.get("userId"));
        String petName = valueAsString(event.get("petName"));
        String serviceName = valueAsString(event.get("serviceName"));
        String appointmentDate = valueAsString(event.get("appointmentDate"));
        String appointmentTime = valueAsString(event.get("appointmentTime"));

        notificationService.createSystemNotification(
                NotificationService.ADMIN_AUDIENCE,
                "Có lịch hẹn mới",
                "Khách hàng " + safeText(customerId, "mới")
                        + " vừa đặt " + safeText(serviceName, "dịch vụ")
                        + " cho " + safeText(petName, "thú cưng")
                        + " lúc " + formatAppointmentTime(appointmentDate, appointmentTime) + ".",
                NotificationType.BOOKING,
                bookingId
        );

        if (customerId != null && !customerId.isBlank()) {
            notificationService.createSystemNotification(
                    customerId,
                    "Đặt lịch thành công",
                    "Bạn đã đặt " + safeText(serviceName, "dịch vụ")
                            + " cho " + safeText(petName, "thú cưng")
                            + " lúc " + formatAppointmentTime(appointmentDate, appointmentTime)
                            + ". Lịch hẹn đang chờ xác nhận.",
                    NotificationType.BOOKING,
                    bookingId
            );
        }
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_BOOKING_STATUS_CHANGED_QUEUE)
    public void handleBookingStatusChanged(Map<String, Object> event) {
        String userId = valueAsString(event.get("userId"));
        String bookingId = valueAsString(event.get("bookingId"));
        String newStatus = valueAsString(event.get("newStatus"));
        String serviceName = valueAsString(event.get("serviceName"));
        String appointmentDate = valueAsString(event.get("appointmentDate"));
        String appointmentTime = valueAsString(event.get("appointmentTime"));

        if (userId == null) {
            log.warn("Skip booking status notification because userId is missing: {}", event);
            return;
        }

        notificationService.createSystemNotification(
                userId,
                "Lịch hẹn đã cập nhật",
                "Lịch hẹn " + safeReference(bookingId)
                        + " cho dịch vụ " + safeText(serviceName, "của bạn")
                        + " lúc " + formatAppointmentTime(appointmentDate, appointmentTime)
                        + " đã chuyển sang trạng thái " + bookingStatusLabel(newStatus) + ".",
                NotificationType.BOOKING,
                bookingId
        );
    }

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_SERVICE_PACKAGE_UPDATED_QUEUE)
    public void handleServicePackageUpdated(Map<String, Object> event) {
        String userId = valueAsString(event.get("userId"));
        String bookingId = valueAsString(event.get("bookingId"));
        String servicePackageId = valueAsString(event.get("servicePackageId"));
        String serviceName = valueAsString(event.get("serviceName"));
        String appointmentDate = valueAsString(event.get("appointmentDate"));
        String appointmentTime = valueAsString(event.get("appointmentTime"));

        if (userId == null) {
            log.warn("Skip service package update notification because userId is missing: {}", event);
            return;
        }

        notificationService.createSystemNotification(
                userId,
                "Dịch vụ đã cập nhật",
                "Dịch vụ " + safeText(serviceName, "bạn đã đặt")
                        + " trong lịch hẹn " + safeReference(bookingId)
                        + " lúc " + formatAppointmentTime(appointmentDate, appointmentTime)
                        + " vừa được cập nhật. Vui lòng kiểm tra lại thông tin lịch hẹn.",
                NotificationType.BOOKING,
                servicePackageId == null ? bookingId : servicePackageId
        );
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

    private String safeReference(String value) {
        if (value == null || value.isBlank()) {
            return "của bạn";
        }
        return "#" + value;
    }

    private String safeText(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private String formatAppointmentTime(String date, String time) {
        if (date == null && time == null) {
            return "đã đặt";
        }
        if (date == null) {
            return time;
        }
        if (time == null) {
            return date;
        }
        return time + " ngày " + date;
    }

    private String orderStatusLabel(String status) {
        if (status == null) {
            return "mới";
        }
        return switch (status) {
            case "PENDING" -> "đang xử lý";
            case "RESERVED" -> "đã giữ hàng";
            case "PAYMENT_PENDING" -> "chờ thanh toán";
            case "PAID" -> "đã thanh toán";
            case "CONFIRMED" -> "đã xác nhận";
            case "FAILED" -> "thất bại";
            case "PAYMENT_FAILED" -> "thanh toán thất bại";
            case "CANCELLED" -> "đã hủy";
            default -> status;
        };
    }

    private String bookingStatusLabel(String status) {
        if (status == null) {
            return "mới";
        }
        return switch (status) {
            case "PENDING" -> "chờ xác nhận";
            case "CONFIRMED" -> "đã xác nhận";
            case "IN_PROGRESS" -> "đang thực hiện";
            case "COMPLETED" -> "hoàn thành";
            case "CANCELLED" -> "đã hủy";
            case "NO_SHOW" -> "không đến";
            default -> status;
        };
    }
}
