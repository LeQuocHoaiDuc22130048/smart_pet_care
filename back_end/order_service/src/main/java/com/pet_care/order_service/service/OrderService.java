package com.pet_care.order_service.service;

import com.pet_care.order_service.client.ProductClient;
import com.pet_care.order_service.dto.request.CreateOrderRequest;
import com.pet_care.order_service.dto.request.OrderItemRequest;
import com.pet_care.order_service.dto.response.OrderResponse;
import com.pet_care.order_service.dto.response.ProductResponse;
import com.pet_care.order_service.entity.OrderItem;
import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import com.pet_care.order_service.event.OrderCreatedEvent;
import com.pet_care.order_service.event.OrderEventPublisher;
import com.pet_care.order_service.mapper.OrderMapper;
import com.pet_care.order_service.repository.OrderRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderService {
    OrderMapper orderMapper;
    ProductClient productClient;
    OrderRepository orderRepository;
    OrderEventPublisher orderEventPublisher;

    @Transactional
    public OrderResponse createOrder(String userId, CreateOrderRequest request) {
        Orders order = Orders.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        List<OrderItem> items = new ArrayList<>();

        BigDecimal totalPrice = BigDecimal.ZERO;

        for (OrderItemRequest itemRequest : request.getItems()) {
            ProductResponse product = productClient.getProductById(itemRequest.getProductId()).getResult();

            BigDecimal price = product.getPrice().multiply(BigDecimal.valueOf(itemRequest.getQuantity()));

            OrderItem item = OrderItem.builder()
                    .productId(itemRequest.getProductId())
                    .productName(product.getProductName())
                    .quantity(itemRequest.getQuantity())
                    .price(price)
                    .order(order)
                    .build();

            totalPrice = totalPrice.add(price);

            items.add(item);
        }

        order.setItems(items);
        order.setTotalPrice(totalPrice);

        Orders saved = orderRepository.save(order);

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(saved.getId())
                .userId(saved.getUserId())
                .totalPrice(saved.getTotalPrice())
                .build();

        orderEventPublisher.publishOrderCreated(event);

        return orderMapper.toOrderResponse(saved);
    }
}
