package com.hoaiduc.identity.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.hoaiduc.identity.dto.request.UserCreationRequest;
import com.hoaiduc.identity.dto.response.UserResponse;
import com.hoaiduc.identity.service.UserService;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource("/application-test.properties")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

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
        when(userService.createUser(any()))
                .thenReturn(
                        response); // when declare this method result will return in test not run in main application
        // when, then
        mockMvc.perform(MockMvcRequestBuilders.post("/users")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(content))
                .andExpect(MockMvcResultMatchers.status().isOk())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1000))
                .andExpect(MockMvcResultMatchers.jsonPath("result.id").value("4ddd76387ff8"));
    }

    @Test
    // comment it
    void createUser_usernameInvalid_fail() throws Exception {
        // Given
        request.setUsername("Du");
        ObjectMapper objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        String content = objectMapper.writeValueAsString(request);

        // when, then
        mockMvc.perform(MockMvcRequestBuilders.post("/users")
                        .contentType(MediaType.APPLICATION_JSON_VALUE)
                        .content(content))
                .andExpect(MockMvcResultMatchers.status().isBadRequest())
                .andExpect(MockMvcResultMatchers.jsonPath("code").value(1002))
                .andExpect(MockMvcResultMatchers.jsonPath("message").value("Username must be at least 3 characters"));
    }
}
