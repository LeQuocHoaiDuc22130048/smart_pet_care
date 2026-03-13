package com.pet_care.order_service.mapper;

import com.pet_care.order_service.dto.response.OrderItemResponse;
import com.pet_care.order_service.dto.response.OrderResponse;
import com.pet_care.order_service.entity.OrderItem;
import com.pet_care.order_service.entity.Orders;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = OrderMapper.class)
public interface OrderMapper {
    OrderResponse toOrderResponse(Orders order);

    List<OrderResponse> toOrderResponseList(List<Orders> request);

    OrderItemResponse toOrderItemResponse(OrderItem orderItem);
}
