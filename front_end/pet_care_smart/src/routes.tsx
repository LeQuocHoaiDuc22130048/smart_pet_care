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
import UserDashboardLayout from './layout/UserDashboardLayout';
import UserDashboardPage from './pages/UserDashboardPage';

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
            { path: 'booking', Component: BookingServicePage }
        ]
    },
    {
        path: '/dashboard',
        Component: UserDashboardLayout,
        children: [{ index: true, Component: UserDashboardPage }]
    },
    {
        path: '/admin',
        Component: AdminDashboardLayout,
        children: [{ index: true, Component: AdminDashboardPage }]
    },
    {
        path: '/unauthorized',
        Component: UnauthorizedPage
    },
    { path: '*', Component: NotFoundPage }
]);
