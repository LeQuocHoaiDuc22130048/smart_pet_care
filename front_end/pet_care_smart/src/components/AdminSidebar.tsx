import { Link, useNavigate } from 'react-router';
import {
    LayoutDashboard,
    ShoppingBag,
    Users,
    Calendar,
    BarChart,
    Settings,
    LogOut,
    Package
} from 'lucide-react';
import { Button } from './ui/button';

const AdminSidebar = () => {
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: ShoppingBag, label: 'Products', path: '/admin' },
        { icon: Package, label: 'Orders', path: '/admin' },
        { icon: Users, label: 'Customers', path: '/admin' },
        { icon: Calendar, label: 'Bookings', path: '/admin' },
        { icon: BarChart, label: 'Analytics', path: '/admin' },
        { icon: Settings, label: 'Settings', path: '/admin' }
    ];

    return (
        <aside className='fixed left-0 top-0 h-screen w-64 bg-white border-r border-border z-40 flex flex-col'>
            {/* Logo */}
            <div className='p-6 border-b border-border'>
                <Link to='/' className='flex items-center space-x-2'>
                    <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-[#B490F5] to-[#9370DB] flex items-center justify-center'>
                        <span className='text-white font-bold text-xl'>🐾</span>
                    </div>
                    <div className='flex flex-col'>
                        <span className='font-bold text-lg text-foreground'>
                            PetCare
                        </span>
                        <span className='text-xs text-[#B490F5] -mt-1'>
                            Admin Panel
                        </span>
                    </div>
                </Link>
            </div>

            {/* Menu */}
            <nav className='flex-1 p-4 space-y-1 overflow-y-auto'>
                {menuItems.map((item) => (
                    <Link key={item.path} to={item.path}>
                        <Button
                            variant='ghost'
                            className='w-full justify-start rounded-xl hover:bg-[#B490F5]/10 hover:text-[#B490F5]'
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
                    onClick={() => navigate('/')}
                    className='w-full justify-start rounded-xl mb-2'
                >
                    <ShoppingBag className='w-5 h-5 mr-3' />
                    View Store
                </Button>
                <Button
                    variant='ghost'
                    //   onClick={handleLogout}
                    className='w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10'
                >
                    <LogOut className='w-5 h-5 mr-3' />
                    Logout
                </Button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
