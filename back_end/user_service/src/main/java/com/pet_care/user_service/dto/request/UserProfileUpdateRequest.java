package com.pet_care.user_service.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdateRequest {

    // multipart field name: firstName
    private String firstName;

    // multipart field name: lastName
    private String lastName;

    private String email;

    private LocalDate birthday;

    private String phone;

    private MultipartFile avatar;
}
