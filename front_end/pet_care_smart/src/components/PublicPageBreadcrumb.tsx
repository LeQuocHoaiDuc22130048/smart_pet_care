import { useLocation } from 'react-router';
import Breadcrumb from '@/components/Breadcrumb';
import { getPublicBreadcrumbItems } from '@/lib/publicBreadcrumbs';

const PublicPageBreadcrumb = () => {
    const { pathname } = useLocation();
    const items = getPublicBreadcrumbItems(pathname);
    if (!items?.length) return null;

    return (
        <div className='border-b border-border/60 bg-muted/20'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3'>
                <Breadcrumb items={items} />
            </div>
        </div>
    );
};

export default PublicPageBreadcrumb;
