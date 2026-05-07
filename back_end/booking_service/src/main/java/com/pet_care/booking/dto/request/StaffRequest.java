package com.pet_care.booking.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffRequest {
    @NotBlank(message = "Name is required")
    String name;
    String specialization;
    String phone;

    @Email(message = "Email is invalid")
    String email;

    String avatarUrl;
    String bio;
    Boolean active;
}
