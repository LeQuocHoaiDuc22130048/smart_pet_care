import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Calendar,
    Heart,
    ImageIcon,
    Shield,
    ShoppingBag,
    Sparkles,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import HeroSlider from '@/components/HeroSlider';
import FeaturedProductsSlider from '@/components/FeaturedProductsSlider';
import TestimonialsSlider from '@/components/TestimonialsSlider';

const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
};

const Homepage = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Sparkles className='w-6 h-6' />,
            title: 'AI Recommendations',
            description: "Get personalized product suggestions based on your pet's needs",
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
            {/* Hero Slider */}
            <HeroSlider />

            {/* Features Section */}
            <section className='py-20 bg-background'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div {...fadeInUp} className='text-center mb-16'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>
                            Why Choose PetCare?
                        </h2>
                        <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
                            Experience the future of pet care with our AI-powered platform
                        </p>
                    </motion.div>

                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <Card className='p-6 rounded-2xl border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card h-full'>
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className='font-semibold text-foreground mb-2'>{feature.title}</h3>
                                    <p className='text-sm text-muted-foreground'>{feature.description}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products Slider */}
            <FeaturedProductsSlider />

            {/* Categories Section */}
            <section className='py-20 bg-muted/30'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div {...fadeInUp} className='text-center mb-16'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>
                            Shop by Category
                        </h2>
                        <p className='text-lg text-muted-foreground'>Find exactly what your pet needs</p>
                    </motion.div>

                    <div className='grid md:grid-cols-3 gap-8'>
                        {categories.map((category, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12, duration: 0.5 }}
                            >
                                <Card
                                    className='group cursor-pointer overflow-hidden rounded-2xl border-border hover:shadow-xl transition-all duration-300 bg-card'
                                    onClick={() => navigate('/products')}
                                >
                                    <div className='relative h-64 overflow-hidden'>
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500'
                                        />
                                        <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />
                                        <div className='absolute bottom-0 left-0 right-0 p-6 text-white'>
                                            <h3 className='text-2xl font-bold mb-1'>{category.name}</h3>
                                            <p className='text-white/90'>{category.count}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div {...fadeInUp} className='text-center mt-12'>
                        <Button
                            size='lg'
                            variant='outline'
                            onClick={() => navigate('/products')}
                            className='rounded-xl border-2 px-8'
                        >
                            <ShoppingBag className='mr-2 w-5 h-5' />
                            View All Products
                        </Button>
                    </motion.div>
                </div>
            </section>

            {/* Services Section */}
            <section className='py-20 bg-background'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div {...fadeInUp} className='text-center mb-16'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>
                            Professional Pet Services
                        </h2>
                        <p className='text-lg text-muted-foreground'>Expert care for your beloved pets</p>
                    </motion.div>

                    <div className='grid md:grid-cols-3 gap-8'>
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12, duration: 0.5 }}
                                whileHover={{ y: -4 }}
                            >
                                <Card className='p-8 rounded-2xl border-border hover:shadow-xl transition-shadow duration-300 bg-card text-center h-full flex flex-col'>
                                    <div className='text-6xl mb-4'>{service.icon}</div>
                                    <h3 className='text-xl font-semibold text-foreground mb-2'>{service.title}</h3>
                                    <p className='text-muted-foreground mb-4 flex-1'>{service.description}</p>
                                    <div className='text-2xl font-bold text-[#5B9FD8] mb-4'>{service.price}</div>
                                    <Button
                                        onClick={() => navigate('/booking')}
                                        className='w-full rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                                    >
                                        <Calendar className='mr-2 w-4 h-4' />
                                        Book Now
                                    </Button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Slider */}
            <TestimonialsSlider />

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className='py-20 bg-gradient-to-br from-[#5B9FD8] to-[#3D7BA8]'
            >
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        <Heart className='w-16 h-16 text-white mx-auto mb-6' />
                    </motion.div>
                    <motion.h2
                        {...fadeInUp}
                        className='text-3xl sm:text-4xl font-bold text-white mb-6'
                    >
                        Ready to Give Your Pet the Best?
                    </motion.h2>
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
            </motion.section>
        </div>
    );
};

export default Homepage;
