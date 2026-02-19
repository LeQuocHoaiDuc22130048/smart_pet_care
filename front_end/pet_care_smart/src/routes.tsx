import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from './layout/PublicLayout';
import Homepage from './pages/Homepage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export const routes = createBrowserRouter([
    {
        path: '/',
        Component: PublicLayout,
        children: [
            { index: true, Component: Homepage },
            { path: 'login', Component: LoginPage },
            { path: 'register', Component: RegisterPage }
        ]
    },
    {}
]);
