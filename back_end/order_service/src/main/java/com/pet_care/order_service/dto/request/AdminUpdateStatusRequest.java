package com.pet_care.order_service.dto.request;

import com.pet_care.order_service.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUpdateStatusRequest {

    @NotNull(message = "Status is required")
    OrderStatus status;

    String note;
}
