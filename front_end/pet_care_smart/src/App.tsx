import { RouterProvider } from 'react-router';
import { routes } from './routes.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ErrorBoundary } from './components/error-states/index.tsx';
import AIChatBot from './components/AIChatBot.tsx';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext.tsx';

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <CartProvider>
                    <RouterProvider router={routes} />
                    <AIChatBot />
                    <Toaster />
                </CartProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
