/**
 * Identity Service API
 * Route prefix: /pet_care_identity
 * DTOs: UserCreationRequest, AuthenticationRequest, IntrospectRequest,
 *        LogoutRequest, RefreshRequest, UserUpdateRequest, PermissionRequest, RoleRequest
 */

import { apiRequest, type ApiResponse } from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

/** UserCreationRequest */
export interface RegisterRequest {
    username: string;       // @Size(min=3)
    password: string;       // @Size(min=8)
    firstName: string;
    lastName: string;
    birthDate: string;      // LocalDate → "yyyy-MM-dd"
}

/** AuthenticationRequest */
export interface LoginRequest {
    username: string;
    password: string;
}

/** IntrospectRequest */
export interface IntrospectRequest {
    token: string;
}

/** LogoutRequest */
export interface LogoutRequest {
    token: string;
}

/** RefreshRequest */
export interface RefreshRequest {
    token: string;
}

/** UserUpdateRequest */
export interface UserUpdateRequest {
    password?: string;
    firstName?: string;
    lastName?: string;
    birthDate?: string;     // LocalDate -> "yyyy-MM-dd"
    roles?: string[];
}

/** PermissionRequest */
export interface PermissionRequest {
    name: string;
    description?: string;
}

/** RoleRequest */
export interface RoleRequest {
    name: string;
    description?: string;
    permissions: string[];
}

// ─── Response types ───────────────────────────────────────────────────────────
export interface TokenResponse {
    token: string;
    authenticated: boolean;
}

export interface IntrospectResponse {
    valid: boolean;
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
    /** POST /pet_care_identity/users — UserCreationRequest */
    register(data: RegisterRequest): Promise<ApiResponse<UserIdentity>> {
        return apiRequest('/pet_care_identity/users', {
            method: 'POST',
            body: data,
        });
    },

    /** POST /pet_care_identity/auth/token — AuthenticationRequest */
    login(data: LoginRequest): Promise<ApiResponse<TokenResponse>> {
        return apiRequest('/pet_care_identity/auth/token', {
            method: 'POST',
            body: data,
        });
    },

    /** Google OAuth — Build Google OAuth URL using authorization code flow */
    getGoogleAuthUrl(redirectUri: string): string {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        
        if (!clientId) {
            console.error('VITE_GOOGLE_CLIENT_ID is not configured');
            return '';
        }

        const params = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: 'token id_token',  // Request ID Token directly
            scope: 'openid email profile',
            nonce: Math.random().toString(36).substring(2),
        });

        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    },

    /** POST /pet_care_identity/auth/google — Authenticate with Google ID Token */
    authenticateWithGoogle(data: { idToken: string; accessToken?: string }): Promise<ApiResponse<TokenResponse>> {
        return apiRequest('/pet_care_identity/auth/google', {
            method: 'POST',
            body: data,
        });
    },

    /** POST /pet_care_identity/auth/introspect — IntrospectRequest */
    introspect(data: IntrospectRequest): Promise<ApiResponse<IntrospectResponse>> {
        return apiRequest('/pet_care_identity/auth/introspect', {
            method: 'POST',
            body: data,
        });
    },

    /** POST /pet_care_identity/auth/log-out — LogoutRequest */
    logout(data: LogoutRequest): Promise<ApiResponse<null>> {
        return apiRequest('/pet_care_identity/auth/log-out', {
            method: 'POST',
            body: data,
        });
    },

    /** POST /pet_care_identity/auth/refresh — RefreshRequest */
    refresh(data: RefreshRequest): Promise<ApiResponse<TokenResponse>> {
        return apiRequest('/pet_care_identity/auth/refresh', {
            method: 'POST',
            body: data,
        });
    },

    /** GET /pet_care_identity/users/myInfo */
    getMyInfo(): Promise<ApiResponse<UserIdentity>> {
        return apiRequest('/pet_care_identity/users/myInfo', {
            requireAuth: true,
        });
    },

    /** GET /pet_care_identity/users/{id} */
    getUserById(id: string): Promise<ApiResponse<UserIdentity>> {
        return apiRequest(`/pet_care_identity/users/${id}`, {
            requireAuth: true,
        });
    },

    /** PUT /pet_care_identity/users/{id} — UserUpdateRequest */
    updateUser(id: string, data: UserUpdateRequest): Promise<ApiResponse<UserIdentity>> {
        return apiRequest(`/pet_care_identity/users/${id}`, {
            method: 'PUT',
            body: data,
            requireAuth: true,
        });
    },

    /** GET /pet_care_identity/users — ADMIN */
    getAllUsers(): Promise<ApiResponse<UserIdentity[]>> {
        return apiRequest('/pet_care_identity/users', {
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_identity/users/{id} — ADMIN */
    deleteUser(id: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_identity/users/${id}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    // ── Role & Permission (ADMIN) ─────────────────────────────────────────────

    /** GET /pet_care_identity/roles */
    getAllRoles(): Promise<ApiResponse<{ name: string; description: string; permissions: { name: string }[] }[]>> {
        return apiRequest('/pet_care_identity/roles', { requireAuth: true });
    },

    /** POST /pet_care_identity/roles — RoleRequest */
    createRole(data: RoleRequest): Promise<ApiResponse<unknown>> {
        return apiRequest('/pet_care_identity/roles', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_identity/roles/{role} */
    deleteRole(role: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_identity/roles/${role}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },

    /** GET /pet_care_identity/permissions */
    getAllPermissions(): Promise<ApiResponse<{ name: string; description: string }[]>> {
        return apiRequest('/pet_care_identity/permissions', { requireAuth: true });
    },

    /** POST /pet_care_identity/permissions — PermissionRequest */
    createPermission(data: PermissionRequest): Promise<ApiResponse<unknown>> {
        return apiRequest('/pet_care_identity/permissions', {
            method: 'POST',
            body: data,
            requireAuth: true,
        });
    },

    /** DELETE /pet_care_identity/permissions/{permission} */
    deletePermission(permission: string): Promise<ApiResponse<null>> {
        return apiRequest(`/pet_care_identity/permissions/${permission}`, {
            method: 'DELETE',
            requireAuth: true,
        });
    },
};
