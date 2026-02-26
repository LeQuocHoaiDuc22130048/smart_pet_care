import {
    ShoppingCart,
    Search,
    Package,
    Sparkles,
    Image as ImageIcon,
    Calendar,
    MessageSquare,
    Heart,
    type LucideIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { type ReactNode } from 'react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
    illustration?: ReactNode;
    className?: string;
}

/**
 * Base Empty State Component
 * Reusable empty state with icon, title, description, and actions
 */
export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    secondaryAction,
    illustration,
    className = ''
}: EmptyStateProps) {
    return (
        <div
            className={`flex flex-col items-center justify-center text-center py-16 px-4 ${className}`}
        >
            {illustration || (
                <div className='mb-6 relative'>
                    {/* Decorative background */}
                    <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent-purple/10 rounded-full blur-3xl'></div>

                    {/* Icon container */}
                    <div className='relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8'>
                        <Icon
                            className='w-16 h-16 text-muted-foreground'
                            strokeWidth={1.5}
                        />
                    </div>
                </div>
            )}

            <h3 className='text-2xl font-semibold text-foreground mb-2'>
                {title}
            </h3>
            <p className='text-muted-foreground max-w-md mb-8'>{description}</p>

            {(action || secondaryAction) && (
                <div className='flex flex-col sm:flex-row gap-3'>
                    {action && (
                        <Button
                            onClick={action.onClick}
                            size='lg'
                            className='rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground px-8'
                        >
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            onClick={secondaryAction.onClick}
                            variant='outline'
                            size='lg'
                            className='rounded-xl px-8'
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * Empty Cart State
 */
export function EmptyCart({ onShopNow }: { onShopNow: () => void }) {
    return (
        <EmptyState
            icon={ShoppingCart}
            title='Your cart is empty'
            description="Looks like you haven't added anything to your cart yet. Start shopping and give your pet something special!"
            action={{
                label: 'Start Shopping',
                onClick: onShopNow
            }}
        />
    );
}

/**
 * No Search Results State
 */
export function NoSearchResults({
    searchTerm,
    onClearSearch,
    onBrowseAll
}: {
    searchTerm: string;
    onClearSearch: () => void;
    onBrowseAll: () => void;
}) {
    return (
        <EmptyState
            icon={Search}
            title='No results found'
            description={`We couldn't find any products matching "${searchTerm}". Try adjusting your search or browse our full catalog.`}
            action={{
                label: 'Clear Search',
                onClick: onClearSearch
            }}
            secondaryAction={{
                label: 'Browse All Products',
                onClick: onBrowseAll
            }}
        />
    );
}

/**
 * No Orders State
 */
export function NoOrders({ onShopNow }: { onShopNow: () => void }) {
    return (
        <EmptyState
            icon={Package}
            title='No orders yet'
            description="You haven't placed any orders yet. Start shopping to see your order history here."
            action={{
                label: 'Shop Now',
                onClick: onShopNow
            }}
        />
    );
}

/**
 * No Recommendations State
 */
export function NoRecommendations({ onExplore }: { onExplore: () => void }) {
    return (
        <EmptyState
            icon={Sparkles}
            title='No recommendations yet'
            description='Browse products and add items to your cart to help our AI understand your preferences and provide personalized recommendations.'
            action={{
                label: 'Explore Products',
                onClick: onExplore
            }}
        />
    );
}

/**
 * No Image Search Results State
 */
export function NoImageSearchResults({
    onTryAgain
}: {
    onTryAgain: () => void;
}) {
    return (
        <EmptyState
            icon={ImageIcon}
            title='No similar products found'
            description="We couldn't find products matching your image. Try uploading a different image or browse our catalog."
            action={{
                label: 'Try Another Image',
                onClick: onTryAgain
            }}
        />
    );
}

/**
 * No Bookings State
 */
export function NoBookings({ onBookService }: { onBookService: () => void }) {
    return (
        <EmptyState
            icon={Calendar}
            title='No bookings yet'
            description="You haven't booked any services yet. Schedule a spa, vaccination, or health checkup for your pet."
            action={{
                label: 'Book a Service',
                onClick: onBookService
            }}
        />
    );
}

/**
 * No Messages State (for chatbot)
 */
export function NoMessages({ onStartChat }: { onStartChat: () => void }) {
    return (
        <EmptyState
            icon={MessageSquare}
            title='Start a conversation'
            description="Ask me anything about pet care, products, or services. I'm here to help!"
            action={{
                label: 'Send a Message',
                onClick: onStartChat
            }}
        />
    );
}

/**
 * No Favorites State
 */
export function NoFavorites({ onBrowse }: { onBrowse: () => void }) {
    return (
        <EmptyState
            icon={Heart}
            title='No favorites yet'
            description='Start adding products to your favorites to quickly find them later.'
            action={{
                label: 'Browse Products',
                onClick: onBrowse
            }}
        />
    );
}

/**
 * Generic Empty State with Custom Content
 */
export function CustomEmptyState({
    title,
    description,
    icon,
    children
}: {
    title: string;
    description: string;
    icon?: LucideIcon;
    children?: ReactNode;
}) {
    const Icon = icon || Package;

    return (
        <div className='flex flex-col items-center justify-center text-center py-16 px-4'>
            <div className='mb-6 relative'>
                <div className='absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent-purple/10 rounded-full blur-3xl'></div>
                <div className='relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8'>
                    <Icon
                        className='w-16 h-16 text-muted-foreground'
                        strokeWidth={1.5}
                    />
                </div>
            </div>

            <h3 className='text-2xl font-semibold text-foreground mb-2'>
                {title}
            </h3>
            <p className='text-muted-foreground max-w-md mb-8'>{description}</p>

            {children}
        </div>
    );
}
