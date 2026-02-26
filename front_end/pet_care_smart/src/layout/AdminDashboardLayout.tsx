import AdminHeader from '@/components/AdminHeader';
import AdminSidebar from '@/components/AdminSidebar';
import { Outlet } from 'react-router';

const AdminDashboardLayout = () => {
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
