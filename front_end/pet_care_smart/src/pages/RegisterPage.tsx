import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { Loader2, Lock, User as UserIcon, CalendarDays } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [form, setForm] = useState({
        username: '',
        firstName: '',
        lastName: '',
        birthDate: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

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

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div>
                        <Label>Tên đăng nhập</Label>
                        <div className='relative mt-1'>
                            <UserIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='text'
                                placeholder='username'
                                className='pl-10 rounded-xl'
                                value={form.username}
                                onChange={set('username')}
                                required
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-2 gap-3'>
                        <div>
                            <Label>Họ</Label>
                            <Input
                                type='text'
                                placeholder='Nguyễn'
                                className='mt-1 rounded-xl'
                                value={form.firstName}
                                onChange={set('firstName')}
                                required
                            />
                        </div>
                        <div>
                            <Label>Tên</Label>
                            <Input
                                type='text'
                                placeholder='Văn A'
                                className='mt-1 rounded-xl'
                                value={form.lastName}
                                onChange={set('lastName')}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Ngày sinh</Label>
                        <div className='relative mt-1'>
                            <CalendarDays className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='date'
                                className='pl-10 rounded-xl'
                                value={form.birthDate}
                                onChange={set('birthDate')}
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
                                value={form.password}
                                onChange={set('password')}
                                required
                                minLength={8}
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
