package com.pet_care.product.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    CATEGORY_EXISTED(1001, "User existed", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(1002, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_IS_USED(1003, "Category is used by products", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1004, "Invalid message key", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1005, "you do not have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1006, "unauthenticated", HttpStatus.UNAUTHORIZED),
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
