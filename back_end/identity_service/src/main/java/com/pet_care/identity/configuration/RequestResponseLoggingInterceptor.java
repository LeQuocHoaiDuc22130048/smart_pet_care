package com.pet_care.identity.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.util.ContentCachingRequestWrapper;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.nio.charset.StandardCharsets;

/**
 * HTTP Request/Response Logging Interceptor
 * Logs all incoming and outgoing HTTP requests with proper masking of sensitive data
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RequestResponseLoggingInterceptor implements HandlerInterceptor {

    private final ObjectMapper objectMapper;

    private static final String[] SENSITIVE_FIELDS = {
            "password", "token", "authorization", "secret", "apiKey", "creditCard"
    };

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (isLoggingDisabled(request)) {
            return true;
        }

        // Set start time for duration calculation in afterCompletion
        request.setAttribute("startTime", System.currentTimeMillis());

        try {
            String method = request.getMethod();
            String uri = request.getRequestURI();
            String queryString = request.getQueryString();

            log.info(">>> {} {} {}", method, uri, queryString != null ? "?" + queryString : "");

            // Log request headers (except sensitive ones)
            logRequestHeaders(request);

            // Log request body if present
            if ("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method)) {
                logRequestBody(request);
            }
        } catch (Exception e) {
            log.error("Error logging request", e);
        }

        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {
        if (isLoggingDisabled(request)) {
            return;
        }

        try {
            String method = request.getMethod();
            String uri = request.getRequestURI();
            int status = response.getStatus();

            // Calculate duration
            Long startTime = (Long) request.getAttribute("startTime");
            long duration = startTime != null ? System.currentTimeMillis() - startTime : 0;

            log.info("<<< {} {} {} - {} ms", method, uri, status, duration);

            // Log response status and content type
            log.info("Response Content-Type: {}", response.getContentType());

            if (ex != null) {
                log.error("Exception occurred: {}", ex.getMessage(), ex);
            }
        } catch (Exception e) {
            log.error("Error logging response", e);
        }
    }

    /**
     * Log request headers (excluding sensitive ones)
     */
    private void logRequestHeaders(HttpServletRequest request) {
        try {
            var headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String headerName = headerNames.nextElement();
                if (!isSensitiveHeader(headerName)) {
                    log.debug("Header: {} = {}", headerName, request.getHeader(headerName));
                }
            }
        } catch (Exception e) {
            log.debug("Error logging request headers", e);
        }
    }

    /**
     * Log request body with sensitive data masked
     */
    private void logRequestBody(HttpServletRequest request) {
        try {
            if (request instanceof ContentCachingRequestWrapper) {
                ContentCachingRequestWrapper wrapper = (ContentCachingRequestWrapper) request;
                byte[] buf = wrapper.getContentAsByteArray();
                if (buf.length > 0) {
                    String body = new String(buf, StandardCharsets.UTF_8);
                    String maskedBody = maskSensitiveData(body);
                    log.debug("Request Body: {}", maskedBody);
                }
            }
        } catch (Exception e) {
            log.debug("Error logging request body", e);
        }
    }

    /**
     * Check if logging is disabled for this request
     */
    private boolean isLoggingDisabled(HttpServletRequest request) {
        String uri = request.getRequestURI();
        // Don't log health check, metrics endpoints
        return uri.contains("/actuator/");
    }

    /**
     * Check if header is sensitive
     */
    private boolean isSensitiveHeader(String headerName) {
        String lowerName = headerName.toLowerCase();
        for (String sensitive : SENSITIVE_FIELDS) {
            if (lowerName.contains(sensitive)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Mask sensitive data in JSON/request body
     */
    private String maskSensitiveData(String body) {
        try {
            if (body.trim().startsWith("{")) {
                // Try to parse as JSON
                String masked = body;
                for (String field : SENSITIVE_FIELDS) {
                    // Simple regex to mask sensitive fields
                    masked = masked.replaceAll(
                            "\"" + field + "\"\\s*:\\s*\"([^\"]+)\"",
                            "\"" + field + "\": \"***MASKED***\""
                    );
                }
                return masked;
            }
            return body;
        } catch (Exception e) {
            return "[Error masking data]";
        }
    }
}

