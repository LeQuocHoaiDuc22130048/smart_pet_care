import { createContext, useContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    avatar?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
}

// ─── Mock accounts ────────────────────────────────────────────────────────────
const MOCK_USERS: (User & { password: string })[] = [
    {
        id: '1',
        name: 'Nguyễn Văn An',
        email: 'user@petcare.vn',
        password: '123456',
        role: 'user',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
    },
    {
        id: '2',
        name: 'Admin PetCare',
        email: 'admin@petcare.vn',
        password: '123456',
        role: 'admin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
    }
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = (email: string, password: string): boolean => {
        const found = MOCK_USERS.find(
            (u) => u.email === email && u.password === password
        );
        if (found) {
            const { password: _, ...userData } = found;
            setUser(userData);
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated: !!user, login, logout }}
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

// ─── Hook tiện ích: logout + redirect ─────────────────────────────────────────
export function useLogout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    return () => {
        logout();
        toast.success('Đã đăng xuất thành công');
        navigate('/');
    };
}
