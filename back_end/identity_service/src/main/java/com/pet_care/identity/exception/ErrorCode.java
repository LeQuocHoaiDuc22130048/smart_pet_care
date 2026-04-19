package com.pet_care.identity.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import lombok.Getter;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    USER_EXISTED(1001, "User existed", HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1002, "Username must be at least {min} characters", HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1003, "Password must be at least {min} characters", HttpStatus.BAD_REQUEST),
    INVALID_KEY(1004, "Invalid message key", HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTED(1005, "User not existed", HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006, "unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1007, "you do not have permission", HttpStatus.FORBIDDEN),
    INVALID_DOB(1008, "Your age must be at least {min}", HttpStatus.BAD_REQUEST),
    INVALID_GOOGLE_TOKEN(1009, "Invalid Google token", HttpStatus.UNAUTHORIZED),
    GOOGLE_ACCOUNT_ALREADY_LINKED(1010, "Google account is already linked to another user", HttpStatus.BAD_REQUEST),
    CANNOT_UNLINK_PRIMARY_AUTH(1011, "Cannot unlink primary authentication method", HttpStatus.BAD_REQUEST),
    ROLE_NOT_EXISTED(1012, "Role not existed", HttpStatus.NOT_FOUND),
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
