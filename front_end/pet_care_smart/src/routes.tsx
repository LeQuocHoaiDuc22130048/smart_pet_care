import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from './layout/PublicLayout';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProductListingPage from './pages/ProductListingPage';
import NotFoundPage from './pages/NotFoundPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ImageSearchPage from './pages/ImageSearchPage';
import CartPage from './pages/CartPage';

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
            { path: 'cart', Component: CartPage }
        ]
    },
    { path: '*', Component: NotFoundPage }
]);
