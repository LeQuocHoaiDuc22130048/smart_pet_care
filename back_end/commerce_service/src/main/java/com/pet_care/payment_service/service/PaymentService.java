package com.pet_care.payment_service.service;

import com.pet_care.payment_service.client.OrderServiceClient;
import com.pet_care.payment_service.client.OrderValidationResponse;
import com.pet_care.payment_service.dto.ApiResponse;
import com.pet_care.payment_service.dto.request.CreatePaymentRequest;
import com.pet_care.payment_service.dto.request.UpdatePaymentStatusRequest;
import com.pet_care.payment_service.dto.response.PaymentResponse;
import com.pet_care.payment_service.entity.Payment;
import com.pet_care.payment_service.enums.PaymentMethod;
import com.pet_care.payment_service.enums.PaymentStatus;
import com.pet_care.payment_service.exception.AppException;
import com.pet_care.payment_service.exception.ErrorCode;
import com.pet_care.payment_service.gateway.PaymentGateway;
import com.pet_care.payment_service.gateway.VNPayGateway;
import com.pet_care.payment_service.mapper.PaymentMapper;
import com.pet_care.payment_service.messaging.event.PaymentFailedEvent;
import com.pet_care.payment_service.messaging.event.PaymentResultEvent;
import com.pet_care.payment_service.messaging.publisher.PaymentEventPublisher;
import com.pet_care.payment_service.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    PaymentRepository paymentRepository;
    PaymentMapper paymentMapper;
    PaymentGateway paymentGateway;
    VNPayGateway vnPayGateway;
    PaymentEventPublisher paymentEventPublisher;
    OrderServiceClient orderServiceClient;

    /**
     * Tạo thanh toán mới và khởi tạo giao dịch
     */
    @Transactional
    public PaymentResponse createPayment(CreatePaymentRequest request, Jwt jwt) {
        String userId = jwt.getSubject();

        // Validate amount
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.PAYMENT_AMOUNT_INVALID);
        }
        validateOrder(request, jwt);

        Payment existingPayment = paymentRepository.findByOrderId(request.getOrderId()).orElse(null);
        if (existingPayment != null) {
            if (!existingPayment.getUserId().equals(userId)) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
            return paymentMapper.toPaymentResponse(existingPayment);
        }

        // Generate transaction ID
        String transactionId = generateTransactionId();

        // Create payment record
        Payment payment = Payment.builder()
                .transactionId(transactionId)
                .orderId(request.getOrderId())
                .userId(userId)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(request.getPaymentMethod() == PaymentMethod.CASH_ON_DELIVERY
                        ? PaymentStatus.SUCCESS
                        : PaymentStatus.PENDING)
                .description(request.getDescription())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Created payment with transactionId: {} for order: {}", transactionId, request.getOrderId());
        if (savedPayment.getStatus() == PaymentStatus.SUCCESS) {
            publishPaymentEvent(savedPayment);
        }

        return paymentMapper.toPaymentResponse(savedPayment);
    }

    /**
     * Lấy payment URL từ gateway
     */
    public String getPaymentUrl(String transactionId, String userId) {
        Payment payment = getOwnedPaymentByTransactionId(transactionId, userId);

        if (!payment.getStatus().equals(PaymentStatus.PENDING)) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        }
        if (payment.getPaymentMethod() != PaymentMethod.VNPAY) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        }

        try {
            String paymentUrl = paymentGateway.initiatePayment(
                    transactionId,
                    payment.getAmount(),
                    payment.getDescription() != null ? payment.getDescription() : "PetCare Order",
                    null
            );
            log.info("Generated payment URL for transaction: {}", transactionId);
            return paymentUrl;
        } catch (Exception e) {
            log.error("Failed to generate payment URL: {}", e.getMessage());
            throw new AppException(ErrorCode.PAYMENT_PROCESSING_FAILED);
        }
    }

    @Transactional
    public PaymentResponse processVnPayCallback(Map<String, String> params) {
        if (!vnPayGateway.verifySignature(params)) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_SIGNATURE);
        }

        String transactionId = params.get("vnp_TxnRef");
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if (payment.getPaymentMethod() != PaymentMethod.VNPAY) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        }
        validateVnPayAmount(payment, params.get("vnp_Amount"));
        if (payment.getStatus() != PaymentStatus.PENDING) {
            return paymentMapper.toPaymentResponse(payment);
        }

        boolean success = "00".equals(params.get("vnp_ResponseCode"))
                && "00".equals(params.get("vnp_TransactionStatus"));
        payment.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.setReferenceCode(params.get("vnp_TransactionNo"));
        Payment updatedPayment = paymentRepository.save(payment);
        publishPaymentEvent(updatedPayment);
        return paymentMapper.toPaymentResponse(updatedPayment);
    }

    /**
     * Cập nhật trạng thái thanh toán từ gateway callback
     */
    @Transactional
    public PaymentResponse updatePaymentStatus(UpdatePaymentStatusRequest request) {
        Payment payment = paymentRepository.findByTransactionId(request.getTransactionId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getStatus().equals(PaymentStatus.PENDING)) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        }

        PaymentStatus newStatus = PaymentStatus.valueOf(request.getStatus().toUpperCase());
        payment.setStatus(newStatus);
        payment.setReferenceCode(request.getReferenceCode());

        Payment updatedPayment = paymentRepository.save(payment);
        log.info("Updated payment status to {} for transaction: {}", newStatus, request.getTransactionId());

        // Publish event
        publishPaymentEvent(updatedPayment);

        return paymentMapper.toPaymentResponse(updatedPayment);
    }

    /**
     * Lấy chi tiết thanh toán
     */
    public PaymentResponse getPaymentByTransactionId(String transactionId, String userId) {
        Payment payment = getOwnedPaymentByTransactionId(transactionId, userId);
        return paymentMapper.toPaymentResponse(payment);
    }

    /**
     * Lấy payment của một order
     */
    public PaymentResponse getPaymentByOrderId(String orderId, String userId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if (!payment.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return paymentMapper.toPaymentResponse(payment);
    }

    /**
     * Lấy tất cả payment của user
     */
    public List<PaymentResponse> getPaymentsByUserId(String userId) {
        return paymentRepository.findByUserId(userId)
                .stream()
                .map(paymentMapper::toPaymentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Hoàn tiền
     */
    @Transactional
    public PaymentResponse refundPayment(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getStatus().equals(PaymentStatus.SUCCESS)) {
            throw new AppException(ErrorCode.PAYMENT_PROCESSING_FAILED);
        }

        try {
            boolean refundSuccess = paymentGateway.refund(transactionId);
            if (!refundSuccess) {
                throw new AppException(ErrorCode.PAYMENT_PROCESSING_FAILED);
            }

            payment.setStatus(PaymentStatus.REFUNDED);
            Payment refundedPayment = paymentRepository.save(payment);
            log.info("Refunded payment for transaction: {}", transactionId);

            return paymentMapper.toPaymentResponse(refundedPayment);
        } catch (Exception e) {
            log.error("Refund failed: {}", e.getMessage());
            throw new AppException(ErrorCode.PAYMENT_PROCESSING_FAILED);
        }
    }

    /**
     * Private helper methods
     */

    private String generateTransactionId() {
        return "TXN-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
    }

    private Payment getOwnedPaymentByTransactionId(String transactionId, String userId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        if (!payment.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        return payment;
    }

    private void validateOrder(CreatePaymentRequest request, Jwt jwt) {
        try {
            ApiResponse<OrderValidationResponse> response = orderServiceClient.getOrderById(
                    request.getOrderId(), "Bearer " + jwt.getTokenValue());
            OrderValidationResponse order = response == null ? null : response.getResult();
            if (order == null) {
                throw new AppException(ErrorCode.ORDER_NOT_FOUND);
            }
            if (!jwt.getSubject().equals(order.getUserId())) {
                throw new AppException(ErrorCode.FORBIDDEN);
            }
            if (order.getTotalPrice() == null || order.getTotalPrice().compareTo(request.getAmount()) != 0) {
                throw new AppException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
            }
        } catch (AppException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("Could not validate order {} before payment: {}", request.getOrderId(), exception.getMessage());
            throw new AppException(ErrorCode.PAYMENT_PROCESSING_FAILED);
        }
    }

    private void validateVnPayAmount(Payment payment, String amountValue) {
        try {
            BigDecimal callbackAmount = new BigDecimal(amountValue).movePointLeft(2);
            if (payment.getAmount().compareTo(callbackAmount) != 0) {
                throw new AppException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
            }
        } catch (NumberFormatException | NullPointerException exception) {
            throw new AppException(ErrorCode.PAYMENT_AMOUNT_MISMATCH);
        }
    }

    private void publishPaymentEvent(Payment payment) {
        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            PaymentResultEvent event = PaymentResultEvent.builder()
                    .transactionId(payment.getTransactionId())
                    .orderId(payment.getOrderId())
                    .userId(payment.getUserId())
                    .amount(payment.getAmount())
                    .status(PaymentStatus.SUCCESS)
                    .message("Payment successful")
                    .timestamp(LocalDateTime.now())
                    .build();
            paymentEventPublisher.publishPaymentSuccess(event);
        } else if (payment.getStatus() == PaymentStatus.FAILED) {
            PaymentFailedEvent event = PaymentFailedEvent.builder()
                    .transactionId(payment.getTransactionId())
                    .orderId(payment.getOrderId())
                    .userId(payment.getUserId())
                    .reason("Payment failed")
                    .timestamp(LocalDateTime.now())
                    .build();
            paymentEventPublisher.publishPaymentFailed(event);
        }
    }
}

