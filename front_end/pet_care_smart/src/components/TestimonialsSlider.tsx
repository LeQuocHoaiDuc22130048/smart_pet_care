import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Bác Nguyễn Văn Hùng',
        role: 'Nông dân, Đồng Nai',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face',
        rating: 5,
        text: 'Tôi nuôi chó giữ nhà đã 10 năm. Từ khi dùng PetCare, mua thức ăn và thuốc dễ lắm, giao tận nhà, không cần đi xa. Giá cả hợp lý, chất lượng tốt!'
    },
    {
        id: 2,
        name: 'Chị Trần Thị Mai',
        role: 'Hộ chăn nuôi, Long An',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
        rating: 5,
        text: 'Đặt lịch tiêm phòng cho mấy con chó rất tiện. Bác sĩ đến tận nhà, chuyên nghiệp, giá không đắt. Tôi giới thiệu cho cả xóm rồi!'
    },
    {
        id: 3,
        name: 'Anh Lê Minh Tuấn',
        role: 'Nông dân, Bình Dương',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
        rating: 5,
        text: 'Tìm sản phẩm bằng cách chụp ảnh rất hay, tôi không biết tên thuốc nhưng chụp ảnh lên là tìm được ngay. Giao hàng nhanh, đóng gói cẩn thận.'
    },
    {
        id: 4,
        name: 'Bà Phạm Thị Lan',
        role: 'Hộ nuôi mèo, Tiền Giang',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
        rating: 5,
        text: 'Con mèo nhà tôi bệnh, gọi điện tư vấn là có người hướng dẫn ngay. Mua thuốc về cho uống là khỏi. Cảm ơn PetCare nhiều lắm!'
    }
];

const TestimonialsSlider = () => {
    const [current, setCurrent] = useState(0);
    const [direction, setDirection] = useState(1);

    const next = useCallback(() => {
        setDirection(1);
        setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    }, []);

    const prev = useCallback(() => {
        setDirection(-1);
        setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    }, []);

    useEffect(() => {
        const timer = setInterval(next, 6000);
        return () => clearInterval(timer);
    }, [next]);

    const variants = {
        enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 })
    };

    const t = TESTIMONIALS[current];

    return (
        <section className='py-20 bg-gradient-to-br from-[#448B3D]/5 to-[#B490F5]/5'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-4'>Bà con nói gì về chúng tôi</h2>
                    <p className='text-muted-foreground text-lg'>Hàng nghìn hộ gia đình đã tin dùng PetCare</p>
                </div>

                <div className='relative'>
                    <AnimatePresence mode='wait' custom={direction}>
                        <motion.div
                            key={t.id}
                            custom={direction}
                            variants={variants}
                            initial='enter'
                            animate='center'
                            exit='exit'
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className='bg-card border border-border rounded-3xl p-8 md:p-12 shadow-lg text-center'
                        >
                            <Quote className='w-10 h-10 text-[#448B3D]/30 mx-auto mb-6' />

                            <p className='text-lg md:text-xl text-foreground leading-relaxed mb-8 italic'>
                                "{t.text}"
                            </p>

                            <div className='flex items-center justify-center space-x-1 mb-6'>
                                {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className='w-5 h-5 fill-[#FFB86F] text-[#FFB86F]' />
                                ))}
                            </div>

                            <div className='flex items-center justify-center space-x-4'>
                                <img
                                    src={t.avatar}
                                    alt={t.name}
                                    className='w-14 h-14 rounded-full object-cover border-2 border-[#448B3D]/20'
                                />
                                <div className='text-left'>
                                    <p className='font-semibold text-foreground'>{t.name}</p>
                                    <p className='text-sm text-muted-foreground'>{t.role}</p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Nav buttons */}
                    <button
                        onClick={prev}
                        className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-all shadow-md'
                        aria-label='Previous testimonial'
                    >
                        <ChevronLeft className='w-5 h-5' />
                    </button>
                    <button
                        onClick={next}
                        className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-all shadow-md'
                        aria-label='Next testimonial'
                    >
                        <ChevronRight className='w-5 h-5' />
                    </button>
                </div>

                {/* Dots */}
                <div className='flex justify-center space-x-2 mt-8'>
                    {TESTIMONIALS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                            className={`transition-all duration-300 rounded-full ${i === current ? 'w-8 h-2.5 bg-[#448B3D]' : 'w-2.5 h-2.5 bg-[#448B3D]/30 hover:bg-[#448B3D]/60'
                                }`}
                            aria-label={`Go to testimonial ${i + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSlider;
