/**
 * Booking Service API
 * Route prefix: /pet_care_booking
 * Gateway: /api/v1/pet_care_booking/**  →  http://localhost:8086/pet_care_booking/**
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Enums ────────────────────────────────────────────────────────────────────
export type BookingStatus =
    | 'PENDING'
    | 'CONFIRMED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'NO_SHOW';

export type ServiceCategory =
    | 'GROOMING'
    | 'VETERINARY'
    | 'VACCINATION'
    | 'HEALTH_CHECK'
    | 'TRAINING'
    | 'BOARDING'
    | 'OTHER';

// ─── Response types ───────────────────────────────────────────────────────────
export interface ServicePackage {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationMinutes: number;
    category: ServiceCategory;
    imageUrl?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Staff {
    id: string;
    name: string;
    specialization?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
    bio?: string;
    active: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface BookingResponse {
    id: string;
    userId: string;
    petId: string;
    petName?: string;
    servicePackage: ServicePackage;
    staff: Staff;
    appointmentDate: string;   // "yyyy-MM-dd"
    appointmentTime: string;   // "HH:mm:ss"
    status: BookingStatus;
    totalPrice: number;
    notes?: string;
    adminNotes?: string;
    createdAt?: string;
    updatedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
}

// ─── Request types ────────────────────────────────────────────────────────────
export interface CreateBookingRequest {
    petId: string;
    servicePackageId: string;
    staffId: string;
    appointmentDate: string;   // "yyyy-MM-dd"
    appointmentTime: string;   // "HH:mm:ss"
    notes?: string;
}

export interface UpdateBookingStatusRequest {
    status: BookingStatus;
    adminNotes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map BookingStatus → nhãn tiếng Việt */
export function bookingStatusLabel(status: BookingStatus): string {
    const map: Record<BookingStatus, string> = {
        PENDING: 'Chờ xác nhận',
        CONFIRMED: 'Đã xác nhận',
        IN_PROGRESS: 'Đang thực hiện',
        COMPLETED: 'Hoàn thành',
        CANCELLED: 'Đã hủy',
        NO_SHOW: 'Không đến',
    };
    return map[status] ?? status;
}

/** Map BookingStatus → CSS badge class */
export function bookingStatusBadge(status: BookingStatus): string {
    switch (status) {
        case 'COMPLETED':
            return 'bg-green-100 text-green-800 border-0 dark:bg-green-950/60 dark:text-green-300';
        case 'CONFIRMED':
        case 'IN_PROGRESS':
            return 'bg-blue-100 text-blue-800 border-0 dark:bg-blue-950/60 dark:text-blue-300';
        case 'CANCELLED':
        case 'NO_SHOW':
            return 'bg-red-100 text-red-800 border-0 dark:bg-red-950/60 dark:text-red-300';
        default:
            return 'bg-orange-100 text-orange-800 border-0 dark:bg-orange-950/50 dark:text-orange-300';
    }
}

/** Map ServiceCategory → icon emoji */
export function categoryIcon(category: ServiceCategory): string {
    const map: Record<ServiceCategory, string> = {
        GROOMING: '🛁',
        VETERINARY: '🏥',
        VACCINATION: '💉',
        HEALTH_CHECK: '🩺',
        TRAINING: '🎓',
        BOARDING: '🏠',
        OTHER: '🐾',
    };
    return map[category] ?? '🐾';
}

/** Format giá tiền VND */
export function formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + 'đ';
}

/** Format thời gian từ "HH:mm:ss" → "HH:mm" */
export function formatTime(time: string): string {
    return time.slice(0, 5);
}

/** Format ngày từ "yyyy-MM-dd" → "dd/MM/yyyy" */
export function formatDate(date: string): string {
    const [y, m, d] = date.split('-');
    return `${d}/${m}/${y}`;
}

