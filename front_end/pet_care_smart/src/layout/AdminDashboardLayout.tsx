import { useEffect, useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router';
import { cn } from '@/lib/utils';

const ADMIN_SIDEBAR_STORAGE_KEY = 'petcare-admin-sidebar-desktop';

const AdminDashboardLayout = () => {
    const { isAuthenticated, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);

    useEffect(() => {
        try {
            const v = localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY);
            if (v === '0') setDesktopSidebarOpen(false);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, desktopSidebarOpen ? '1' : '0');
        } catch {
            /* ignore */
        }
    }, [desktopSidebarOpen]);

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to='/unauthorized' replace />;
    }

    return (
        <div className='min-h-screen flex bg-background'>
            <AdminSidebar
                open={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                desktopOpen={desktopSidebarOpen}
            />

            {/* Main content — offset on desktop khi sidebar mở */}
            <div
                className={cn(
                    'flex-1 flex flex-col min-w-0 transition-[margin] duration-300 ease-out',
                    desktopSidebarOpen && 'lg:ml-64'
                )}
            >
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    desktopSidebarOpen={desktopSidebarOpen}
                    onToggleDesktopSidebar={() => setDesktopSidebarOpen((v) => !v)}
                />
                <main className='flex-1 p-4 sm:p-6 xl:p-8 mt-16 min-w-0'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
