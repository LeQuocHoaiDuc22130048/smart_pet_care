import { Link, useNavigate } from 'react-router';
import { Home, ShoppingBag, Heart, Calendar, Package, Settings, User } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth, useLogout } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

const menuItems = [
    { icon: Home, label: 'Tổng quan', path: '/dashboard' },
    { icon: Package, label: 'Đơn hàng', path: '/dashboard' },
    { icon: Heart, label: 'Yêu thích', path: '/dashboard' },
    { icon: Calendar, label: 'Lịch đặt', path: '/dashboard' },
    { icon: User, label: 'Thú cưng', path: '/dashboard' },
    { icon: Settings, label: 'Cài đặt', path: '/dashboard' }
];

const UserSidebar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const logout = useLogout();

    return (
        <aside className='fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 flex flex-col'>
            {/* Logo */}
            <div className='p-6 border-b border-border'>
                <Link to='/' className='flex items-center space-x-2'>
                    <div className='w-10 h-10 rounded-xl flex items-center justify-center'>
                        <img src='/image-removebg-preview.png' alt='Logo' />
                    </div>
                    <div className='flex flex-col'>
                        <span className='font-bold text-lg text-foreground'>PetCare</span>
                        <span className='text-xs text-muted-foreground -mt-1'>Trang cá nhân</span>
                    </div>
                </Link>
            </div>

            {/* User info */}
            {user && (
                <div className='p-4 border-b border-border'>
                    <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 rounded-full bg-[#448B3D]/20 flex items-center justify-center overflow-hidden flex-shrink-0'>
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                            ) : (
                                <User className='w-5 h-5 text-[#448B3D]' />
                            )}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='font-semibold text-sm text-foreground truncate'>{user.name}</p>
                            <p className='text-xs text-muted-foreground truncate'>{user.email}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu */}
            <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
                {menuItems.map((item) => (
                    <Link key={item.label} to={item.path}>
                        <Button variant='ghost' className='w-full justify-start rounded-xl hover:bg-[#448B3D]/10 hover:text-[#448B3D]'>
                            <item.icon className='w-5 h-5 mr-3' />
                            {item.label}
                        </Button>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className='p-4 border-t border-border space-y-1'>
                <Button variant='ghost' onClick={() => navigate('/products')} className='w-full justify-start rounded-xl'>
                    <ShoppingBag className='w-5 h-5 mr-3' />
                    Quay lại cửa hàng
                </Button>
                <Button variant='ghost' onClick={logout} className='w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10'>
                    <LogOut className='w-5 h-5 mr-3' />
                    Đăng xuất
                </Button>
            </div>
        </aside>
    );
};

export default UserSidebar;
