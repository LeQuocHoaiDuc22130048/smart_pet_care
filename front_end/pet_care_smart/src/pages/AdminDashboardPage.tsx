import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, TrendingUp, Package, Calendar } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";


const AdminDashboardPage = () => {
    const stats = [
        {
            icon: DollarSign,
            label: 'Total Revenue',
            value: '$45,890',
            change: '+12.5%',
            trend: 'up'
        },
        {
            icon: ShoppingBag,
            label: 'Total Orders',
            value: '1,234',
            change: '+8.2%',
            trend: 'up'
        },
        {
            icon: Users,
            label: 'Total Customers',
            value: '892',
            change: '+15.3%',
            trend: 'up'
        },
        {
            icon: Calendar,
            label: 'Bookings',
            value: '156',
            change: '+5.1%',
            trend: 'up'
        }
    ];

    const salesData = [
        { month: 'Jan', sales: 4000, orders: 240 },
        { month: 'Feb', sales: 3000, orders: 180 },
        { month: 'Mar', sales: 5000, orders: 320 },
        { month: 'Apr', sales: 4500, orders: 280 },
        { month: 'May', sales: 6000, orders: 380 },
        { month: 'Jun', sales: 5500, orders: 350 }
    ];

    const recentOrders = [
        {
            id: 'ORD-1234',
            customer: 'John Doe',
            product: 'Premium Dog Food',
            amount: '$49.99',
            status: 'Completed',
            date: 'Feb 11, 2026'
        },
        {
            id: 'ORD-1233',
            customer: 'Jane Smith',
            product: 'Cat Scratching Post',
            amount: '$89.99',
            status: 'Processing',
            date: 'Feb 11, 2026'
        },
        {
            id: 'ORD-1232',
            customer: 'Bob Johnson',
            product: 'Pet Bed',
            amount: '$79.99',
            status: 'Shipped',
            date: 'Feb 10, 2026'
        }
    ];

    const topProducts = [
        { name: 'Premium Dog Food', sales: 234, revenue: '$11,690' },
        { name: 'Cat Scratching Post', sales: 189, revenue: '$16,998' },
        { name: 'Pet Bed', sales: 156, revenue: '$12,480' },
        { name: 'Interactive Toy', sales: 145, revenue: '$6,520' }
    ];

    return (
        <div className='max-w-7xl'>
            <div className='mb-8'>
                <h1 className='text-3xl font-bold text-foreground mb-2'>
                    Admin Dashboard
                </h1>
                <p className='text-muted-foreground'>
                    Overview of your pet care business
                </p>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                {stats.map((stat) => (
                    <Card key={stat.label} className='p-6 rounded-2xl'>
                        <div className='flex items-center justify-between mb-4'>
                            <div
                                className={`w-12 h-12 rounded-xl bg-gradient-to-br from-[#B490F5] to-[#9370DB] flex items-center justify-center`}
                            >
                                <stat.icon className='w-6 h-6 text-white' />
                            </div>
                            <Badge
                                className={`${stat.trend === 'up' ? 'bg-[#7FD99E]/20 text-[#4CAF50]' : 'bg-[#F44336]/20 text-[#F44336]'} border-0`}
                            >
                                {stat.change}
                            </Badge>
                        </div>
                        <p className='text-sm text-muted-foreground mb-1'>
                            {stat.label}
                        </p>
                        <p className='text-3xl font-bold text-foreground'>
                            {stat.value}
                        </p>
                    </Card>
                ))}
            </div>

            <div className='grid lg:grid-cols-2 gap-8 mb-8'>
                {/* Sales Chart */}
                <Card className='p-6 rounded-2xl'>
                    <h2 className='text-xl font-bold text-foreground mb-6'>
                        Sales Overview
                    </h2>
                    <ResponsiveContainer width='100%' height={300}>
                        <LineChart data={salesData}>
                            <CartesianGrid
                                strokeDasharray='3 3'
                                stroke='#e5e7eb'
                            />
                            <XAxis dataKey='month' stroke='#6B7280' />
                            <YAxis stroke='#6B7280' />
                            <Tooltip />
                            <Line
                                type='monotone'
                                dataKey='sales'
                                stroke='#5B9FD8'
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>

                {/* Orders Chart */}
                <Card className='p-6 rounded-2xl'>
                    <h2 className='text-xl font-bold text-foreground mb-6'>
                        Orders Trend
                    </h2>
                    <ResponsiveContainer width='100%' height={300}>
                        <BarChart data={salesData}>
                            <CartesianGrid
                                strokeDasharray='3 3'
                                stroke='#e5e7eb'
                            />
                            <XAxis dataKey='month' stroke='#6B7280' />
                            <YAxis stroke='#6B7280' />
                            <Tooltip />
                            <Bar
                                dataKey='orders'
                                fill='#FFB86F'
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className='grid lg:grid-cols-2 gap-8'>
                {/* Recent Orders */}
                <Card className='p-6 rounded-2xl'>
                    <h2 className='text-xl font-bold text-foreground mb-6'>
                        Recent Orders
                    </h2>
                    <div className='space-y-4'>
                        {recentOrders.map((order) => (
                            <div
                                key={order.id}
                                className='flex items-center justify-between p-4 rounded-xl bg-background hover:bg-background-alt transition-colors'
                            >
                                <div className='flex-1'>
                                    <div className='flex items-center space-x-2 mb-1'>
                                        <h4 className='font-semibold text-sm text-foreground'>
                                            {order.id}
                                        </h4>
                                        <Badge
                                            className={`${
                                                order.status === 'Completed'
                                                    ? 'bg-[#7FD99E]/20 text-[#4CAF50] border-[#7FD99E]'
                                                    : order.status ===
                                                        'Processing'
                                                      ? 'bg-[#FFB86F]/20 text-[#FF9A3D] border-[#FFB86F]'
                                                      : 'bg-[#5B9FD8]/20 text-[#5B9FD8] border-[#5B9FD8]'
                                            }`}
                                        >
                                            {order.status}
                                        </Badge>
                                    </div>
                                    <p className='text-xs text-muted-foreground'>
                                        {order.customer} • {order.product}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        {order.date}
                                    </p>
                                </div>
                                <p className='font-semibold text-foreground'>
                                    {order.amount}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Products */}
                <Card className='p-6 rounded-2xl'>
                    <h2 className='text-xl font-bold text-foreground mb-6'>
                        Top Products
                    </h2>
                    <div className='space-y-4'>
                        {topProducts.map((product, index) => (
                            <div
                                key={product.name}
                                className='flex items-center space-x-4'
                            >
                                <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-[#B490F5] to-[#9370DB] flex items-center justify-center'>
                                    <span className='text-white font-semibold text-sm'>
                                        {index + 1}
                                    </span>
                                </div>
                                <div className='flex-1'>
                                    <h4 className='font-semibold text-sm text-foreground'>
                                        {product.name}
                                    </h4>
                                    <p className='text-xs text-muted-foreground'>
                                        {product.sales} sales
                                    </p>
                                </div>
                                <p className='font-semibold text-foreground'>
                                    {product.revenue}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className='mt-8 grid md:grid-cols-4 gap-6'>
                <Card className='p-6 rounded-2xl'>
                    <Package className='w-8 h-8 text-[#5B9FD8] mb-3' />
                    <p className='text-2xl font-bold text-foreground mb-1'>
                        1,234
                    </p>
                    <p className='text-sm text-muted-foreground'>
                        Total Products
                    </p>
                </Card>
                <Card className='p-6 rounded-2xl'>
                    <Users className='w-8 h-8 text-[#FFB86F] mb-3' />
                    <p className='text-2xl font-bold text-foreground mb-1'>
                        892
                    </p>
                    <p className='text-sm text-muted-foreground'>
                        Active Customers
                    </p>
                </Card>
                <Card className='p-6 rounded-2xl'>
                    <TrendingUp className='w-8 h-8 text-[#7FD99E] mb-3' />
                    <p className='text-2xl font-bold text-foreground mb-1'>
                        $45.8K
                    </p>
                    <p className='text-sm text-muted-foreground'>
                        Monthly Revenue
                    </p>
                </Card>
                <Card className='p-6 rounded-2xl'>
                    <Calendar className='w-8 h-8 text-[#B490F5] mb-3' />
                    <p className='text-2xl font-bold text-foreground mb-1'>
                        156
                    </p>
                    <p className='text-sm text-muted-foreground'>
                        Pending Bookings
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
