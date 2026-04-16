/**
 * Cart Service API
 * Route prefix: /pet_care_cart
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CartItem {
    id: string;         // itemId
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

// ─── Cart endpoints ───────────────────────────────────────────────────────────
export const cartApi = {
    getCart(): Promise<ApiResponse<Cart>> {
        return apiRequest('/pet_care_cart/cart', { requireAuth: true });
    },

    addItem(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
        return apiRequest('/pet_care_cart/cart/items', {
            method: 'POST',
            body: { productId, quantity },
            requireAuth: true,
        });
    },

    updateItem(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
        return apiRequest(`/pet_care_cart/cart/items/${itemId}`, {
            method: 'PUT',
            body: { quantity },
            requireAuth: true,
        });
    },

    removeItem(itemId: string): Promise<ApiResponse<Cart>> {
        return apiRequest(`/pet_care_cart/cart/items/${itemId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    clearCart(): Promise<ApiResponse<null>> {
        return apiRequest('/pet_care_cart/cart', {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