// ─── API calls ────────────────────────────────────────────────────────────────
export const bookingApi = {
    // ── Service Packages (public) ─────────────────────────────────────────────

    /** GET /pet_care_booking/service-packages?category=... */
    getServicePackages(category?: ServiceCategory): Promise<ApiResponse<ServicePackage[]>> {
        const query = category ? `?category=${category}` : '';
        return apiRequest(`/pet_care_booking/service-packages${query}`);
    },

    /** GET /pet_care_booking/service-packages/{id} */
    getServicePackageById(id: string): Promise<ApiResponse<ServicePackage>> {
        return apiRequest(`/pet_care_booking/service-packages/${id}`);
    },

    // ── Staff (public) ────────────────────────────────────────────────────────

    /** GET /pet_care_booking/staff?activeOnly=true */
    getStaff(activeOnly = true): Promise<ApiResponse<Staff[]>> {
        return apiRequest(`/pet_care_booking/staff?activeOnly=${activeOnly}`);
    },

    /** GET /pet_care_booking/staff/{id} */
    getStaffById(id: string): Promise<ApiResponse<Staff>> {
        return apiRequest(`/pet_care_booking/staff/${id}`);
    },

    // ── Bookings (authenticated) ──────────────────────────────────────────────

    /** POST /pet_care_booking/bookings — tạo lịch đặt mới */
    createBooking(data: CreateBookingRequest): Promise<ApiResponse<BookingResponse>> {
        return apiRequest('/pet_care_booking/bookings', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** GET /pet_care_booking/bookings/my — lịch đặt của tôi */
    getMyBookings(): Promise<ApiResponse<BookingResponse[]>> {
        return apiRequest('/pet_care_booking/bookings/my', { requireAuth: true });
    },

    /** GET /pet_care_booking/bookings/my/{id} */
    getMyBookingById(id: string): Promise<ApiResponse<BookingResponse>> {
        return apiRequest(`/pet_care_booking/bookings/my/${id}`, { requireAuth: true });
    },

    /** PATCH /pet_care_booking/bookings/my/{id}/cancel */
    cancelMyBooking(id: string): Promise<ApiResponse<BookingResponse>> {
        return apiRequest(`/pet_care_booking/bookings/my/${id}/cancel`, {
            method: 'PATCH',
            requireAuth: true,
        });
    },

    // ── Admin ─────────────────────────────────────────────────────────────────

    /** GET /pet_care_booking/bookings/admin?status=... */
    getAllBookings(status?: BookingStatus): Promise<ApiResponse<BookingResponse[]>> {
        const query = status ? `?status=${status}` : '';
        return apiRequest(`/pet_care_booking/bookings/admin${query}`, { requireAuth: true });
    },

    /** GET /pet_care_booking/bookings/admin/staff/{staffId}/schedule?date=yyyy-MM-dd */
    getStaffSchedule(staffId: string, date: string): Promise<ApiResponse<BookingResponse[]>> {
        return apiRequest(`/pet_care_booking/bookings/admin/staff/${staffId}/schedule?date=${date}`, {
            requireAuth: true,
        });
    },

    /** PATCH /pet_care_booking/bookings/admin/{id}/status */
    updateBookingStatus(id: string, data: UpdateBookingStatusRequest): Promise<ApiResponse<BookingResponse>> {
        return apiRequest(`/pet_care_booking/bookings/admin/${id}/status`, {
            method: 'PATCH',
            body: data,
            requireAuth: true,
        });
    },

    // ── Admin: Service Packages ───────────────────────────────────────────────

    /** GET /pet_care_booking/service-packages/admin */
    getAllServicePackages(): Promise<ApiResponse<ServicePackage[]>> {
        return apiRequest('/pet_care_booking/service-packages/admin', { requireAuth: true });
    },

    /** POST /pet_care_booking/service-packages */
    createServicePackage(data: Omit<ServicePackage, 'id' | 'active' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<ServicePackage>> {
        return apiRequest('/pet_care_booking/service-packages', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** PUT /pet_care_booking/service-packages/{id} */
    updateServicePackage(id: string, data: Partial<ServicePackage>): Promise<ApiResponse<ServicePackage>> {
        return apiRequest(`/pet_care_booking/service-packages/${id}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_booking/service-packages/{id} */
    deleteServicePackage(id: string): Promise<ApiResponse<string>> {
        return apiRequest(`/pet_care_booking/service-packages/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    // ── Admin: Staff ──────────────────────────────────────────────────────────

    /** POST /pet_care_booking/staff */
    createStaff(data: Omit<Staff, 'id' | 'active' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Staff>> {
        return apiRequest('/pet_care_booking/staff', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** PUT /pet_care_booking/staff/{id} */
    updateStaff(id: string, data: Partial<Staff>): Promise<ApiResponse<Staff>> {
        return apiRequest(`/pet_care_booking/staff/${id}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_booking/staff/{id} */
    deleteStaff(id: string): Promise<ApiResponse<string>> {
        return apiRequest(`/pet_care_booking/staff/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
