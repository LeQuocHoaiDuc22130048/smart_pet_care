import { ThumbsUp, Star, BadgeCheck, X } from 'lucide-react';
import { type Feedback, useFeedback } from '@/context/FeedbackContext';
import { toast } from 'sonner';
import { useState } from 'react';

interface Props {
    feedback: Feedback;
}

const FeedbackCard = ({ feedback: f }: Props) => {
    const { markHelpful } = useFeedback();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleHelpful = () => {
        markHelpful(f.id);
        toast.success('Cảm ơn bạn đã đánh giá!');
    };

    return (
        <div className='bg-card border border-border rounded-2xl p-4 sm:p-5 space-y-3'>
            {/* Header */}
            <div className='flex items-start justify-between gap-3'>
                <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full overflow-hidden bg-[#448B3D]/10 shrink-0'>
                        {f.authorAvatar
                            ? <img src={f.authorAvatar} alt={f.authorName} className='w-full h-full object-cover' />
                            : <span className='w-full h-full flex items-center justify-center text-[#448B3D] font-bold text-sm'>
                                {f.authorName.charAt(0)}
                            </span>
                        }
                    </div>
                    <div>
                        <div className='flex items-center gap-1.5'>
                            <p className='font-semibold text-sm text-foreground'>{f.authorName}</p>
                            {f.verified && (
                                <BadgeCheck className='w-4 h-4 text-[#448B3D]' title='Đã mua hàng' />
                            )}
                        </div>
                        <p className='text-xs text-muted-foreground'>{f.date}</p>
                    </div>
                </div>
                {/* Stars */}
                <div className='flex items-center gap-0.5 shrink-0'>
                    {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-4 h-4 ${i <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                </div>
            </div>

            {/* Content */}
            <div>
                <p className='font-semibold text-foreground text-sm mb-1'>{f.title}</p>
                <p className='text-sm text-muted-foreground leading-relaxed'>{f.content}</p>
            </div>

            {/* Images */}
            {f.imageUrls && f.imageUrls.length > 0 && (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-2'>
                    {f.imageUrls.map((url, idx) => (
                        <div
                            key={idx}
                            className='relative aspect-square rounded-lg overflow-hidden bg-muted group cursor-pointer'
                            onClick={() => setSelectedImage(url)}
                        >
                            <img
                                src={url}
                                alt={`Feedback image ${idx + 1}`}
                                className='w-full h-full object-cover transition-transform group-hover:scale-110'
                                loading='lazy'
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors' />
                        </div>
                    ))}
                </div>
            )}

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className='fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4'
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className='absolute top-4 right-4 text-white hover:text-gray-300 transition-colors'
                        onClick={() => setSelectedImage(null)}
                    >
                        <X className='w-8 h-8' />
                    </button>
                    <img
                        src={selectedImage}
                        alt='Feedback image'
                        className='max-w-full max-h-full object-contain rounded-lg'
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Footer */}
            <div className='flex items-center justify-between pt-1'>
                {(f.productName || f.serviceName) && (
                    <span className='text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full'>
                        {f.productName ?? f.serviceName}
                    </span>
                )}
                <button
                    onClick={handleHelpful}
                    className='flex items-center gap-1.5 text-xs text-muted-foreground hover:text-[#448B3D] transition-colors ml-auto'
                >
                    <ThumbsUp className='w-3.5 h-3.5' />
                    Hữu ích ({f.helpful})
                </button>
            </div>
        </div>
    );
};

export default FeedbackCard;
