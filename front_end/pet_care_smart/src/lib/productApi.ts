/**
 * Product Service API
 * Route prefix: /pet_care_product
 * DTOs: ProductCreationRequest, ProductUpdateRequest,
 *        CategoryCreationRequest, CategoryUpdateRequest
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Enums ────────────────────────────────────────────────────────────────────
/** Khớp với ProductStatus enum backend */
export type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';

// ─── Response types ───────────────────────────────────────────────────────────

/** CategoryResponse — field là categoryId (không phải id) */
export interface Category {
    categoryId: string;         // backend dùng categoryId
    categoryName: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

/** CategoryResponseCreateProduct — dùng trong ProductResponse.category */
export interface CategoryInProduct {
    categoryId: string;
    categoryName: string;
}

/** ImageResponse */
export interface ProductImage {
    imageUrl: string;
    isPrimary: boolean;
}

/** ProductResponse */
export interface Product {
    id: string;
    productName: string;
    description?: string;
    price: number;
    stockQuantity: number;
    status: ProductStatus;
    category?: CategoryInProduct[];     // Set<CategoryResponseCreateProduct>
    images?: ProductImage[];
    createdAt?: string;
    updatedAt?: string;
}

// ─── Request types (khớp DTO backend) ────────────────────────────────────────

/**
 * ProductCreationRequest — multipart/form-data
 * field "request": JSON string của object bên dưới
 * field "images": File[]
 */
export interface ProductCreationRequest {
    productName: string;        // @NotBlank
    description?: string;       // @Size(max=500)
    price: number;              // BigDecimal
    stockQuantity: number;
    categoryId: string[];       // Set<String> @NotEmpty — dùng array, backend nhận Set
    primaryImageIndex?: number;
    // status không có trong CreationRequest (mặc định ACTIVE)
}

/**
 * ProductUpdateRequest — multipart/form-data
 * field "request": JSON string
 * field "images": File[] (optional)
 */
export interface ProductUpdateRequest {
    productName: string;        // @NotBlank
    description?: string;       // @Size(max=500)
    price?: number;
    stockQuantity?: number;
    status?: ProductStatus;
    categoryId: string[];       // @NotEmpty
    primaryImageIndex?: number;
}

/**
 * CategoryCreationRequest — application/json
 */
export interface CategoryCreationRequest {
    categoryName: string;       // @NotBlank, @Size(max=100)
    description?: string;       // @Size(max=500)
}

/**
 * CategoryUpdateRequest — application/json
 */
export interface CategoryUpdateRequest {
    categoryName?: string;
    description?: string;
}

// ─── Product endpoints ────────────────────────────────────────────────────────
export const productApi = {
    // ── Public ───────────────────────────────────────────────────────────────

    /** GET /pet_care_product/products */
    getAll(): Promise<ApiResponse<Product[]>> {
        return apiRequest('/pet_care_product/products');
    },

    /** GET /pet_care_product/products/{id} */
    getById(id: string): Promise<ApiResponse<Product>> {
        return apiRequest(`/pet_care_product/products/${id}`);
    },

    // ── Admin ─────────────────────────────────────────────────────────────────

    /**
     * POST /pet_care_product/products — multipart/form-data
     * field "request": JSON string của ProductCreationRequest
     * field "images": File[]
     */
    create(data: ProductCreationRequest, images: File[]): Promise<ApiResponse<Product>> {
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

    /**
     * PUT /pet_care_product/products/{id} — multipart/form-data
     * field "request": JSON string của ProductUpdateRequest
     * field "images": File[] (optional)
     */
    update(id: string, data: ProductUpdateRequest, images?: File[]): Promise<ApiResponse<Product>> {
        const formData = new FormData();
        formData.append('request', JSON.stringify(data));
        if (images && images.length > 0) {
            images.forEach((img) => formData.append('images', img));
        }
        return apiRequest(`/pet_care_product/products/${id}`, {
            method: 'PUT',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_product/products/{id} */
    delete(id: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_product/products/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    // ── Categories ────────────────────────────────────────────────────────────

    /** GET /pet_care_product/categories */
    getAllCategories(): Promise<ApiResponse<Category[]>> {
        return apiRequest('/pet_care_product/categories');
    },

    /** GET /pet_care_product/categories/{id} */
    getCategoryById(id: string): Promise<ApiResponse<Category>> {
        return apiRequest(`/pet_care_product/categories/${id}`);
    },

    /** POST /pet_care_product/categories — CategoryCreationRequest */
    createCategory(data: CategoryCreationRequest): Promise<ApiResponse<Category>> {
        return apiRequest('/pet_care_product/categories', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** PUT /pet_care_product/categories/{id} — CategoryUpdateRequest */
    updateCategory(id: string, data: CategoryUpdateRequest): Promise<ApiResponse<Category>> {
        return apiRequest(`/pet_care_product/categories/${id}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_product/categories/{id} */
    deleteCategory(id: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_product/categories/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
