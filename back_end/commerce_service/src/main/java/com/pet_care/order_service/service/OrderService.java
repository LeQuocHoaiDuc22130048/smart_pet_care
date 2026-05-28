package com.pet_care.order_service.service;

import com.pet_care.order_service.client.ProductClient;
import com.pet_care.order_service.dto.request.AdminUpdateStatusRequest;
import com.pet_care.order_service.dto.request.CreateOrderRequest;
import com.pet_care.order_service.dto.request.OrderItemRequest;
import com.pet_care.order_service.dto.request.ReserveStockRequest;
import com.pet_care.order_service.dto.request.RollbackStockRequest;
import com.pet_care.order_service.dto.response.OrderResponse;
import com.pet_care.order_service.dto.response.OrderStatsResponse;
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
import java.util.LinkedHashMap;
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

    // ===================== USER METHODS =====================

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

        if (orders.getStatus() == OrderStatus.PAID ||
            orders.getStatus() == OrderStatus.CANCELLED ||
            orders.getStatus() == OrderStatus.PAYMENT_FAILED) {
            throw new AppException(ErrorCode.ORDER_ALREADY_TERMINAL);
        }

        switch (status) {
            case "PAID":   orders.setStatus(OrderStatus.PAID);   break;
            case "FAILED": orders.setStatus(OrderStatus.FAILED); break;
            default: throw new AppException(ErrorCode.INVALID_PAYMENT_STATUS);
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

    // ===================== ADMIN METHODS =====================

    /** Lấy tất cả đơn hàng, có thể lọc theo status */
    public List<OrderResponse> adminGetAllOrders(OrderStatus status) {
        if (status != null) {
            return orderMapper.toOrderResponseList(orderRepository.findByStatus(status));
        }
        return orderMapper.toOrderResponseList(orderRepository.findAll());
    }

    /** Lấy đơn hàng của 1 user cụ thể, có thể lọc theo status */
    public List<OrderResponse> adminGetOrdersByUser(String userId, OrderStatus status) {
        if (status != null) {
            return orderMapper.toOrderResponseList(orderRepository.findByUserIdAndStatus(userId, status));
        }
        return orderMapper.toOrderResponseList(orderRepository.findByUserId(userId));
    }

    /** Lấy chi tiết bất kỳ đơn hàng nào (không check ownership) */
    public OrderResponse adminGetOrderById(String orderId) {
        return orderMapper.toOrderResponse(getOrder(orderId));
    }

    /**
     * Admin cập nhật trạng thái đơn hàng thủ công.
     * Dùng khi cần can thiệp: xác nhận giao hàng, xử lý khiếu nại...
     */
    @Transactional
    public OrderResponse adminUpdateStatus(String orderId, AdminUpdateStatusRequest request) {
        Orders order = getOrder(orderId);
        OrderStatus oldStatus = order.getStatus();
        order.setStatus(request.getStatus());
        Orders saved = orderRepository.save(order);
        log.info("Admin updated order {} status: {} → {}", orderId, oldStatus, request.getStatus());
        return orderMapper.toOrderResponse(saved);
    }

    /** Admin hủy đơn hàng và rollback tồn kho */
    @Transactional
    public void adminCancelOrder(String orderId) {
        Orders order = getOrder(orderId);
        if (order.getStatus() == OrderStatus.CANCELLED) return;
        publishRollbackEvent(order);
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
        log.info("Admin cancelled order {}", orderId);
    }

    /** Thống kê đơn hàng theo status */
    public OrderStatsResponse adminGetStats() {
        long total = orderRepository.count();
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            byStatus.put(s.name(), orderRepository.countByStatus(s));
        }
        return OrderStatsResponse.builder()
                .total(total)
                .byStatus(byStatus)
                .build();
    }

    // ===================== PRIVATE HELPERS =====================

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
        item.setPrice(unitPrice.multiply(BigDecimal.valueOf(newQuantity)));
    }
}
