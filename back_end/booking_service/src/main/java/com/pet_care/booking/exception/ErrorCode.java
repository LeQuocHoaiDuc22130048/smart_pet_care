package com.pet_care.booking.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    SERVICE_PACKAGE_NOT_FOUND(6101, "Service package not found", HttpStatus.NOT_FOUND),
    STAFF_NOT_FOUND(6102, "Staff not found", HttpStatus.NOT_FOUND),
    BOOKING_NOT_FOUND(6103, "Booking not found", HttpStatus.NOT_FOUND),
    PET_NOT_FOUND(6104, "Pet not found", HttpStatus.NOT_FOUND),
    INVALID_BOOKING_TIME(6105, "Booking time must be in the future", HttpStatus.BAD_REQUEST),
    STAFF_NOT_AVAILABLE(6106, "Staff is not available at this time", HttpStatus.CONFLICT),
    BOOKING_ALREADY_TERMINAL(6107, "Booking is already completed or cancelled", HttpStatus.CONFLICT),
    INVALID_STATUS_TRANSITION(6108, "Invalid booking status transition", HttpStatus.BAD_REQUEST),
    INVALID_REQUEST(6109, "Invalid request", HttpStatus.BAD_REQUEST),
    SERVICE_UNAVAILABLE(6110, "Dependent service is unavailable", HttpStatus.SERVICE_UNAVAILABLE);

    private final int code;
    private final String message;
    private final HttpStatus status;

    ErrorCode(int code, String message, HttpStatus status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
