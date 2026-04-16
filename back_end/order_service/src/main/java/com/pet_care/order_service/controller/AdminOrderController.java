package com.pet_care.order_service.controller;

import com.pet_care.order_service.dto.ApiResponse;
import com.pet_care.order_service.dto.request.AdminUpdateStatusRequest;
import com.pet_care.order_service.dto.response.OrderResponse;
import com.pet_care.order_service.dto.response.OrderStatsResponse;
import com.pet_care.order_service.enums.OrderStatus;
import com.pet_care.order_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    OrderService orderService;

    /**
     * GET /admin/orders
     * Lấy tất cả đơn hàng, có thể lọc theo status
     * VD: /admin/orders?status=PENDING
     */
    @GetMapping
    public ApiResponse<List<OrderResponse>> getAllOrders(
            @RequestParam(required = false) OrderStatus status) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.adminGetAllOrders(status))
                .build();
    }

    /**
     * GET /admin/orders/stats
     * Thống kê số lượng đơn hàng theo từng trạng thái
     */
    @GetMapping("/stats")
    public ApiResponse<OrderStatsResponse> getStats() {
        return ApiResponse.<OrderStatsResponse>builder()
                .result(orderService.adminGetStats())
                .build();
    }

    /**
     * GET /admin/orders/{orderId}
     * Lấy chi tiết bất kỳ đơn hàng (không check ownership)
     */
    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable String orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.adminGetOrderById(orderId))
                .build();
    }

    /**
     * GET /admin/orders/user/{userId}
     * Lấy tất cả đơn hàng của 1 user, có thể lọc theo status
     */
    @GetMapping("/user/{userId}")
    public ApiResponse<List<OrderResponse>> getOrdersByUser(
            @PathVariable String userId,
            @RequestParam(required = false) OrderStatus status) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.adminGetOrdersByUser(userId, status))
                .build();
    }

    /**
     * PATCH /admin/orders/{orderId}/status
     * Cập nhật trạng thái đơn hàng thủ công
     * Dùng khi: xác nhận giao hàng, xử lý khiếu nại, override trạng thái
     */
    @PatchMapping("/{orderId}/status")
    public ApiResponse<OrderResponse> updateStatus(
            @PathVariable String orderId,
            @RequestBody @Valid AdminUpdateStatusRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.adminUpdateStatus(orderId, request))
                .build();
    }

    /**
     * DELETE /admin/orders/{orderId}
     * Admin hủy đơn hàng và tự động rollback tồn kho
     */
    @DeleteMapping("/{orderId}")
    public ApiResponse<Void> cancelOrder(@PathVariable String orderId) {
        orderService.adminCancelOrder(orderId);
        return ApiResponse.<Void>builder()
                .message("Order cancelled and stock rolled back")
                .build();
    }
}
