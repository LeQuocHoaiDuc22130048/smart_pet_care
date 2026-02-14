import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from './layout/PublicLayout';
import Homepage from './pages/Homepage';

export const routes = createBrowserRouter([
    {
        path: '/',
        Component: PublicLayout,
        children: [{ index: true, Component: Homepage }]
    },
    {}
]);
