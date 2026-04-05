import { useState } from 'react';
import { Star, MessageSquarePlus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFeedback } from '@/context/FeedbackContext';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import RatingSummary from '@/components/feedback/RatingSummary';
import { motion, AnimatePresence } from 'motion/react';

const FILTERS = ['Tất cả', 'Tổng thể', 'Sản phẩm', 'Dịch vụ'] as const;
const SORT = ['Mới nhất', 'Hữu ích nhất', 'Đánh giá cao', 'Đánh giá thấp'] as const;

const FeedbackPage = () => {
    const { feedbacks, avgRating } = useFeedback();
    const [showForm, setShowForm] = useState(false);
    const [filter, setFilter] = useState<typeof FILTERS[number]>('Tất cả');
    const [sort, setSort] = useState<typeof SORT[number]>('Mới nhất');
    const [starFilter, setStarFilter] = useState(0);

    const filtered = feedbacks
        .filter(f => {
            if (filter === 'Tổng thể') return f.type === 'general';
            if (filter === 'Sản phẩm') return f.type === 'product';
            if (filter === 'Dịch vụ') return f.type === 'service';
            return true;
        })
        .filter(f => starFilter === 0 || f.rating === starFilter)
        .sort((a, b) => {
            if (sort === 'Hữu ích nhất') return b.helpful - a.helpful;
            if (sort === 'Đánh giá cao') return b.rating - a.rating;
            if (sort === 'Đánh giá thấp') return a.rating - b.rating;
            return b.id.localeCompare(a.id); // Mới nhất
        });

    const avg = avgRating(feedbacks);

    return (
        <div className='min-h-screen bg-background'>
            {/* Hero */}
            <div className='bg-[#448B3D] py-10 sm:py-14 px-4 text-center'>
                <Star className='w-12 h-12 text-yellow-300 mx-auto mb-3 fill-yellow-300' />
                <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>Đánh giá & Nhận xét</h1>
                <p className='text-white/80 text-sm sm:text-base'>Ý kiến của bà con giúp chúng tôi ngày càng tốt hơn</p>
            </div>

            <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
                {/* Summary */}
                <div className='mb-8'>
                    <RatingSummary feedbacks={feedbacks} avgRating={avg} />
                </div>

                {/* Write review button */}
                <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
                    <h2 className='text-xl font-bold text-foreground'>
                        Tất cả đánh giá ({feedbacks.length})
                    </h2>
                    <Button
                        onClick={() => setShowForm(v => !v)}
                        className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white gap-2'
                    >
                        <MessageSquarePlus className='w-4 h-4' />
                        {showForm ? 'Đóng' : 'Viết đánh giá'}
                    </Button>
                </div>

                {/* Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                            className='overflow-hidden mb-6'
                        >
                            <div className='bg-card border-2 border-[#448B3D]/20 rounded-2xl p-5 sm:p-6'>
                                <h3 className='font-bold text-lg text-foreground mb-4'>Chia sẻ trải nghiệm của bạn</h3>
                                <FeedbackForm type='general' onSuccess={() => setShowForm(false)} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Filters */}
                <div className='flex flex-wrap gap-2 mb-4'>
                    {FILTERS.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filter === f
                                    ? 'bg-[#448B3D] text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-[#448B3D]/10 hover:text-[#448B3D]'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                    <div className='w-px bg-border mx-1' />
                    {[5, 4, 3, 2, 1].map(s => (
                        <button
                            key={s}
                            onClick={() => setStarFilter(starFilter === s ? 0 : s)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${starFilter === s
                                    ? 'bg-yellow-400 text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-yellow-50 hover:text-yellow-600'
                                }`}
                        >
                            {s} <Star className='w-3 h-3' />
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <div className='flex items-center gap-2 mb-5 flex-wrap'>
                    <Filter className='w-4 h-4 text-muted-foreground' />
                    <span className='text-sm text-muted-foreground'>Sắp xếp:</span>
                    {SORT.map(s => (
                        <button
                            key={s}
                            onClick={() => setSort(s)}
                            className={`text-sm px-3 py-1 rounded-lg transition-all ${sort === s
                                    ? 'bg-[#448B3D]/10 text-[#448B3D] font-semibold'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* List */}
                {filtered.length === 0 ? (
                    <div className='text-center py-12'>
                        <p className='text-4xl mb-3'>💬</p>
                        <p className='text-foreground font-semibold'>Chưa có đánh giá nào</p>
                        <p className='text-muted-foreground text-sm mt-1'>Hãy là người đầu tiên chia sẻ!</p>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {filtered.map(fb => (
                            <motion.div
                                key={fb.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <FeedbackCard feedback={fb} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackPage;
