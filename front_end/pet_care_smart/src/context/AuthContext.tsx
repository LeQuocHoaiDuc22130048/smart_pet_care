import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '@/lib/authApi';
import { userApi } from '@/lib/userApi';
import { ApiError, getToken, setToken, removeToken } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    name: string; // firstName + lastName
    email?: string;
    role: 'user' | 'admin';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<'admin' | 'user' | null>;
    loginWithToken: (token: string) => Promise<'admin' | 'user' | null>;
    logout: () => Promise<void>;
    register: (data: {
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        birthDate: string;
    }) => Promise<boolean>;
    updateUser: (data: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'firstName' | 'lastName'>>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Helper: extract role from JWT roles array ────────────────────────────────
function extractRole(roles?: { name: string }[]): 'user' | 'admin' {
    if (!roles) return 'user';
    const hasAdmin = roles.some(
        (r) => r.name.toUpperCase() === 'ADMIN' || r.name.toUpperCase() === 'ROLE_ADMIN'
    );
    return hasAdmin ? 'admin' : 'user';
}

// ─── Helper: fetch avatar URL from user service (silent fail) ─────────────────
async function fetchAvatarUrl(): Promise<string | undefined> {
    try {
        const res = await userApi.getMyProfile();
        return res.result?.avatar_url ?? res.result?.avatarUrl ?? undefined;
    } catch {
        return undefined;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(() => getToken() !== null);

    // ── Restore session on mount ──────────────────────────────────────────────
    useEffect(() => {
        const token = getToken();
        if (!token) {
            return;
        }

        // Validate token then fetch user info
        authApi
            .introspect({ token })
            .then(async (res) => {
                if (res.result?.valid) {
                    const infoRes = await authApi.getMyInfo();
                    const u = infoRes.result;
                    // Fetch avatar từ user service (identity service không lưu avatar)
                    const avatar = await fetchAvatarUrl();
                    setUser({
                        id: u.id,
                        username: u.username,
                        firstName: u.firstName,
                        lastName: u.lastName,
                        name: `${u.firstName} ${u.lastName}`,
                        role: extractRole(u.roles),
                        avatar,
                    });
                } else {
                    removeToken();
                }
            })
            .catch(() => removeToken())
            .finally(() => setIsLoading(false));
    }, []);

    // ── Login ─────────────────────────────────────────────────────────────────
    const login = async (username: string, password: string): Promise<'admin' | 'user' | null> => {
        try {
            const res = await authApi.login({ username, password });
            const { token, authenticated } = res.result;

            if (!authenticated || !token) return null;

            setToken(token);

            const infoRes = await authApi.getMyInfo();
            const u = infoRes.result;
            const role = extractRole(u.roles);
            // Fetch avatar từ user service
            const avatar = await fetchAvatarUrl();
            setUser({
                id: u.id,
                username: u.username,
                firstName: u.firstName,
                lastName: u.lastName,
                name: `${u.firstName} ${u.lastName}`,
                role,
                avatar,
            });

            return role;
        } catch (error) {
            if (error instanceof ApiError && error.httpStatus === 429) {
                throw error;
            }
            return null;
        }
    };

    // ── Login with Token (for Google OAuth) ──────────────────────────────────
    const loginWithToken = async (token: string): Promise<'admin' | 'user' | null> => {
        try {
            setToken(token);

            const infoRes = await authApi.getMyInfo();
            const u = infoRes.result;
            const role = extractRole(u.roles);
            // Fetch avatar từ user service
            const avatar = await fetchAvatarUrl();
            setUser({
                id: u.id,
                username: u.username,
                firstName: u.firstName,
                lastName: u.lastName,
                name: `${u.firstName} ${u.lastName}`,
                role,
                avatar,
            });

            return role;
        } catch {
            removeToken();
            return null;
        }
    };

    // ── Register ──────────────────────────────────────────────────────────────
    const register = async (data: {
        username: string;
        password: string;
        firstName: string;
        lastName: string;
        birthDate: string;
    }): Promise<boolean> => {
        try {
            await authApi.register(data);
            // Auto-login after register
            const role = await login(data.username, data.password);
            return role !== null;
        } catch {
            return false;
        }
    };

    // ── Logout ────────────────────────────────────────────────────────────────
    const logout = async (): Promise<void> => {
        const token = getToken();
        if (token) {
            try {
                await authApi.logout({ token });
            } catch {
                // ignore logout errors
            }
        }
        removeToken();
        setUser(null);
    };

    // ── Update local user state ───────────────────────────────────────────────
    const updateUser = (
        data: Partial<Pick<User, 'name' | 'email' | 'avatar' | 'firstName' | 'lastName'>>
    ) => {
        setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, ...data };
            // Sync name if firstName/lastName changed
            if (data.firstName || data.lastName) {
                updated.name = `${data.firstName ?? prev.firstName} ${data.lastName ?? prev.lastName}`;
            }
            return updated;
        });
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                loginWithToken,
                logout,
                register,
                updateUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

// ─── Hook tiện ích: logout + redirect ────────────────────────────────────────
export function useLogout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    return async () => {
        await logout();
        toast.success('Đã đăng xuất thành công');
        navigate('/');
    };
}
