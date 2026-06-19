import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { LayoutDashboard, ShoppingBag, Users, Calendar, BarChart, Settings, LogOut, Package, X, ChevronDown, List, Tag, FileText, UserSearch, Megaphone } from 'lucide-react';
import { Button } from './ui/button';
import { useLogout } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

type SubItem = { icon: React.ElementType; label: string; tab: string };

type MenuItem =
    | { icon: React.ElementType; label: string; tab: string; children?: SubItem[] };

const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Tổng quan', tab: 'overview' },
    {
        icon: ShoppingBag, label: 'Sản phẩm', tab: 'products',
        children: [
            { icon: List, label: 'Danh sách sản phẩm', tab: 'products' },
            { icon: Tag, label: 'Danh mục sản phẩm', tab: 'product-categories' },
        ]
    },
    {
        icon: Package, label: 'Đơn hàng', tab: 'orders',
        children: [
            { icon: List, label: 'Danh sách đơn hàng', tab: 'orders' },
            { icon: FileText, label: 'Chi tiết đơn hàng', tab: 'order-detail' },
        ]
    },
    {
        icon: Users, label: 'Khách hàng', tab: 'customers',
        children: [
            { icon: List, label: 'Danh sách khách hàng', tab: 'customers' },
            { icon: UserSearch, label: 'Chi tiết khách hàng', tab: 'customer-detail' },
        ]
    },
    { icon: Calendar, label: 'Lịch đặt', tab: 'bookings' },
    // { icon: Megaphone, label: 'CMS & Marketing', tab: 'cms-marketing' },
    { icon: BarChart, label: 'Thống kê', tab: 'stats' },
    { icon: Settings, label: 'Cài đặt', tab: 'settings' },
];

const ALL_TABS = [
    'overview', 'products', 'products-add', 'product-categories',
    'orders', 'order-detail', 'customers', 'customer-detail', 'bookings', 'cms-marketing', 'stats', 'settings'
] as const;
type AdminTab = typeof ALL_TABS[number];

function parseAdminTabParam(raw: string | null): AdminTab {
    if (raw && (ALL_TABS as readonly string[]).includes(raw)) return raw as AdminTab;
    return 'overview';
}

function adminHref(tab: string) {
    if (tab === 'cms-marketing') return '/admin/cms-marketing';
    return tab === 'overview' ? '/admin' : `/admin?tab=${tab}`;
}

function isAdminTabActive(current: string, tab: string) {
    if (tab === 'overview') return current === 'overview';
    return current === tab;
}

function getExpandedMenuForTab(tab: AdminTab): string | null {
    const parent = menuItems.find((item) => item.children?.some((child) => isAdminTabActive(tab, child.tab)));
    return parent?.tab ?? null;
}

interface SidebarContentProps {
    onClose: () => void;
}

