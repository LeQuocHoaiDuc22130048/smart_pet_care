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
import com.pet_care.order_service.messaging.OrderCreatedEvent;
import com.pet_care.order_service.consumer.OrderEventPublisher;
import com.pet_care.order_service.messaging.OrderItemEvent;
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
        publishReserveStockEvent(savedOrder);

        return orderMapper.toOrderResponse(savedOrder);
    }

    public List<OrderResponse> getOrdersByUser(String userId) {
        return orderMapper.toOrderResponseList(orderRepository.findByUserId(userId));
    }

    public OrderResponse getOrderById(String orderId, String userId) {
        Orders order = getOrder(orderId);
        if (!order.getUserId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        return orderMapper.toOrderResponse(order);
    }

    @Transactional
    public void cancelOrder(String orderId, String userId) {
        Orders orders = getOrder(orderId);
        if (!orders.getUserId().equals(userId))
            throw new AppException(ErrorCode.UNAUTHORIZED);
        if (orders.getStatus() == OrderStatus.CANCELLED) return;
        publishRollbackEvent(orders);
        orders.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(orders);
    }

    @Transactional
    public OrderResponse updatePaymentStatus(String orderId, String status) {
        Orders orders = getOrder(orderId);

        // Không cho phép cập nhật nếu đã ở trạng thái cuối
        if (orders.getStatus() == OrderStatus.PAID ||
            orders.getStatus() == OrderStatus.CANCELLED ||
            orders.getStatus() == OrderStatus.PAYMENT_FAILED) {
            log.warn("Order {} already in terminal status {}, ignoring payment update",
                    orderId, orders.getStatus());
            return orderMapper.toOrderResponse(orders);
        }

        switch (status) {
            case "PAID":
                orders.setStatus(OrderStatus.PAID);
                break;
            case "FAILED":
                orders.setStatus(OrderStatus.FAILED);
                break;
            default:
                throw new AppException(ErrorCode.INVALID_PAYMENT_STATUS);
        }
        return orderMapper.toOrderResponse(orderRepository.save(orders));
    }

    @Transactional
    public void handlePaymentFailed(Orders order) {
        publishRollbackEvent(order);
        order.setStatus(OrderStatus.FAILED);
        orderRepository.save(order);
    }

    @Transactional
    public void updateOrderStatusFromPayment(String orderId, String status) {
        Orders order = getOrder(orderId);
        OrderStatus newStatus = OrderStatus.valueOf(status);
        order.setStatus(newStatus);
        orderRepository.save(order);
        log.info("Updated order {} status to {}", orderId, newStatus);
    }

    @Transactional
    public void cancelOrderDueToPaymentFailure(String orderId) {
        Orders order = getOrder(orderId);
        publishRollbackEvent(order);
        order.setStatus(OrderStatus.PAYMENT_FAILED);
        orderRepository.save(order);
        log.info("Cancelled order {} due to payment failure", orderId);
    }

    // --- Private helpers ---

    private void publishRollbackEvent(Orders orders) {
        List<RollbackStockRequest> items = orders.getItems().stream()
                .map(i -> RollbackStockRequest.builder()
                        .productId(i.getProductId())
                        .quantity(i.getQuantity())
                        .build()).toList();
        orderEventPublisher.publish("stock.rollback", items);
    }

    private void publishReserveStockEvent(Orders savedOrder) {
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

        orderEventPublisher.publish("stock.reserve", event);
    }

    private BigDecimal calculateTotalPrice(List<OrderItem> items) {
        return items.stream()
                .map(OrderItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private OrderItem createItem(Orders orders, OrderItemRequest req, ProductResponse product) {
        BigDecimal price = product.getPrice().multiply(BigDecimal.valueOf(req.getQuantity()));
        return OrderItem.builder()
                .order(orders)
                .productId(req.getProductId())
                .productName(product.getProductName())
                .quantity(req.getQuantity())
                .price(price)
                .build();
    }

    private Orders getOrCreateOrder(String userId) {
        // Chỉ PENDING mới được thêm/sửa items — PAID đã thanh toán không được chỉnh sửa
        return orderRepository.findFirstByUserIdAndStatusIn(userId, List.of(OrderStatus.PENDING))
                .orElseGet(() -> Orders.builder()
                        .userId(userId)
                        .status(OrderStatus.PENDING)
                        .items(new ArrayList<>())
                        .totalPrice(BigDecimal.ZERO)
                        .build());
    }

    private Orders getOrder(String orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
    }

    private void updateItem(OrderItem item, int addedQuantity, BigDecimal unitPrice) {
        int newQuantity = item.getQuantity() + addedQuantity;
        item.setQuantity(newQuantity);
        // Tính lại tổng giá theo số lượng mới
        item.setPrice(unitPrice.multiply(BigDecimal.valueOf(newQuantity)));
    }
}
