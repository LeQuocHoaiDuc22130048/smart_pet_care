package com.pet_care.booking.dto.response;

import com.pet_care.booking.enums.ServiceCategory;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServicePackageResponse {
    String id;
    String name;
    String description;
    BigDecimal price;
    Integer durationMinutes;
    ServiceCategory category;
    String imageUrl;
    Boolean active;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
