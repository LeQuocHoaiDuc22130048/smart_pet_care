import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFeedback, type FeedbackType } from '@/context/FeedbackContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Props {
    type: FeedbackType;
    productId?: string;
    productName?: string;
    serviceId?: string;
    serviceName?: string;
    onSuccess?: () => void;
}

const FeedbackForm = ({ type, productId, productName, serviceId, serviceName, onSuccess }: Props) => {
    const { addFeedback } = useFeedback();
    const { user } = useAuth();

    const [rating, setRating] = useState(0);
    const [hovered, setHovered] = useState(0);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [name, setName] = useState(user?.name ?? '');
    const [loading, setLoading] = useState(false);

    const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) { toast.error('Vui lòng chọn số sao đánh giá'); return; }
        if (!content.trim()) { toast.error('Vui lòng nhập nội dung đánh giá'); return; }
        if (!name.trim()) { toast.error('Vui lòng nhập tên của bạn'); return; }

        setLoading(true);
        setTimeout(() => {
            addFeedback({
                type,
                rating,
                title: title || ratingLabels[rating],
                content,
                authorName: name,
                authorAvatar: user?.avatar,
                verified: !!user,
                productId,
                productName,
                serviceId,
                serviceName,
            });
            toast.success('Cảm ơn bạn đã gửi đánh giá! 🎉');
            setRating(0); setTitle(''); setContent('');
            if (!user) setName('');
            setLoading(false);
            onSuccess?.();
        }, 600);
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-4'>
            {/* Star rating */}
            <div>
                <Label className='mb-2 block font-semibold'>Đánh giá của bạn <span className='text-red-500'>*</span></Label>
                <div className='flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map(i => (
                        <button
                            key={i}
                            type='button'
                            onClick={() => setRating(i)}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(0)}
                            className='transition-transform hover:scale-110'
                            aria-label={`${i} sao`}
                        >
                            <Star className={`w-8 h-8 transition-colors ${i <= (hovered || rating)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`} />
                        </button>
                    ))}
                    {(hovered || rating) > 0 && (
                        <span className='ml-2 text-sm font-medium text-[#448B3D]'>
                            {ratingLabels[hovered || rating]}
                        </span>
                    )}
                </div>
            </div>

            {/* Name — prefill if logged in */}
            {!user && (
                <div>
                    <Label htmlFor='fb-name'>Họ tên <span className='text-red-500'>*</span></Label>
                    <Input
                        id='fb-name'
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder='Nguyễn Văn A'
                        className='mt-1 rounded-xl h-11'
                    />
                </div>
            )}

            {/* Title */}
            <div>
                <Label htmlFor='fb-title'>Tiêu đề (tùy chọn)</Label>
                <Input
                    id='fb-title'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='VD: Sản phẩm rất tốt, giao hàng nhanh...'
                    className='mt-1 rounded-xl h-11'
                />
            </div>

            {/* Content */}
            <div>
                <Label htmlFor='fb-content'>Nội dung đánh giá <span className='text-red-500'>*</span></Label>
                <Textarea
                    id='fb-content'
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder='Chia sẻ trải nghiệm của bạn...'
                    className='mt-1 rounded-xl min-h-[100px]'
                />
            </div>

            <Button
                type='submit'
                disabled={loading}
                className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-12'
            >
                {loading ? (
                    <span className='flex items-center gap-2'>
                        <span className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                        Đang gửi...
                    </span>
                ) : (
                    <span className='flex items-center gap-2'>
                        <Send className='w-4 h-4' /> Gửi đánh giá
                    </span>
                )}
            </Button>
        </form>
    );
};

export default FeedbackForm;
