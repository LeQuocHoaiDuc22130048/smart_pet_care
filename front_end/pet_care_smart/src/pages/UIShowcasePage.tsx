import {
    FadeIn,
    FadeInUp,
    StaggerChildren,
    StaggerItem,
    HoverScale,
    HoverLift,
    PressAnimation,
    SuccessAnimation,
    PageTransition
} from '@/components/animations';
import {
    EmptyCart,
    NoSearchResults,
    NoOrders,
    NoRecommendations
} from '@/components/empty-states';
import {
    APIError,
    NetworkError,
    PaymentError,
    InlineError
} from '@/components/error-states';
import {
    LoadingOverlay,
    InlineLoading,
    ContentLoading,
    ButtonSpinner,
    DotsLoading,
    PulseLoading,
    ProgressLoading
} from '@/components/loading-states';
import {
    ProductCardSkeleton,
    DashboardStatsSkeleton,
    OrderHistorySkeleton,
    TableSkeleton,
    GridSkeleton
} from '@/components/skeletons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

const UIShowcasePage = () => {
    const [showLoading, setShowLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showSuccess, setShowSuccess] = useState(false);
    const simulateProgress = () => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setShowSuccess(true);
                    setTimeout(() => setShowSuccess(false), 2000);
                    return 0;
                }
                return prev + 10;
            });
        }, 300);
    };

    return (
        <PageTransition>
            <div className='min-h-screen bg-background py-12'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    {/* Header */}
                    <FadeIn>
                        <div className='text-center mb-12'>
                            <Badge variant='secondary' className='mb-4'>
                                <Sparkles className='w-3 h-3 mr-1' />
                                Production UI System
                            </Badge>
                            <h1 className='text-4xl font-bold text-foreground mb-4'>
                                UI Component Showcase
                            </h1>
                            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                                Comprehensive demonstration of all UI
                                components, states, and animations
                            </p>
                        </div>
                    </FadeIn>

                    {/* Tabs */}
                    <Tabs defaultValue='loading' className='space-y-8'>
                        <TabsList className='grid grid-cols-2 md:grid-cols-5 gap-2'>
                            <TabsTrigger value='loading'>
                                Loading States
                            </TabsTrigger>
                            <TabsTrigger value='skeleton'>
                                Skeletons
                            </TabsTrigger>
                            <TabsTrigger value='empty'>
                                Empty States
                            </TabsTrigger>
                            <TabsTrigger value='errors'>
                                Error States
                            </TabsTrigger>
                            <TabsTrigger value='animations'>
                                Animations
                            </TabsTrigger>
                        </TabsList>

                        {/* Loading States Tab */}
                        <TabsContent value='loading' className='space-y-6'>
                            <StaggerChildren>
                                {/* Inline Loading */}
                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Inline Loading
                                            </CardTitle>
                                            <CardDescription>
                                                Loading indicators for inline
                                                use
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <InlineLoading
                                                message='Loading data...'
                                                size='sm'
                                            />
                                            <InlineLoading
                                                message='Processing...'
                                                size='md'
                                            />
                                            <InlineLoading
                                                message='Please wait...'
                                                size='lg'
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                {/* Button States */}
                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Button Loading States
                                            </CardTitle>
                                            <CardDescription>
                                                Loading spinners for buttons
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className='flex flex-wrap gap-4'>
                                            <Button disabled>
                                                <ButtonSpinner className='w-4 h-4 mr-2' />
                                                Processing
                                            </Button>
                                            <Button variant='outline' disabled>
                                                <ButtonSpinner className='w-4 h-4 mr-2' />
                                                Loading
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                {/* Specialized Loaders */}
                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Specialized Loaders
                                            </CardTitle>
                                            <CardDescription>
                                                Different loading animations
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className='space-y-8'>
                                            <div>
                                                <p className='text-sm font-medium mb-4'>
                                                    Dots Loading
                                                </p>
                                                <DotsLoading />
                                            </div>
                                            <div>
                                                <p className='text-sm font-medium mb-4'>
                                                    Pulse Loading
                                                </p>
                                                <div className='flex gap-8'>
                                                    <PulseLoading size='sm' />
                                                    <PulseLoading size='md' />
                                                    <PulseLoading size='lg' />
                                                </div>
                                            </div>
                                            <div>
                                                <p className='text-sm font-medium mb-4'>
                                                    Progress Loading
                                                </p>
                                                <ProgressLoading
                                                    progress={progress}
                                                    message='Uploading files...'
                                                />
                                                <Button
                                                    onClick={simulateProgress}
                                                    className='mt-4'
                                                    size='sm'
                                                >
                                                    Simulate Progress
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                {/* Page Loading */}
                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Page & Content Loading
                                            </CardTitle>
                                            <CardDescription>
                                                Full page loading states
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button
                                                onClick={() =>
                                                    setShowLoading(true)
                                                }
                                            >
                                                Show Loading Overlay
                                            </Button>
                                            <div className='mt-6 border border-border rounded-lg p-8 bg-background-alt'>
                                                <ContentLoading message='Loading content...' />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            </StaggerChildren>
                        </TabsContent>

                        {/* Skeleton Tab */}
                        <TabsContent value='skeleton' className='space-y-6'>
                            <StaggerChildren>
                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Product Card Skeleton
                                            </CardTitle>
                                            <CardDescription>
                                                Loading state for product cards
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                                <ProductCardSkeleton />
                                                <ProductCardSkeleton />
                                                <ProductCardSkeleton />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Dashboard Stats Skeleton
                                            </CardTitle>
                                            <CardDescription>
                                                Loading state for dashboard
                                                statistics
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <DashboardStatsSkeleton />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Order History Skeleton
                                            </CardTitle>
                                            <CardDescription>
                                                Loading state for order lists
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <OrderHistorySkeleton />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Table Skeleton
                                            </CardTitle>
                                            <CardDescription>
                                                Loading state for data tables
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <TableSkeleton
                                                rows={5}
                                                columns={5}
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Grid Skeleton</CardTitle>
                                            <CardDescription>
                                                Generic grid skeleton
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <GridSkeleton items={6} />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            </StaggerChildren>
                        </TabsContent>

                        {/* Empty States Tab */}
                        <TabsContent value='empty' className='space-y-6'>
                            <StaggerChildren>
                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Empty Cart</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <EmptyCart
                                                onShopNow={() =>
                                                    alert(
                                                        'Navigate to products'
                                                    )
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                No Search Results
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <NoSearchResults
                                                searchTerm='dog collar premium'
                                                onClearSearch={() =>
                                                    alert('Clear search')
                                                }
                                                onBrowseAll={() =>
                                                    alert('Browse all')
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>No Orders</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <NoOrders
                                                onShopNow={() =>
                                                    alert('Shop now')
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                No Recommendations
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <NoRecommendations
                                                onExplore={() =>
                                                    alert('Explore')
                                                }
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            </StaggerChildren>
                        </TabsContent>

                        {/* Error States Tab */}
                        <TabsContent value='errors' className='space-y-6'>
                            <StaggerChildren>
                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>API Error</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <APIError
                                                message='Failed to load products from the server'
                                                onRetry={() => alert('Retry')}
                                                details='Error 500: Internal Server Error'
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Network Error</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <NetworkError
                                                onRetry={() => alert('Retry')}
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Payment Error</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <PaymentError
                                                onRetry={() =>
                                                    alert('Retry payment')
                                                }
                                                onHome={() => alert('Go home')}
                                            />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Inline Error</CardTitle>
                                            <CardDescription>
                                                For form validation and inline
                                                errors
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <InlineError message='Please enter a valid email address' />
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            </StaggerChildren>
                        </TabsContent>

                        {/* Animations Tab */}
                        <TabsContent value='animations' className='space-y-6'>
                            <StaggerChildren>
                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Fade Animations
                                            </CardTitle>
                                            <CardDescription>
                                                Smooth fade-in effects
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className='space-y-4'>
                                            <FadeIn delay={0}>
                                                <div className='p-4 bg-primary/10 rounded-lg'>
                                                    Fade In (no delay)
                                                </div>
                                            </FadeIn>
                                            <FadeInUp delay={0.2}>
                                                <div className='p-4 bg-secondary/10 rounded-lg'>
                                                    Fade In Up (0.2s delay)
                                                </div>
                                            </FadeInUp>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Hover Effects</CardTitle>
                                            <CardDescription>
                                                Interactive hover animations
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className='grid md:grid-cols-2 gap-6'>
                                            <HoverScale>
                                                <Card className='p-6 bg-gradient-to-br from-primary/20 to-secondary/20 cursor-pointer'>
                                                    <p className='font-medium'>
                                                        Hover Scale
                                                    </p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        Scales up on hover
                                                    </p>
                                                </Card>
                                            </HoverScale>
                                            <HoverLift>
                                                <Card className='p-6 bg-gradient-to-br from-accent-purple/20 to-accent-pink/20 cursor-pointer'>
                                                    <p className='font-medium'>
                                                        Hover Lift
                                                    </p>
                                                    <p className='text-sm text-muted-foreground'>
                                                        Lifts up on hover
                                                    </p>
                                                </Card>
                                            </HoverLift>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Press Animation
                                            </CardTitle>
                                            <CardDescription>
                                                Tap/click feedback
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <PressAnimation className='inline-block'>
                                                <Button size='lg'>
                                                    Click Me!
                                                </Button>
                                            </PressAnimation>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Success Animation
                                            </CardTitle>
                                            <CardDescription>
                                                Animated success indicator
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className='flex gap-6 items-center'>
                                            {showSuccess && (
                                                <SuccessAnimation size='lg' />
                                            )}
                                            <div>
                                                <p className='text-sm text-muted-foreground mb-2'>
                                                    {showSuccess
                                                        ? 'Success!'
                                                        : 'Click the progress button above to see the success animation'}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>

                                <StaggerItem>
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Stagger Children
                                            </CardTitle>
                                            <CardDescription>
                                                Sequential animation of multiple
                                                items
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <StaggerChildren staggerDelay={0.1}>
                                                {[1, 2, 3, 4].map((i) => (
                                                    <StaggerItem key={i}>
                                                        <div className='p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg mb-3'>
                                                            Item {i}
                                                        </div>
                                                    </StaggerItem>
                                                ))}
                                            </StaggerChildren>
                                        </CardContent>
                                    </Card>
                                </StaggerItem>
                            </StaggerChildren>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Loading Overlay Demo */}
                {showLoading && (
                    <LoadingOverlay message='Processing your request...' />
                )}
            </div>
        </PageTransition>
    );
};

export default UIShowcasePage;
