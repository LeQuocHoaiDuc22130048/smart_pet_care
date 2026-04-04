import { RouterProvider } from 'react-router';
import { routes } from './routes.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ErrorBoundary } from './components/error-states/index.tsx';
import AIChatBot from './components/AIChatBot.tsx';
import { Toaster } from 'sonner';
import { ThemeProvider } from './context/ThemeContext.tsx';
import ScrollToTop from './components/ScrollToTop.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <AuthProvider>
                    <CartProvider>
                        <RouterProvider router={routes} />
                        <AIChatBot />
                        <ScrollToTop />
                        <Toaster richColors />
                    </CartProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
