package com.pet_care.api_gateway.configuration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pet_care.api_gateway.dto.ApiResponse;
import com.pet_care.api_gateway.dto.response.IntrospectResponse;
import com.pet_care.api_gateway.service.IdentityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.concurrent.atomic.AtomicBoolean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthenticationFilterTest {

    private IdentityService identityService;
    private AuthenticationFilter authenticationFilter;

    @BeforeEach
    void setUp() {
        identityService = mock(IdentityService.class);
        authenticationFilter = new AuthenticationFilter(identityService, new ObjectMapper());
        ReflectionTestUtils.setField(authenticationFilter, "apiPrefix", "/api/v1");
    }

    @Test
    void publicRouteWithoutAuthorizationPassesThrough() {
        ServerWebExchange exchange = exchange("GET", "/api/v1/pet_care_product/products/123", null);
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        StepVerifier.create(authenticationFilter.filter(exchange, chain(chainCalled)))
                .verifyComplete();

        assertThat(chainCalled).isTrue();
        assertThat(exchange.getResponse().getStatusCode()).isNull();
        verify(identityService, never()).introspect(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void privateRouteWithoutAuthorizationIsRejected() {
        ServerWebExchange exchange = exchange("GET", "/api/v1/pet_care_user/profile/me", null);
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        StepVerifier.create(authenticationFilter.filter(exchange, chain(chainCalled)))
                .verifyComplete();

        assertThat(chainCalled).isFalse();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(identityService, never()).introspect(org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void privateRouteWithInvalidTokenIsRejected() {
        when(identityService.introspect(eq("bad-token")))
                .thenReturn(Mono.just(ApiResponse.<IntrospectResponse>builder()
                        .result(IntrospectResponse.builder().valid(false).build())
                        .build()));

        ServerWebExchange exchange = exchange("GET", "/api/v1/pet_care_user/profile/me", "Bearer bad-token");
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        StepVerifier.create(authenticationFilter.filter(exchange, chain(chainCalled)))
                .verifyComplete();

        assertThat(chainCalled).isFalse();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(identityService).introspect("bad-token");
    }

    @Test
    void privateRouteWithValidTokenPassesThrough() {
        when(identityService.introspect(eq("good-token")))
                .thenReturn(Mono.just(ApiResponse.<IntrospectResponse>builder()
                        .result(IntrospectResponse.builder().valid(true).build())
                        .build()));

        ServerWebExchange exchange = exchange("GET", "/api/v1/pet_care_user/profile/me", "Bearer good-token");
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        StepVerifier.create(authenticationFilter.filter(exchange, chain(chainCalled)))
                .verifyComplete();

        assertThat(chainCalled).isTrue();
        assertThat(exchange.getResponse().getStatusCode()).isNull();
        verify(identityService).introspect("good-token");
    }

    @Test
    void publicGetRouteDoesNotMakeOtherMethodsPublic() {
        ServerWebExchange exchange = exchange("POST", "/api/v1/pet_care_product/products", null);
        AtomicBoolean chainCalled = new AtomicBoolean(false);

        StepVerifier.create(authenticationFilter.filter(exchange, chain(chainCalled)))
                .verifyComplete();

        assertThat(chainCalled).isFalse();
        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(identityService, never()).introspect(org.mockito.ArgumentMatchers.anyString());
    }

    private ServerWebExchange exchange(String method, String path, String authorization) {
        MockServerHttpRequest.BaseBuilder<?> requestBuilder = MockServerHttpRequest.method(
                org.springframework.http.HttpMethod.valueOf(method), path);

        if (authorization != null) {
            requestBuilder.header(HttpHeaders.AUTHORIZATION, authorization);
        }

        return MockServerWebExchange.from(requestBuilder);
    }

    private GatewayFilterChain chain(AtomicBoolean chainCalled) {
        return exchange -> {
            chainCalled.set(true);
            return Mono.empty();
        };
    }
}
