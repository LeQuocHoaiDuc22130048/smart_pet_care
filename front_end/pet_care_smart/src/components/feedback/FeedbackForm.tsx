import { useState } from 'react';
import { Star, Send, Upload, X } from 'lucide-react';
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
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const ratingLabels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Xuất sắc'];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 5) {
            toast.error('Chỉ được tải lên tối đa 5 ảnh');
            return;
        }

        // Validate file size (max 5MB per image)
        const invalidFiles = files.filter(f => f.size > 5 * 1024 * 1024);
        if (invalidFiles.length > 0) {
            toast.error('Kích thước ảnh không được vượt quá 5MB');
            return;
        }

        setImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Vui lòng chọn số sao đánh giá');
            return;
        }
        if (!content.trim()) {
            toast.error('Vui lòng nhập nội dung đánh giá');
            return;
        }
        if (content.trim().length < 10) {
            toast.error('Nội dung đánh giá phải có ít nhất 10 ký tự');
            return;
        }
        if (content.trim().length > 1000) {
            toast.error('Nội dung đánh giá không được vượt quá 1000 ký tự');
            return;
        }
        if (!user && !name.trim()) {
            toast.error('Vui lòng nhập tên của bạn');
            return;
        }

        setLoading(true);
        try {
            await addFeedback({
                type,
                rating,
                title: title || ratingLabels[rating],
                content,
                authorName: user?.name || name,
                authorAvatar: user?.avatar,
                verified: !!user,
                productId,
                productName,
                serviceId,
                serviceName,
            }, images);

            // Reset form
            setRating(0);
            setTitle('');
            setContent('');
            setImages([]);
            setImagePreviews([]);
            if (!user) setName('');

            onSuccess?.();
        } catch {
            // Error already handled in context
        } finally {
            setLoading(false);
        }
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
                <div className='flex items-center justify-between mb-1'>
                    <Label htmlFor='fb-content'>Nội dung đánh giá <span className='text-red-500'>*</span></Label>
                    <span className={`text-xs ${content.length < 10 ? 'text-red-500' : content.length > 1000 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {content.length}/1000 {content.length < 10 && '(tối thiểu 10 ký tự)'}
                    </span>
                </div>
                <Textarea
                    id='fb-content'
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder='Chia sẻ trải nghiệm của bạn... (tối thiểu 10 ký tự)'
                    className='mt-1 rounded-xl min-h-[100px]'
                    minLength={10}
                    maxLength={1000}
                />
            </div>

            {/* Image upload */}
            <div>
                <Label>Hình ảnh (tùy chọn, tối đa 5 ảnh)</Label>
                <div className='mt-2 space-y-3'>
                    {imagePreviews.length > 0 && (
                        <div className='grid grid-cols-3 gap-2'>
                            {imagePreviews.map((preview, idx) => (
                                <div key={idx} className='relative group'>
                                    <img
                                        src={preview}
                                        alt={`Preview ${idx + 1}`}
                                        className='w-full h-24 object-cover rounded-lg border border-border'
                                    />
                                    <button
                                        type='button'
                                        onClick={() => removeImage(idx)}
                                        className='absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                                    >
                                        <X className='w-3 h-3' />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    {images.length < 5 && (
                        <label className='flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-4 cursor-pointer hover:border-[#448B3D] transition-colors'>
                            <Upload className='w-5 h-5 text-muted-foreground' />
                            <span className='text-sm text-muted-foreground'>Tải ảnh lên</span>
                            <input
                                type='file'
                                accept='image/jpeg,image/png,image/jpg'
                                multiple
                                onChange={handleImageChange}
                                className='hidden'
                            />
                        </label>
                    )}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                    Chấp nhận JPG, PNG. Tối đa 5MB mỗi ảnh.
                </p>
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
