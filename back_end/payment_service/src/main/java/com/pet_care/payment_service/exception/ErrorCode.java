package com.pet_care.payment_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1004, "Invalid message key", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1005, "you do not have permission", HttpStatus.FORBIDDEN),

    UNAUTHENTICATED(1006, "unauthenticated", HttpStatus.UNAUTHORIZED),
    PAYMENT_ALREADY_EXISTS(4002, "Payment already exists for the given order ID", HttpStatus.CONFLICT),
    ;

    private int code;
    private String message;
    private HttpStatusCode status;

    ErrorCode(int code, String message, HttpStatusCode status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
