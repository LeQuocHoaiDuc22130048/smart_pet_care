import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Menu, ShoppingCart, X, User, LayoutDashboard, Shield, Phone } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/context/CartContext';
import { useAuth, useLogout } from '@/context/AuthContext';
import { Badge } from './ui/badge';
import ThemeToggle from './theme/ThemeToggle';
import { motion, AnimatePresence } from 'motion/react';

const PublicNavbar = () => {
    const navigate = useNavigate();
    const { cartCount } = useCart();
    const { user, isAuthenticated } = useAuth();
    const logout = useLogout();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const navLinks = [
        { name: 'Sản phẩm', path: '/products' },
        { name: 'Đặt lịch', path: '/booking' },
        { name: 'Tin tức', path: '/blog' },
        { name: 'Tìm theo ảnh', path: '/image-search' },
        { name: 'Liên hệ', path: '/lien-he' },
    ];

    return (
        <header className='sticky top-0 z-50 bg-card border-b-2 border-[#448B3D] shadow-md'>
            {/* Thanh thông tin trên cùng */}
            <div className='bg-[#448B3D] text-white py-1.5 px-4 text-center text-sm font-medium'>
                <span className='flex items-center justify-center gap-2'>
                    <Phone className='w-4 h-4' />
                    Gọi đặt hàng: <a href='tel:+84702500551' className='font-bold underline'>(+84) 702 500 551</a>
                    <span className='hidden sm:inline'>— Mở cửa 7:00 – 18:00 hàng ngày</span>
                </span>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    {/* Logo */}
                    <Link to='/' className='flex items-center space-x-3 group'>
                        <div className='w-12 h-12 rounded-lg flex items-center justify-center'>
                            <img src='/image-removebg-preview.png' alt='Logo PetCare' />
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-bold text-xl text-[#448B3D] leading-tight'>PetCare</span>
                            <span className='text-xs text-muted-foreground'>Chăm sóc vật nuôi</span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className='hidden md:flex items-center space-x-1'>
                        {navLinks.map((link) => (
                            <Button
                                key={link.path}
                                variant='ghost'
                                onClick={() => navigate(link.path)}
                                className='text-base font-semibold text-foreground hover:text-[#448B3D] hover:bg-[#448B3D]/10 rounded-lg px-4 h-11'
                            >
                                {link.name}
                            </Button>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className='flex items-center space-x-2'>
                        <ThemeToggle />

                        {/* Giỏ hàng - nút to, dễ thấy */}
                        <Button
                            variant='outline'
                            className='rounded-lg hover:bg-[#448B3D]/10 relative border-[#448B3D] h-11 px-3'
                            onClick={() => navigate('/cart')}
                            aria-label={`Giỏ hàng có ${cartCount} sản phẩm`}
                        >
                            <ShoppingCart className='w-5 h-5 text-[#448B3D]' />
                            {cartCount > 0 && (
                                <Badge className='absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-red-500 text-white text-xs border-2 border-card font-bold'>
                                    {cartCount}
                                </Badge>
                            )}
                            <span className='hidden sm:inline ml-2 text-sm font-semibold text-[#448B3D]'>Giỏ hàng</span>
                        </Button>

                        {/* Auth */}
                        {isAuthenticated && user ? (
                            <div className='relative hidden md:block'>
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className='flex items-center space-x-2 rounded-lg px-3 py-2 h-11 hover:bg-muted transition-colors border border-border'
                                >
                                    <div className='w-8 h-8 rounded-full bg-[#448B3D]/20 flex items-center justify-center overflow-hidden'>
                                        {user.avatar
                                            ? <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                                            : <User className='w-4 h-4 text-[#448B3D]' />
                                        }
                                    </div>
                                    <span className='text-sm font-semibold text-foreground max-w-[100px] truncate'>{user.name}</span>
                                    {user.role === 'admin' && (
                                        <Badge className='bg-[#448B3D] text-white text-xs px-1.5 py-0'>Admin</Badge>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.15 }}
                                            className='absolute right-0 top-full mt-2 w-52 bg-card border-2 border-border rounded-xl shadow-xl overflow-hidden z-50'
                                        >
                                            <div className='p-3 border-b border-border bg-[#448B3D]/5'>
                                                <p className='text-sm font-bold text-foreground'>{user.name}</p>
                                                <p className='text-xs text-muted-foreground'>{user.email}</p>
                                            </div>
                                            <div className='p-2'>
                                                <button
                                                    onClick={() => { navigate(user.role === 'admin' ? '/admin' : '/dashboard'); setUserMenuOpen(false); }}
                                                    className='w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-left'
                                                >
                                                    {user.role === 'admin'
                                                        ? <Shield className='w-4 h-4 text-[#448B3D]' />
                                                        : <LayoutDashboard className='w-4 h-4 text-[#448B3D]' />
                                                    }
                                                    <span>{user.role === 'admin' ? 'Quản trị viên' : 'Trang cá nhân'}</span>
                                                </button>
                                                <button
                                                    onClick={() => { logout(); setUserMenuOpen(false); }}
                                                    className='w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 text-red-600 transition-colors text-left'
                                                >
                                                    <span>Đăng xuất</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Button
                                onClick={() => navigate('/login')}
                                className='hidden md:inline-flex rounded-lg bg-[#448B3D] hover:bg-[#336B2D] text-white font-semibold h-11 px-5 text-base'
                            >
                                Đăng nhập
                            </Button>
                        )}

                        <Button
                            variant='ghost'
                            size='icon'
                            className='md:hidden rounded-lg w-11 h-11'
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label='Mở menu'
                        >
                            {mobileMenuOpen ? <X className='w-6 h-6' /> : <Menu className='w-6 h-6' />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className='md:hidden overflow-hidden border-t-2 border-[#448B3D]/20'
                        >
                            <nav className='flex flex-col gap-1 py-3'>
                                {isAuthenticated && user && (
                                    <div className='flex items-center gap-3 px-3 py-3 mb-1 bg-[#448B3D]/5 rounded-xl'>
                                        <div className='w-10 h-10 rounded-full bg-[#448B3D]/20 flex items-center justify-center overflow-hidden'>
                                            {user.avatar
                                                ? <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                                                : <User className='w-5 h-5 text-[#448B3D]' />
                                            }
                                        </div>
                                        <div>
                                            <p className='font-bold text-sm'>{user.name}</p>
                                            <p className='text-xs text-muted-foreground'>{user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</p>
                                        </div>
                                    </div>
                                )}
                                {navLinks.map((link) => (
                                    <Button
                                        key={link.path}
                                        variant='ghost'
                                        onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                                        className='justify-start text-base font-semibold rounded-lg h-12 px-4'
                                    >
                                        {link.name}
                                    </Button>
                                ))}
                                {isAuthenticated ? (
                                    <>
                                        <Button variant='ghost'
                                            onClick={() => { navigate(user?.role === 'admin' ? '/admin' : '/dashboard'); setMobileMenuOpen(false); }}
                                            className='justify-start rounded-lg h-12 text-base font-semibold'>
                                            👤 Trang cá nhân
                                        </Button>
                                        <Button variant='ghost'
                                            onClick={() => { logout(); setMobileMenuOpen(false); }}
                                            className='justify-start rounded-lg h-12 text-base font-semibold text-red-600 hover:text-red-700 hover:bg-red-50'>
                                            Đăng xuất
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                                        className='rounded-lg bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-12 text-base mt-1'
                                    >
                                        Đăng nhập
                                    </Button>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default PublicNavbar;
