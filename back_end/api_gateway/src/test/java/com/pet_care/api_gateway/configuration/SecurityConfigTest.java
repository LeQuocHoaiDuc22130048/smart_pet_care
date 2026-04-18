package com.pet_care.api_gateway.configuration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.reactive.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Test SecurityConfig configuration
 */
@SpringBootTest
class SecurityConfigTest {

    @Autowired(required = false)
    private SecurityConfig securityConfig;

    @Autowired(required = false)
    private SecurityWebFilterChain securityWebFilterChain;

    @Autowired(required = false)
    private ReactiveJwtDecoder reactiveJwtDecoder;

    @Autowired(required = false)
    private CorsConfigurationSource corsConfigurationSource;

    @Test
    void testSecurityConfigBeanCreated() {
        assertThat(securityConfig).isNotNull();
    }

    @Test
    void testSecurityWebFilterChainBeanCreated() {
        assertThat(securityWebFilterChain).isNotNull();
    }

    @Test
    void testReactiveJwtDecoderBeanCreated() {
        assertThat(reactiveJwtDecoder).isNotNull();
    }

    @Test
    void testCorsConfigurationSourceBeanCreated() {
        assertThat(corsConfigurationSource).isNotNull();
    }
}

