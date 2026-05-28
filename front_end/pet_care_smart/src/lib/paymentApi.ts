/**
 * Payment Service API
 * Route prefix: /pet_care_payment
 * DTOs: CreatePaymentRequest, UpdatePaymentStatusRequest
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Enums (khớp PaymentMethod backend) ──────────────────────────────────────
export type PaymentMethod = 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

// ─── Response types ───────────────────────────────────────────────────────────
export interface Payment {
    id: number;
    orderId: string;
    userId?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    description?: string;
    paymentUrl?: string;
    transactionId: string;
    referenceCode?: string;
    createdAt?: string;
}

// ─── Request types (khớp DTO backend) ────────────────────────────────────────

/**
 * CreatePaymentRequest
 * orderId: @NotBlank
 * amount: @NotNull, @DecimalMin("0.01")
 * paymentMethod: @NotNull
 * description: optional
 */
export interface CreatePaymentRequest {
    orderId: string;
    amount: number;             // BigDecimal — gửi number, Jackson tự convert
    paymentMethod: PaymentMethod;
    description?: string;
}

/**
 * UpdatePaymentStatusRequest (dùng nội bộ / callback)
 * transactionId: @NotBlank
 * status: @NotBlank — "SUCCESS" | "FAILED" | "CANCELLED"
 * referenceCode: optional
 * message: optional
 */
export interface UpdatePaymentStatusRequest {
    transactionId: string;
    status: 'SUCCESS' | 'FAILED' | 'CANCELLED';
    referenceCode?: string;
    message?: string;
}

// ─── Payment endpoints ────────────────────────────────────────────────────────
export const paymentApi = {
    /**
     * POST /pet_care_payment/payments — CreatePaymentRequest
     * orderId, amount, paymentMethod required
     */
    createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
        return apiRequest('/pet_care_payment/payments', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** GET /pet_care_payment/payments/{transactionId} */
    getPaymentById(transactionId: string): Promise<ApiResponse<Payment>> {
        return apiRequest(`/pet_care_payment/payments/${transactionId}`, { requireAuth: true });
    },

    /** GET /pet_care_payment/payments/{transactionId}/payment-url */
    getPaymentUrl(transactionId: string): Promise<ApiResponse<string>> {
        return apiRequest(`/pet_care_payment/payments/${transactionId}/payment-url`, {
            requireAuth: true,
        });
    },

    /** GET /pet_care_payment/payments/order/{orderId} */
    getPaymentByOrder(orderId: string): Promise<ApiResponse<Payment>> {
        return apiRequest(`/pet_care_payment/payments/order/${orderId}`, { requireAuth: true });
    },

    /** GET /pet_care_payment/payments/user/my-payments */
    getMyPayments(): Promise<ApiResponse<Payment[]>> {
        return apiRequest('/pet_care_payment/payments/user/my-payments', { requireAuth: true });
    },

    /** POST /pet_care_payment/payments/{transactionId}/refund */
    refund(transactionId: string): Promise<ApiResponse<Payment>> {
        return apiRequest(`/pet_care_payment/payments/${transactionId}/refund`, {
            method: 'POST',
            requireAuth: true,
        });
    },
};
