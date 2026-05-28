package com.pet_care.order_service.messaging;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class OrderCreatedEvent {

    String orderId;

    String userId;

    BigDecimal totalPrice;

    List<OrderItemEvent> items;

}
