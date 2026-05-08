/**
 * Feedback Service API
 * Route prefix: /pet_care_feedback
 * DTOs: CreateFeedbackRequest, UpdateFeedbackRequest, AdminResponseRequest
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Enums ────────────────────────────────────────────────────────────────────

/** Khớp với FeedbackType enum backend */
export type FeedbackType = 'PRODUCT' | 'ORDER' | 'BOOKING';

/** Khớp với FeedbackStatus enum backend */
export type FeedbackStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// ─── Response types ───────────────────────────────────────────────────────────

/** FeedbackResponse */
export interface Feedback {
    id: string;
    userId: string;
    username: string;
    type: FeedbackType;
    productId?: string;
    orderId?: string;
    bookingId?: string;
    rating: number;                 // 1-5
    comment: string;
    imageUrls: string[];
    status: FeedbackStatus;
    adminResponse?: string;
    adminResponseAt?: string;
    helpfulCount: number;
    notHelpfulCount: number;
    verifiedPurchase: boolean;
    createdAt: string;
    updatedAt: string;
}

/** FeedbackStatsResponse */
export interface FeedbackStats {
    totalFeedbacks: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;  // {"5": 10, "4": 5, ...}
    verifiedPurchaseCount: number;
}

/** Page response */
export interface PageResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
        sort: {
            empty: boolean;
            sorted: boolean;
            unsorted: boolean;
        };
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

// ─── Request types (khớp DTO backend) ────────────────────────────────────────

/**
 * CreateFeedbackRequest — multipart/form-data
 * field "request": JSON string của object bên dưới
 * field "images": File[] (optional)
 */
export interface CreateFeedbackRequest {
    type: FeedbackType;         // @NotNull
    productId?: string;         // Required if type = PRODUCT
    orderId?: string;           // Required if type = ORDER
    bookingId?: string;         // Required if type = BOOKING
    rating: number;             // @Min(1) @Max(5)
    comment: string;            // @NotBlank @Size(max=1000)
}

/**
 * UpdateFeedbackRequest — application/json
 */
export interface UpdateFeedbackRequest {
    rating?: number;            // @Min(1) @Max(5)
    comment?: string;           // @Size(max=1000)
}

/**
 * AdminResponseRequest — application/json
 */
export interface AdminResponseRequest {
    response: string;           // @NotBlank @Size(max=500)
}

// ─── Feedback endpoints ───────────────────────────────────────────────────────
export const feedbackApi = {
    // ── Public / User ─────────────────────────────────────────────────────────

    /**
     * POST /pet_care_feedback/feedbacks — multipart/form-data
     * field "request": JSON string của CreateFeedbackRequest
     * field "images": File[] (optional, max 5 images)
     */
    create(data: CreateFeedbackRequest, images?: File[]): Promise<ApiResponse<Feedback>> {
        const formData = new FormData();
        // Use Blob with explicit UTF-8 encoding to properly handle Vietnamese characters
        const jsonBlob = new Blob([JSON.stringify(data)], { type: 'application/json; charset=utf-8' });
        formData.append('request', jsonBlob);
        if (images && images.length > 0) {
            images.forEach((img) => formData.append('images', img));
        }
        return apiRequest('/pet_care_feedback/feedbacks', {
            method: 'POST',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    /**
     * PUT /pet_care_feedback/feedbacks/{feedbackId} — application/json
     */
    update(feedbackId: string, data: UpdateFeedbackRequest): Promise<ApiResponse<Feedback>> {
        return apiRequest(`/pet_care_feedback/feedbacks/${feedbackId}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    /**
     * POST /pet_care_feedback/feedbacks/{feedbackId}/images — multipart/form-data
     * field "images": File[]
     */
    addImages(feedbackId: string, images: File[]): Promise<ApiResponse<Feedback>> {
        const formData = new FormData();
        images.forEach((img) => formData.append('images', img));
        return apiRequest(`/pet_care_feedback/feedbacks/${feedbackId}/images`, {
            method: 'POST',
            body: formData,
            isFormData: true,
            requireAuth: true,
        });
    },

    /**
     * DELETE /pet_care_feedback/feedbacks/{feedbackId}
     */
    delete(feedbackId: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_feedback/feedbacks/${feedbackId}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    /**
     * GET /pet_care_feedback/feedbacks/{feedbackId}
     */
    getById(feedbackId: string): Promise<ApiResponse<Feedback>> {
        return apiRequest(`/pet_care_feedback/feedbacks/${feedbackId}`, {
            requireAuth: true,
        });
    },

    /**
     * GET /pet_care_feedback/feedbacks/my?page=0&size=10
     */
    getMyFeedbacks(page = 0, size = 10): Promise<ApiResponse<PageResponse<Feedback>>> {
        return apiRequest(`/pet_care_feedback/feedbacks/my?page=${page}&size=${size}`, {
            requireAuth: true,
        });
    },

    /**
     * GET /pet_care_feedback/feedbacks/product/{productId}?page=0&size=10
     * Public endpoint - có thể gọi với hoặc không có auth
     */
    getProductFeedbacks(
        productId: string,
        page = 0,
        size = 10,
        requireAuth = false
    ): Promise<ApiResponse<PageResponse<Feedback>>> {
        return apiRequest(
            `/pet_care_feedback/feedbacks/product/${productId}?page=${page}&size=${size}`,
            { requireAuth }
        );
    },

    /**
     * GET /pet_care_feedback/feedbacks/order/{orderId}?page=0&size=10
     */
    getOrderFeedbacks(
        orderId: string,
        page = 0,
        size = 10
    ): Promise<ApiResponse<PageResponse<Feedback>>> {
        return apiRequest(
            `/pet_care_feedback/feedbacks/order/${orderId}?page=${page}&size=${size}`,
            { requireAuth: true }
        );
    },

    /**
     * GET /pet_care_feedback/feedbacks/stats/product/{productId}
     * Public endpoint
     */
    getProductStats(productId: string, requireAuth = false): Promise<ApiResponse<FeedbackStats>> {
        return apiRequest(`/pet_care_feedback/feedbacks/stats/product/${productId}`, {
            requireAuth,
        });
    },

    // ── Admin endpoints ───────────────────────────────────────────────────────

    /**
     * POST /pet_care_feedback/feedbacks/{feedbackId}/response
     * Admin only - Add response to feedback
     */
    addAdminResponse(
        feedbackId: string,
        data: AdminResponseRequest
    ): Promise<ApiResponse<Feedback>> {
        return apiRequest(`/pet_care_feedback/feedbacks/${feedbackId}/response`, {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /**
     * PATCH /pet_care_feedback/feedbacks/{feedbackId}/status?status=APPROVED
     * Admin only - Update feedback status
     */
    updateStatus(feedbackId: string, status: FeedbackStatus): Promise<ApiResponse<Feedback>> {
        return apiRequest(`/pet_care_feedback/feedbacks/${feedbackId}/status?status=${status}`, {
            method: 'PATCH',
            requireAuth: true,
        });
    },

    /**
     * GET /pet_care_feedback/feedbacks/admin/status/{status}?page=0&size=10
     * Admin only - Get feedbacks by status
     */
    getFeedbacksByStatus(
        status: FeedbackStatus,
        page = 0,
        size = 10
    ): Promise<ApiResponse<PageResponse<Feedback>>> {
        return apiRequest(
            `/pet_care_feedback/feedbacks/admin/status/${status}?page=${page}&size=${size}`,
            { requireAuth: true }
        );
    },
};
