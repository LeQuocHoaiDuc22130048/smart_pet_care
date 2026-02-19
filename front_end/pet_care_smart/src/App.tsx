import { RouterProvider } from 'react-router-dom';
import { routes } from './routes.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ErrorBoundary } from './components/error-states/index.tsx';

function App() {
    return (
        <ErrorBoundary>
            <CartProvider>
                <RouterProvider router={routes} />
            </CartProvider>
        </ErrorBoundary>
    );
}

export default App;
