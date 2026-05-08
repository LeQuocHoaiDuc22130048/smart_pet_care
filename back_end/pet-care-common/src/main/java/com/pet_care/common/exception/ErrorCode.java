package com.pet_care.common.exception;

import org.springframework.http.HttpStatusCode;

/**
 * Interface để định nghĩa tất cả error codes trong hệ thống
 * Các service sẽ implement enum này
 */
public interface ErrorCode {
    int getCode();
    String getMessage();
    HttpStatusCode getStatus();
}

