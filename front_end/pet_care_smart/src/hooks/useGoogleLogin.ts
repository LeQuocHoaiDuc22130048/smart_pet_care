import { useCallback } from 'react';
import { authApi } from '@/lib/authApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// Extend Window type for Google Identity Services
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    prompt: (callback?: (notification: {
                        isNotDisplayed: () => boolean;
                        isSkippedMoment: () => boolean;
                        getNotDisplayedReason: () => string;
                    }) => void) => void;
                    renderButton: (element: HTMLElement, config: object) => void;
                    disableAutoSelect: () => void;
                };
            };
        };
    }
}

export function useGoogleLogin() {
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = useCallback(async () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
            toast.error('Google Client ID chưa được cấu hình');
            return;
        }

        if (!window.google?.accounts?.id) {
            toast.error('Google Sign-In chưa được tải. Vui lòng thử lại.');
            return;
        }

        return new Promise<void>((resolve, reject) => {
            window.google!.accounts.id.initialize({
                client_id: clientId,
                callback: async (response) => {
                    try {
                        const idToken = response.credential;

                        const res = await authApi.authenticateWithGoogle({ idToken });

                        if (res.result?.token) {
                            const role = await loginWithToken(res.result.token);
                            if (role !== null) {
                                toast.success('Đăng nhập Google thành công!');
                                navigate(role === 'admin' ? '/admin' : '/dashboard');
                                resolve();
                            } else {
                                toast.error('Không thể xác thực tài khoản');
                                reject(new Error('Login failed'));
                            }
                        } else {
                            toast.error('Đăng nhập thất bại');
                            reject(new Error('No token returned'));
                        }
                    } catch (err: any) {
                        console.error('Google login error:', err);
                        toast.error(err?.message || 'Đăng nhập Google thất bại');
                        reject(err);
                    }
                },
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            // Show One Tap popup
            window.google!.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    const reason = notification.getNotDisplayedReason();
                    console.warn('Google One Tap not displayed:', reason);
                    // Fallback: nếu One Tap không hiện, thử popup thông thường
                    toast.error('Không thể hiển thị Google Sign-In. Vui lòng thử lại.');
                    reject(new Error(reason));
                }
            });
        });
    }, [loginWithToken, navigate]);

    return { handleGoogleLogin };
}
