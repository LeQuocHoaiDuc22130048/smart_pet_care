package com.pet_care.payment_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    // General
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized exception", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1001, "Invalid message key", HttpStatus.BAD_REQUEST),

    // Payment specific
    PAYMENT_NOT_FOUND(2001, "Payment not found", HttpStatus.NOT_FOUND),
    INVALID_PAYMENT_METHOD(2002, "Invalid payment method", HttpStatus.BAD_REQUEST),
    PAYMENT_AMOUNT_INVALID(2003, "Payment amount must be greater than 0", HttpStatus.BAD_REQUEST),
    PAYMENT_ALREADY_PROCESSED(2004, "Payment has already been processed", HttpStatus.BAD_REQUEST),
    PAYMENT_PROCESSING_FAILED(2005, "Payment processing failed", HttpStatus.INTERNAL_SERVER_ERROR),
    ORDER_NOT_FOUND(2006, "Order not found", HttpStatus.NOT_FOUND),

    // Security
    UNAUTHORIZED(401, "Unauthorized", HttpStatus.UNAUTHORIZED),
    FORBIDDEN(403, "Forbidden", HttpStatus.FORBIDDEN),
    ;

    private final int code;
    private final String message;
    private final HttpStatusCode status;

    ErrorCode(int code, String message, HttpStatusCode status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}

