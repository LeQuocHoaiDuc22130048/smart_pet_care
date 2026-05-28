package com.pet_care.payment_service.controller;

import com.pet_care.payment_service.dto.ApiResponse;
import com.pet_care.payment_service.dto.request.CreatePaymentRequest;
import com.pet_care.payment_service.dto.request.UpdatePaymentStatusRequest;
import com.pet_care.payment_service.dto.response.PaymentResponse;
import com.pet_care.payment_service.configuration.VNPayConfig;
import com.pet_care.payment_service.exception.AppException;
import com.pet_care.payment_service.exception.ErrorCode;
import com.pet_care.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {
    PaymentService paymentService;
    VNPayConfig vnPayConfig;

    /**
     * Tạo thanh toán mới
     */
    @PostMapping
    public ApiResponse<PaymentResponse> createPayment(
            @RequestBody @Valid CreatePaymentRequest request,
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
            @AuthenticationPrincipal Jwt jwt) {
        log.info("Getting payment URL for transaction: {}", transactionId);
        return ApiResponse.<String>builder()
                .result(paymentService.getPaymentUrl(transactionId, jwt.getSubject()))
                .build();
    }

    /**
     * Callback thủ công chỉ dành cho quản trị viên; VNPay sử dụng endpoint ký số bên dưới.
     */
    @PostMapping("/callback")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PaymentResponse> paymentCallback(
            @RequestBody @Valid UpdatePaymentStatusRequest request) {
        log.info("Payment callback received for transaction: {}", request.getTransactionId());
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.updatePaymentStatus(request))
                .build();
    }

    @GetMapping("/vnpay-callback")
    public RedirectView vnPayCallback(@RequestParam Map<String, String> params) {
        PaymentResponse payment = paymentService.processVnPayCallback(params);
        String redirectUrl = UriComponentsBuilder.fromUriString(vnPayConfig.getFrontendReturnUrl())
                .queryParam("status", payment.getStatus().name())
                .queryParam("transactionId", payment.getTransactionId())
                .queryParam("orderId", payment.getOrderId())
                .build()
                .toUriString();
        return new RedirectView(redirectUrl);
    }

    /**
     * IPN server-to-server chính thức của VNPay. Cấu hình URL này trên cổng sandbox/merchant.
     */
    @GetMapping("/vnpay-ipn")
    public Map<String, String> vnPayIpn(@RequestParam Map<String, String> params) {
        try {
            paymentService.processVnPayCallback(params);
            return vnpayResponse("00", "Confirm Success");
        } catch (AppException exception) {
            ErrorCode errorCode = exception.getErrorCode();
            if (errorCode == ErrorCode.INVALID_PAYMENT_SIGNATURE) {
                return vnpayResponse("97", "Invalid signature");
            }
            if (errorCode == ErrorCode.PAYMENT_NOT_FOUND) {
                return vnpayResponse("01", "Order not found");
            }
            if (errorCode == ErrorCode.PAYMENT_AMOUNT_MISMATCH) {
                return vnpayResponse("04", "Invalid amount");
            }
            return vnpayResponse("99", "Unknown error");
        }
    }

    /**
     * Lấy chi tiết thanh toán theo transaction ID
     */
    @GetMapping("/{transactionId}")
    public ApiResponse<PaymentResponse> getPaymentByTransactionId(@PathVariable String transactionId,
                                                                    @AuthenticationPrincipal Jwt jwt) {
        log.info("Fetching payment for transaction: {}", transactionId);
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.getPaymentByTransactionId(transactionId, jwt.getSubject()))
                .build();
    }

    /**
     * Lấy thanh toán theo order ID
     */
    @GetMapping("/order/{orderId}")
    public ApiResponse<PaymentResponse> getPaymentByOrderId(@PathVariable String orderId,
                                                              @AuthenticationPrincipal Jwt jwt) {
        log.info("Fetching payment for order: {}", orderId);
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.getPaymentByOrderId(orderId, jwt.getSubject()))
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
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<PaymentResponse> refundPayment(@PathVariable String transactionId) {
        log.info("Processing refund for transaction: {}", transactionId);
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.refundPayment(transactionId))
                .build();
    }

    private Map<String, String> vnpayResponse(String code, String message) {
        return Map.of("RspCode", code, "Message", message);
    }
}

