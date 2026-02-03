package com.pet_care.product.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    PRODUCT_NAME_EXISTED(2001, "Product name existed", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(2002, "Product not found", HttpStatus.NOT_FOUND),

    PRIMARY_IMAGE_REQUIRED(2003, "Primary image is required", HttpStatus.BAD_REQUEST),
    PRIMARY_IMAGE_INDEX_INVALID(2004, "Primary image index is invalid", HttpStatus.BAD_REQUEST),

    CATEGORY_EXISTED(2101, "User existed", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(2102, "Category not found", HttpStatus.NOT_FOUND),
    CATEGORY_IS_USED(2103, "Category is used by products", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1004, "Invalid message key", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1005, "you do not have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1006, "unauthenticated", HttpStatus.UNAUTHORIZED)
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
