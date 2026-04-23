import { useCallback } from 'react';
import { authApi } from '@/lib/authApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function useGoogleLogin() {
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = useCallback(async () => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const redirectUri = import.meta.env.VITE_GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/google/callback';

        if (!clientId) {
            toast.error('Google Client ID chưa được cấu hình');
            return;
        }

        // Use OAuth 2.0 popup flow instead of One Tap to avoid FedCM issues
        const scope = 'openid email profile';
        const responseType = 'id_token';
        const nonce = Math.random().toString(36).substring(2);
        
        // Build OAuth URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', responseType);
        authUrl.searchParams.set('scope', scope);
        authUrl.searchParams.set('nonce', nonce);
        authUrl.searchParams.set('prompt', 'select_account');

        // Open popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
            authUrl.toString(),
            'Google Sign In',
            `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
        );

        if (!popup) {
            toast.error('Popup bị chặn. Vui lòng cho phép popup cho trang này.');
            return;
        }

        // Listen for callback
        return new Promise<void>((resolve, reject) => {
            let timeoutId: NodeJS.Timeout;
            
            const cleanup = () => {
                window.removeEventListener('message', handleMessage);
                if (timeoutId) clearTimeout(timeoutId);
            };

            const handleMessage = async (event: MessageEvent) => {
                // Verify origin
                if (event.origin !== window.location.origin) {
                    return;
                }

                if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
                    cleanup();
                    
                    try {
                        const idToken = event.data.idToken;
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
                } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
                    cleanup();
                    toast.error('Đăng nhập Google thất bại');
                    reject(new Error(event.data.error));
                }
            };

            window.addEventListener('message', handleMessage);

            // Set timeout for popup (2 minutes)
            timeoutId = setTimeout(() => {
                cleanup();
                toast.error('Đăng nhập Google hết thời gian chờ');
                reject(new Error('Timeout'));
            }, 120000); // 2 minutes
        });
    }, [loginWithToken, navigate]);

    return { handleGoogleLogin };
}
