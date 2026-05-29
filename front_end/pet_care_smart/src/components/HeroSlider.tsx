import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ArrowRight} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cmsMarketingApi, type Banner } from '@/lib/cmsMarketingApi';
import { productApi } from '@/lib/productApi';
import { bookingApi } from '@/lib/bookingApi';

type HeroSlide = {
    id: string;
    badge: string;
    title: string;
    highlight: string;
    description: string;
    image: string;
    gradient: string;
    cta: { label: string; path: string };
    ctaSecondary: { label: string; path: string };
};

const fallbackSlides: HeroSlide[] = [
    {
        id: 'default-products',
        badge: 'Chăm sóc vật nuôi tốt nhất',
        title: 'Tất cả những gì vật nuôi cần,',
        highlight: 'Có ngay tại đây',
        description: 'Thức ăn, thuốc, phụ kiện chất lượng cao. Giao hàng tận nơi, giá cả phải chăng, phù hợp với bà con nông dân.',
        image: 'https://images.unsplash.com/photo-1511024654425-72f2d89820be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGdvbGRlbiUyMHJldHJpZXZlciUyMHBsYXlpbmd8ZW58MXx8fHwxNzcwNzg5NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        gradient: 'from-[#448B3D]/15 via-[#FFB86F]/10 to-[#7FD99E]/15',
        cta: { label: 'Mua ngay', path: '/products' },
        ctaSecondary: { label: 'Đặt lịch khám', path: '/booking' }
    },
    {
        id: 'default-image-search',
        badge: 'Tìm sản phẩm dễ dàng',
        title: 'Chụp ảnh sản phẩm,',
        highlight: 'Tìm ngay trong giây lát',
        description: 'Không biết tên sản phẩm? Chỉ cần chụp ảnh, chúng tôi sẽ tìm sản phẩm phù hợp cho bạn ngay lập tức.',
        image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBwb3J0cmFpdCUyMGN1dGV8ZW58MXx8fHwxNzcwNzg5NjkyfDA&ixlib=rb-4.1.0&q=80&w=1080',
        gradient: 'from-[#7FD99E]/15 via-[#448B3D]/10 to-[#FFB86F]/15',
        cta: { label: 'Tìm theo ảnh', path: '/image-search' },
        ctaSecondary: { label: 'Xem sản phẩm', path: '/products' }
    },
    {
        id: 'default-booking',
        badge: 'Dịch vụ thú y tại nhà',
        title: 'Bác sĩ thú y đến tận nơi,',
        highlight: 'Tiện lợi & Tin cậy',
        description: 'Đặt lịch khám, tiêm phòng, tắm rửa cho vật nuôi ngay tại nhà. Bác sĩ có kinh nghiệm, giá cả hợp lý.',
        image: 'https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBleGFtaW5pbmclMjBwZXR8ZW58MXx8fHwxNzcwNzM3MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
        gradient: 'from-[#FFB86F]/15 via-[#448B3D]/10 to-[#7FD99E]/15',
        cta: { label: 'Đặt lịch ngay', path: '/booking' },
        ctaSecondary: { label: 'Gọi tư vấn', path: '/products' }
    }
];

const gradients = [
    'from-[#448B3D]/15 via-[#FFB86F]/10 to-[#7FD99E]/15',
    'from-[#7FD99E]/15 via-[#448B3D]/10 to-[#FFB86F]/15',
    'from-[#FFB86F]/15 via-[#448B3D]/10 to-[#7FD99E]/15'
];

function toHeroSlide(banner: Banner, index: number): HeroSlide {
    const [title, ...rest] = banner.title.split(',');
    return {
        id: banner.id,
        badge: banner.position || 'PetCare Smart',
        title: rest.length > 0 ? `${title},` : banner.title,
        highlight: rest.length > 0 ? rest.join(',').trim() : 'Khám phá ngay',
        description: banner.subtitle || 'Khám phá nội dung mới nhất từ PetCare Smart.',
        image: banner.imageUrl,
        gradient: gradients[index % gradients.length],
        cta: { label: 'Xem ngay', path: banner.linkUrl || '/products' },
        ctaSecondary: { label: 'Đặt lịch dịch vụ', path: '/booking' }
    };
}

const HeroSlider = () => {
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);
    const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
    const [stats, setStats] = useState([
        { value: '0', label: 'Sản phẩm' },
        { value: '0', label: 'Dịch vụ' },
        { value: '7:00-18:00', label: 'Tư vấn' }
    ]);

    useEffect(() => {
        let mounted = true;

        const loadHeroData = async () => {
            try {
                const [bannerRes, productRes, serviceRes] = await Promise.allSettled([
                    cmsMarketingApi.getPublicBanners('homepage'),
                    productApi.getAll(),
                    bookingApi.getServicePackages()
                ]);
                const banners = bannerRes.status === 'fulfilled'
                    ? (bannerRes.value.result ?? []).filter((banner) => banner.imageUrl)
                    : [];
                if (mounted && banners.length > 0) {
                    setSlides(banners.map(toHeroSlide));
                    setCurrent(0);
                }
                if (mounted) {
                    const productCount = productRes.status === 'fulfilled'
                        ? (productRes.value.result ?? []).filter((product) => product.status === 'ACTIVE').length
                        : 0;
                    const serviceCount = serviceRes.status === 'fulfilled'
                        ? (serviceRes.value.result ?? []).filter((service) => service.active).length
                        : 0;
                    setStats([
                        { value: productCount.toLocaleString('vi-VN'), label: 'Sản phẩm' },
                        { value: serviceCount.toLocaleString('vi-VN'), label: 'Dịch vụ' },
                        { value: '7:00-18:00', label: 'Tư vấn' }
                    ]);
                }
            } catch (error) {
                console.error('Error loading hero data:', error);
            }
        };

        void loadHeroData();
        return () => {
            mounted = false;
        };
    }, []);

    const next = useCallback(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    const prev = useCallback(() => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const timer = setInterval(next, 5000);
        return () => clearInterval(timer);
    }, [next]);

    const slide = slides[current] ?? fallbackSlides[0];

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })
    };

    return (
        <section className='relative overflow-hidden min-h-[420px] sm:min-h-[520px] lg:min-h-[680px]'>
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

            <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-28'>
                <div className='grid lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
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
                                className='inline-flex items-center space-x-2 bg-white/80 dark:bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-[#448B3D]/20'
                            >
                                <span className='text-sm font-medium text-[#448B3D]'>{slide.badge}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className='text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight'
                            >
                                {slide.title}{' '}
                                <span className='bg-gradient-to-r from-[#448B3D] to-[#FFB86F] bg-clip-text text-transparent'>
                                    {slide.highlight}
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className='text-base sm:text-lg text-muted-foreground max-w-xl'
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
                                    className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white px-8 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all'
                                >
                                    {slide.cta.label}
                                    <ArrowRight className='ml-2 w-5 h-5' />
                                </Button>
                                <Button
                                    size='lg'
                                    variant='outline'
                                    onClick={() => navigate(slide.ctaSecondary.path)}
                                    className='rounded-xl border-2 border-[#448B3D] text-[#448B3D] hover:bg-[#448B3D] hover:text-white px-8'
                                >
                                    {slide.ctaSecondary.label}
                                </Button>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.45 }}
                                className='flex items-center space-x-4 sm:space-x-8 pt-2 sm:pt-4'
                            >
                                {stats.map((stat, i) => (
                                    <div key={i} className='flex items-center space-x-4'>
                                        {i > 0 && <div className='w-px h-12 bg-border' />}
                                        <div className='text-center'>
                                            <div className='text-xl sm:text-3xl font-bold text-foreground'>{stat.value}</div>
                                            <div className='text-xs sm:text-sm text-muted-foreground'>{stat.label}</div>
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
                            className='relative hidden lg:block'
                        >
                            <div className='absolute inset-0 bg-gradient-to-br from-[#448B3D] to-[#FFB86F] rounded-3xl blur-3xl opacity-20' />
                            <img
                                src={slide.image}
                                alt='Hero'
                                className='relative rounded-3xl shadow-2xl w-full h-[380px] lg:h-[480px] object-cover'
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
                            className={`transition-all duration-300 rounded-full ${i === current
                                ? 'w-8 h-3 bg-[#448B3D]'
                                : 'w-3 h-3 bg-[#448B3D]/30 hover:bg-[#448B3D]/60'
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
