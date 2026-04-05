import { Outlet } from 'react-router';
import PublicNavbar from '../components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import PublicPageBreadcrumb from '@/components/PublicPageBreadcrumb';

const PublicLayout = () => {
    return (
        <div className='min-h-screen flex flex-col bg-background'>
            <PublicNavbar />
            <PublicPageBreadcrumb />
            <main className='flex-1'>
                <Outlet />
            </main>
            <PublicFooter />
        </div>
    );
};

export default PublicLayout;
