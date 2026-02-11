import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';

const PublicLayout = () => {
    return (
        <div className='min-h-screen flex flex-col bg-background'>
            <PublicNavbar />
            <main className='flex-1'>
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
