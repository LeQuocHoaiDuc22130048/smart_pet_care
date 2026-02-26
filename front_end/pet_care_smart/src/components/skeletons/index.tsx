import { Skeleton } from '../ui/skeleton';

/**
 * Product Card Skeleton
 * Used in product listing pages while loading
 */
export function ProductCardSkeleton() {
    return (
        <div className='bg-card border border-border rounded-2xl overflow-hidden'>
            {/* Image skeleton */}
            <Skeleton className='w-full h-64' />

            {/* Content skeleton */}
            <div className='p-4 space-y-3'>
                {/* Title */}
                <Skeleton className='h-5 w-3/4' />

                {/* Description */}
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-2/3' />

                {/* Price and rating row */}
                <div className='flex items-center justify-between pt-2'>
                    <Skeleton className='h-6 w-20' />
                    <Skeleton className='h-5 w-16' />
                </div>

                {/* Button */}
                <Skeleton className='h-10 w-full rounded-xl' />
            </div>
        </div>
    );
}

/**
 * Product Detail Skeleton
 * Used on product detail page
 */
export function ProductDetailSkeleton() {
    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <div className='grid lg:grid-cols-2 gap-12'>
                {/* Image Gallery Skeleton */}
                <div className='space-y-4'>
                    <Skeleton className='w-full h-[500px] rounded-2xl' />
                    <div className='grid grid-cols-4 gap-4'>
                        <Skeleton className='h-24 rounded-lg' />
                        <Skeleton className='h-24 rounded-lg' />
                        <Skeleton className='h-24 rounded-lg' />
                        <Skeleton className='h-24 rounded-lg' />
                    </div>
                </div>

                {/* Product Info Skeleton */}
                <div className='space-y-6'>
                    <Skeleton className='h-8 w-3/4' />
                    <div className='flex items-center gap-4'>
                        <Skeleton className='h-5 w-24' />
                        <Skeleton className='h-5 w-32' />
                    </div>
                    <Skeleton className='h-10 w-32' />
                    <div className='space-y-2'>
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-full' />
                        <Skeleton className='h-4 w-3/4' />
                    </div>
                    <div className='space-y-3 pt-4'>
                        <Skeleton className='h-12 w-full rounded-xl' />
                        <Skeleton className='h-12 w-full rounded-xl' />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Dashboard Stats Skeleton
 * Used in admin/user dashboard
 */
export function DashboardStatsSkeleton() {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[...Array(4)].map((_, i) => (
                <div
                    key={i}
                    className='bg-card border border-border rounded-2xl p-6'
                >
                    <div className='flex items-center justify-between mb-4'>
                        <Skeleton className='h-10 w-10 rounded-lg' />
                        <Skeleton className='h-6 w-16' />
                    </div>
                    <Skeleton className='h-8 w-24 mb-2' />
                    <Skeleton className='h-4 w-32' />
                </div>
            ))}
        </div>
    );
}

/**
 * Order History Skeleton
 * Used in user dashboard order history
 */
export function OrderHistorySkeleton() {
    return (
        <div className='space-y-4'>
            {[...Array(3)].map((_, i) => (
                <div
                    key={i}
                    className='bg-card border border-border rounded-2xl p-6'
                >
                    <div className='flex items-start justify-between mb-4'>
                        <div className='space-y-2 flex-1'>
                            <Skeleton className='h-5 w-32' />
                            <Skeleton className='h-4 w-48' />
                        </div>
                        <Skeleton className='h-6 w-20 rounded-full' />
                    </div>

                    <div className='flex items-center gap-4 mb-4'>
                        <Skeleton className='h-20 w-20 rounded-lg' />
                        <div className='flex-1 space-y-2'>
                            <Skeleton className='h-4 w-3/4' />
                            <Skeleton className='h-4 w-1/2' />
                        </div>
                    </div>

                    <div className='flex items-center justify-between pt-4 border-t border-border'>
                        <Skeleton className='h-6 w-24' />
                        <Skeleton className='h-9 w-32 rounded-lg' />
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Table Skeleton
 * Used for data tables in admin dashboard
 */
export function TableSkeleton({
    rows = 5,
    columns = 5
}: {
    rows?: number;
    columns?: number;
}) {
    return (
        <div className='bg-card border border-border rounded-2xl overflow-hidden'>
            {/* Table Header */}
            <div className='bg-muted border-b border-border p-4'>
                <div
                    className='grid gap-4'
                    style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
                >
                    {[...Array(columns)].map((_, i) => (
                        <Skeleton key={i} className='h-5' />
                    ))}
                </div>
            </div>

            {/* Table Rows */}
            <div className='divide-y divide-border'>
                {[...Array(rows)].map((_, rowIndex) => (
                    <div key={rowIndex} className='p-4'>
                        <div
                            className='grid gap-4'
                            style={{
                                gridTemplateColumns: `repeat(${columns}, 1fr)`
                            }}
                        >
                            {[...Array(columns)].map((_, colIndex) => (
                                <Skeleton key={colIndex} className='h-4' />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Chat Message Skeleton
 * Used in AI chatbot
 */
export function ChatMessageSkeleton() {
    return (
        <div className='flex gap-3 items-start'>
            <Skeleton className='h-8 w-8 rounded-full flex-shrink-0' />
            <div className='space-y-2 flex-1'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-2/3' />
            </div>
        </div>
    );
}

/**
 * Grid Skeleton
 * Generic grid skeleton for various use cases
 */
export function GridSkeleton({
    items = 8,
    columns = 4,
    aspectRatio = '4/3'
}: {
    items?: number;
    columns?: number;
    aspectRatio?: string;
}) {
    return (
        <div
            className='grid gap-6'
            style={{
                gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))`
            }}
        >
            {[...Array(items)].map((_, i) => (
                <div key={i} className='space-y-3'>
                    <Skeleton
                        className='w-full rounded-2xl'
                        style={{ aspectRatio }}
                    />
                    <Skeleton className='h-4 w-3/4' />
                    <Skeleton className='h-4 w-1/2' />
                </div>
            ))}
        </div>
    );
}
