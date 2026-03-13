package com.pet_care.order_service.mapper;

import com.pet_care.order_service.dto.response.OrderItemResponse;
import com.pet_care.order_service.entity.OrderItem;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderItemMapper {
    OrderItemResponse toOrderItemResponse(OrderItem orderItem);
    List<OrderItemResponse> toOrderItemResponseList(List<OrderItem> request);
}
