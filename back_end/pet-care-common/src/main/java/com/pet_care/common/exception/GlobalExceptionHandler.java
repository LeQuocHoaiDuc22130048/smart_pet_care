package com.pet_care.common.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.common.dto.ApiResponse;
import jakarta.validation.ConstraintViolation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.Objects;

/**
 * Base Global Exception Handler for all microservices
 * Provides unified exception handling across the application
 * Services should extend or override methods as needed
 */
@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public abstract class GlobalExceptionHandler {

    protected static final String MIN_ATTRIBUTE = "min";
    protected final ObjectMapper objectMapper;

    /**
     * Handle generic exceptions
     */
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception exception) {
        log.error("Uncategorized exception: {}", exception.getMessage(), exception);
        ErrorCode errorCode = getUncategorizedException();
        return ResponseEntity.status(errorCode.getStatus())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    /**
     * Handle application exceptions
     */
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        log.warn("Application exception: {} - {}", errorCode.getCode(), errorCode.getMessage());
        return ResponseEntity.status(errorCode.getStatus())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    /**
     * Handle access denied exceptions
     */
    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDeniedException(AccessDeniedException exception) {
        ErrorCode errorCode = getUnauthorizedException();
        log.warn("Access denied: {}", exception.getMessage());
        return ResponseEntity.status(errorCode.getStatus())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build());
    }

    /**
     * Handle validation exceptions
     */
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
        String enumKey = exception.getFieldError() != null
                ? exception.getFieldError().getDefaultMessage()
                : null;

        ErrorCode errorCode = getInvalidKeyException();
        Map<String, Object> attributes = null;

        try {
            if (enumKey != null) {
                errorCode = resolveErrorCode(enumKey);
                var constraintViolations =
                        exception.getBindingResult().getAllErrors().getFirst().unwrap(ConstraintViolation.class);
                attributes = constraintViolations.getConstraintDescriptor().getAttributes();
                log.debug("Validation attributes: {}", attributes);
            }
        } catch (IllegalArgumentException e) {
            log.debug("Unknown validation key: {}", enumKey);
        }

        String message = Objects.nonNull(attributes)
                ? mapAttribute(errorCode.getMessage(), attributes)
                : errorCode.getMessage();

        return ResponseEntity.status(errorCode.getStatus())
                .body(ApiResponse.<Void>builder()
                        .code(errorCode.getCode())
                        .message(message)
                        .build());
    }

    /**
     * Map validation attributes to message
     */
    protected String mapAttribute(String message, Map<String, Object> attributes) {
        String minValue = String.valueOf(attributes.get(MIN_ATTRIBUTE));
        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }

    /**
     * Resolve ErrorCode from string key
     * Override in service-specific implementation
     */
    protected abstract ErrorCode resolveErrorCode(String enumKey);

    /**
     * Get uncategorized exception error code
     * Override in service-specific implementation
     */
    protected abstract ErrorCode getUncategorizedException();

    /**
     * Get unauthorized exception error code
     * Override in service-specific implementation
     */
    protected abstract ErrorCode getUnauthorizedException();

    /**
     * Get invalid key exception error code
     * Override in service-specific implementation
     */
    protected abstract ErrorCode getInvalidKeyException();
}

