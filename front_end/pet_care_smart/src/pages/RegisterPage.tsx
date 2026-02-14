import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock, Mail, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
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
                        Create Account
                    </h1>
                    <p className='text-muted-foreground'>Join PetCare today</p>
                </div>

                <form className='space-y-6'>
                    <div>
                        <Label>Full Name</Label>
                        <div className='relative mt-1'>
                            <UserIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
                            <Input
                                type='text'
                                placeholder='John Doe'
                                className='pl-10 rounded-xl'
                                required
                            />
                        </div>
                    </div>

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
                                minLength={6}
                            />
                        </div>
                    </div>

                    <Button
                        type='submit'
                        size='lg'
                        disabled={loading}
                        className='w-full rounded-xl bg-[#FFB86F] hover:bg-[#FF9A3D] text-white'
                    >
                        {loading ? (
                            <>
                                <Loader2 className='w-5 h-5 mr-2 animate-spin' />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </Button>
                </form>

                <div className='mt-6 text-center'>
                    <p className='text-sm text-muted-foreground'>
                        Already have an account?{' '}
                        <Link
                            to='/login'
                            className='text-[#5B9FD8] font-semibold hover:underline'
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
