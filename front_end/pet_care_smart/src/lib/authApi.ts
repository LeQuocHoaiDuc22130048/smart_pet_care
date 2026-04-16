/**
 * Identity Service API
 * Route prefix: /pet_care_identity
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RegisterRequest {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: string; // yyyy-MM-dd
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface TokenResponse {
    token: string;
    authenticated: boolean;
}

export interface IntrospectRequest {
    token: string;
}

export interface IntrospectResponse {
    valid: boolean;
}

export interface LogoutRequest {
    token: string;
}

export interface RefreshRequest {
    token: string;
}

export interface UserIdentity {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
    roles?: { name: string; permissions: { name: string }[] }[];
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────
export const authApi = {
    register(data: RegisterRequest): Promise<ApiResponse<UserIdentity>> {
        return apiRequest('/pet_care_identity/users', {
            method: 'POST',
            body: data,
        });
    },

    login(data: LoginRequest): Promise<ApiResponse<TokenResponse>> {
        return apiRequest('/pet_care_identity/auth/token', {
            method: 'POST',
            body: data,
        });
    },

    introspect(data: IntrospectRequest): Promise<ApiResponse<IntrospectResponse>> {
        return apiRequest('/pet_care_identity/auth/introspect', {
            method: 'POST',
            body: data,
        });
    },

    logout(data: LogoutRequest): Promise<ApiResponse<null>> {
        return apiRequest('/pet_care_identity/auth/log-out', {
            method: 'POST',
            body: data,
        });
    },

    refresh(data: RefreshRequest): Promise<ApiResponse<TokenResponse>> {
        return apiRequest('/pet_care_identity/auth/refresh', {
            method: 'POST',
            body: data,
        });
    },

    getMyInfo(): Promise<ApiResponse<UserIdentity>> {
        return apiRequest('/pet_care_identity/users/myInfo', {
            requireAuth: true,
        });
    },

    getUserById(id: string): Promise<ApiResponse<UserIdentity>> {
        return apiRequest(`/pet_care_identity/users/${id}`, {
            requireAuth: true,
        });
    },

    updateUser(id: string, data: Partial<RegisterRequest>): Promise<ApiResponse<UserIdentity>> {
        return apiRequest(`/pet_care_identity/users/${id}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    // Admin
    getAllUsers(): Promise<ApiResponse<UserIdentity[]>> {
        return apiRequest('/pet_care_identity/users', {
            requireAuth: true,
        });
    },

    deleteUser(id: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_identity/users/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
