package com.pet_care.payment_service.controller;

import com.pet_care.payment_service.dto.ApiResponse;
import com.pet_care.payment_service.dto.request.CreatePaymentRequest;
import com.pet_care.payment_service.dto.request.UpdatePaymentStatusRequest;
import com.pet_care.payment_service.dto.response.PaymentResponse;
import com.pet_care.payment_service.service.PaymentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;

    /**
     * Tạo thanh toán mới
     */
    @PostMapping
    public ApiResponse<PaymentResponse> createPayment(
            @RequestBody CreatePaymentRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Creating payment for order: {}", request.getOrderId());
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.createPayment(request, jwt))
                .build();
    }

    /**
     * Lấy URL thanh toán
     */
    @GetMapping("/{transactionId}/payment-url")
    public ApiResponse<String> getPaymentUrl(
            @PathVariable String transactionId,
            @RequestParam(value = "returnUrl", defaultValue = "http://localhost:3000/payment-callback") String returnUrl) {
        log.info("Getting payment URL for transaction: {}", transactionId);
        return ApiResponse.<String>builder()
                .result(paymentService.getPaymentUrl(transactionId, returnUrl))
                .build();
    }

    /**
     * Callback từ payment gateway (POST theo chuẩn webhook)
     */
    @PostMapping("/callback")
    public ApiResponse<PaymentResponse> paymentCallback(
            @RequestBody UpdatePaymentStatusRequest request) {
        log.info("Payment callback received for transaction: {}", request.getTransactionId());
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.updatePaymentStatus(request))
                .build();
    }

    /**
     * Lấy chi tiết thanh toán theo transaction ID
     */
    @GetMapping("/{transactionId}")
    public ApiResponse<PaymentResponse> getPaymentByTransactionId(@PathVariable String transactionId) {
        log.info("Fetching payment for transaction: {}", transactionId);
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.getPaymentByTransactionId(transactionId))
                .build();
    }

    /**
     * Lấy thanh toán theo order ID
     */
    @GetMapping("/order/{orderId}")
    public ApiResponse<PaymentResponse> getPaymentByOrderId(@PathVariable String orderId) {
        log.info("Fetching payment for order: {}", orderId);
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.getPaymentByOrderId(orderId))
                .build();
    }

    /**
     * Lấy tất cả thanh toán của user hiện tại
     */
    @GetMapping("/user/my-payments")
    public ApiResponse<List<PaymentResponse>> getMyPayments(
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        log.info("Fetching payments for user: {}", userId);
        return ApiResponse.<List<PaymentResponse>>builder()
                .result(paymentService.getPaymentsByUserId(userId))
                .build();
    }

    /**
     * Hoàn tiền
     */
    @PostMapping("/{transactionId}/refund")
    public ApiResponse<PaymentResponse> refundPayment(@PathVariable String transactionId) {
        log.info("Processing refund for transaction: {}", transactionId);
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.refundPayment(transactionId))
                .build();
    }
}

