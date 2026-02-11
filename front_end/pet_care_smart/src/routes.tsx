import { createBrowserRouter } from 'react-router-dom';
import PublicLayout from './layout/PublicLayout';

export const routes = createBrowserRouter([
    {
        path: '/',
        Component: PublicLayout,
        children: []
    },
    {}
]);
