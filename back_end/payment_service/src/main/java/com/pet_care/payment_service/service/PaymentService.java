package com.pet_care.payment_service.service;

import com.pet_care.payment_service.dto.request.PaymentRequest;
import com.pet_care.payment_service.dto.response.PaymentResponse;
import com.pet_care.payment_service.entity.Payment;
import com.pet_care.payment_service.enums.PaymentStatus;
import com.pet_care.payment_service.gateway.PaymentGateway;
import com.pet_care.payment_service.gateway.PaymentGatewayFactory;
import com.pet_care.payment_service.mapper.PaymentMapper;
import com.pet_care.payment_service.messaging.publisher.PaymentPublisher;
import com.pet_care.payment_service.repository.PaymentRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentService {
    PaymentRepository paymentRepository;
    PaymentGatewayFactory paymentGatewayFactory;
    PaymentMapper paymentMapper;
    PaymentPublisher paymentPublisher;

    public PaymentResponse createPayment(PaymentRequest request) {
        if (paymentRepository.findByOrderId(request.getOrderId()).isPresent()) throw new
                RuntimeException("Payment already exists for this order");

        Payment payment = paymentMapper.toPaymentRequest(request);

        paymentRepository.save(payment);

        PaymentGateway gateway = paymentGatewayFactory.getGateway(request.getPaymentMethod());

        String url = gateway.createPaymentUrl(payment);

        return paymentMapper.toPaymentResponse(payment);
    }

    public void handleCallback(String paymentId, Map<String, String> params) {
        Payment payment = paymentRepository.findById(paymentId).orElseThrow();
        if (payment.getStatus() != PaymentStatus.PENDING) return;

        PaymentGateway gateway = paymentGatewayFactory.getGateway(payment.getPaymentMethod());
        PaymentStatus status = gateway.handleCallback(params);

        payment.setStatus(status);
        payment.setUpdatedAt(LocalDateTime.now());
        paymentRepository.save(payment);

        if (status == PaymentStatus.SUCCESS) paymentPublisher.sendSuccess(payment);
        else paymentPublisher.sendFailed(payment);
    }
}
