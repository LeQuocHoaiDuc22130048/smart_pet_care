import { Star } from 'lucide-react';
import { type Feedback } from '@/context/FeedbackContext';

interface Props {
    feedbacks: Feedback[];
    avgRating: number;
}

const RatingSummary = ({ feedbacks, avgRating }: Props) => {
    const total = feedbacks.length;
    const counts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: feedbacks.filter(f => f.rating === star).length,
        pct: total === 0 ? 0 : Math.round((feedbacks.filter(f => f.rating === star).length / total) * 100),
    }));

    return (
        <div className='flex flex-col sm:flex-row items-center gap-6 p-5 bg-[#448B3D]/5 border border-[#448B3D]/20 rounded-2xl'>
            {/* Big number */}
            <div className='text-center shrink-0'>
                <div className='text-5xl font-bold text-[#448B3D]'>{avgRating.toFixed(1)}</div>
                <div className='flex items-center justify-center gap-0.5 my-1'>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                </div>
                <div className='text-xs text-muted-foreground'>{total} đánh giá</div>
            </div>

            {/* Bar chart */}
            <div className='flex-1 w-full space-y-1.5'>
                {counts.map(({ star, count, pct }) => (
                    <div key={star} className='flex items-center gap-2 text-xs'>
                        <span className='w-4 text-right text-muted-foreground'>{star}</span>
                        <Star className='w-3 h-3 fill-yellow-400 text-yellow-400 shrink-0' />
                        <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                            <div
                                className='h-full bg-yellow-400 rounded-full transition-all duration-500'
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className='w-8 text-muted-foreground'>{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatingSummary;
