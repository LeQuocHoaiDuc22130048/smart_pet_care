/**
 * Payment Service API
 * Route prefix: /pet_care_payment
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export type PaymentMethod = 'VNPAY' | 'MOMO' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface Payment {
    id: string;
    orderId: string;
    userId?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    description?: string;
    paymentUrl?: string;
    transactionId?: string;
    createdAt?: string;
}

export interface CreatePaymentRequest {
    orderId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    description?: string;
}

// ─── Payment endpoints ────────────────────────────────────────────────────────
export const paymentApi = {
    createPayment(data: CreatePaymentRequest): Promise<ApiResponse<Payment>> {
        return apiRequest('/pet_care_payment/payments', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    getPaymentById(transactionId: string): Promise<ApiResponse<Payment>> {
        return apiRequest(`/pet_care_payment/payments/${transactionId}`, { requireAuth: true });
    },

    getPaymentUrl(transactionId: string): Promise<ApiResponse<{ paymentUrl: string }>> {
        return apiRequest(`/pet_care_payment/payments/${transactionId}/payment-url`, {
            requireAuth: true,
        });
    },

    getPaymentByOrder(orderId: string): Promise<ApiResponse<Payment>> {
        return apiRequest(`/pet_care_payment/payments/order/${orderId}`, { requireAuth: true });
    },

    getMyPayments(): Promise<ApiResponse<Payment[]>> {
        return apiRequest('/pet_care_payment/payments/user/my-payments', { requireAuth: true });
    },

    refund(transactionId: string): Promise<ApiResponse<Payment>> {
        return apiRequest(`/pet_care_payment/payments/${transactionId}/refund`, {
            method: 'POST',
            requireAuth: true,
        });
    },
};
