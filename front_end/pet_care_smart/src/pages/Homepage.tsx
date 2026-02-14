import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    ArrowRight,
    Calendar,
    Heart,
    ImageIcon,
    Shield,
    ShoppingBag,
    Sparkles,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Homepage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Sparkles className='w-6 h-6' />,
            title: 'AI Recommendations',
            description:
                "Get personalized product suggestions based on your pet's needs",
            color: 'from-[#B490F5] to-[#9370DB]'
        },
        {
            icon: <ImageIcon className='w-6 h-6' />,
            title: 'AI Image Search',
            description: 'Upload a photo to find similar products instantly',
            color: 'from-[#FFB86F] to-[#FF9A3D]'
        },
        {
            icon: <Shield className='w-6 h-6' />,
            title: 'Quality Guaranteed',
            description: 'All products are verified and safe for your pets',
            color: 'from-[#7FD99E] to-[#4CAF50]'
        },
        {
            icon: <Zap className='w-6 h-6' />,
            title: 'Fast Delivery',
            description: 'Free shipping on orders over $50',
            color: 'from-[#5B9FD8] to-[#3D7BA8]'
        }
    ];

    const categories = [
        {
            name: 'Premium Food',
            image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
            count: '500+ Products'
        },
        {
            name: 'Toys & Fun',
            image: 'https://images.unsplash.com/photo-1744608257939-1ecbd90f1320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3lzJTIwY29sb3JmdWx8ZW58MXx8fHwxNzcwNzYxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
            count: '300+ Products'
        },
        {
            name: 'Health Care',
            image: 'https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBleGFtaW5pbmclMjBwZXR8ZW58MXx8fHwxNzcwNzM3MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
            count: 'Book Services'
        }
    ];

    const services = [
        {
            icon: '🛁',
            title: 'Pet Spa',
            description: 'Premium grooming and spa treatments',
            price: '$49.99'
        },
        {
            icon: '💉',
            title: 'Vaccination',
            description: 'Complete vaccination packages',
            price: '$79.99'
        },
        {
            icon: '🏥',
            title: 'Health Checkup',
            description: 'Comprehensive health examination',
            price: '$99.99'
        }
    ];

    return (
        <div className='min-h-screen'>
            {/* Hero Section */}
            <section className='relative bg-gradient-to-br from-[#5B9FD8]/10 via-[#FFB86F]/10 to-[#B490F5]/10 overflow-hidden'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32'>
                    <div className='grid lg:grid-cols-2 gap-12 items-center'>
                        <div className='space-y-8'>
                            <div className='inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[#5B9FD8]/20'>
                                <Sparkles className='w-4 h-4 text-[#5B9FD8]' />
                                <span className='text-sm font-medium text-[#5B9FD8]'>
                                    AI-Powered Pet Care
                                </span>
                            </div>

                            <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight'>
                                Everything Your Pet Needs,{' '}
                                <span className='bg-gradient-to-r from-[#5B9FD8] to-[#FFB86F] bg-clip-text text-transparent'>
                                    All in One Place
                                </span>
                            </h1>

                            <p className='text-lg text-muted-foreground max-w-xl'>
                                Discover premium products, expert services, and
                                AI-powered recommendations tailored for your
                                furry friends.
                            </p>

                            <div className='flex flex-col sm:flex-row gap-4'>
                                <Button
                                    size='lg'
                                    onClick={() => navigate('/products')}
                                    className='rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all'
                                >
                                    Shop Now{' '}
                                    <ArrowRight className='ml-2 w-5 h-5' />
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    onClick={() => navigate('/booking')}
                                    className='rounded-xl border-2 border-[#5B9FD8] text-[#5B9FD8] hover:bg-[#5B9FD8] hover:text-white px-8'
                                >
                                    <Calendar className='mr-2 w-5 h-5' />
                                    Book Service
                                </Button>
                            </div>

                            <div className='flex items-center space-x-8 pt-4'>
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-foreground'>
                                        50K+
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                        Happy Pets
                                    </div>
                                </div>
                                <div className='w-px h-12 bg-border'></div>
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-foreground'>
                                        1000+
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                        Products
                                    </div>
                                </div>
                                <div className='w-px h-12 bg-border'></div>
                                <div className='text-center'>
                                    <div className='text-3xl font-bold text-foreground'>
                                        24/7
                                    </div>
                                    <div className='text-sm text-muted-foreground'>
                                        Support
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-br from-[#5B9FD8] to-[#FFB86F] rounded-3xl blur-3xl opacity-20'></div>
                            <img
                                src='https://images.unsplash.com/photo-1511024654425-72f2d89820be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGdvbGRlbiUyMHJldHJpZXZlciUyMHBsYXlpbmd8ZW58MXx8fHwxNzcwNzg5NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080'
                                alt='Happy Pet'
                                className='relative rounded-3xl shadow-2xl w-full h-[500px] object-cover'
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className='py-20 bg-background'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='text-center mb-16'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>
                            Why Choose PetCare?
                        </h2>
                        <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                            Experience the future of pet care with our
                            AI-powered platform
                        </p>
                    </div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {features.map((feature, index) => (
                            <Card
                                key={index}
                                className='p-6 rounded-2xl border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white'
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}
                                >
                                    {feature.icon}
                                </div>
                                <h3 className='font-semibold text-foreground mb-2'>
                                    {feature.title}
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className='py-20 bg-background-alt'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='text-center mb-16'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>
                            Shop by Category
                        </h2>
                        <p className='text-lg text-muted-foreground'>
                            Find exactly what your pet needs
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-8'>
                        {categories.map((category, index) => (
                            <Card
                                key={index}
                                className='group cursor-pointer overflow-hidden rounded-2xl border-border hover:shadow-xl transition-all duration-300 bg-white'
                                onClick={() => navigate('/products')}
                            >
                                <div className='relative h-64 overflow-hidden'>
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className='w-full h-full object-center group-hover:scale-110 transition-transform duration-500'
                                    />
                                    <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent'></div>
                                    <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                                        <h3 className='text-2xl font-bold mb-1'>
                                            {category.name}
                                        </h3>
                                        <p className='text-white/90'>
                                            {category.count}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className='text-center mt-12'>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={() => navigate('/products')}
                            className='rounded-xl border-2 px-8'
                        >
                            <ShoppingBag className='mr-2 w-5 h-5' />
                            View All Products
                        </Button>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className='py-20 bg-background'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='text-center mb-16'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>
                            Professional Pet Services
                        </h2>
                        <p className='text-lg text-muted-foreground'>
                            Expert care for your beloved pets
                        </p>
                    </div>

                    <div className='grid md:grid-cols-3 gap-8'>
                        {services.map((service, index) => (
                            <Card
                                key={index}
                                className='p-8 rounded-2xl border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white text-center'
                            >
                                <div className='text-6xl mb-4'>
                                    {service.icon}
                                </div>
                                <h3 className='text-xl font-semibold text-foreground mb-2'>
                                    {service.title}
                                </h3>
                                <p className='text-muted-foreground mb-4'>
                                    {service.description}
                                </p>
                                <div className='text-2xl font-bold text-[#5B9FD8] mb-4'>
                                    {service.price}
                                </div>
                                <Button
                                    onClick={() => navigate('/booking')}
                                    className='w-full rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                                >
                                    Book Now
                                </Button>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className='py-20 bg-gradient-to-br from-[#5B9FD8] to-[#3D7BA8]'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                    <Heart className='w-16 h-16 text-white mx-auto mb-6' />
                    <h2 className='text-3xl sm:text-4xl font-bold text-white mb-6'>
                        Ready to Give Your Pet the Best?
                    </h2>
                    <p className='text-xl text-white/90 mb-8'>
                        Join thousands of happy pet parents who trust PetCare
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Button
                            size='lg'
                            onClick={() => navigate('/products')}
                            className='rounded-xl bg-white text-[#5B9FD8] hover:bg-gray-100 px-8 shadow-lg'
                        >
                            Start Shopping
                        </Button>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={() => navigate('/image-search')}
                            className='rounded-xl bg-white text-[#5B9FD8] hover:bg-gray-100 px-8 shadow-lg'
                        >
                            <ImageIcon className='mr-2 w-5 h-5' />
                            Try AI Search
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Homepage;
