import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    // Badge,
    Menu,
    Search,
    ShoppingCart,
    Sparkles,
    X
} from 'lucide-react';
import { Button } from './ui/button';

const PublicNavbar = () => {
    const navigate = useNavigate();
    // const { cartCount } = useCart();
    // const { isAuthenticated, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Products', path: '/products' },
        {
            name: 'AI Search',
            path: '/image-search',
            icon: <Sparkles className='w-4 h-4' />
        },
        { name: 'Booking', path: '/booking' }
    ];
    return (
        <header className='sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border shadow-sm'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    {/* Logo */}
                    <Link to='/' className='flex items-center space-x-2 group'>
                        <div className='w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform'>
                            <span className='text-white font-bold text-xl'>
                                <img
                                    src='../../public/image-removebg-preview.png'
                                    alt='Logo'
                                />
                            </span>
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-bold text-lg text-foreground'>
                                PetCareSmart
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className='hidden md:flex items-center space-x-1'>
                        {navLinks.map((link) => (
                            <Button
                                key={link.path}
                                variant='ghost'
                                onClick={() => navigate(link.path)}
                                className='text-sm font-medium text-foreground hover:text-[#5B9FD8] hover:bg-[#5B9FD8]/10 transition-colors rounded-xl'
                            >
                                {link.icon && (
                                    <span className='mr-1'>{link.icon}</span>
                                )}
                                {link.name}
                            </Button>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className='flex items-center space-x-2'>
                        <Button
                            variant='ghost'
                            size='icon'
                            className='rounded-xl hover:bg-[#5B9FD8]/10'
                            onClick={() => navigate('/products')}
                        >
                            <Search className='w-5 h-5' />
                        </Button>

                        <Button
                            variant='ghost'
                            size='icon'
                            className='rounded-xl hover:bg-[#5B9FD8]/10 relative'
                            onClick={() => navigate('/cart')}
                        >
                            <ShoppingCart className='w-5 h-5' />
                            {/* {cartCount > 0 && (
                                <Badge className='absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#FFB86F] text-xs border-2 border-white'>
                                    {cartCount}
                                </Badge>
                            )} */}
                        </Button>

                        {/* {isAuthenticated ? (
                            <Button
                                variant='ghost'
                                size='icon'
                                className='rounded-xl hover:bg-[#5B9FD8]/10'
                                onClick={() =>
                                    navigate(
                                        user?.role === 'admin'
                                            ? '/admin'
                                            : '/dashboard'
                                    )
                                }
                            >
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className='w-8 h-8 rounded-full'
                                    />
                                ) : (
                                    <User className='w-5 h-5' />
                                )}
                            </Button>
                        ) : (
                            <Button
                                onClick={() => navigate('/login')}
                                className='hidden md:inline-flex rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                            >
                                Sign In
                            </Button>
                        )} */}
                        <Button
                            onClick={() => navigate('/login')}
                            className='hidden md:inline-flex rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                        >
                            Sign In
                        </Button>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant='ghost'
                            size='icon'
                            className='md:hidden rounded-xl'
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className='w-6 h-6' />
                            ) : (
                                <Menu className='w-6 h-6' />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className='md:hidden py-4 border-t border-border'>
                        <nav className='flex flex-col space-y-2'>
                            {navLinks.map((link) => (
                                <Button
                                    key={link.path}
                                    variant='ghost'
                                    onClick={() => {
                                        navigate(link.path);
                                        setMobileMenuOpen(false);
                                    }}
                                    className='justify-start text-sm font-medium rounded-xl'
                                >
                                    {link.icon && (
                                        <span className='mr-2'>
                                            {link.icon}
                                        </span>
                                    )}
                                    {link.name}
                                </Button>
                            ))}
                            {/* {!isAuthenticated && (
                                <Button
                                    onClick={() => {
                                        navigate('/login');
                                        setMobileMenuOpen(false);
                                    }}
                                    className='rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                                >
                                    Sign In
                                </Button>
                            )} */}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default PublicNavbar;
