package com.pet_care.booking.messaging;

import com.pet_care.booking.configuration.RabbitMQConfig;
import com.pet_care.booking.entity.Booking;
import com.pet_care.booking.entity.ServicePackage;
import com.pet_care.booking.enums.BookingStatus;
import java.util.HashMap;
import java.util.Map;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationEventPublisher {
    RabbitTemplate rabbitTemplate;

    public void publishBookingCreated(Booking booking) {
        if (booking == null) {
            return;
        }

        Map<String, Object> event = new HashMap<>();
        event.put("bookingId", booking.getId());
        event.put("userId", booking.getUserId());
        event.put("petName", booking.getPetName());
        event.put("serviceName", booking.getServicePackage().getName());
        event.put("appointmentDate", booking.getAppointmentDate().toString());
        event.put("appointmentTime", booking.getAppointmentTime().toString());

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.BOOKING_CREATED_KEY,
                event
        );
    }

    public void publishBookingStatusChanged(Booking booking, BookingStatus oldStatus, BookingStatus newStatus) {
        if (booking == null || oldStatus == newStatus || newStatus == null) {
            return;
        }

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.BOOKING_STATUS_CHANGED_KEY,
                Map.of(
                        "bookingId", booking.getId(),
                        "userId", booking.getUserId(),
                        "oldStatus", oldStatus.name(),
                        "newStatus", newStatus.name(),
                        "serviceName", booking.getServicePackage().getName(),
                        "appointmentDate", booking.getAppointmentDate().toString(),
                        "appointmentTime", booking.getAppointmentTime().toString()
                )
        );
    }

    public void publishServicePackageUpdated(Booking booking, ServicePackage servicePackage) {
        if (booking == null || servicePackage == null) {
            return;
        }

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.NOTIFICATION_EXCHANGE,
                RabbitMQConfig.SERVICE_PACKAGE_UPDATED_KEY,
                Map.of(
                        "bookingId", booking.getId(),
                        "userId", booking.getUserId(),
                        "servicePackageId", servicePackage.getId(),
                        "serviceName", servicePackage.getName(),
                        "appointmentDate", booking.getAppointmentDate().toString(),
                        "appointmentTime", booking.getAppointmentTime().toString()
                )
        );
    }
}
