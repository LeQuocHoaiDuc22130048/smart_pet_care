package com.pet_care.payment_service.controller;

import com.pet_care.payment_service.dto.ApiResponse;
import com.pet_care.payment_service.dto.request.PaymentRequest;
import com.pet_care.payment_service.dto.response.PaymentResponse;
import com.pet_care.payment_service.service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;

    @PostMapping
    public ApiResponse<PaymentResponse> create(@RequestBody PaymentRequest request) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.createPayment(request))
                .build();
    }

    @GetMapping("vnpay-callback")
    public ApiResponse<String> callback(@RequestParam Map<String, String> params) {
        return ApiResponse.<String>builder()
                .message("OK")
                .build();
    }

    @GetMapping("/mock-callback")
    public ApiResponse<String> mockCallback(@RequestParam String paymentId,
                                            @RequestParam String status) {
        paymentService.handleCallback(paymentId, Map.of("status", status));
        return ApiResponse.<String>builder()
                .message("OK")
                .build();
    }
}
