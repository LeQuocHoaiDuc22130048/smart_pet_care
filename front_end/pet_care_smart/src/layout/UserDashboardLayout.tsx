import { useState } from 'react';
import UserSidebar from '@/components/UserSidebar';
import ThemeToggle from '@/components/theme/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router';
import { Menu } from 'lucide-react';

const UserDashboardLayout = () => {
    const { isAuthenticated } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    return (
        <div className='min-h-screen flex bg-background'>
            <UserSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content — offset on desktop */}
            <div className='flex-1 flex flex-col min-w-0 lg:ml-64'>
                {/* Mobile top bar */}
                <header className='lg:hidden sticky top-0 z-30 bg-card border-b border-border px-4 h-14 flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-3 min-w-0'>
                        <button
                            type='button'
                            onClick={() => setSidebarOpen(true)}
                            className='p-2 rounded-lg hover:bg-muted transition-colors shrink-0'
                            aria-label='Mở menu'
                        >
                            <Menu className='w-5 h-5' />
                        </button>
                        <span className='font-bold text-foreground truncate'>PetCare</span>
                    </div>
                    <ThemeToggle />
                </header>

                <main className='flex-1 bg-muted/25 p-4 dark:bg-muted/15 sm:p-6 lg:p-8'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default UserDashboardLayout;
