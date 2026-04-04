import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// ─── Tài khoản test ───────────────────────────────────────────────────────────
// 👤 User:  user@petcare.vn  / 123456
// 🔑 Admin: admin@petcare.vn / 123456
// ─────────────────────────────────────────────────────────────────────────────

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            const success = login(email, password);
            if (success) {
                toast.success('Đăng nhập thành công!');
                // Redirect dựa theo role
                const isAdmin = email === 'admin@petcare.vn';
                navigate(isAdmin ? '/admin' : '/dashboard');
            } else {
                toast.error('Email hoặc mật khẩu không đúng');
            }
            setLoading(false);
        }, 800);
    };

    const quickLogin = (role: 'user' | 'admin') => {
        const creds = {
            user: { email: 'user@petcare.vn', password: '123456' },
            admin: { email: 'admin@petcare.vn', password: '123456' }
        };
        setEmail(creds[role].email);
        setPassword(creds[role].password);
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

                {/* Quick login buttons for testing */}
                <div className='mb-6 p-4 rounded-xl bg-muted/50 border border-border'>
                    <p className='text-xs text-muted-foreground mb-3 font-medium'>🧪 Đăng nhập nhanh để test:</p>
                    <div className='grid grid-cols-2 gap-2'>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => quickLogin('user')}
                            className='rounded-lg text-xs'
                        >
                            👤 Người dùng
                        </Button>
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() => quickLogin('admin')}
                            className='rounded-lg text-xs'
                        >
                            🔑 Quản trị viên
                        </Button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                        <Label>Địa chỉ Email</Label>
                        <div className='relative mt-1'>
                            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='email'
                                placeholder='ban@example.com'
                                className='pl-10 rounded-xl'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
