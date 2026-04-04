import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock, Mail, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }
        setLoading(true);

        // Simulate register → auto login as mock user
        setTimeout(() => {
            // Thử login với mock accounts trước, nếu không khớp thì dùng user mock
            const success = login(email, password);
            if (!success) {
                // Đăng ký thành công → tự động đăng nhập với tài khoản user mock
                login('user@petcare.vn', '123456');
            }
            toast.success(`Chào mừng ${name}! Tài khoản đã được tạo thành công.`);
            navigate('/dashboard');
            setLoading(false);
        }, 1000);
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-[#448B3D]/10 via-background to-[#FFB86F]/10 flex items-center justify-center py-12 px-4'>
            <Card className='w-full max-w-md p-8 rounded-2xl'>
                <div className='text-center mb-8'>
                    <div className='w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center'>
                        <img src='/image-removebg-preview.png' alt='PetCare Logo' />
                    </div>
                    <h1 className='text-3xl font-bold text-foreground mb-2'>Tạo tài khoản</h1>
                    <p className='text-muted-foreground'>Tham gia PetCare ngay hôm nay</p>
                </div>

                <form onSubmit={handleSubmit} className='space-y-5'>
                    <div>
                        <Label>Họ và tên</Label>
                        <div className='relative mt-1'>
                            <UserIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='text'
                                placeholder='Nguyễn Văn A'
                                className='pl-10 rounded-xl'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>

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
                                minLength={6}
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
                            <><Loader2 className='w-5 h-5 mr-2 animate-spin' />Đang tạo tài khoản...</>
                        ) : 'Tạo tài khoản'}
                    </Button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-muted-foreground'>
                        Đã có tài khoản?{' '}
                        <Link to='/login' className='text-[#448B3D] font-semibold hover:underline'>
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
