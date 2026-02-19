import { Component, type ReactNode } from 'react';
import {
    AlertTriangle,
    WifiOff,
    ServerCrash,
    XCircle,
    RefreshCw,
    Home
} from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */
interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <GeneralError
                    title='Something went wrong'
                    message={
                        this.state.error?.message ||
                        'An unexpected error occurred'
                    }
                    onRetry={this.handleReset}
                    showHome
                />
            );
        }

        return this.props.children;
    }
}

/**
 * Base Error State Component
 */
interface ErrorStateProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    message: string;
    onRetry?: () => void;
    onHome?: () => void;
    showHome?: boolean;
    details?: string;
}

function ErrorState({
    icon: Icon,
    title,
    message,
    onRetry,
    onHome,
    showHome = false,
    details
}: ErrorStateProps) {
    return (
        <div className='flex flex-col items-center justify-center min-h-[400px] px-4 py-16'>
            <div className='mb-6 relative'>
                {/* Decorative background */}
                <div className='absolute inset-0 bg-gradient-to-br from-danger/10 via-warning/10 to-danger/10 rounded-full blur-3xl'></div>

                {/* Icon container */}
                <div className='relative bg-gradient-to-br from-danger/10 to-warning/10 rounded-full p-8'>
                    <Icon className='w-16 h-16 text-danger' />
                </div>
            </div>

            <h3 className='text-2xl font-semibold text-foreground mb-2'>
                {title}
            </h3>
            <p className='text-muted-foreground max-w-md text-center mb-6'>
                {message}
            </p>

            {details && (
                <div className='max-w-md w-full mb-6'>
                    <Alert variant='destructive' className='text-left'>
                        <AlertTriangle className='h-4 w-4' />
                        <AlertTitle>Error Details</AlertTitle>
                        <AlertDescription className='text-sm font-mono mt-2 break-all'>
                            {details}
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            <div className='flex flex-col sm:flex-row gap-3'>
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        size='lg'
                        className='rounded-xl px-8'
                    >
                        <RefreshCw className='w-4 h-4 mr-2' />
                        Try Again
                    </Button>
                )}
                {(showHome || onHome) && (
                    <Button
                        onClick={onHome || (() => (window.location.href = '/'))}
                        variant='outline'
                        size='lg'
                        className='rounded-xl px-8'
                    >
                        <Home className='w-4 h-4 mr-2' />
                        Go Home
                    </Button>
                )}
            </div>
        </div>
    );
}

/**
 * API Error State
 */
export function APIError({
    message = "We couldn't load the data. Please try again.",
    onRetry,
    details
}: {
    message?: string;
    onRetry?: () => void;
    details?: string;
}) {
    return (
        <ErrorState
            icon={ServerCrash}
            title='Server Error'
            message={message}
            onRetry={onRetry}
            details={details}
        />
    );
}

/**
 * Network Error State
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
    return (
        <ErrorState
            icon={WifiOff}
            title='Connection Lost'
            message='Please check your internet connection and try again.'
            onRetry={onRetry}
        />
    );
}

/**
 * Payment Failed Error State
 */
export function PaymentError({
    message = "Your payment couldn't be processed. Please try again or use a different payment method.",
    onRetry,
    onHome
}: {
    message?: string;
    onRetry?: () => void;
    onHome?: () => void;
}) {
    return (
        <ErrorState
            icon={XCircle}
            title='Payment Failed'
            message={message}
            onRetry={onRetry}
            onHome={onHome}
        />
    );
}

/**
 * General Error State
 */
export function GeneralError({
    title = 'Something went wrong',
    message = 'An unexpected error occurred. Please try again.',
    onRetry,
    onHome,
    showHome = false,
    details
}: {
    title?: string;
    message?: string;
    onRetry?: () => void;
    onHome?: () => void;
    showHome?: boolean;
    details?: string;
}) {
    return (
        <ErrorState
            icon={AlertTriangle}
            title={title}
            message={message}
            onRetry={onRetry}
            onHome={onHome}
            showHome={showHome}
            details={details}
        />
    );
}

/**
 * Inline Error Alert
 * For form validation and inline errors
 */
export function InlineError({
    message,
    className = ''
}: {
    message: string;
    className?: string;
}) {
    return (
        <Alert variant='destructive' className={`rounded-xl ${className}`}>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>{message}</AlertDescription>
        </Alert>
    );
}

/**
 * Toast Error Message
 * Use with sonner toast for temporary error messages
 */
export function showErrorToast(message: string, toast: any) {
    toast.error(message, {
        description:
            'Please try again or contact support if the problem persists.',
        duration: 5000,
        action: {
            label: 'Dismiss',
            onClick: () => {}
        }
    });
}
