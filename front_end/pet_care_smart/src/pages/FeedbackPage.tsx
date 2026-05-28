import { useState, useEffect } from 'react';
import { Star, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useFeedback, type Feedback } from '@/context/FeedbackContext';
import { useAuth } from '@/context/AuthContext';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import RatingSummary from '@/components/feedback/RatingSummary';
import { feedbackApi } from '@/lib/feedbackApi';
import { toast } from 'sonner';
import { motion } from 'motion/react';

const FILTERS = ['Tất cả', 'Sản phẩm', 'Dịch vụ'] as const;
const SORT = ['Mới nhất', 'Hữu ích nhất', 'Đánh giá cao', 'Đánh giá thấp'] as const;

const FeedbackPage = () => {
    const { avgRating } = useFeedback();
    const { isAuthenticated } = useAuth();
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<typeof FILTERS[number]>('Tất cả');
    const [sort, setSort] = useState<typeof SORT[number]>('Mới nhất');
    const [starFilter, setStarFilter] = useState(0);

    // Load user's feedbacks
    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        const loadMyFeedbacks = async () => {
            try {
                setLoading(true);
                const response = await feedbackApi.getMyFeedbacks(0, 100);
                const apiFeedbacks: Feedback[] = response.result.content.map(f => ({
                    id: f.id,
                    type: f.type === 'PRODUCT' ? 'product' : f.type === 'ORDER' ? 'service' : 'general',
                    rating: f.rating,
                    title: '',
                    content: f.comment,
                    authorName: f.username,
                    date: new Date(f.createdAt).toLocaleDateString('vi-VN'),
                    productId: f.productId,
                    helpful: f.helpfulCount,
                    verified: f.verifiedPurchase,
                    imageUrls: f.imageUrls,
                }));
                setFeedbacks(apiFeedbacks);
            } catch (error) {
                console.error('Error loading feedbacks:', error);
                toast.error('Không thể tải đánh giá');
            } finally {
                setLoading(false);
            }
        };

        loadMyFeedbacks();
    }, [isAuthenticated]);

    const filtered = feedbacks
        .filter(f => {
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

    if (!isAuthenticated) {
        return (
            <div className='min-h-screen bg-background'>
                <div className='bg-[#448B3D] py-10 sm:py-14 px-4 text-center'>
                    <Star className='w-12 h-12 text-yellow-300 mx-auto mb-3 fill-yellow-300' />
                    <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>Đánh giá của tôi</h1>
                    <p className='text-white/80 text-sm sm:text-base'>Quản lý tất cả đánh giá của bạn</p>
                </div>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
                    <Card className='p-8 rounded-2xl text-center'>
                        <p className='text-lg font-semibold text-foreground mb-2'>Vui lòng đăng nhập</p>
                        <p className='text-sm text-muted-foreground'>Đăng nhập để xem đánh giá của bạn</p>
                    </Card>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className='min-h-screen bg-background'>
                <div className='bg-[#448B3D] py-10 sm:py-14 px-4 text-center'>
                    <Star className='w-12 h-12 text-yellow-300 mx-auto mb-3 fill-yellow-300' />
                    <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>Đánh giá của tôi</h1>
                    <p className='text-white/80 text-sm sm:text-base'>Quản lý tất cả đánh giá của bạn</p>
                </div>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
                    <div className='text-center py-12'>
                        <div className='w-10 h-10 border-4 border-[#448B3D] border-t-transparent rounded-full animate-spin mx-auto mb-4' />
                        <p className='text-muted-foreground'>Đang tải đánh giá...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-background'>
            {/* Hero */}
            <div className='bg-[#448B3D] py-10 sm:py-14 px-4 text-center'>
                <Star className='w-12 h-12 text-yellow-300 mx-auto mb-3 fill-yellow-300' />
                <h1 className='text-2xl sm:text-3xl font-bold text-white mb-2'>Đánh giá của tôi</h1>
                <p className='text-white/80 text-sm sm:text-base'>Quản lý tất cả đánh giá của bạn</p>
            </div>

            <div className='max-w-4xl mx-auto px-4 sm:px-6 py-8'>
                {/* Summary */}
                <div className='mb-8'>
                    <RatingSummary feedbacks={feedbacks} avgRating={avg} />
                </div>

                {/* Write review button */}
                <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
                    <h2 className='text-xl font-bold text-foreground'>
                        Đánh giá của tôi ({feedbacks.length})
                    </h2>
                </div>

                {/* Info message */}
                <Card className='p-4 rounded-2xl border-2 border-[#448B3D]/20 bg-muted/50 mb-6'>
                    <p className='text-sm text-muted-foreground text-center'>
                        💡 Để viết đánh giá, vui lòng truy cập trang sản phẩm hoặc dịch vụ cụ thể
                    </p>
                </Card>

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
