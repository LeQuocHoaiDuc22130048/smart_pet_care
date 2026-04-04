import { useState } from 'react';
import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router';

const AdminDashboardLayout = () => {
    const { isAuthenticated, user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to='/unauthorized' replace />;
    }

    return (
        <div className='min-h-screen flex bg-background'>
            <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content — offset on desktop */}
            <div className='flex-1 flex flex-col min-w-0 lg:ml-64'>
                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
                <main className='flex-1 p-4 sm:p-6 lg:p-8 mt-16'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
