package com.pet_care.booking.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BookingRequest {
    @NotBlank(message = "Pet is required")
    String petId;

    @NotBlank(message = "Service package is required")
    String servicePackageId;

    @NotBlank(message = "Staff is required")
    String staffId;

    @NotNull(message = "Appointment date is required")
    @FutureOrPresent(message = "Appointment date must not be in the past")
    LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    LocalTime appointmentTime;

    String notes;
}
