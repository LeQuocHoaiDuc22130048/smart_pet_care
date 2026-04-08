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
    public void updatePaymentStatus(@RequestBody PaymentStatusRequest request) {
        orderService.updatePaymentStatus(request.getOrderId(), request.getStatus());
    }
}
