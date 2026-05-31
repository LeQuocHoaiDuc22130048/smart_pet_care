/**
 * API Client — PetCareSmart
 * Base URL: http://localhost:8888/api/v1
 */

export const BASE_URL = '/api/v1';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const TOKEN_KEY = 'pcs_token';
const LEGACY_LOCAL_STORAGE_TOKEN_KEY = TOKEN_KEY;

export function getToken(): string | null {
    const sessionToken = sessionStorage.getItem(TOKEN_KEY);
    if (sessionToken) return sessionToken;

    const legacyToken = localStorage.getItem(LEGACY_LOCAL_STORAGE_TOKEN_KEY);
    if (legacyToken) {
        sessionStorage.setItem(TOKEN_KEY, legacyToken);
        localStorage.removeItem(LEGACY_LOCAL_STORAGE_TOKEN_KEY);
        return legacyToken;
    }

    return null;
}

export function setToken(token: string): void {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_TOKEN_KEY);
}

export function removeToken(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_LOCAL_STORAGE_TOKEN_KEY);
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

    // Safely parse JSON — guard against empty body (204, network errors, etc.)
    let data: ApiResponse<T>;
    const contentType = response.headers.get('content-type') ?? '';
    const text = await response.text();

    if (!text || !text.trim()) {
        // Empty body — treat as success if 2xx, otherwise throw
        if (response.ok) {
            return { code: 1000, message: null, result: null as T };
        }
        throw new ApiError(response.status, `HTTP ${response.status}`, response.status);
    }

    if (!contentType.includes('application/json')) {
        // Non-JSON response (HTML error page, plain text, etc.)
        throw new ApiError(response.status, `Unexpected response format: ${text.slice(0, 100)}`, response.status);
    }

    try {
        data = JSON.parse(text) as ApiResponse<T>;
    } catch {
        throw new ApiError(response.status, `Invalid JSON response: ${text.slice(0, 100)}`, response.status);
    }

    if (!response.ok && data.code !== 1000) {
        // Nếu 401 → token hết hạn, xóa token để force re-login
        if (response.status === 401) {
            removeToken();
        }
        throw new ApiError(data.code, data.message ?? 'Lỗi không xác định', response.status);
    }

    return data;
}

// ─── Custom error ─────────────────────────────────────────────────────────────
export class ApiError extends Error {
    public readonly code: number;
    public readonly httpStatus: number;
    
    constructor(
        code: number,
        message: string,
        httpStatus: number
    ) {
        super(message);
        this.name = 'ApiError';
        this.code = code;
        this.httpStatus = httpStatus;
        
        // Đảm bảo message được set đúng
        Object.defineProperty(this, 'message', {
            enumerable: true,
            value: message
        });
    }
}
