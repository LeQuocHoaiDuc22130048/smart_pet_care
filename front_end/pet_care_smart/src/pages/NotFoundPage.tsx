import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className='min-h-screen bg-gradient-to-br from-[#5B9FD8]/10 via-background to-[#FFB86F]/10 flex items-center justify-center px-4'>
            <div className='text-center'>
                <div className='mb-8'>
                    <h1 className='text-9xl font-bold text-[#5B9FD8] mb-4'>
                        404
                    </h1>
                    <h2 className='text-3xl font-bold text-foreground mb-4'>
                        Page Not Found
                    </h2>
                    <p className='text-lg text-muted-foreground max-w-md mx-auto'>
                        Oops! The page you're looking for seems to have wandered
                        off like a curious puppy.
                    </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <Button
                        size='lg'
                        onClick={() => navigate('/')}
                        className='rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                    >
                        <Home className='w-5 h-5 mr-2' />
                        Go Home
                    </Button>
                    <Button
                        size='lg'
                        variant='outline'
                        onClick={() => navigate('/products')}
                        className='rounded-xl border-2'
                    >
                        <Search className='w-5 h-5 mr-2' />
                        Browse Products
                    </Button>
                </div>

                <div className='mt-12'>
                    <div className='w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#5B9FD8]/20 to-[#FFB86F]/20 flex items-center justify-center'>
                        <span className='text-6xl'>🐾</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
