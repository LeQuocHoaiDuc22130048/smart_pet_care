/**
 * Product Service API
 * Route prefix: /pet_care_product
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

export interface Category {
    id: string;
    categoryName: string;
    description?: string;
}

export interface ProductImage {
    id: string;
    imageUrl: string;
    isPrimary: boolean;
}

export interface Product {
    id: string;
    productName: string;
    description?: string;
    price: number;
    stockQuantity: number;
    status: ProductStatus;
    categories?: Category[];
    images?: ProductImage[];
    primaryImageUrl?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateProductRequest {
    productName: string;
    description?: string;
    price: number;
    stockQuantity: number;
    categoryId: string[];
    primaryImageIndex?: number;
    status?: ProductStatus;
}

export interface CreateCategoryRequest {
    categoryName: string;
    description?: string;
}

// ─── Product endpoints ────────────────────────────────────────────────────────
export const productApi = {
    // Public
    getAll(): Promise<ApiResponse<Product[]>> {
        return apiRequest('/pet_care_product/products');
    },

    getById(id: string): Promise<ApiResponse<Product>> {
        return apiRequest(`/pet_care_product/products/${id}`);
    },

    // Admin
    create(data: CreateProductRequest, images: File[]): Promise<ApiResponse<Product>> {
        const formData = new FormData();
        formData.append('request', JSON.stringify(data));
        images.forEach((img) => formData.append('images', img));
        return apiRequest('/pet_care_product/products', {
            method: 'POST',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    update(id: string, data: Partial<CreateProductRequest>, images?: File[]): Promise<ApiResponse<Product>> {
        const formData = new FormData();
        formData.append('request', JSON.stringify(data));
        if (images) {
            images.forEach((img) => formData.append('images', img));
        }
        return apiRequest(`/pet_care_product/products/${id}`, {
            method: 'PUT',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    delete(id: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_product/products/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    // Categories
    getAllCategories(): Promise<ApiResponse<Category[]>> {
        return apiRequest('/pet_care_product/categories');
    },

    getCategoryById(id: string): Promise<ApiResponse<Category>> {
        return apiRequest(`/pet_care_product/categories/${id}`);
    },

    createCategory(data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
        return apiRequest('/pet_care_product/categories', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    updateCategory(id: string, data: CreateCategoryRequest): Promise<ApiResponse<Category>> {
        return apiRequest(`/pet_care_product/categories/${id}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    deleteCategory(id: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_product/categories/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
