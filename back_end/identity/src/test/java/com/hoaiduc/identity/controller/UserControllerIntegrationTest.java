package com.hoaiduc.identity.controller;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hoaiduc.identity.dto.request.UserCreationRequest;
import com.hoaiduc.identity.dto.response.UserResponse;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
public class UserControllerIntegrationTest {

    @Container
    static final MySQLContainer<?> MY_SQL_CONTAINER = new MySQLContainer<>("mysql:8.0.36")
            .withDatabaseName("identity_service")
            .withUsername("root")
            .withPassword("root");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MY_SQL_CONTAINER::getJdbcUrl);
        registry.add("spring.datasource.username", MY_SQL_CONTAINER::getUsername);
        registry.add("spring.datasource.password", MY_SQL_CONTAINER::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
    }

    @Autowired
    private MockMvc mockMvc;

    private UserCreationRequest request;
    private UserResponse response;
    private LocalDate dateOfBirth;

    @BeforeEach
    void initData() {
        dateOfBirth = LocalDate.of(2004, 3, 29);
        request = UserCreationRequest.builder()
                .username("HoaiDuc")
                .firstName("HoaiDuc")
                .lastName("HoaiDuc")
                .password("123456789")
                .birthDate(dateOfBirth)
                .build();

        response = UserResponse.builder()
                .id("4ddd76387ff8")
                .username("HoaiDuc")
                .firstName("HoaiDuc")
                .lastName("HoaiDuc")
                .birthDate(dateOfBirth)
                .build();
    }

    @Test
    // comment it
    void createUser_validRequest_success() throws Exception {
        // Given
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(request);
        // when, then
        var resp = mockMvc.perform(MockMvcRequestBuilders.post("/users")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(content))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000))
                .andExpect(MockMvcResultMatchers.jsonPath("result.username").value("HoaiDuc"))
                .andExpect(MockMvcResultMatchers.jsonPath("result.firstName").value("HoaiDuc"))
                .andExpect(MockMvcResultMatchers.jsonPath("result.lastName").value("HoaiDuc"));

        log.info("Result: {}", resp.andReturn().getResponse().getContentAsString());
    }
}
