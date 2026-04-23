import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const GoogleCallbackPage = () => {
    useEffect(() => {
        // Parse hash fragment for id_token
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get('id_token');
        const error = params.get('error');

        if (error) {
            // Send error to parent window
            window.opener?.postMessage(
                { type: 'GOOGLE_AUTH_ERROR', error },
                window.location.origin
            );
            window.close();
            return;
        }

        if (idToken) {
            // Send token to parent window
            window.opener?.postMessage(
                { type: 'GOOGLE_AUTH_SUCCESS', idToken },
                window.location.origin
            );
            window.close();
        } else {
            // No token found
            window.opener?.postMessage(
                { type: 'GOOGLE_AUTH_ERROR', error: 'No ID token received' },
                window.location.origin
            );
            window.close();
        }
    }, []);

    return (
        <div className='min-h-screen bg-background flex items-center justify-center'>
            <div className='text-center'>
                <Loader2 className='w-10 h-10 animate-spin text-[#448B3D] mx-auto mb-4' />
                <p className='text-muted-foreground'>Đang xử lý đăng nhập...</p>
            </div>
        </div>
    );
};

export default GoogleCallbackPage;