function SidebarContent({ onClose }: SidebarContentProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const logout = useLogout();
    const [searchParams] = useSearchParams();
    const activeTab = location.pathname === '/admin/cms-marketing'
        ? 'cms-marketing'
        : parseAdminTabParam(searchParams.get('tab'));

    // Only one parent menu should be expanded at a time.
    const [expandedMenu, setExpandedMenu] = useState<string | null>(() => getExpandedMenuForTab(activeTab));

    useEffect(() => {
        setExpandedMenu(getExpandedMenuForTab(activeTab));
    }, [activeTab]);

    const toggleMenu = (tab: string) => {
        setExpandedMenu(prev => prev === tab ? null : tab);
    };

    return (
        <div className='flex flex-col h-full text-white'>
            {/* Logo */}
            <div className='p-5 border-b border-white/10 flex items-center justify-between bg-black/10'>
                <Link to='/admin' className='flex items-center space-x-2 min-w-0' onClick={onClose}>
                    <div className='w-10 h-10 rounded-xl bg-white/15 ring-1 ring-white/20 flex items-center justify-center shrink-0'>
                        <span className='text-xl leading-none'>🐾</span>
                    </div>
                    <div className='flex flex-col min-w-0'>
                        <span className='font-bold text-lg text-white leading-tight truncate'>PetCare</span>
                        <span className='text-xs text-emerald-200/90'>Quản trị viên</span>
                    </div>
                </Link>
                <button
                    type='button'
                    onClick={onClose}
                    className='lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white'
                    aria-label='Đóng menu'
                >
                    <X className='w-5 h-5' />
                </button>
            </div>

            
            

            {/* Menu */}
            <nav className='flex-1 p-3 space-y-0.5 overflow-y-auto'>
                {menuItems.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isParentActive = hasChildren
                        ? item.children!.some(c => isAdminTabActive(activeTab, c.tab))
                        : isAdminTabActive(activeTab, item.tab);
                    const isExpanded = expandedMenu === item.tab;

                    const parentClass = cn(
                        'w-full justify-start rounded-xl h-11 text-white/85 border-0 shadow-none',
                        isParentActive
                            ? 'bg-white/20 text-white font-semibold hover:bg-white/25 hover:text-white'
                            : 'hover:bg-white/10 hover:text-white'
                    );

                    if (hasChildren) {
                        return (
                            <div key={item.label}>
                                <Button
                                    variant='ghost'
                                    className={parentClass}
                                    onClick={() => toggleMenu(item.tab)}
                                >
                                    <item.icon className='w-5 h-5 mr-3 shrink-0 opacity-95' />
                                    <span className='flex-1 text-left'>{item.label}</span>
                                    <ChevronDown className={cn('w-4 h-4 transition-transform duration-200', isExpanded && 'rotate-180')} />
                                </Button>
                                <AnimatePresence initial={false}>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className='overflow-hidden'
                                        >
                                            <div className='ml-4 mt-0.5 space-y-0.5 border-l border-white/15 pl-3'>
                                                {item.children!.map((child) => {
                                                    const childActive = isAdminTabActive(activeTab, child.tab);
                                                    return (
                                                        <Link key={child.tab} to={adminHref(child.tab)} onClick={onClose}>
                                                            <Button
                                                                variant='ghost'
                                                                className={cn(
                                                                    'w-full justify-start rounded-xl h-10 text-sm text-white/80 border-0 shadow-none',
                                                                    childActive
                                                                        ? 'bg-white/15 text-white font-semibold hover:bg-white/20 hover:text-white'
                                                                        : 'hover:bg-white/10 hover:text-white'
                                                                )}
                                                            >
                                                                <child.icon className='w-4 h-4 mr-2.5 shrink-0 opacity-90' />
                                                                {child.label}
                                                            </Button>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    }

                    return (
                        <Link key={item.label} to={adminHref(item.tab)} onClick={onClose}>
                            <Button variant='ghost' className={parentClass}>
                                <item.icon className='w-5 h-5 mr-3 shrink-0 opacity-95' />
                                {item.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className='p-3 border-t border-white/10 space-y-0.5 bg-black/10'>
                <Button
                    variant='ghost'
                    onClick={() => { navigate('/products'); onClose(); }}
                    className='w-full justify-start rounded-xl h-11 text-white/90 hover:bg-white/10 hover:text-white border-0 shadow-none'
                >
                    <ShoppingBag className='w-5 h-5 mr-3 shrink-0' />
                    Xem cửa hàng
                </Button>
                <Button
                    variant='ghost'
                    onClick={() => { logout(); onClose(); }}
                    className='w-full justify-start rounded-xl h-11 text-red-200 hover:text-red-100 hover:bg-red-500/20 border-0 shadow-none'
                >
                    <LogOut className='w-5 h-5 mr-3 shrink-0' />
                    Đăng xuất
                </Button>
            </div>
        </div>
    );
}

const sidebarShellClass =
    'flex flex-col bg-gradient-to-b from-[#3d8f36] via-[#2a6b24] to-[#1a4518] border-r border-white/10 shadow-xl';

interface Props {
    open: boolean;
    onClose: () => void;
    /** Desktop: sidebar cố định có đang mở (trượt ẩn khi false) */
    desktopOpen: boolean;
}

const AdminSidebar = ({ open, onClose, desktopOpen }: Props) => {
    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className={cn(
                    'hidden lg:flex fixed left-0 top-0 h-screen w-64 z-40',
                    sidebarShellClass,
                    'transition-transform duration-300 ease-out',
                    !desktopOpen && '-translate-x-full'
                )}
            >
                <SidebarContent onClose={onClose} />
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
                            className={cn(
                                'fixed left-0 top-0 h-screen w-72 z-50 flex flex-col lg:hidden',
                                sidebarShellClass
                            )}
                        >
                            <SidebarContent onClose={onClose} />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminSidebar;
