package com.hoaiduc.identity.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.hoaiduc.identity.dto.request.UserCreationRequest;
import com.hoaiduc.identity.dto.response.UserResponse;
import com.hoaiduc.identity.entity.User;
import com.hoaiduc.identity.exception.AppException;
import com.hoaiduc.identity.repository.UserRepository;

@SpringBootTest
@TestPropertySource("/application-test.properties")
public class UserServiceTest {

    @Autowired
    private UserService userService;

    @MockitoBean
    private UserRepository userRepository;

    private UserCreationRequest request;
    private UserResponse response;
    private LocalDate dateOfBirth;
    private User user;

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

        user = User.builder()
                .id("4ddd76387ff8")
                .username("HoaiDuc")
                .firstName("HoaiDuc")
                .lastName("HoaiDuc")
                .birthDate(dateOfBirth)
                .build();
    }

    @Test
    void createUser_validRequest_success() {
        // GIVEN
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.save(any())).thenReturn(user);

        // WHEN
        var userResponse = userService.createUser(request);

        // THEN
        Assertions.assertThat(userResponse.getId()).isEqualTo("4ddd76387ff8");
        Assertions.assertThat(userResponse.getUsername()).isEqualTo("HoaiDuc");
    }

    @Test
    void createUser_userExisted_fail() {
        // GIVEN
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        // WHEN
        var exception = assertThrows(AppException.class, () -> userService.createUser(request));
        Assertions.assertThat(exception.getErrorCode().getCode()).isEqualTo(1001);
    }

    @Test
    @WithMockUser(username = "HoaiDuc")
    void getMyInfo_valid_success() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(user));

        var userResponse = userService.getMyInfo();

        Assertions.assertThat(userResponse.getUsername()).isEqualTo("HoaiDuc");
        Assertions.assertThat(userResponse.getId()).isEqualTo("4ddd76387ff8");
    }

    @Test
    @WithMockUser(username = "HoaiDuc")
    void getMyInfo_userNotFound_error() {
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.ofNullable(null));

        var exception = assertThrows(AppException.class, () -> userService.getMyInfo());

        Assertions.assertThat(exception.getErrorCode().getCode()).isEqualTo(1005);
    }
}
