/**
 * Order Service API
 * Route prefix: /pet_care_order
 * DTOs: CreateOrderRequest, OrderItemRequest,
 *        PaymentStatusRequest, AdminUpdateStatusRequest
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Enums (khớp OrderStatus backend) ────────────────────────────────────────
export type OrderStatus =
    | 'PENDING'
    | 'RESERVED'
    | 'PAYMENT_PENDING'
    | 'PAID'
    | 'CONFIRMED'
    | 'FAILED'
    | 'PAYMENT_FAILED'
    | 'CANCELLED';

// ─── Response types ───────────────────────────────────────────────────────────
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

// ─── Request types (khớp DTO backend) ────────────────────────────────────────

/**
 * OrderItemRequest
 * productId: @NotNull
 * quantity: @Min(1)
 */
export interface OrderItemRequest {
    productId: string;
    quantity: number;       // >= 1
}

/**
 * CreateOrderRequest
 * items: @NotEmpty List<OrderItemRequest>
 */
export interface CreateOrderRequest {
    items: OrderItemRequest[];
}

/**
 * PaymentStatusRequest
 * orderId: String
 * status: "PAID" | "FAILED"
 */
export interface PaymentStatusRequest {
    orderId: string;
    status: 'PAID' | 'FAILED';
}

/**
 * AdminUpdateStatusRequest
 * status: OrderStatus @NotNull
 * note: String (optional)
 */
export interface AdminUpdateStatusRequest {
    status: OrderStatus;
    note?: string;
}

// ─── Order endpoints ──────────────────────────────────────────────────────────
export const orderApi = {
    // ── User ──────────────────────────────────────────────────────────────────

    /** POST /pet_care_order/orders — CreateOrderRequest */
    createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
        return apiRequest('/pet_care_order/orders', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** GET /pet_care_order/orders/my */
    getMyOrders(): Promise<ApiResponse<Order[]>> {
        return apiRequest('/pet_care_order/orders/my', { requireAuth: true });
    },

    /** GET /pet_care_order/orders/{orderId} */
    getOrderById(orderId: string): Promise<ApiResponse<Order>> {
        return apiRequest(`/pet_care_order/orders/${orderId}`, { requireAuth: true });
    },

    /** DELETE /pet_care_order/orders/{orderId} */
    cancelOrder(orderId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_order/orders/${orderId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    /**
     * POST /pet_care_order/orders/payment-status — PaymentStatusRequest
     * status: "PAID" | "FAILED"
     */
    updatePaymentStatus(data: PaymentStatusRequest): Promise<ApiResponse<Order>> {
        return apiRequest('/pet_care_order/orders/payment-status', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    // ── Admin ─────────────────────────────────────────────────────────────────

    /** GET /pet_care_order/admin/orders?status=... */
    getAllOrders(status?: OrderStatus): Promise<ApiResponse<Order[]>> {
        const query = status ? `?status=${status}` : '';
        return apiRequest(`/pet_care_order/admin/orders${query}`, { requireAuth: true });
    },

    /** GET /pet_care_order/admin/orders/stats */
    getOrderStats(): Promise<ApiResponse<Record<string, number>>> {
        return apiRequest('/pet_care_order/admin/orders/stats', { requireAuth: true });
    },

    /** GET /pet_care_order/admin/orders/{orderId} */
    getAdminOrderById(orderId: string): Promise<ApiResponse<Order>> {
        return apiRequest(`/pet_care_order/admin/orders/${orderId}`, { requireAuth: true });
    },

    /** GET /pet_care_order/admin/orders/user/{userId} */
    getOrdersByUser(userId: string): Promise<ApiResponse<Order[]>> {
        return apiRequest(`/pet_care_order/admin/orders/user/${userId}`, { requireAuth: true });
    },

    /**
     * PATCH /pet_care_order/admin/orders/{orderId}/status — AdminUpdateStatusRequest
     * status: OrderStatus @NotNull
     */
    adminUpdateStatus(orderId: string, data: AdminUpdateStatusRequest): Promise<ApiResponse<Order>> {
        return apiRequest(`/pet_care_order/admin/orders/${orderId}/status`, {
            method: 'PATCH',
            body: data,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_order/admin/orders/{orderId} */
    adminCancelOrder(orderId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_order/admin/orders/${orderId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
