package com.pet_care.api_gateway.configuration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.api_gateway.dto.ApiResponse;
import com.pet_care.api_gateway.service.IdentityService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class AuthenticationFilter implements GlobalFilter, Ordered {

    IdentityService identityService;
    ObjectMapper objectMapper;

    @Value("${app.api-prefix}")
    @NonFinal
    String apiPrefix;

    /**
     * Các endpoint không cần JWT.
     * Format: "METHOD:/path" — path là phần sau api-prefix
     * Dùng "*" cho method nếu tất cả method đều public.
     */
    private static final List<PublicRoute> PUBLIC_ROUTES = List.of(
            // ── Identity ──────────────────────────────────────────
            new PublicRoute("POST", "/pet_care_identity/users"),           // Đăng ký
            new PublicRoute("POST", "/pet_care_identity/auth/token"),      // Đăng nhập
            new PublicRoute("POST", "/pet_care_identity/auth/introspect"), // Kiểm tra token (API Gateway dùng)
            new PublicRoute("POST", "/pet_care_identity/auth/log-out"),    // Đăng xuất
            new PublicRoute("POST", "/pet_care_identity/auth/refresh"),    // Làm mới token
            
            // ── Google OAuth ──────────────────────────────────────
            new PublicRoute("GET",  "/pet_care_identity/auth/outbound/authentication"), // Initiate Google OAuth
            new PublicRoute("POST", "/pet_care_identity/auth/google"),                  // Authenticate with Google ID Token
            new PublicRoute("GET",  "/pet_care_identity/auth/outbound/callback"),       // Google OAuth callback (all providers)

            // ── Product — đọc không cần đăng nhập ─────────────────
            new PublicRoute("GET",  "/pet_care_product/products"),
            new PublicRoute("GET",  "/pet_care_product/categories"),

            // ── Feedback — đọc feedback và stats không cần đăng nhập ──
            new PublicRoute("GET",  "/pet_care_feedback/feedbacks/product"),
            new PublicRoute("GET",  "/pet_care_feedback/feedbacks/stats"),

            // ── Payment callback — gateway gọi từ VNPay/MoMo ──────
            new PublicRoute("POST", "/pet_care_payment/payments/callback"),
            new PublicRoute("GET",  "/pet_care_payment/payments/vnpay-callback")
    );

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        String method = request.getMethod() != null ? request.getMethod().name() : "";

        log.debug("Gateway filter: {} {}", method, path);

        if (isPublicRoute(path, method)) {
            log.debug("Public route, skipping auth: {} {}", method, path);
            return chain.filter(exchange);
        }

        List<String> authHeader = request.getHeaders().get(HttpHeaders.AUTHORIZATION);
        if (CollectionUtils.isEmpty(authHeader)) {
            log.warn("Missing Authorization header for: {} {}", method, path);
            return unauthenticated(exchange.getResponse());
        }

        String token = authHeader.getFirst().replace("Bearer ", "").trim();

        return identityService.introspect(token)
                .flatMap(response -> {
                    if (response.getResult() != null && response.getResult().isValid()) {
                        return chain.filter(exchange);
                    }
                    log.warn("Invalid token for: {} {}", method, path);
                    return unauthenticated(exchange.getResponse());
                })
                .onErrorResume(e -> {
                    log.error("Token introspection failed: {}", e.getMessage());
                    return unauthenticated(exchange.getResponse());
                });
    }

    @Override
    public int getOrder() {
        return -1;
    }

    private boolean isPublicRoute(String path, String method) {
        // Bỏ api-prefix để so sánh
        String strippedPath = path.startsWith(apiPrefix)
                ? path.substring(apiPrefix.length())
                : path;

        // Chuẩn hóa: bỏ trailing slash để so sánh nhất quán
        String normalizedPath = strippedPath.endsWith("/") && strippedPath.length() > 1
                ? strippedPath.substring(0, strippedPath.length() - 1)
                : strippedPath;

        return PUBLIC_ROUTES.stream().anyMatch(route -> {
            boolean methodMatch = "*".equals(route.method()) || route.method().equalsIgnoreCase(method);
            // Match exact hoặc sub-path (có dấu / phân cách rõ ràng)
            boolean pathMatch = normalizedPath.equals(route.path())
                    || normalizedPath.startsWith(route.path() + "/");
            return methodMatch && pathMatch;
        });
    }

    private Mono<Void> unauthenticated(ServerHttpResponse response) {
        ApiResponse<?> apiResponse = ApiResponse.builder()
                .code(1006)
                .message("Unauthenticated")
                .build();

        String body;
        try {
            body = objectMapper.writeValueAsString(apiResponse);
        } catch (JsonProcessingException e) {
            body = "{\"code\":1006,\"message\":\"Unauthenticated\"}";
        }

        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(body.getBytes())));
    }

    record PublicRoute(String method, String path) {}
}
