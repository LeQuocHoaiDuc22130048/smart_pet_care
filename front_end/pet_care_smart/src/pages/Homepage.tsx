import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, Heart, ShoppingBag, Phone, ChevronRight, Star, MessageSquarePlus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useCallback, useEffect } from 'react';
import HeroSlider from '@/components/HeroSlider';
import FeaturedProductsSlider from '@/components/FeaturedProductsSlider';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import { useFeedback } from '@/context/FeedbackContext';

const fadeInUp = {
    initial: { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 }
};

const Homepage = () => {
    const navigate = useNavigate();
    const { getGeneral, avgRating, feedbacks } = useFeedback();

    // Slider state cho feedback
    const generalFeedbacks = getGeneral();
    const [fbIndex, setFbIndex] = useState(0);
    const [fbDir, setFbDir] = useState(1);
    const [showFbForm, setShowFbForm] = useState(false);

    const nextFb = useCallback(() => {
        setFbDir(1);
        setFbIndex(i => (i + 1) % Math.max(1, generalFeedbacks.length));
    }, [generalFeedbacks.length]);

    useEffect(() => {
        const t = setInterval(nextFb, 5000);
        return () => clearInterval(t);
    }, [nextFb]);

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

    const categories = [
        {
            name: 'Thức ăn',
            desc: 'Thức ăn cho chó, mèo, gia súc',
            image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080',
            count: '500+ sản phẩm'
        },
        {
            name: 'Đồ chơi & Phụ kiện',
            desc: 'Vòng cổ, dây dắt, đồ chơi',
            image: 'https://images.unsplash.com/photo-1744608257939-1ecbd90f1320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3lzJTIwY29sb3JmdWx8ZW58MXx8fHwxNzcwNzYxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
            count: '300+ sản phẩm'
        },
        {
            name: 'Thuốc & Sức khỏe',
            desc: 'Thuốc, vitamin, tiêm phòng',
            image: 'https://images.unsplash.com/photo-1625321171045-1fea4ac688e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZXRlcmluYXJpYW4lMjBleGFtaW5pbmclMjBwZXR8ZW58MXx8fHwxNzcwNzM3MjE3fDA&ixlib=rb-4.1.0&q=80&w=1080',
            count: 'Đặt lịch ngay'
        }
    ];

    const services = [
        { icon: '🛁', title: 'Tắm & Cắt lông', description: 'Tắm sạch, cắt tỉa lông gọn gàng tại nhà bạn', price: '150.000đ' },
        { icon: '💉', title: 'Tiêm phòng', description: 'Tiêm đầy đủ các loại vắc-xin cần thiết', price: '200.000đ' },
        { icon: '🏥', title: 'Khám sức khỏe', description: 'Kiểm tra sức khỏe định kỳ, phát hiện bệnh sớm', price: '250.000đ' }
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

            {/* Danh mục */}
            <section className='py-8 sm:py-14 bg-[#448B3D]/5'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <motion.div {...fadeInUp} className='text-center mb-10'>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-3'>
                            Mua theo danh mục
                        </h2>
                        <p className='text-lg text-muted-foreground'>Tìm đúng sản phẩm bạn cần</p>
                    </motion.div>
                    <div className='grid md:grid-cols-3 gap-6'>
                        {categories.map((cat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.97 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                            >
                                <Card
                                    className='group cursor-pointer overflow-hidden rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-lg transition-all duration-300'
                                    onClick={() => navigate('/products')}
                                >
                                    <div className='relative h-52 overflow-hidden'>
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                                        />
                                        <div className='absolute inset-0 bg-gradient-to-t from-black/70 to-transparent' />
                                        <div className='absolute bottom-0 left-0 right-0 p-5 text-white'>
                                            <h3 className='text-2xl font-bold mb-0.5'>{cat.name}</h3>
                                            <p className='text-white/85 text-sm'>{cat.desc}</p>
                                            <p className='text-white/70 text-xs mt-1'>{cat.count}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                    <motion.div {...fadeInUp} className='text-center mt-8'>
                        <Button
                            size='lg'
                            onClick={() => navigate('/products')}
                            className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-13 px-10 text-lg'
                        >
                            Xem tất cả sản phẩm<ChevronRight />
                        </Button>
                    </motion.div>
                </div>
            </section>

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
                    <div className='grid md:grid-cols-3 gap-6'>
                        {services.map((svc, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4 }}
                            >
                                <Card className='p-7 rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-lg transition-all duration-300 text-center h-full flex flex-col'>
                                    <div className='text-6xl mb-4'>{svc.icon}</div>
                                    <h3 className='text-xl font-bold text-foreground mb-2'>{svc.title}</h3>
                                    <p className='text-base text-muted-foreground mb-4 flex-1 leading-relaxed'>{svc.description}</p>
                                    <div className='text-2xl font-bold text-[#448B3D] mb-4'>Từ {svc.price}</div>
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
                                    {avgRating(feedbacks).toFixed(1)}
                                </div>
                                <div className='flex justify-center gap-1 mb-2'>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating(feedbacks)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <p className='text-sm text-muted-foreground'>{feedbacks.length} đánh giá từ khách hàng</p>

                                {/* Bar chart nhỏ */}
                                <div className='mt-4 space-y-1.5'>
                                    {[5, 4, 3, 2, 1].map(star => {
                                        const count = feedbacks.filter(f => f.rating === star).length;
                                        const pct = feedbacks.length === 0 ? 0 : Math.round(count / feedbacks.length * 100);
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
                            </Card>

                            {/* Nút viết đánh giá */}
                            <Button
                                onClick={() => setShowFbForm(v => !v)}
                                className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-12 gap-2'
                            >
                                <MessageSquarePlus className='w-5 h-5' />
                                {showFbForm ? 'Đóng form' : 'Viết đánh giá của bạn'}
                            </Button>

                            {/* Form */}
                            <AnimatePresence>
                                {showFbForm && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.25 }}
                                        className='overflow-hidden'
                                    >
                                        <Card className='p-5 rounded-2xl border-2 border-[#448B3D]/20'>
                                            <FeedbackForm
                                                type='general'
                                                onSuccess={() => setShowFbForm(false)}
                                            />
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                            {generalFeedbacks.length === 0 ? (
                                <div className='text-center py-12 text-muted-foreground'>
                                    <p className='text-4xl mb-3'>💬</p>
                                    <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
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
                                                <FeedbackCard feedback={generalFeedbacks[fbIndex % generalFeedbacks.length]} />
                                            </motion.div>
                                        </AnimatePresence>

                                        {/* Dots */}
                                        <div className='flex justify-center gap-1.5 mt-3'>
                                            {generalFeedbacks.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => { setFbDir(i > fbIndex ? 1 : -1); setFbIndex(i); }}
                                                    className={`rounded-full transition-all duration-300 ${i === fbIndex ? 'w-6 h-2 bg-[#448B3D]' : 'w-2 h-2 bg-[#448B3D]/30 hover:bg-[#448B3D]/60'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* 2 feedback tiếp theo dạng grid */}
                                    {generalFeedbacks.length > 1 && (
                                        <div className='grid sm:grid-cols-2 gap-4 mt-2'>
                                            {generalFeedbacks
                                                .filter((_, i) => i !== fbIndex % generalFeedbacks.length)
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
