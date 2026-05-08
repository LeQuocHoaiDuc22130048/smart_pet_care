import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { Loader2, Lock, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();
    const { handleGoogleLogin } = useGoogleLogin();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const role = await login(username, password);
            if (role !== null) {
                toast.success('Đăng nhập thành công!');
                navigate(role === 'admin' ? '/admin' : '/dashboard');
            } else {
                toast.error('Tên đăng nhập hoặc mật khẩu không đúng');
            }
        } catch {
            toast.error('Không thể kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await handleGoogleLogin();
        } catch (err) {
            // Errors are already toasted inside the hook
            // Only log unexpected errors
            if (err instanceof Error && err.message !== 'Timeout') {
                console.error('Google sign-in error:', err.message);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-[#448B3D]/10 via-background to-[#FFB86F]/10 flex items-center justify-center py-12 px-4'>
            <Card className='w-full max-w-md p-8 rounded-2xl'>
                <div className='text-center mb-8'>
                    <div className='w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center'>
                        <img src='/image-removebg-preview.png' alt='PetCare Logo' />
                    </div>
                    <h1 className='text-3xl font-bold text-foreground mb-2'>Chào mừng trở lại</h1>
                    <p className='text-muted-foreground'>Đăng nhập vào tài khoản PetCare của bạn</p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                        <Label>Tên đăng nhập</Label>
                        <div className='relative mt-1'>
                            <UserIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='text'
                                placeholder='username'
                                className='pl-10 rounded-xl'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Mật khẩu</Label>
                        <div className='relative mt-1'>
                            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='password'
                                placeholder='••••••••'
                                className='pl-10 rounded-xl'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type='submit'
                        size='lg'
                        disabled={loading}
                        className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                    >
                        {loading ? (
                            <><Loader2 className='w-5 h-5 mr-2 animate-spin' />Đang đăng nhập...</>
                        ) : 'Đăng nhập'}
                    </Button>
                </form>

                <div className='relative my-6'>
                    <div className='absolute inset-0 flex items-center'>
                        <div className='w-full border-t border-border'></div>
                    </div>
                    <div className='relative flex justify-center text-sm'>
                        <span className='px-4 bg-card text-muted-foreground'>Hoặc</span>
                    </div>
                </div>

                <Button
                    type='button'
                    variant='outline'
                    size='lg'
                    onClick={handleGoogleSignIn}
                    disabled={loading || googleLoading}
                    className='w-full rounded-xl border-2 hover:bg-muted/50'
                >
                    <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                        <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                        <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                        <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                        <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                    </svg>
                    {googleLoading ? <><Loader2 className='w-4 h-4 mr-2 animate-spin' />Đang xử lý...</> : 'Đăng nhập với Google'}
                </Button>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-muted-foreground'>
                        Chưa có tài khoản?{' '}
                        <Link to='/register' className='text-[#448B3D] font-semibold hover:underline'>
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;