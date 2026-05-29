import { createBrowserRouter } from 'react-router';
import PublicLayout from './layout/PublicLayout';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListingPage from './pages/ProductListingPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ImageSearchPage from './pages/ImageSearchPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import BookingServicePage from './pages/BookingServicePage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AdminDashboardLayout from './layout/AdminDashboardLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCmsMarketingPage from './pages/AdminCmsMarketingPage';
import UserDashboardLayout from './layout/UserDashboardLayout';
import UserDashboardPage from './pages/UserDashboardPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ContactPage from './pages/ContactPage';
import GoogleCallbackPage from './pages/GoogleCallbackPage';
import PaymentResultPage from './pages/PaymentResultPage';

import FeedbackPage from './pages/FeedbackPage';

export const routes = createBrowserRouter([
    {
        path: '/',
        Component: PublicLayout,
        children: [
            { index: true, Component: Homepage },
            { path: 'login', Component: LoginPage },
            { path: 'register', Component: RegisterPage },
            { path: 'products', Component: ProductListingPage },
            { path: 'products/:id', Component: ProductDetailPage },
            { path: 'image-search', Component: ImageSearchPage },
            { path: 'cart', Component: CartPage },
            { path: 'checkout', Component: CheckoutPage },
            { path: 'booking', Component: BookingServicePage },
            { path: 'blog', Component: BlogPage },
            { path: 'blog/:id', Component: BlogDetailPage },
            { path: 'chinh-sach-bao-mat', Component: PrivacyPolicyPage },
            { path: 'chinh-sach-doi-tra', Component: ReturnPolicyPage },
            { path: 'chinh-sach-van-chuyen', Component: ShippingPolicyPage },
            { path: 'lien-he', Component: ContactPage },
            { path: 'feedback', Component: FeedbackPage },
            { path: 'payment-result', Component: PaymentResultPage }
        ]
    },
    {
        path: '/auth/google/callback',
        Component: GoogleCallbackPage
    },
    {
        path: '/dashboard',
        Component: UserDashboardLayout,
        children: [{ index: true, Component: UserDashboardPage }]
    },
    {
        path: '/admin',
        Component: AdminDashboardLayout,
        children: [
            { index: true, Component: AdminDashboardPage },
            { path: 'cms-marketing', Component: AdminCmsMarketingPage },
        ]
    },
    {
        path: '/unauthorized',
        Component: UnauthorizedPage
    },
    { path: '*', Component: NotFoundPage }
]);
