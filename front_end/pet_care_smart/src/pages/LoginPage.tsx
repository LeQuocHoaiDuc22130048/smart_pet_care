import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useGoogleLogin } from '@/hooks/useGoogleLogin';
import { Loader2, Lock, User as UserIcon, CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api';
import { motion } from 'motion/react';

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
        } catch (error) {
            if (error instanceof ApiError && error.httpStatus === 429) {
                toast.error(error.message);
            } else {
                toast.error('Không thể kết nối đến máy chủ');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setGoogleLoading(true);
        try {
            await handleGoogleLogin();
        } catch (err) {
            if (err instanceof Error && err.message !== 'Timeout') {
                console.error('Google sign-in error:', err.message);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <div className='h-screen w-full flex flex-col md:flex-row bg-background overflow-hidden'>
            {/* Left Column - Branding & Teaser (Desktop only) */}
            <div className='hidden md:flex md:w-1/2 h-full bg-gradient-to-br from-[#448B3D] via-[#357230] to-[#E59740] p-12 text-white flex-col justify-between relative overflow-hidden'>
                {/* Floating animated ambient circles */}
                <motion.div
                    className='absolute w-96 h-96 rounded-full bg-white/10 blur-3xl'
                    animate={{
                        x: [0, 80, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{ top: '-10%', left: '-10%' }}
                />
                <motion.div
                    className='absolute w-80 h-80 rounded-full bg-white/5 blur-3xl'
                    animate={{
                        x: [0, -60, 0],
                        y: [0, 70, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                    style={{ bottom: '-10%', right: '-5%' }}
                />

                {/* Header Logo */}
                <div className='flex items-center space-x-3 z-10'>
                    <Link to='/' className='flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md transition-all duration-300 border border-white/15'>
                        <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-white/95 p-1.5 shadow-sm'>
                            <img src='/image-removebg-preview.png' alt='PetCare Logo' className='object-contain w-full h-full' />
                        </div>
                        <div className='flex flex-col text-left'>
                            <span className='font-bold text-lg text-white leading-none'>PetCare</span>
                            <span className='text-[10px] text-white/80 mt-0.5'>Chăm sóc vật nuôi</span>
                        </div>
                    </Link>
                </div>

                {/* Core Slogan & Highlights */}
                <div className='my-auto space-y-8 z-10 max-w-lg'>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/20 mb-4 backdrop-blur-sm'>
                            <Sparkles className='w-3.5 h-3.5 text-yellow-300 fill-yellow-300' />
                            Giải pháp toàn diện cho thú cưng
                        </span>
                        <h1 className='text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm'>
                            Chăm sóc vật nuôi <br />
                            <span className='text-yellow-200'>chưa bao giờ dễ dàng</span> đến thế.
                        </h1>
                        <p className='text-white/95 text-lg mt-4 leading-relaxed font-medium'>
                            Chào mừng bà con trở lại với hệ thống y tế và chăm sóc thú cưng thông minh hàng đầu Việt Nam.
                        </p>
                    </motion.div>

                    <div className='space-y-4 pt-2'>
                        {[
                            { icon: <CheckCircle2 className='w-5 h-5 text-yellow-300 shrink-0' />, text: 'Dịch vụ bác sĩ thú y khám và chữa bệnh tại nhà cực kỳ tiện lợi.' },
                            { icon: <ShieldCheck className='w-5 h-5 text-yellow-300 shrink-0' />, text: 'Cửa hàng cung cấp thuốc, vắc-xin và thức ăn chính hãng 100%.' },
                            { icon: <Sparkles className='w-5 h-5 text-yellow-300 shrink-0' />, text: 'Trí tuệ nhân tạo AI hỗ trợ phân tích hình ảnh chẩn đoán bệnh.' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                                className='flex items-start space-x-3 text-white/90'
                            >
                                {item.icon}
                                <span className='text-base font-medium'>{item.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Footer and Trust Statistics */}
                <div className='z-10 bg-white/10 backdrop-blur-lg border border-white/15 p-5 rounded-2xl'>
                    <div className='grid grid-cols-2 gap-6 text-center divide-x divide-white/15'>
                        <div>
                            <div className='text-3xl font-black text-white'>10.000+</div>
                            <div className='text-xs text-white/80 mt-1 font-medium'>Thú cưng được chăm sóc</div>
                        </div>
                        <div>
                            <div className='text-3xl font-black text-white'>99%</div>
                            <div className='text-xs text-white/80 mt-1 font-medium'>Đánh giá hài lòng tuyệt đối</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Elegant Login Card Form */}
            <div className='w-full md:w-1/2 h-full flex items-center justify-center p-4 sm:p-8 md:p-12 bg-muted/20 dark:bg-zinc-950 relative overflow-y-auto'>
                {/* Floating ambient shapes for mobile background */}
                <div className='absolute inset-0 block md:hidden bg-gradient-to-br from-[#448B3D]/5 via-background to-[#FFB86F]/5 z-0' />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className='w-full max-w-md z-10 my-auto'
                >
                    {/* Brand header for mobile */}
                    <div className='text-center md:hidden mb-6'>
                        <div className='w-14 h-14 mx-auto mb-2 rounded-2xl bg-white dark:bg-zinc-900 flex items-center justify-center p-2 shadow-md border border-border'>
                            <img src='/image-removebg-preview.png' alt='PetCare Logo' className='object-contain w-full h-full' />
                        </div>
                        <h2 className='text-xl font-black text-[#448B3D] tracking-tight'>PetCareSmart</h2>
                        <p className='text-[10px] text-muted-foreground mt-0.5'>Chăm sóc vật nuôi toàn diện</p>
                    </div>

                    <Card className='p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-2xl dark:shadow-zinc-950/50 backdrop-blur-sm'>
                        <div className='text-left mb-6'>
                            <h1 className='text-3xl font-black text-foreground tracking-tight'>Đăng nhập</h1>
                            <p className='text-muted-foreground mt-1.5 text-sm'>Vui lòng nhập thông tin đăng nhập của bà con.</p>
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
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <div className='flex justify-between items-center'>
                                    <Label className='text-xs font-bold uppercase tracking-wider text-muted-foreground/90'>Mật khẩu</Label>
                                </div>
                                <div className='relative mt-1.5'>
                                    <Lock className='absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/80' />
                                    <Input
                                        type='password'
                                        placeholder='••••••••'
                                        className='pl-11 rounded-xl h-12 border border-border bg-muted/30 focus-visible:ring-2 focus-visible:ring-[#448B3D] focus-visible:border-transparent transition-all duration-300'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
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
                                    className='w-full rounded-xl bg-[#448B3D] hover:bg-[#357230] text-white font-bold h-12 shadow-lg hover:shadow-green-900/20 text-base mt-2 transition-all duration-300'
                                >
                                    {loading ? (
                                        <><Loader2 className='w-5 h-5 mr-2 animate-spin' />Đang đăng nhập...</>
                                    ) : (
                                        <>Đăng nhập <ArrowRight className='w-4 h-4 ml-2' /></>
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
                                <span className='px-4 bg-card text-muted-foreground font-bold tracking-wider'>Hoặc sử dụng</span>
                            </div>
                        </div>

                        {/* Google Sign In */}
                        <motion.div
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <Button
                                type='button'
                                variant='outline'
                                onClick={handleGoogleSignIn}
                                disabled={loading || googleLoading}
                                className='w-full rounded-xl border border-border hover:bg-muted/50 h-12 font-bold transition-all duration-300 flex items-center justify-center shadow-sm text-sm'
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
                                    'Đăng nhập với Google'
                                )}
                            </Button>
                        </motion.div>

                        <div className='mt-6 text-center'>
                            <p className='text-sm text-muted-foreground font-medium'>
                                Chưa có tài khoản?{' '}
                                <Link to='/register' className='text-[#448B3D] font-bold hover:underline transition-all duration-200'>
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
