package com.pet_care.user_service.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_KEY(9998, "Invalid key", HttpStatus.BAD_REQUEST),
    USER_PROFILE_NOT_FOUND(2001, "User profile not found", HttpStatus.NOT_FOUND),
    PET_NOT_FOUND(2002, "Pet not found", HttpStatus.NOT_FOUND),
    ADDRESS_NOT_FOUND(2003, "Address not found", HttpStatus.NOT_FOUND),
    UNAUTHORIZED(2004, "You do not have permission", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(2005, "Unauthenticated", HttpStatus.UNAUTHORIZED),
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
