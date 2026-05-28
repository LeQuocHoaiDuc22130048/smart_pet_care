package com.pet_care.identity.dto.request;

import java.util.Set;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleRequest {
    @NotBlank(message = "FIELD_REQUIRED")
    String name;
    String description;

    @NotNull(message = "FIELD_REQUIRED")
    Set<@NotBlank(message = "FIELD_REQUIRED") String> permissions;
}
