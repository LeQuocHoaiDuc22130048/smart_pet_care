import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        id: 1,
        badge: '🐾 AI-Powered Pet Care',
        title: 'Everything Your Pet Needs,',
        highlight: 'All in One Place',
        description:
            'Discover premium products, expert services, and AI-powered recommendations tailored for your furry friends.',
        image: 'https://images.unsplash.com/photo-1511024654425-72f2d89820be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGdvbGRlbiUyMHJldHJpZXZlciUyMHBsYXlpbmd8ZW58MXx8fHwxNzcwNzg5NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        gradient: 'from-[#5B9FD8]/15 via-[#FFB86F]/10 to-[#B490F5]/15',
        cta: { label: 'Shop Now', path: '/products' },
        ctaSecondary: { label: 'Book Service', path: '/booking' }
    },
    {
        id: 2,
        badge: '✨ AI Image Search',
        title: 'Find Products with',
        highlight: 'Just a Photo',
        description:
            'Upload a photo of any pet product and our AI will instantly find the best matches for you.',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBwb3J0cmFpdCUyMGN1dGV8ZW58MXx8fHwxNzcwNzg5NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        gradient: 'from-[#B490F5]/15 via-[#5B9FD8]/10 to-[#FFB86F]/15',
        cta: { label: 'Try AI Search', path: '/image-search' },
        ctaSecondary: { label: 'View Products', path: '/products' }
    },
    {
        id: 3,
        badge: '🏥 Professional Services',
        title: 'Expert Care for',
        highlight: 'Your Beloved Pets',
        description:
            'From grooming to health checkups, our certified professionals provide top-tier care for your pets.',
        image: 'https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBleGFtaW5pbmclMjBwZXR8ZW58MXx8fHwxNzcwNzM3MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        gradient: 'from-[#7FD99E]/15 via-[#5B9FD8]/10 to-[#B490F5]/15',
        cta: { label: 'Book Now', path: '/booking' },
        ctaSecondary: { label: 'Learn More', path: '/products' }
    }
];

const HeroSlider = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    const next = useCallback(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
    }, []);

    const prev = useCallback(() => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const slide = slides[current];

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })
    };

    return (
        <section className='relative overflow-hidden min-h-[600px] lg:min-h-[700px]'>
            {/* Background gradient */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={`bg-${current}`}
                    className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6 }}
                />
            </AnimatePresence>

            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28'>
                <div className='grid lg:grid-cols-2 gap-12 items-center'>
                    {/* Text content */}
                    <AnimatePresence mode='wait' custom={direction}>
                        <motion.div
                            key={`text-${current}`}
                            custom={direction}
                            variants={variants}
                            initial='enter'
                            animate='center'
                            exit='exit'
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            className='space-y-8'
                        >
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className='inline-flex items-center space-x-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#5B9FD8]/20'
                            >
                                <span className='text-sm font-medium text-[#5B9FD8]'>{slide.badge}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className='text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight'
                            >
                                {slide.title}{' '}
                                <span className='bg-gradient-to-r from-[#5B9FD8] to-[#FFB86F] bg-clip-text text-transparent'>
                                    {slide.highlight}
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className='text-lg text-muted-foreground max-w-xl'
                            >
                                {slide.description}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className='flex flex-col sm:flex-row gap-4'
                            >
                                <Button
                                    size='lg'
                                    onClick={() => navigate(slide.cta.path)}
                                    className='rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all'
                                >
                                    {slide.cta.label}
                                    <ArrowRight className='ml-2 w-5 h-5' />
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    onClick={() => navigate(slide.ctaSecondary.path)}
                                    className='rounded-xl border-2 border-[#5B9FD8] text-[#5B9FD8] hover:bg-[#5B9FD8] hover:text-white px-8'
                                >
                                    <Calendar className='mr-2 w-5 h-5' />
                                    {slide.ctaSecondary.label}
                                </Button>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className='flex items-center space-x-8 pt-4'
                            >
                                {[
                                    { value: '50K+', label: 'Happy Pets' },
                                    { value: '1000+', label: 'Products' },
                                    { value: '24/7', label: 'Support' }
                                ].map((stat, i) => (
                                    <div key={i} className='flex items-center space-x-4'>
                                        {i > 0 && <div className='w-px h-12 bg-border' />}
                                        <div className='text-center'>
                                            <div className='text-3xl font-bold text-foreground'>{stat.value}</div>
                                            <div className='text-sm text-muted-foreground'>{stat.label}</div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Image */}
                    <AnimatePresence mode='wait' custom={direction}>
                        <motion.div
                            key={`img-${current}`}
                            custom={direction}
                            variants={variants}
                            initial='enter'
                            animate='center'
                            exit='exit'
                            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                            className='relative'
                        >
                            <div className='absolute inset-0 bg-gradient-to-br from-[#5B9FD8] to-[#FFB86F] rounded-3xl blur-3xl opacity-20' />
                            <img
                                src={slide.image}
                                alt='Hero'
                                className='relative rounded-3xl shadow-2xl w-full h-[480px] object-cover'
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Controls */}
            <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4'>
                <button
                    onClick={prev}
                    className='w-10 h-10 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-white dark:hover:bg-white/20 transition-all shadow-md'
                    aria-label='Previous slide'
                >
                    <ChevronLeft className='w-5 h-5' />
                </button>

                <div className='flex items-center space-x-2'>
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                            className={`transition-all duration-300 rounded-full ${
                                i === current
                                    ? 'w-8 h-3 bg-[#5B9FD8]'
                                    : 'w-3 h-3 bg-[#5B9FD8]/30 hover:bg-[#5B9FD8]/60'
                            }`}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>

                <button
                    onClick={next}
                    className='w-10 h-10 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-sm border border-border flex items-center justify-center hover:bg-white dark:hover:bg-white/20 transition-all shadow-md'
                    aria-label='Next slide'
                >
                    <ChevronRight className='w-5 h-5' />
                </button>
            </div>
        </section>
    );
};

export default HeroSlider;
