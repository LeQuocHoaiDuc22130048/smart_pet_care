package com.pet_care.booking.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StaffResponse {
    String id;
    String name;
    String specialization;
    String phone;
    String email;
    String avatarUrl;
    String bio;
    Boolean active;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
