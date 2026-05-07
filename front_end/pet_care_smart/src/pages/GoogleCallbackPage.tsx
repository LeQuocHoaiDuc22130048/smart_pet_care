import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Google OAuth callback page.
 * Handles the hash fragment returned by Google's implicit flow
 * (response_type=token id_token) and forwards the id_token to the opener window.
 */
const GoogleCallbackPage = () => {
    useEffect(() => {
        const sendToOpener = (msg: object) => {
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage(msg, window.location.origin);
            }
            // Small delay so the message is delivered before the window closes
            setTimeout(() => window.close(), 300);
        };

        // ── Check for error in query string (some OAuth errors come as ?error=...) ──
        const searchParams = new URLSearchParams(window.location.search);
        const queryError = searchParams.get('error');
        if (queryError) {
            sendToOpener({ type: 'GOOGLE_AUTH_ERROR', error: queryError });
            return;
        }

        // ── Parse hash fragment (#id_token=...&access_token=...&...) ──
        const hash = window.location.hash.startsWith('#')
            ? window.location.hash.substring(1)
            : window.location.hash;

        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        const hashError = params.get('error');

        if (hashError) {
            sendToOpener({ type: 'GOOGLE_AUTH_ERROR', error: hashError });
            return;
        }

        if (idToken) {
            sendToOpener({ type: 'GOOGLE_AUTH_SUCCESS', idToken });
            return;
        }

        // ── No token and no error — likely a direct navigation, redirect home ──
        if (!window.opener) {
            window.location.replace('/');
            return;
        }

        sendToOpener({
            type: 'GOOGLE_AUTH_ERROR',
            error: 'No ID token received from Google',
        });
    }, []);

    return (
        <div className='min-h-screen bg-background flex items-center justify-center'>
            <div className='text-center'>
                <Loader2 className='w-10 h-10 animate-spin text-[#448B3D] mx-auto mb-4' />
                <p className='text-muted-foreground'>Đang xử lý đăng nhập Google...</p>
            </div>
        </div>
    );
};

export default GoogleCallbackPage;
