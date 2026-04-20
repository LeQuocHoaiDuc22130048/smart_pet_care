import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/lib/authApi';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const GoogleCallbackPage = () => {
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            // Google implicit flow trả về params trong URL fragment (#)
            const hash = window.location.hash.substring(1);
            const params = new URLSearchParams(hash);

            const idToken = params.get('id_token');
            const accessToken = params.get('access_token');
            const errorParam = params.get('error');

            if (errorParam) {
                setError(`Google OAuth error: ${errorParam}`);
                toast.error('Đăng nhập Google bị hủy');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            if (!idToken) {
                setError('Không nhận được ID token từ Google');
                toast.error('Đăng nhập Google thất bại');
                setTimeout(() => navigate('/login'), 2000);
                return;
            }

            try {
                // Gửi ID Token đến backend
                const response = await authApi.authenticateWithGoogle({
                    idToken,
                    accessToken: accessToken ?? undefined,
                });

                if (response.result?.token) {
                    const role = await loginWithToken(response.result.token);
                    if (role !== null) {
                        toast.success('Đăng nhập Google thành công!');
                        navigate(role === 'admin' ? '/admin' : '/dashboard');
                    } else {
                        setError('Không thể xác thực token');
                        toast.error('Đăng nhập thất bại');
                        setTimeout(() => navigate('/login'), 2000);
                    }
                } else {
                    setError('Backend không trả về token');
                    toast.error('Đăng nhập thất bại');
                    setTimeout(() => navigate('/login'), 2000);
                }
            } catch (err: any) {
                console.error('Google callback error:', err);
                setError(err?.message || 'Có lỗi xảy ra khi đăng nhập');
                toast.error('Đăng nhập Google thất bại');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        handleCallback();
    }, [navigate, loginWithToken]);

    return (
        <div className='min-h-screen bg-linear-to-br from-[#448B3D]/10 via-background to-[#FFB86F]/10 flex items-center justify-center'>
            <div className='text-center'>
                {error ? (
                    <>
                        <div className='w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center'>
                            <span className='text-3xl'>❌</span>
                        </div>
                        <h2 className='text-xl font-bold text-foreground mb-2'>Đăng nhập thất bại</h2>
                        <p className='text-muted-foreground'>{error}</p>
                        <p className='text-sm text-muted-foreground mt-2'>Đang chuyển hướng về trang đăng nhập...</p>
                    </>
                ) : (
                    <>
                        <Loader2 className='w-16 h-16 mx-auto mb-4 animate-spin text-[#448B3D]' />
                        <h2 className='text-xl font-bold text-foreground mb-2'>Đang xử lý đăng nhập Google</h2>
                        <p className='text-muted-foreground'>Vui lòng đợi...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default GoogleCallbackPage;
