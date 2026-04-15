package com.pet_care.user_service.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
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

    @JsonAlias("first_name")
    private String firstName;

    @JsonAlias("last_name")
    private String lastName;

    private String email;

    private LocalDate birthday;

    private String phone;

    private MultipartFile avatar;

    // Setter alias cho multipart/form-data binding
    public void setFirst_name(String value) {
        this.firstName = value;
    }

    public void setLast_name(String value) {
        this.lastName = value;
    }
}
