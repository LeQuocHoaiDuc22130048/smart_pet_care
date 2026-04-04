import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-gradient-to-br from-[#448B3D]/10 via-background to-[#FFB86F]/10 flex items-center justify-center px-4'>
            <div className='text-center'>
                <div className='mb-8'>
                    <h1 className='text-9xl font-bold text-[#448B3D] mb-4'>404</h1>
                    <h2 className='text-3xl font-bold text-foreground mb-4'>Không tìm thấy trang</h2>
                    <p className='text-lg text-muted-foreground max-w-md mx-auto'>
                        Ôi! Trang bạn đang tìm kiếm có vẻ đã đi lạc như một chú cún tò mò.
                    </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <Button
                        size='lg'
                        onClick={() => navigate('/')}
                        className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                    >
                        <Home className='w-5 h-5 mr-2' />
                        Về trang chủ
                    </Button>
                    <Button
                        size='lg'
                        variant='outline'
                        onClick={() => navigate('/products')}
                        className='rounded-xl border-2'
                    >
                        <Search className='w-5 h-5 mr-2' />
                        Xem sản phẩm
                    </Button>
                </div>

                <div className='mt-12'>
                    <div className='w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#448B3D]/20 to-[#FFB86F]/20 flex items-center justify-center'>
                        <span className='text-6xl'>🐾</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
