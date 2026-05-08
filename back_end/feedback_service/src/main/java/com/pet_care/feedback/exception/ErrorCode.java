package com.pet_care.feedback.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(1004, "Invalid message key", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1006, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "You do not have permission", HttpStatus.FORBIDDEN),
    
    // Feedback errors (6xxx)
    FEEDBACK_NOT_FOUND(6001, "Feedback not found", HttpStatus.NOT_FOUND),
    FEEDBACK_ALREADY_EXISTS(6002, "You have already submitted feedback for this item", HttpStatus.BAD_REQUEST),
    INVALID_FEEDBACK_TYPE(6003, "Invalid feedback type or missing reference ID", HttpStatus.BAD_REQUEST),
    CANNOT_EDIT_FEEDBACK(6004, "Cannot edit feedback after 24 hours", HttpStatus.BAD_REQUEST),
    NOT_FEEDBACK_OWNER(6005, "You are not the owner of this feedback", HttpStatus.FORBIDDEN),
    ORDER_NOT_COMPLETED(6006, "Cannot review order that is not completed", HttpStatus.BAD_REQUEST),
    PRODUCT_NOT_FOUND(6007, "Product not found", HttpStatus.NOT_FOUND),
    ORDER_NOT_FOUND(6008, "Order not found", HttpStatus.NOT_FOUND),
    
    // Image upload errors
    IMAGE_UPLOAD_FAILED(6100, "Failed to upload image", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_IMAGE_FORMAT(6101, "Invalid image format. Only JPG, PNG allowed", HttpStatus.BAD_REQUEST),
    IMAGE_TOO_LARGE(6102, "Image size exceeds 5MB limit", HttpStatus.BAD_REQUEST),
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
