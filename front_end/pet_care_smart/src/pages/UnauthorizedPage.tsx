import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UnauthorizedPage = () => {
    const navigate = useNavigate();
    return (
        <div className='min-h-screen bg-gradient-to-br from-danger/10 via-background to-warning/10 flex items-center justify-center px-4'>
            <div className='text-center max-w-2xl'>
                <div className='mb-8'>
                    {/* Icon */}
                    <div className='mb-6 relative mx-auto w-fit'>
                        <div className='absolute inset-0 bg-gradient-to-br from-danger/20 via-warning/20 to-danger/20 rounded-full blur-3xl'></div>
                        <div className='relative bg-gradient-to-br from-danger/10 to-warning/10 rounded-full p-8'>
                            <ShieldAlert
                                className='w-16 h-16 text-danger'
                                strokeWidth={1.5}
                            />
                        </div>
                    </div>

                    <h1 className='text-6xl font-bold text-danger mb-4'>403</h1>
                    <h2 className='text-3xl font-bold text-foreground mb-4'>
                        Access Denied
                    </h2>
                    <p className='text-lg text-muted-foreground max-w-md mx-auto'>
                        You don't have permission to access this page. Please
                        log in with the appropriate credentials or contact
                        support.
                    </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    <Button
                        size='lg'
                        onClick={() => navigate('/')}
                        className='rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground px-8'
                    >
                        <Home className='w-5 h-5 mr-2' />
                        Go Home
                    </Button>
                    <Button
                        size='lg'
                        variant='outline'
                        onClick={() => navigate('/login')}
                        className='rounded-xl border-2 px-8'
                    >
                        <LogIn className='w-5 h-5 mr-2' />
                        Log In
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
