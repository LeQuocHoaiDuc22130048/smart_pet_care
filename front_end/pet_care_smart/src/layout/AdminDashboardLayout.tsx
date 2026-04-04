import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router';

const AdminDashboardLayout = () => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to='/unauthorized' replace />;
    }

    return (
        <div className='min-h-screen flex bg-background'>
            <AdminSidebar />
            <div className='flex-1 ml-0 lg:ml-64'>
                <AdminHeader />
                <main className='p-6 lg:p-8 mt-16'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;
