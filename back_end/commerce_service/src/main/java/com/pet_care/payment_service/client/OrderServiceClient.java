package com.pet_care.payment_service.client;

import com.pet_care.payment_service.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "order-service-payment-validation", url = "${services.order.url}")
public interface OrderServiceClient {
    @GetMapping("/orders/{orderId}")
    ApiResponse<OrderValidationResponse> getOrderById(
            @PathVariable String orderId,
            @RequestHeader("Authorization") String authorization);
}
