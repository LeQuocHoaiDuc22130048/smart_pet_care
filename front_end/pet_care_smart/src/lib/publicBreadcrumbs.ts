import type { BreadcrumbItem } from '@/components/Breadcrumb';

/** Các mục sau trang gốc Homepage; component Breadcrumb tự thêm Homepage (/) */
export function getPublicBreadcrumbItems(pathname: string): BreadcrumbItem[] | null {
    const path = pathname.replace(/\/+$/, '') || '/';
    if (path === '/') return null;

    if (path === '/login') return [{ label: 'Đăng nhập' }];
    if (path === '/register') return [{ label: 'Đăng ký' }];
    if (path === '/products') return [{ label: 'Sản phẩm' }];
    if (path.startsWith('/products/')) {
        const rest = path.slice('/products/'.length);
        if (!rest) return [{ label: 'Sản phẩm' }];
        return [{ label: 'Sản phẩm', path: '/products' }, { label: 'Chi tiết sản phẩm' }];
    }
    if (path === '/image-search') return [{ label: 'Tìm theo ảnh' }];
    if (path === '/cart') return [{ label: 'Giỏ hàng' }];
    if (path === '/checkout') {
        return [{ label: 'Giỏ hàng', path: '/cart' }, { label: 'Thanh toán' }];
    }
    if (path === '/booking') return [{ label: 'Đặt lịch' }];
    if (path === '/blog') return [{ label: 'Tin tức' }];
    if (path.startsWith('/blog/')) {
        const rest = path.slice('/blog/'.length);
        if (!rest) return [{ label: 'Tin tức' }];
        return [{ label: 'Tin tức', path: '/blog' }, { label: 'Chi tiết bài viết' }];
    }
    if (path === '/chinh-sach-bao-mat') return [{ label: 'Chính sách bảo mật' }];
    if (path === '/chinh-sach-doi-tra') return [{ label: 'Chính sách đổi trả' }];
    if (path === '/chinh-sach-van-chuyen') return [{ label: 'Chính sách vận chuyển' }];
    if (path === '/lien-he') return [{ label: 'Liên hệ' }];
    if (path === '/feedback') return [{ label: 'Góp ý' }];

    return [{ label: 'Trang' }];
}
