import { Link, useNavigate } from 'react-router';
import {
    Home,
    ShoppingBag,
    Heart,
    Calendar,
    Package,
    Settings,
    LogOut,
    User
} from 'lucide-react';
import { Button } from './ui/button';

const UserSidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/dashboard' },
        { icon: Package, label: 'My Orders', path: '/dashboard' },
        { icon: Heart, label: 'Wishlist', path: '/dashboard' },
        { icon: Calendar, label: 'Bookings', path: '/dashboard' },
        { icon: User, label: 'My Pets', path: '/dashboard' },
        { icon: Settings, label: 'Settings', path: '/dashboard' }
    ];

    return (
        <aside className='fixed left-0 top-0 h-screen w-64 bg-white border-r border-border z-40 flex flex-col'>
            {/* Logo */}
            <div className='p-6 border-b border-border'>
                <Link to='/' className='flex items-center space-x-2'>
                    <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B9FD8] to-[#3D7BA8] flex items-center justify-center'>
                        <span className='text-white font-bold text-xl'>🐾</span>
                    </div>
                    <div className='flex flex-col'>
                        <span className='font-bold text-lg text-foreground'>
                            PetCare
                        </span>
                        <span className='text-xs text-muted-foreground -mt-1'>
                            Dashboard
                        </span>
                    </div>
                </Link>
            </div>

            {/* User Info */}
            <div className='p-4 border-b border-border'>
                <div className='flex items-center space-x-3'>
                    {/* {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className='w-10 h-10 rounded-full'
                        />
                    ) : (
                        <div className='w-10 h-10 rounded-full bg-[#5B9FD8] flex items-center justify-center'>
                            <span className='text-white font-semibold'>
                                {user?.name.charAt(0)}
                            </span>
                        </div>
                    )} */}
                    <div className='flex-1 min-w-0'>
                        {/* <p className='font-semibold text-sm text-foreground truncate'>
                            {user?.name}
                        </p> */}
                        {/* <p className='text-xs text-muted-foreground truncate'>
                            {user?.email}
                        </p> */}
                    </div>
                </div>
            </div>

            {/* Menu */}
            <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
                {menuItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                        <Button
                            variant='ghost'
                            className='w-full justify-start rounded-xl hover:bg-[#5B9FD8]/10 hover:text-[#5B9FD8]'
                        >
                            <item.icon className='w-5 h-5 mr-3' />
                            {item.label}
                        </Button>
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className='p-4 border-t border-border'>
                <Button
                    variant='ghost'
                    onClick={() => navigate('/products')}
                    className='w-full justify-start rounded-xl mb-2'
                >
                    <ShoppingBag className='w-5 h-5 mr-3' />
                    Back to Shop
                </Button>
                <Button
                    variant='ghost'
                    // onClick={handleLogout}
                    className='w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10'
                >
                    <LogOut className='w-5 h-5 mr-3' />
                    Logout
                </Button>
            </div>
        </aside>
    );
};

export default UserSidebar;
