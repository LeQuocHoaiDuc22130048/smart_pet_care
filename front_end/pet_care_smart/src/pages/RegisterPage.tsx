import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { Loader2, Lock, User as UserIcon, CalendarDays, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, isAuthenticated, user } = useAuth();
    const { handleGoogleLogin } = useGoogleLogin();
    const [form, setForm] = useState({
        username: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password.length < 8) {
            toast.error('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        setLoading(true);
        try {
            const success = await register(form);
            if (success) {
                toast.success(`Chào mừng ${form.firstName}! Tài khoản đã được tạo thành công.`);
                navigate('/dashboard');
            } else {
                toast.error('Đăng ký thất bại. Tên đăng nhập có thể đã tồn tại.');
            }
        } catch {
            toast.error('Không thể kết nối đến máy chủ');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = async () => {
        setGoogleLoading(true);
        try {
            await handleGoogleLogin();
        } catch {
            // error already handled in hook
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className='min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 sm:p-6 md:p-8 relative'>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className='w-full max-w-md z-10'
            >
                {/* Brand header */}
                <div className='text-center mb-6'>
                    <Link to='/' className='inline-flex items-center space-x-2.5 hover:opacity-90 transition-opacity'>
                        <div className='w-12 h-12 rounded-xl bg-card flex items-center justify-center p-2 shadow-md border border-border'>
                            <img src='/image-removebg-preview.png' alt='PetCare Logo' className='object-contain w-full h-full' />
                        </div>
                        <div className='flex flex-col text-left'>
                            <span className='font-bold text-xl text-foreground leading-none tracking-tight'>PetCare</span>
                            <span className='text-[10px] text-muted-foreground mt-0.5 font-medium'>Chăm sóc vật nuôi thông minh</span>
                        </div>
                    </Link>
                </div>

                <Card className='p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-2xl dark:shadow-zinc-950/50 backdrop-blur-sm'>
                    <div className='text-left mb-6'>
                        <h1 className='text-2xl font-bold text-foreground tracking-tight'>Đăng ký</h1>
                        <p className='text-muted-foreground mt-1.5 text-sm'>Vui lòng nhập thông tin của bà con để mở tài khoản.</p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground/90'>Tên đăng nhập</Label>
                            <div className='relative mt-1.5'>
                                <UserIcon className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/80' />
                                <Input
                                    type='text'
                                    placeholder='username'
                                    className='pl-11 rounded-xl h-12 border border-border bg-muted/30 focus-visible:ring-2 focus-visible:ring-[#448B3D] focus-visible:border-transparent transition-all duration-300'
                                    value={form.username}
                                    onChange={set('username')}
                                    required
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground/90'>Họ</Label>
                                <Input
                                    type='text'
                                    placeholder='Nguyễn'
                                    className='mt-1.5 rounded-xl h-12 border border-border bg-muted/30 focus-visible:ring-2 focus-visible:ring-[#448B3D] focus-visible:border-transparent transition-all duration-300'
                                    value={form.firstName}
                                    onChange={set('firstName')}
                                    required
                                />
                            </div>
                            <div>
                                <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground/90'>Tên</Label>
                                <Input
                                    type='text'
                                    placeholder='Văn A'
                                    className='mt-1.5 rounded-xl h-12 border border-border bg-muted/30 focus-visible:ring-2 focus-visible:ring-[#448B3D] focus-visible:border-transparent transition-all duration-300'
                                    value={form.lastName}
                                    onChange={set('lastName')}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground/90'>Ngày sinh</Label>
                            <div className='relative mt-1.5'>
                                <CalendarDays className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/80' />
                                <Input
                                    type='date'
                                    className='pl-11 rounded-xl h-12 border border-border bg-muted/30 focus-visible:ring-2 focus-visible:ring-[#448B3D] focus-visible:border-transparent transition-all duration-300'
                                    value={form.birthDate}
                                    onChange={set('birthDate')}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground/90'>Mật khẩu</Label>
                            <div className='relative mt-1.5'>
                                <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/80' />
                                <Input
                                    type='password'
                                    placeholder='••••••••'
                                    className='pl-11 rounded-xl h-12 border border-border bg-muted/30 focus-visible:ring-2 focus-visible:ring-[#448B3D] focus-visible:border-transparent transition-all duration-300'
                                    value={form.password}
                                    onChange={set('password')}
                                    required
                                    minLength={8}
                                />
                            </div>
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <Button
                                type='submit'
                                disabled={loading}
                                className='w-full rounded-xl bg-[#448B3D] hover:bg-[#357230] text-white font-bold h-12 shadow-lg hover:shadow-green-900/20 text-base mt-2 transition-all duration-300 cursor-pointer'
                            >
                                {loading ? (
                                    <><Loader2 className='w-5 h-5 mr-2 animate-spin' />Đang tạo tài khoản...</>
                                ) : (
                                    <>Tạo tài khoản <ArrowRight className='w-4 h-4 ml-2' /></>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    {/* Divider */}
                    <div className='relative my-6'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-border'></div>
                        </div>
                        <div className='relative flex justify-center text-xs uppercase'>
                            <span className='px-4 bg-card text-muted-foreground font-bold tracking-wider'>Hoặc đăng ký bằng</span>
                        </div>
                    </div>

                    {/* Google Sign Up */}
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Button
                            type='button'
                            variant='outline'
                            onClick={handleGoogleSignUp}
                            disabled={loading || googleLoading}
                            className='w-full rounded-xl border border-border hover:bg-muted/50 h-12 font-bold transition-all duration-300 flex items-center justify-center shadow-sm text-sm cursor-pointer'
                        >
                            <svg className='w-5 h-5 mr-2.5 shrink-0' viewBox='0 0 24 24'>
                                <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                                <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                                <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                                <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                            </svg>
                            {googleLoading ? (
                                <><Loader2 className='w-4 h-4 mr-2 animate-spin' />Đang xử lý...</>
                            ) : (
                                'Đăng ký với Google'
                            )}
                        </Button>
                    </motion.div>

                    <div className='mt-6 text-center'>
                        <p className='text-sm text-muted-foreground font-medium'>
                            Đã có tài khoản?{' '}
                            <Link to='/login' className='text-[#448B3D] font-bold hover:underline transition-all duration-200'>
                                Đăng nhập
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
