package com.pet_care.order_service.mapper;

import com.pet_care.order_service.dto.response.OrderResponse;
import com.pet_care.order_service.entity.Orders;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderResponse toOrderResponse(Orders order);
    List<OrderResponse> toOrderResponseList(List<Orders> orders);
}
