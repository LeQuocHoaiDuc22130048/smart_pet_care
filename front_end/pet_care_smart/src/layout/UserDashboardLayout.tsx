import UserSidebar from '@/components/UserSidebar';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet } from 'react-router';

const UserDashboardLayout = () => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    return (
        <div className='min-h-screen flex bg-background'>
            <UserSidebar />
            <main className='flex-1 p-6 lg:p-8 ml-0 lg:ml-64'>
                <Outlet />
            </main>
        </div>
    );
};

export default UserDashboardLayout;
