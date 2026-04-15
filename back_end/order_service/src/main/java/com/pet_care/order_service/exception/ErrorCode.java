package com.pet_care.order_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1004, "Invalid message key", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1005, "You do not have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),

    ORDER_NOT_FOUND(3001, "Order not found", HttpStatus.NOT_FOUND),
    ORDER_STATUS_INVALID(3002, "Order status invalid", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(3003, "Product not found", HttpStatus.NOT_FOUND),

    INVALID_PAYMENT_STATUS(4001, "Invalid payment status", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode status;

    ErrorCode(int code, String message, HttpStatusCode status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
