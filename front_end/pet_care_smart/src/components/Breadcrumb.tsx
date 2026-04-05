import { Link } from 'react-router';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface Props {
    items: BreadcrumbItem[];
    className?: string;
}

const Breadcrumb = ({ items, className = '' }: Props) => {
    const all = [{ label: 'Homepage', path: '/' }, ...items];

    return (
        <nav aria-label='breadcrumb' className={`flex items-center flex-wrap gap-1 text-sm text-muted-foreground ${className}`}>
            {all.map((item, i) => {
                const isLast = i === all.length - 1;
                return (
                    <span key={i} className='flex items-center gap-1'>
                        {i > 0 && <ChevronRight className='w-3.5 h-3.5 shrink-0 text-muted-foreground/50' />}
                        {i === 0 && <Home className='w-3.5 h-3.5 shrink-0' />}
                        {isLast || !item.path ? (
                            <span className={isLast ? 'font-medium text-foreground truncate max-w-[180px] sm:max-w-xs' : ''}>
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.path}
                                className='hover:text-[#448B3D] hover:underline transition-colors'
                            >
                                {item.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
};

export default Breadcrumb;
