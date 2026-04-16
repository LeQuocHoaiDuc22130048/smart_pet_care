/**
 * API Client — PetCareSmart
 * Base URL: http://localhost:8888/api/v1
 */

export const BASE_URL = 'http://localhost:8888/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const TOKEN_KEY = 'pcs_token';

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// ─── Standard response wrapper ────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
    code: number;
    message: string | null;
    result: T;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: unknown;
    isFormData?: boolean;
    requireAuth?: boolean;
}

export async function apiRequest<T>(
    path: string,
    options: RequestOptions = {}
): Promise<ApiResponse<T>> {
    const { method = 'GET', body, isFormData = false, requireAuth = false } = options;

    const headers: Record<string, string> = {};

    if (!isFormData && body !== undefined) {
        headers['Content-Type'] = 'application/json';
    }

    if (requireAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: isFormData
            ? (body as FormData)
            : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    });

    const data: ApiResponse<T> = await response.json();

    if (!response.ok && data.code !== 1000) {
        throw new ApiError(data.code, data.message ?? 'Lỗi không xác định', response.status);
    }

    return data;
}

// ─── Custom error ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
    constructor(
        public readonly code: number,
        message: string,
        public readonly httpStatus: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}
