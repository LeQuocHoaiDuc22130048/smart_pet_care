package com.pet_care.booking.dto.request;

import com.pet_care.booking.enums.ServiceCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ServicePackageRequest {
    @NotBlank(message = "Name is required")
    String name;
    String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    BigDecimal price;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    Integer durationMinutes;

    @NotNull(message = "Category is required")
    ServiceCategory category;

    String imageUrl;
    Boolean active;
}
