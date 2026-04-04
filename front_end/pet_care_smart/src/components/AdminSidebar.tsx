import { Link, useNavigate } from 'react-router';
import { LayoutDashboard, ShoppingBag, Users, Calendar, BarChart, Settings, LogOut, Package, Shield, X } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth, useLogout } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/admin' },
    { icon: ShoppingBag, label: 'Sản phẩm', path: '/admin' },
    { icon: Package, label: 'Đơn hàng', path: '/admin' },
    { icon: Users, label: 'Khách hàng', path: '/admin' },
    { icon: Calendar, label: 'Lịch đặt', path: '/admin' },
    { icon: BarChart, label: 'Thống kê', path: '/admin' },
    { icon: Settings, label: 'Cài đặt', path: '/admin' },
];

interface Props {
    open: boolean;
    onClose: () => void;
}

const AdminSidebar = ({ open, onClose }: Props) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const logout = useLogout();

    const SidebarContent = () => (
        <div className='flex flex-col h-full'>
            {/* Logo */}
            <div className='p-5 border-b border-border flex items-center justify-between'>
                <Link to='/' className='flex items-center space-x-2' onClick={onClose}>
                    <div className='w-10 h-10 rounded-xl bg-[#448B3D] flex items-center justify-center'>
                        <span className='text-white font-bold text-xl'>🐾</span>
                    </div>
                    <div className='flex flex-col'>
                        <span className='font-bold text-lg text-foreground leading-tight'>PetCare</span>
                        <span className='text-xs text-[#448B3D]'>Quản trị viên</span>
                    </div>
                </Link>
                <button
                    onClick={onClose}
                    className='lg:hidden p-2 rounded-lg hover:bg-muted transition-colors'
                    aria-label='Đóng menu'
                >
                    <X className='w-5 h-5' />
                </button>
            </div>

            {/* Admin info */}
            {user && (
                <div className='p-4 border-b border-border'>
                    <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 rounded-full bg-[#448B3D]/20 flex items-center justify-center overflow-hidden shrink-0'>
                            {user.avatar
                                ? <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                                : <Shield className='w-5 h-5 text-[#448B3D]' />
                            }
                        </div>
                        <div className='flex-1 min-w-0'>
                            <p className='font-semibold text-sm text-foreground truncate'>{user.name}</p>
                            <p className='text-xs text-[#448B3D] font-medium'>Quản trị viên</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu */}
            <nav className='flex-1 p-3 space-y-0.5 overflow-y-auto'>
                {menuItems.map((item) => (
                    <Link key={item.label} to={item.path} onClick={onClose}>
                        <Button
                            variant='ghost'
                            className='w-full justify-start rounded-xl hover:bg-[#448B3D]/10 hover:text-[#448B3D] h-11'
                        >
                            <item.icon className='w-5 h-5 mr-3 shrink-0' />
                            {item.label}
                        </Button>
                    </Link>
                ))}
            </nav>

            {/* Footer */}
            <div className='p-3 border-t border-border space-y-0.5'>
                <Button
                    variant='ghost'
                    onClick={() => { navigate('/'); onClose(); }}
                    className='w-full justify-start rounded-xl h-11'
                >
                    <ShoppingBag className='w-5 h-5 mr-3 shrink-0' />
                    Xem cửa hàng
                </Button>
                <Button
                    variant='ghost'
                    onClick={() => { logout(); onClose(); }}
                    className='w-full justify-start rounded-xl h-11 text-destructive hover:text-destructive hover:bg-destructive/10'
                >
                    <LogOut className='w-5 h-5 mr-3 shrink-0' />
                    Đăng xuất
                </Button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className='hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-card border-r border-border z-40 flex-col'>
                <SidebarContent />
            </aside>

            {/* Mobile drawer */}
            <AnimatePresence>
                {open && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className='fixed inset-0 bg-black/50 z-40 lg:hidden'
                            onClick={onClose}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className='fixed left-0 top-0 h-screen w-72 bg-card border-r border-border z-50 flex flex-col lg:hidden'
                        >
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminSidebar;
