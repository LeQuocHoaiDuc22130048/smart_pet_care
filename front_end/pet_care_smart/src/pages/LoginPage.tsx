import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    return (
        <div className='min-h-screen bg-gradient-to-br from-[#5B9FD8]/10 via-background to-[#FFB86F]/10 flex items-center justify-center py-12 px-4'>
            <Card className='w-full max-w-md p-8 rounded-2xl'>
                <div className='text-center mb-8'>
                    <div className='w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center'>
                        <img
                            src='../../public/image-removebg-preview.png'
                            alt='PetCare Logo'
                        />
                    </div>
                    <h1 className='text-3xl font-bold text-foreground mb-2'>
                        Welcome Back
                    </h1>
                    <p className='text-muted-foreground'>
                        Sign in to your PetCare account
                    </p>
                </div>

                <form className='space-y-6'>
                    <div>
                        <Label>Email Address</Label>
                        <div className='relative mt-1'>
                            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='email'
                                placeholder='you@example.com'
                                className='pl-10 rounded-xl'
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Password</Label>
                        <div className='relative mt-1'>
                            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='password'
                                placeholder='••••••••'
                                className='pl-10 rounded-xl'
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type='submit'
                        size='lg'
                        className='w-full rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                    >
                        {loading ? (
                            <>
                                <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-muted-foreground'>
                        Don't have an account?{' '}
                        <Link
                            to='/register'
                            className='text-[#5B9FD8] font-semibold hover:underline'
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
