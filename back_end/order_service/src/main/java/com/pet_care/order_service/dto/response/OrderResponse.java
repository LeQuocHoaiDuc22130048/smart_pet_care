package com.pet_care.order_service.dto.response;

import com.pet_care.order_service.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    String id;
    String userId;
    Double totalPrice;
    OrderStatus status;
    LocalDateTime createdAt;
    List<OrderItemResponse> items;
}
