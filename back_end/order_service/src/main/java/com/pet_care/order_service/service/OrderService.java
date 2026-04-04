package com.pet_care.order_service.service;

import com.pet_care.order_service.client.ProductClient;
import com.pet_care.order_service.dto.request.CreateOrderRequest;
import com.pet_care.order_service.dto.request.OrderItemRequest;
import com.pet_care.order_service.dto.request.ReserveStockRequest;
import com.pet_care.order_service.dto.request.RollbackStockRequest;
import com.pet_care.order_service.dto.response.OrderResponse;
import com.pet_care.order_service.dto.response.ProductResponse;
import com.pet_care.order_service.entity.OrderItem;
import com.pet_care.order_service.entity.Orders;
import com.pet_care.order_service.enums.OrderStatus;
import com.pet_care.order_service.event.OrderCreatedEvent;
import com.pet_care.order_service.event.OrderEventPublisher;
import com.pet_care.order_service.event.OrderItemEvent;
import com.pet_care.order_service.exception.AppException;
import com.pet_care.order_service.exception.ErrorCode;
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

        reserveStock(request);

        Map<String, OrderItem> existingItems = orders.getItems()
                .stream()
                .collect(Collectors.toMap(OrderItem::getProductId, Function.identity()));

        for (OrderItemRequest req : request.getItems()) {
            ProductResponse product = productClient.getProductById(req.getProductId()).getResult();

            OrderItem orderItem = existingItems.get(req.getProductId());

            if (orderItem != null) {
                updateItem(orderItem, req.getQuantity(), product.getPrice());
            } else {
                orders.getItems().add(createItem(orders, req, product));
            }
        }

        orders.setTotalPrice(calculateTotalPrice(orders.getItems()));

        Orders savedOrder = orderRepository.save(orders);

        publishOrderEvent(savedOrder);

        return orderMapper.toOrderResponse(savedOrder);
    }

    @Transactional
    public void cancelOrder(String orderId) {
        Orders orders = getOrder(orderId);

        if (orders.getStatus() == OrderStatus.CANCELLED) return;

        rollbackStock(orders);
    }

    // call product service to rollback stock for the order items
    private void rollbackStock(Orders orders) {
        List<RollbackStockRequest> requests = orders.getItems().stream()
                .map(i -> RollbackStockRequest.builder()
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .build()).toList();
        productClient.rollbackStock(requests);
    }

    // call product service to reserve stock for the order items
    private void reserveStock(CreateOrderRequest request) {
        List<ReserveStockRequest> stockRequests = request.getItems().stream()
                .map(i -> {
                    ReserveStockRequest stockReq = new ReserveStockRequest();
                    stockReq.setProductId(i.getProductId());
                    stockReq.setQuantity(i.getQuantity());
                    return stockReq;
                }).toList();
        productClient.reserveStock(stockRequests);
    }

    // publish order event to rabbitmq
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

    // calculate total price of the order
    private BigDecimal calculateTotalPrice(List<OrderItem> items) {
        return items.stream()
                .map(OrderItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // create order item from request and product details
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

    // get existing order with editable status or create a new one
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

    // get order by id
    private Orders getOrder(String orderId) {
        return orderRepository.findById(orderId).orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    // update existing order item with new quantity and price
    private void updateItem(OrderItem item, int addedQuantity, BigDecimal price) {
        int newQuantity = item.getQuantity() + addedQuantity;
        item.setQuantity(newQuantity);
        item.setPrice(price.multiply(BigDecimal.valueOf(addedQuantity)));
    }
}
