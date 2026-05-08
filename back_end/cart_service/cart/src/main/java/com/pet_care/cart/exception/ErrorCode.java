package com.pet_care.cart.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(9998, "Invalid key", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),

    CART_NOT_FOUND(5001, "Cart not found", HttpStatus.NOT_FOUND),
    CART_ITEM_NOT_FOUND(5002, "Cart item not found", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND(5003, "Product not found", HttpStatus.NOT_FOUND),
    PRODUCT_OUT_OF_STOCK(5004, "Product is out of stock", HttpStatus.BAD_REQUEST),
    PRODUCT_INACTIVE(5005, "Product is not available", HttpStatus.BAD_REQUEST),
    QUANTITY_EXCEEDS_STOCK(5006, "Requested quantity exceeds available stock", HttpStatus.BAD_REQUEST);

    private final int code;
    private final String message;
    private final HttpStatusCode status;

    ErrorCode(int code, String message, HttpStatusCode status) {
        this.code = code;
        this.message = message;
        this.status = status;
    }
}
