/**
 * Order Service API
 * Route prefix: /pet_care_order
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export type OrderStatus =
    | 'PENDING'
    | 'RESERVED'
    | 'PAYMENT_PENDING'
    | 'PAID'
    | 'CONFIRMED'
    | 'FAILED'
    | 'PAYMENT_FAILED'
    | 'CANCELLED';

export interface OrderItem {
    productId: string;
    productName?: string;
    quantity: number;
    price?: number;
    imageUrl?: string;
}

export interface Order {
    id: string;
    userId?: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    note?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateOrderRequest {
    items: { productId: string; quantity: number }[];
}

export interface UpdatePaymentStatusRequest {
    orderId: string;
    status: 'PAID' | 'FAILED';
}

export interface AdminUpdateStatusRequest {
    status: OrderStatus;
    note?: string;
}

// ─── Order endpoints ──────────────────────────────────────────────────────────
export const orderApi = {
    // User
    createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
        return apiRequest('/pet_care_order/orders', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    getMyOrders(): Promise<ApiResponse<Order[]>> {
        return apiRequest('/pet_care_order/orders/my', { requireAuth: true });
    },

    getOrderById(orderId: string): Promise<ApiResponse<Order>> {
        return apiRequest(`/pet_care_order/orders/${orderId}`, { requireAuth: true });
    },

    cancelOrder(orderId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_order/orders/${orderId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    updatePaymentStatus(data: UpdatePaymentStatusRequest): Promise<ApiResponse<Order>> {
        return apiRequest('/pet_care_order/orders/payment-status', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    // Admin
    getAllOrders(status?: OrderStatus): Promise<ApiResponse<Order[]>> {
        const query = status ? `?status=${status}` : '';
        return apiRequest(`/pet_care_order/admin/orders${query}`, { requireAuth: true });
    },

    getOrderStats(): Promise<ApiResponse<Record<string, number>>> {
        return apiRequest('/pet_care_order/admin/orders/stats', { requireAuth: true });
    },

    getAdminOrderById(orderId: string): Promise<ApiResponse<Order>> {
        return apiRequest(`/pet_care_order/admin/orders/${orderId}`, { requireAuth: true });
    },

    getOrdersByUser(userId: string): Promise<ApiResponse<Order[]>> {
        return apiRequest(`/pet_care_order/admin/orders/user/${userId}`, { requireAuth: true });
    },

    adminUpdateStatus(orderId: string, data: AdminUpdateStatusRequest): Promise<ApiResponse<Order>> {
        return apiRequest(`/pet_care_order/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: data,
            requireAuth: true,
        });
    },

    adminCancelOrder(orderId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_order/admin/orders/${orderId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
