package com.pet_care.booking.dto.request;

import com.pet_care.booking.enums.BookingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateBookingStatusRequest {
    @NotNull(message = "Status is required")
    BookingStatus status;
    String adminNotes;
}
