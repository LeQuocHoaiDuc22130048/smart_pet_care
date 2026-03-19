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
import com.pet_care.order_service.event.OrderItemEvent;
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
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

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

        Orders orders = getOrCreateOrder(userId);

        Map<String, OrderItem> existingItems = orders.getItems()
                .stream()
                .collect(Collectors.toMap(OrderItem ::getProductId, Function.identity()));

        for (OrderItemRequest req : request.getItems()) {
            ProductResponse product = productClient.getProductById(req.getProductId()).getResult();

            OrderItem orderItem = existingItems.get(req.getProductId());

            if (orderItem != null) {updateItem(orderItem, req.getQuantity(), product.getPrice());}
            else {
                orders.getItems().add(createItem(orders, req, product));
            }
        }

        orders.setTotalPrice(calculateTotalPrice(orders.getItems()));

        Orders savedOrder = orderRepository.save(orders);

        publishOrderEvent(savedOrder);

        return orderMapper.toOrderResponse(savedOrder);
    }

    private void publishOrderEvent(Orders savedOrder) {
        List<OrderItemEvent> itemEvents = savedOrder.getItems()
                .stream()
                .map(i -> OrderItemEvent.builder()
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .build()).toList();

        OrderCreatedEvent event = OrderCreatedEvent.builder()
                .orderId(savedOrder.getId())
                .userId(savedOrder.getUserId())
                .totalPrice(savedOrder.getTotalPrice())
                .items(itemEvents)
                .build();

        orderEventPublisher.publishOrderCreated(event);
    }

    private BigDecimal calculateTotalPrice(List<OrderItem> items) {
        return items.stream()
                .map(OrderItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private OrderItem createItem(Orders orders, OrderItemRequest req, ProductResponse product) {
        BigDecimal price = product.getPrice().multiply(BigDecimal.valueOf(req.getQuantity()));
        return OrderItem.builder().
                order(orders)
                .productId(req.getProductId())
                .productName(product.getProductName())
                .quantity(req.getQuantity())
                .price(price)
                .build();
    }

    private Orders getOrCreateOrder(String userId) {

        List<OrderStatus> editableStatuses = List.of(
                OrderStatus.PENDING,
                OrderStatus.PAID,
                OrderStatus.CREATED
        );

        return orderRepository.findFirstByUserIdAndStatusIn(userId, editableStatuses)
                .orElseGet(() -> Orders.builder()
                        .userId(userId)
                        .status(OrderStatus.PENDING)
                        .createdAt(LocalDateTime.now())
                        .items(new ArrayList<>())
                        .totalPrice(BigDecimal.ZERO)
                        .build());
    }

    private void updateItem(OrderItem item, int addedQuantity, BigDecimal price) {
        int newQuantity = item.getQuantity() + addedQuantity;
        item.setQuantity(newQuantity);
        item.setPrice(price.multiply(BigDecimal.valueOf(addedQuantity)));
    }
}
