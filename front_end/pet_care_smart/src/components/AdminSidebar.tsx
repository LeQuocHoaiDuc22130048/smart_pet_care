import { Link, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingBag, Users, Calendar, BarChart, Settings, LogOut, Package, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth, useLogout } from '@/context/AuthContext';

const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: ShoppingBag, label: 'Sản phẩm', path: '/admin' },
    { icon: Package, label: 'Đơn hàng', path: '/admin' },
    { icon: Users, label: 'Khách hàng', path: '/admin' },
    { icon: Calendar, label: 'Lịch đặt', path: '/admin' },
    { icon: BarChart, label: 'Thống kê', path: '/admin' },
    { icon: Settings, label: 'Cài đặt', path: '/admin' }
];

const AdminSidebar = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const logout = useLogout();

    return (
        <aside className='fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 flex flex-col'>
            {/* Logo */}
            <div className='p-6 border-b border-border'>
                <Link to='/' className='flex items-center space-x-2'>
                    <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-[#448B3D] to-[#336B2D] flex items-center justify-center'>
                        <span className='text-white font-bold text-xl'>🐾</span>
                    </div>
                    <div className='flex flex-col'>
                        <span className='font-bold text-lg text-foreground'>PetCare</span>
                        <span className='text-xs text-[#448B3D] -mt-1'>Quản trị viên</span>
                    </div>
                </Link>
            </div>

            {/* Admin info */}
            {user && (
                <div className='p-4 border-b border-border'>
                    <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 rounded-full bg-[#448B3D]/20 flex items-center justify-center overflow-hidden flex-shrink-0'>
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                            ) : (
                                <Shield className='w-5 h-5 text-[#448B3D]' />
                            )}
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='font-semibold text-sm text-foreground truncate'>{user.name}</p>
                            <p className='text-xs text-[#448B3D] font-medium'>Quản trị viên</p>
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
                <Button variant='ghost' onClick={() => navigate('/')} className='w-full justify-start rounded-xl'>
                    <ShoppingBag className='w-5 h-5 mr-3' />
                    Xem cửa hàng
                </Button>
                <Button variant='ghost' onClick={logout} className='w-full justify-start rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10'>
                    <LogOut className='w-5 h-5 mr-3' />
                    Đăng xuất
                </Button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
