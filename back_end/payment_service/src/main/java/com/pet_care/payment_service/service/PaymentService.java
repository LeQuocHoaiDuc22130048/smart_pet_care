package com.pet_care.payment_service.service;

import com.pet_care.payment_service.dto.request.CreatePaymentRequest;
import com.pet_care.payment_service.dto.request.UpdatePaymentStatusRequest;
import com.pet_care.payment_service.dto.response.PaymentResponse;
import com.pet_care.payment_service.entity.Payment;
import com.pet_care.payment_service.enums.PaymentMethod;
import com.pet_care.payment_service.enums.PaymentStatus;
import com.pet_care.payment_service.exception.AppException;
import com.pet_care.payment_service.exception.ErrorCode;
import com.pet_care.payment_service.gateway.PaymentGateway;
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
    PaymentEventPublisher paymentEventPublisher;

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

        // Generate transaction ID
        String transactionId = generateTransactionId();

        // Create payment record
        Payment payment = Payment.builder()
                .transactionId(transactionId)
                .orderId(request.getOrderId())
                .userId(userId)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .description(request.getDescription())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        log.info("Created payment with transactionId: {} for order: {}", transactionId, request.getOrderId());

        return paymentMapper.toPaymentResponse(savedPayment);
    }

    /**
     * Lấy payment URL từ gateway
     */
    public String getPaymentUrl(String transactionId, String returnUrl) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (!payment.getStatus().equals(PaymentStatus.PENDING)) {
            throw new AppException(ErrorCode.PAYMENT_ALREADY_PROCESSED);
        }

        try {
            String paymentUrl = paymentGateway.initiatePayment(
                    transactionId,
                    payment.getAmount(),
                    payment.getDescription() != null ? payment.getDescription() : "PetCare Order",
                    returnUrl
            );
            log.info("Generated payment URL for transaction: {}", transactionId);
            return paymentUrl;
        } catch (Exception e) {
            log.error("Failed to generate payment URL: {}", e.getMessage());
            throw new AppException(ErrorCode.PAYMENT_PROCESSING_FAILED);
        }
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
    public PaymentResponse getPaymentByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
        return paymentMapper.toPaymentResponse(payment);
    }

    /**
     * Lấy payment của một order
     */
    public PaymentResponse getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));
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

