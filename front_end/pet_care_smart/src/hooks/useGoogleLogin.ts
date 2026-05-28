import { useCallback } from 'react';
import { authApi } from '@/lib/authApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

// ─── Google Identity Services type declarations ───────────────────────────────
interface CredentialResponse {
    credential: string;
    select_by: string;
    client_id: string;
}

interface PromptMomentNotification {
    isDisplayMoment(): boolean;
    isDisplayed(): boolean;
    isNotDisplayed(): boolean;
    getNotDisplayedReason(): string;
    isSkippedMoment(): boolean;
    getSkippedReason(): string;
    isDismissedMoment(): boolean;
    getDismissedReason(): string;
    getMomentType(): string;
}

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize(config: {
                        client_id: string;
                        callback: (response: CredentialResponse) => void;
                        use_fedcm_for_prompt?: boolean;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }): void;
                    prompt(momentListener?: (notification: PromptMomentNotification) => void): void;
                    renderButton(parent: HTMLElement, options: object): void;
                    disableAutoSelect(): void;
                    revoke(hint: string, done: () => void): void;
                };
            };
        };
    }
}

export function useGoogleLogin() {
    const { loginWithToken } = useAuth();
    const navigate = useNavigate();

    const handleGoogleLogin = useCallback((): Promise<void> => {
        return new Promise((resolve, reject) => {
            const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

            if (!clientId) {
                toast.error('Google Client ID chưa được cấu hình');
                reject(new Error('Missing VITE_GOOGLE_CLIENT_ID'));
                return;
            }

            if (!window.google?.accounts?.id) {
                toast.error('Google Sign-In chưa sẵn sàng. Vui lòng thử lại.');
                reject(new Error('Google Identity Services not loaded'));
                return;
            }

            const handleCredential = async (response: CredentialResponse) => {
                if (!response.credential) {
                    toast.error('Không nhận được thông tin xác thực từ Google');
                    reject(new Error('No credential in Google response'));
                    return;
                }
                try {
                    const res = await authApi.authenticateWithGoogle({ idToken: response.credential });
                    if (res.result?.token) {
                        const role = await loginWithToken(res.result.token);
                        if (role !== null) {
                            toast.success('Đăng nhập Google thành công!');
                            navigate(role === 'admin' ? '/admin' : '/dashboard');
                            resolve();
                        } else {
                            toast.error('Không thể xác thực tài khoản');
                            reject(new Error('loginWithToken returned null'));
                        }
                    } else {
                        toast.error('Đăng nhập thất bại — không nhận được token');
                        reject(new Error('No token returned from backend'));
                    }
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Đăng nhập Google thất bại';
                    console.error('Google login error:', err);
                    toast.error(message);
                    reject(err);
                }
            };

            // Initialize with use_fedcm_for_prompt: true to opt-in to FedCM
            // and suppress the deprecation warning
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: handleCredential,
                use_fedcm_for_prompt: true,
                auto_select: false,
                cancel_on_tap_outside: true,
            });

            window.google.accounts.id.prompt((notification) => {
                const type = notification.getMomentType();

                if (notification.isNotDisplayed()) {
                    const reason = notification.getNotDisplayedReason();
                    log(`One Tap not displayed (${reason}), falling back to popup`);
                    // Fall back to popup for any suppression reason
                    openPopupFallback(clientId, loginWithToken, navigate, resolve, reject);

                } else if (notification.isSkippedMoment()) {
                    // User dismissed the prompt — not an error, just resolve
                    log(`One Tap skipped (${notification.getSkippedReason()})`);
                    resolve();

                } else if (notification.isDismissedMoment()) {
                    log(`One Tap dismissed (${notification.getDismissedReason()})`);
                    resolve();

                } else {
                    log(`One Tap moment: ${type}`);
                }
            });
        });
    }, [loginWithToken, navigate]);

    return { handleGoogleLogin };
}

function log(msg: string) {
    console.debug('[GoogleLogin]', msg);
}

// ─── Popup fallback ───────────────────────────────────────────────────────────
function openPopupFallback(
    clientId: string,
    loginWithToken: (token: string) => Promise<'admin' | 'user' | null>,
    navigate: ReturnType<typeof useNavigate>,
    resolve: () => void,
    reject: (err: unknown) => void,
) {
    const redirectUri =
        (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined) ||
        `${window.location.origin}/auth/google/callback`;

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'token id_token');
    authUrl.searchParams.set('scope', 'openid email profile');
    authUrl.searchParams.set('nonce', crypto.randomUUID());
    authUrl.searchParams.set('prompt', 'select_account');

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
        authUrl.toString(),
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`,
    );

    if (!popup) {
        toast.error('Popup bị chặn. Vui lòng cho phép popup cho trang này.');
        reject(new Error('Popup blocked'));
        return;
    }

    const cleanup = () => {
        window.removeEventListener('message', handleMessage);
        clearTimeout(timeoutId);
    };

    const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
            cleanup();
            try {
                const res = await authApi.authenticateWithGoogle({ idToken: event.data.idToken as string });
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
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : 'Đăng nhập Google thất bại';
                toast.error(message);
                reject(err);
            }
        } else if (event.data?.type === 'GOOGLE_AUTH_ERROR') {
            cleanup();
            toast.error('Đăng nhập Google thất bại');
            reject(new Error((event.data.error as string) ?? 'Unknown error'));
        }
    };

    window.addEventListener('message', handleMessage);

    const timeoutId = setTimeout(() => {
        cleanup();
        if (!popup.closed) popup.close();
        toast.error('Đăng nhập Google hết thời gian chờ');
        reject(new Error('Timeout'));
    }, 120_000);
}
