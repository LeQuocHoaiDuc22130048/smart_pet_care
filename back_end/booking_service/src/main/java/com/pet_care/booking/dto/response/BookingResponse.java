package com.pet_care.booking.dto.response;

import com.pet_care.booking.enums.BookingStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingResponse {
    String id;
    String userId;
    String petId;
    String petName;
    ServicePackageResponse servicePackage;
    StaffResponse staff;
    LocalDate appointmentDate;
    LocalTime appointmentTime;
    BookingStatus status;
    BigDecimal totalPrice;
    String notes;
    String adminNotes;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    LocalDateTime completedAt;
    LocalDateTime cancelledAt;
}
