import { Bell, Search, Menu, PanelLeft, PanelLeftClose } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import ThemeToggle from './theme/ThemeToggle';

interface Props {
    onMenuClick: () => void;
    desktopSidebarOpen: boolean;
    onToggleDesktopSidebar: () => void;
}

const AdminHeader = ({ onMenuClick, desktopSidebarOpen, onToggleDesktopSidebar }: Props) => {
    const { user } = useAuth();

    return (
        <header
            className={cn(
                'fixed top-0 right-0 left-0 h-16 bg-card border-b border-border z-30 px-4 lg:px-6 flex items-center justify-between gap-3 transition-[left] duration-300 ease-out',
                desktopSidebarOpen ? 'lg:left-64' : 'lg:left-0'
            )}
        >
            <div className='flex items-center gap-1 shrink-0'>
                {/* Mobile: mở drawer */}
                <button
                    type='button'
                    onClick={onMenuClick}
                    className='lg:hidden p-2 rounded-lg hover:bg-muted transition-colors'
                    aria-label='Mở menu'
                >
                    <Menu className='w-5 h-5' />
                </button>
                {/* Desktop: ẩn / hiện sidebar */}
                <button
                    type='button'
                    onClick={onToggleDesktopSidebar}
                    className='hidden lg:flex p-2 rounded-lg hover:bg-muted transition-colors text-foreground'
                    aria-label={desktopSidebarOpen ? 'Thu gọn menu bên' : 'Mở menu bên'}
                >
                    {desktopSidebarOpen ? <PanelLeftClose className='w-5 h-5' /> : <PanelLeft className='w-5 h-5' />}
                </button>
            </div>

            {/* Search */}
            <div className='flex-1 max-w-sm'>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                    <Input
                        placeholder='Tìm kiếm...'
                        className='pl-9 rounded-xl bg-background h-9 text-sm'
                    />
                </div>
            </div>

            {/* Right actions */}
            <div className='flex items-center gap-1 sm:gap-2'>
                <ThemeToggle />
                <Button variant='ghost' size='icon' className='relative rounded-xl'>
                    <Bell className='w-5 h-5' />
                    <Badge className='absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-[#FFB86F] text-xs border-0'>
                        3
                    </Badge>
                </Button>

                {user && (
                    <div className='hidden sm:flex items-center gap-2 pl-3 border-l border-border'>
                        <div className='w-8 h-8 rounded-full bg-[#448B3D]/20 flex items-center justify-center overflow-hidden shrink-0'>
                            {user.avatar
                                ? <img src={user.avatar} alt={user.name} className='w-full h-full object-cover' />
                                : <span className='text-[#448B3D] font-bold text-sm'>{user.name.charAt(0)}</span>
                            }
                        </div>
                        <div className='hidden md:block'>
                            <p className='text-sm font-semibold text-foreground leading-tight'>{user.name}</p>
                            <p className='text-xs text-muted-foreground'>Quản trị viên</p>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default AdminHeader;
