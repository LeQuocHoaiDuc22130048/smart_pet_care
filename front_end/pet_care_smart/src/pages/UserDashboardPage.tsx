import { useNavigate } from 'react-router';
import {
    Package,
    Calendar,
    Heart,
    TrendingUp,
    ShoppingBag,
    Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const UserDashboardPage = () => {
    const navigate = useNavigate();

    const stats = [
        {
            icon: Package,
            label: 'Total Orders',
            value: '12',
            color: 'from-[#5B9FD8] to-[#3D7BA8]'
        },
        {
            icon: Calendar,
            label: 'Bookings',
            value: '3',
            color: 'from-[#FFB86F] to-[#FF9A3D]'
        },
        {
            icon: Heart,
            label: 'Wishlist',
            value: '8',
            color: 'from-[#FFB4D6] to-[#FF8BC3]'
        },
        {
            icon: TrendingUp,
            label: 'Total Spent',
            value: '$890',
            color: 'from-[#7FD99E] to-[#4CAF50]'
        }
    ];

    const recentOrders = [
        {
            id: 'ORD-001',
            product: 'Premium Organic Dog Food',
            date: 'Feb 8, 2026',
            status: 'Delivered',
            total: '$49.99',
            image: 'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
        },
        {
            id: 'ORD-002',
            product: 'Cat Scratching Post',
            date: 'Feb 5, 2026',
            status: 'Shipped',
            total: '$89.99',
            image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBzY3JhdGNoaW5nJTIwcG9zdHxlbnwxfHx8fDE3NzA3ODk3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
        }
    ];

    const upcomingBookings = [
        {
            id: 'BK-001',
            service: 'Pet Spa',
            date: 'Feb 15, 2026',
            time: '10:00 AM',
            pet: 'Max'
        },
        {
            id: 'BK-002',
            service: 'Health Checkup',
            date: 'Feb 20, 2026',
            time: '2:00 PM',
            pet: 'Bella'
        }
    ];
    return (
        <div className='max-w-7xl'>
            <div className='mb-8'>
                {/* <h1 className='text-3xl font-bold text-foreground mb-2'>
                    Welcome back, {user?.name}!
                </h1> */}
                <p className='text-muted-foreground'>
                    Here's what's happening with your pets
                </p>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                {stats.map((stat) => (
                    <Card key={stat.label} className='p-6 rounded-2xl'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-muted-foreground mb-1'>
                                    {stat.label}
                                </p>
                                <p className='text-3xl font-bold text-foreground'>
                                    {stat.value}
                                </p>
                            </div>
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                            >
                                <stat.icon className='w-6 h-6 text-white' />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className='grid lg:grid-cols-2 gap-8'>
                {/* Recent Orders */}
                <Card className='p-6 rounded-2xl'>
                    <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-xl font-bold text-foreground'>
                            Recent Orders
                        </h2>
                        <Button
                            variant='ghost'
                            size='sm'
                            className='rounded-xl'
                        >
                            View All
                        </Button>
                    </div>
                    <div className='space-y-4'>
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className='flex items-center space-x-4 p-4 rounded-xl bg-background hover:bg-background-alt transition-colors'
                            >
                                <img
                                    src={order.image}
                                    alt={order.product}
                                    className='w-16 h-16 object-cover rounded-lg'
                                />
                                <div className='flex-1'>
                                    <h4 className='font-semibold text-sm text-foreground mb-1'>
                                        {order.product}
                                    </h4>
                                    <div className='flex items-center space-x-2 text-xs text-muted-foreground'>
                                        <span>{order.id}</span>
                                        <span>•</span>
                                        <span>{order.date}</span>
                                    </div>
                                </div>
                                <div className='text-right'>
                                    <p className='font-semibold text-foreground mb-1'>
                                        {order.total}
                                    </p>
                                    <Badge
                                        className={`${
                                            order.status === 'Delivered'
                                                ? 'bg-[#7FD99E]/20 text-[#4CAF50] border-[#7FD99E]'
                                                : 'bg-[#5B9FD8]/20 text-[#5B9FD8] border-[#5B9FD8]'
                                        }`}
                                    >
                                        {order.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Upcoming Bookings */}
                <Card className='p-6 rounded-2xl'>
                    <div className='flex items-center justify-between mb-6'>
                        <h2 className='text-xl font-bold text-foreground'>
                            Upcoming Bookings
                        </h2>
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => navigate('/booking')}
                            className='rounded-xl'
                        >
                            Book Now
                        </Button>
                    </div>
                    <div className='space-y-4'>
                        {upcomingBookings.map((booking) => (
                            <div
                                key={booking.id}
                                className='p-4 rounded-xl border border-border hover:border-[#FFB86F] transition-colors'
                            >
                                <div className='flex items-start justify-between mb-3'>
                                    <div>
                                        <h4 className='font-semibold text-foreground mb-1'>
                                            {booking.service}
                                        </h4>
                                        <p className='text-sm text-muted-foreground'>
                                            Pet: {booking.pet}
                                        </p>
                                    </div>
                                    <Badge className='bg-[#FFB86F]/20 text-[#FF9A3D] border-[#FFB86F]'>
                                        Scheduled
                                    </Badge>
                                </div>
                                <div className='flex items-center space-x-4 text-sm text-muted-foreground'>
                                    <div className='flex items-center'>
                                        <Calendar className='w-4 h-4 mr-1' />
                                        {booking.date}
                                    </div>
                                    <div className='flex items-center'>
                                        <Clock className='w-4 h-4 mr-1' />
                                        {booking.time}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className='mt-8 grid md:grid-cols-3 gap-6'>
                <Card
                    className='p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all'
                    onClick={() => navigate('/products')}
                >
                    <ShoppingBag className='w-8 h-8 text-[#5B9FD8] mb-3' />
                    <h3 className='font-semibold text-foreground mb-1'>
                        Shop Products
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                        Browse our premium pet products
                    </p>
                </Card>

                <Card
                    className='p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all'
                    onClick={() => navigate('/booking')}
                >
                    <Calendar className='w-8 h-8 text-[#FFB86F] mb-3' />
                    <h3 className='font-semibold text-foreground mb-1'>
                        Book Service
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                        Schedule grooming or checkup
                    </p>
                </Card>

                <Card
                    className='p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all'
                    onClick={() => navigate('/image-search')}
                >
                    <TrendingUp className='w-8 h-8 text-[#B490F5] mb-3' />
                    <h3 className='font-semibold text-foreground mb-1'>
                        AI Search
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                        Find products by image
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default UserDashboardPage;
