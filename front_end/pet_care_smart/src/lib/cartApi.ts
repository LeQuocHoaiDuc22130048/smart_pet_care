/**
 * Cart Service API
 * Route prefix: /pet_care_cart
 * DTOs: AddToCartRequest, UpdateCartItemRequest
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Response types ───────────────────────────────────────────────────────────
export interface CartItem {
    id: string;             // itemId
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
}

// ─── Request types (khớp DTO backend) ────────────────────────────────────────

/**
 * AddToCartRequest
 * productId: @NotBlank
 * quantity: @Min(1)
 */
export interface AddToCartRequest {
    productId: string;
    quantity: number;       // >= 1
}

/**
 * UpdateCartItemRequest
 * quantity: @Min(0) — 0 = xóa item
 */
export interface UpdateCartItemRequest {
    quantity: number;       // >= 0
}

// ─── Cart endpoints ───────────────────────────────────────────────────────────
export const cartApi = {
    /** GET /pet_care_cart/cart */
    getCart(): Promise<ApiResponse<Cart>> {
        return apiRequest('/pet_care_cart/cart', { requireAuth: true });
    },

    /**
     * POST /pet_care_cart/cart/items — AddToCartRequest
     * quantity >= 1
     */
    addItem(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
        const body: AddToCartRequest = { productId, quantity };
        return apiRequest('/pet_care_cart/cart/items', {
            method: 'POST',
            body,
            requireAuth: true,
        });
    },

    /**
     * PUT /pet_care_cart/cart/items/{itemId} — UpdateCartItemRequest
     * quantity >= 0 (0 = xóa item)
     */
    updateItem(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
        const body: UpdateCartItemRequest = { quantity };
        return apiRequest(`/pet_care_cart/cart/items/${itemId}`, {
            method: 'PUT',
            body,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_cart/cart/items/{itemId} */
    removeItem(itemId: string): Promise<ApiResponse<Cart>> {
        return apiRequest(`/pet_care_cart/cart/items/${itemId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_cart/cart */
    clearCart(): Promise<ApiResponse<null>> {
        return apiRequest('/pet_care_cart/cart', {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
