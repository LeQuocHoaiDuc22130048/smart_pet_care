import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Heart, ShoppingBag, Phone, Star, MessageSquarePlus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, useEffect } from 'react';
import HeroSlider from '@/components/HeroSlider';
import FeaturedProductsSlider from '@/components/FeaturedProductsSlider';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import { useFeedback, type Feedback } from '@/context/FeedbackContext';
import { feedbackApi } from '@/lib/feedbackApi';
import { useAuth } from '@/context/AuthContext';
import { bookingApi, categoryIcon, formatPrice, type ServicePackage } from '@/lib/bookingApi';

const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
};

const Homepage = () => {
    const navigate = useNavigate();
    const { avgRating } = useFeedback();
    const { user } = useAuth();

    // Local state for homepage feedbacks
    const [homepageFeedbacks, setHomepageFeedbacks] = useState<Feedback[]>([]);
    const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);
    const [services, setServices] = useState<ServicePackage[]>([]);
    const [loadingHomepageData, setLoadingHomepageData] = useState(true);

    // Slider state cho feedback
    const [fbIndex, setFbIndex] = useState(0);
    const [fbDir, setFbDir] = useState(1);

    // Load user's feedbacks for homepage display
    useEffect(() => {
        const loadFeedbacks = async () => {
            if (!user) {
                setHomepageFeedbacks([]);
                return;
            }

            try {
                setLoadingFeedbacks(true);
                const response = await feedbackApi.getMyFeedbacks(0, 10);
                const apiFeedbacks = response.result.content.map((apiFb): Feedback => ({
                    id: apiFb.id,
                    type: apiFb.type === 'PRODUCT' ? 'product' : apiFb.type === 'ORDER' ? 'service' : 'general',
                    rating: apiFb.rating,
                    title: '',
                    content: apiFb.comment,
                    authorName: apiFb.username,
                    date: new Date(apiFb.createdAt).toLocaleDateString('vi-VN'),
                    productId: apiFb.productId,
                    serviceId: apiFb.orderId,
                    helpful: apiFb.helpfulCount,
                    verified: apiFb.verifiedPurchase,
                    imageUrls: apiFb.imageUrls,
                    status: apiFb.status,
                    adminResponse: apiFb.adminResponse,
                }));
                setHomepageFeedbacks(apiFeedbacks);
            } catch (error) {
                console.error('Error loading homepage feedbacks:', error);
                setHomepageFeedbacks([]);
            } finally {
                setLoadingFeedbacks(false);
            }
        };

        loadFeedbacks();
    }, [user]);

    const nextFb = useCallback(() => {
        setFbDir(1);
        setFbIndex(i => (i + 1) % Math.max(1, homepageFeedbacks.length));
    }, [homepageFeedbacks.length]);

    useEffect(() => {
        if (homepageFeedbacks.length === 0) return;
        const t = setInterval(nextFb, 5000);
        return () => clearInterval(t);
    }, [nextFb, homepageFeedbacks.length]);

    useEffect(() => {
        let mounted = true;

        const loadHomepageData = async () => {
            setLoadingHomepageData(true);
            try {
                const servicesRes = await bookingApi.getServicePackages();

                if (!mounted) return;

                const apiServices = servicesRes.result ?? [];
                setServices(apiServices.filter((service) => service.active).slice(0, 3));
            } catch (error) {
                console.error('Error loading homepage data:', error);
                setServices([]);
            } finally {
                if (mounted) setLoadingHomepageData(false);
            }
        };

        void loadHomepageData();
        return () => {
            mounted = false;
        };
    }, []);

    const features = [
        {
            icon: '✅',
            title: 'Hàng chính hãng',
            description: 'Tất cả sản phẩm đều có nguồn gốc rõ ràng, an toàn cho vật nuôi của bạn',
            bg: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800'
        },
        {
            icon: '🚚',
            title: 'Giao hàng tận nơi',
            description: 'Giao hàng đến tận nhà, kể cả vùng nông thôn. Miễn phí đơn từ 500.000đ',
            bg: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800'
        },
        {
            icon: '💰',
            title: 'Giá cả phải chăng',
            description: 'Giá tốt nhất thị trường, nhiều chương trình khuyến mãi cho bà con',
            bg: 'bg-yellow-50 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-800'
        },
        {
            icon: '📞',
            title: 'Tư vấn miễn phí',
            description: 'Gọi ngay (84) 702 500 551 để được tư vấn chọn sản phẩm phù hợp',
            bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
        }
    ];

    return (
        <div className='min-h-screen'>
            <HeroSlider />

            {/* Lý do chọn chúng tôi */}
            <section className='py-8 sm:py-14 bg-background'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div {...fadeInUp} className='text-center mb-10'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-3'>
                            Tại sao bà con tin chọn PetCare?
                        </h2>
                        <p className='text-lg text-muted-foreground'>
                            Chúng tôi hiểu nhu cầu của người chăn nuôi Việt Nam
                        </p>
                    </motion.div>
                    <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-5'>
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                            >
                                <Card className={`p-5 rounded-xl border-2 ${f.bg} h-full`}>
                                    <div className='text-4xl mb-3'>{f.icon}</div>
                                    <h3 className='font-bold text-lg text-foreground mb-2'>{f.title}</h3>
                                    <p className='text-base text-muted-foreground leading-relaxed'>{f.description}</p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sản phẩm nổi bật */}
            <FeaturedProductsSlider />

            {/* Dịch vụ */}
            <section className='py-8 sm:py-14 bg-background'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div {...fadeInUp} className='text-center mb-10'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-3'>
                            Dịch vụ thú y tại nhà
                        </h2>
                        <p className='text-lg text-muted-foreground'>
                            Bác sĩ đến tận nơi — Không cần đi xa
                        </p>
                    </motion.div>
                    {loadingHomepageData ? (
                        <div className='py-12 text-center text-muted-foreground'>Đang tải dịch vụ...</div>
                    ) : services.length === 0 ? (
                        <div className='py-12 text-center text-muted-foreground'>Chưa có gói dịch vụ đang hoạt động</div>
                    ) : (
                    <div className='grid md:grid-cols-3 gap-6'>
                        {services.map((svc, i) => (
                            <motion.div
                                key={svc.id}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                            >
                                <Card className='p-7 rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-lg transition-all duration-300 text-center h-full flex flex-col'>
                                    <div className='text-6xl mb-4'>{categoryIcon(svc.category)}</div>
                                    <h3 className='text-xl font-bold text-foreground mb-2'>{svc.name}</h3>
                                    <p className='text-base text-muted-foreground mb-4 flex-1 leading-relaxed'>{svc.description}</p>
                                    <div className='text-2xl font-bold text-[#448B3D] mb-4'>Từ {formatPrice(svc.price)}</div>
                                    <Button
                                        onClick={() => navigate('/booking')}
                                        className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-12 text-base'
                                    >
                                        <Calendar className='mr-2 w-5 h-5' />
                                        Đặt lịch ngay
                                    </Button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                    )}
                </div>
            </section>

            {/* ── Feedback tổng thể ── */}
            <section className='py-8 sm:py-14 bg-muted/30'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div {...fadeInUp} className='text-center mb-10'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-3'>
                            ⭐ Bà con nói gì về PetCare?
                        </h2>
                        <p className='text-lg text-muted-foreground'>
                            Hàng nghìn hộ gia đình đã tin dùng — Đây là chia sẻ của họ
                        </p>
                    </motion.div>

                    <div className='grid lg:grid-cols-3 gap-8 items-start'>
                        {/* Cột trái — Stats + nút viết đánh giá */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className='space-y-5'
                        >
                            {/* Rating tổng */}
                            <Card className='p-6 rounded-2xl border-2 border-[#448B3D]/20 bg-[#448B3D]/5 text-center'>
                                <div className='text-6xl font-bold text-[#448B3D] mb-1'>
                                    {avgRating(homepageFeedbacks).toFixed(1)}
                                </div>
                                <div className='flex justify-center gap-1 mb-2'>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating(homepageFeedbacks)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className='text-sm text-muted-foreground'>
                                    {user ? `${homepageFeedbacks.length} đánh giá của bạn` : 'Đăng nhập để xem đánh giá'}
                                </p>

                                {/* Bar chart nhỏ */}
                                {user && homepageFeedbacks.length > 0 && (
                                    <div className='mt-4 space-y-1.5'>
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = homepageFeedbacks.filter(f => f.rating === star).length;
                                            const pct = homepageFeedbacks.length === 0 ? 0 : Math.round(count / homepageFeedbacks.length * 100);
                                            return (
                                                <div key={star} className='flex items-center gap-2 text-xs'>
                                                    <span className='w-3 text-muted-foreground text-right'>{star}</span>
                                                    <Star className='w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0' />
                                                    <div className='flex-1 h-1.5 bg-muted rounded-full overflow-hidden'>
                                                        <div className='h-full bg-yellow-400 rounded-full' style={{ width: `${pct}%` }} />
                                                    </div>
                                                    <span className='w-5 text-muted-foreground'>{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>

                            {/* Nút viết đánh giá */}
                            <Button
                                onClick={() => navigate('/products')}
                                className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-12 gap-2'
                            >
                                <MessageSquarePlus className='w-5 h-5' />
                                Viết đánh giá sản phẩm
                            </Button>

                            <Card className='p-4 rounded-2xl border-2 border-[#448B3D]/20 bg-muted/50'>
                                <p className='text-sm text-muted-foreground text-center'>
                                    💡 Để viết đánh giá, vui lòng truy cập trang sản phẩm hoặc dịch vụ cụ thể
                                </p>
                            </Card>

                            <Button
                                variant='outline'
                                onClick={() => navigate('/feedback')}
                                className='w-full rounded-xl border-2 h-11 gap-2'
                            >
                                Xem tất cả đánh giá
                                <ArrowRight className='w-4 h-4' />
                            </Button>
                        </motion.div>

                        {/* Cột phải — Slider feedback */}
                        <div className='lg:col-span-2'>
                            {loadingFeedbacks ? (
                                <div className='text-center py-12 text-muted-foreground'>
                                    <p className='text-4xl mb-3'>⏳</p>
                                    <p>Đang tải đánh giá...</p>
                                </div>
                            ) : !user ? (
                                <div className='text-center py-12 text-muted-foreground'>
                                    <p className='text-4xl mb-3'>🔒</p>
                                    <p className='mb-4'>Đăng nhập để xem đánh giá của bạn</p>
                                    <Button
                                        onClick={() => navigate('/login')}
                                        className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold'
                                    >
                                        Đăng nhập ngay
                                    </Button>
                                </div>
                            ) : homepageFeedbacks.length === 0 ? (
                                <div className='text-center py-12 text-muted-foreground'>
                                    <p className='text-4xl mb-3'>💬</p>
                                    <p className='mb-4'>Bạn chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                                    <Button
                                        onClick={() => navigate('/products')}
                                        className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold'
                                    >
                                        Mua sắm và đánh giá
                                    </Button>
                                </div>
                            ) : (
                                <div className='space-y-4'>
                                    {/* Featured feedback — animated */}
                                    <div className='relative overflow-hidden'>
                                        <AnimatePresence mode='wait' custom={fbDir}>
                                            <motion.div
                                                key={fbIndex}
                                                custom={fbDir}
                                                variants={{
                                                    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
                                                    center: { x: 0, opacity: 1 },
                                                    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
                                                }}
                                                initial='enter'
                                                animate='center'
                                                exit='exit'
                                                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                            >
                                                <FeedbackCard feedback={homepageFeedbacks[fbIndex % homepageFeedbacks.length]} />
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Dots */}
                                        <div className='flex justify-center gap-1.5 mt-3'>
                                            {homepageFeedbacks.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setFbDir(i > fbIndex ? 1 : -1); setFbIndex(i); }}
                                                    className={`!size-2.5 !min-h-0 !p-0 aspect-square rounded-full transition-all duration-300 ${i === fbIndex ? 'bg-[#448B3D]' : 'bg-[#448B3D]/30 hover:bg-[#448B3D]/60'}`}
                                                    aria-label={`Xem đánh giá ${i + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2 feedback tiếp theo dạng grid */}
                                    {homepageFeedbacks.length > 1 && (
                                        <div className='grid sm:grid-cols-2 gap-4 mt-2'>
                                            {homepageFeedbacks
                                                .filter((_, i) => i !== fbIndex % homepageFeedbacks.length)
                                                .slice(0, 2)
                                                .map(fb => (
                                                    <FeedbackCard key={fb.id} feedback={fb} />
                                                ))
                                            }
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Liên hệ nhanh */}
            <section className='py-8 sm:py-14 bg-[#448B3D]'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                    <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    >
                        <Heart className='w-14 h-14 text-white mx-auto mb-5' />
                    </motion.div>
                    <h2 className='text-3xl sm:text-4xl font-bold text-white mb-4'>
                        Cần tư vấn? Gọi ngay cho chúng tôi!
                    </h2>
                    <p className='text-xl text-white/90 mb-8'>
                        Đội ngũ tư vấn sẵn sàng hỗ trợ bà con từ 7:00 – 18:00 hàng ngày
                    </p>

                    {/* Số điện thoại nổi bật */}
                    <a
                        href='tel:+84702500551'
                        className='inline-flex items-center gap-3 bg-white/95 text-[#448B3D] rounded-xl px-8 py-4 text-2xl font-bold hover:bg-white transition-colors shadow-lg mb-6'
                    >
                        <Phone className='w-7 h-7' />
                        (84) 702 500 551
                    </a>

                    <div className='flex flex-col sm:flex-row gap-4 justify-center mt-4'>
                        <Button
                            size='lg'
                            onClick={() => navigate('/products')}
                            className='rounded-xl bg-white/95 text-[#448B3D] hover:bg-white font-bold h-13 px-8 text-lg shadow-lg'
                        >
                            <ShoppingBag className='mr-2 w-5 h-5' />
                            Mua sắm ngay
                        </Button>
                        <Button
                            size='lg'
                            onClick={() => navigate('/booking')}
                            className='rounded-xl bg-white/95 text-[#448B3D] hover:bg-white font-bold h-13 px-8 text-lg shadow-lg'
                        >
                            <Calendar className='mr-2 w-5 h-5' />
                            Đặt lịch dịch vụ
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Homepage;
