package com.pet_care.order_service.controller;

import com.pet_care.order_service.dto.ApiResponse;
import com.pet_care.order_service.dto.request.CreateOrderRequest;
import com.pet_care.order_service.dto.request.PaymentStatusRequest;
import com.pet_care.order_service.dto.response.OrderResponse;
import com.pet_care.order_service.service.OrderService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {

    OrderService orderService;

    @PostMapping
    public ApiResponse<OrderResponse> createOrder(@RequestBody CreateOrderRequest request, @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ApiResponse.<OrderResponse>builder().result(orderService.createOrder(userId, request)).build();
    }

    @PostMapping("/payment-status")
    public ApiResponse<OrderResponse> updatePaymentStatus(@RequestBody PaymentStatusRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updatePaymentStatus(request.getOrderId(), request.getStatus()))
                .build();
    }

    @GetMapping("/my")
    public ApiResponse<List<OrderResponse>> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getOrdersByUser(userId))
                .build();
    }

    @GetMapping("/{orderId}")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable String orderId,
                                                    @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderById(orderId, userId))
                .build();
    }

    @DeleteMapping("/{orderId}")
    public ApiResponse<Void> cancelOrder(@PathVariable String orderId,
                                          @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        orderService.cancelOrder(orderId, userId);
        return ApiResponse.<Void>builder().build();
    }
}
