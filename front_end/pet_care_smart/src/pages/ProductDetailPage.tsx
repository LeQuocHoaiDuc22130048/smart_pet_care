import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { useFeedback } from '@/context/FeedbackContext';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import RatingSummary from '@/components/feedback/RatingSummary';
import {
    ShoppingCart, Heart, Star, Truck, Shield,
    ArrowLeft, ChevronLeft, ChevronRight, MessageSquarePlus, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { productApi, type Product } from '@/lib/productApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getImages(product: Product): string[] {
    if (!product.images || product.images.length === 0) {
        return ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=800&fit=crop'];
    }
    // Primary first
    const sorted = [...product.images].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
    return sorted.map((i) => i.imageUrl);
}

function getCategoryNames(product: Product): string {
    return product.category?.map((c) => c.categoryName).join(', ') || 'Khác';
}

const BLOCKED_HTML_TAGS = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'form']);
const ALLOWED_HTML_TAGS = new Set([
    'a',
    'b',
    'blockquote',
    'br',
    'code',
    'div',
    'em',
    'figcaption',
    'figure',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'hr',
    'i',
    'img',
    'li',
    'ol',
    'p',
    'pre',
    's',
    'span',
    'strong',
    'sub',
    'sup',
    'table',
    'tbody',
    'td',
    'tfoot',
    'th',
    'thead',
    'tr',
    'u',
    'ul',
]);
const GLOBAL_HTML_ATTRIBUTES = new Set(['class', 'style', 'title']);
const TAG_HTML_ATTRIBUTES: Record<string, Set<string>> = {
    a: new Set(['href', 'target', 'rel']),
    img: new Set(['src', 'alt', 'width', 'height', 'loading']),
    td: new Set(['colspan', 'rowspan']),
    th: new Set(['colspan', 'rowspan', 'scope']),
};
const ALLOWED_STYLE_PROPERTIES = new Set([
    'text-align',
    'margin-left',
    'margin-right',
    'padding-left',
    'width',
    'height',
]);

function isSafeUrl(value: string, allowImageData = false): boolean {
    const trimmed = value.trim().toLowerCase();
    return (
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/') ||
        trimmed.startsWith('#') ||
        trimmed.startsWith('mailto:') ||
        trimmed.startsWith('tel:') ||
        (allowImageData && trimmed.startsWith('data:image/'))
    );
}

function sanitizeStyle(value: string): string {
    return value
        .split(';')
        .map((rule) => rule.trim())
        .filter(Boolean)
        .filter((rule) => {
            const property = rule.split(':')[0]?.trim().toLowerCase();
            return ALLOWED_STYLE_PROPERTIES.has(property);
        })
        .join('; ');
}

function sanitizeCkEditorHtml(value?: string): string {
    if (!value?.trim() || typeof window === 'undefined') {
        return '';
    }

    const template = document.createElement('template');
    template.innerHTML = value;

    template.content.querySelectorAll('*').forEach((element) => {
        const tagName = element.tagName.toLowerCase();
        if (BLOCKED_HTML_TAGS.has(tagName)) {
            element.remove();
            return;
        }

        if (!ALLOWED_HTML_TAGS.has(tagName)) {
            element.replaceWith(...Array.from(element.childNodes));
            return;
        }

        Array.from(element.attributes).forEach((attribute) => {
            const attrName = attribute.name.toLowerCase();
            const attrValue = attribute.value;
            const isAllowedAttribute = GLOBAL_HTML_ATTRIBUTES.has(attrName) || TAG_HTML_ATTRIBUTES[tagName]?.has(attrName);

            if (!isAllowedAttribute || attrName.startsWith('on') || attrName === 'srcdoc') {
                element.removeAttribute(attribute.name);
                return;
            }

            if (attrName === 'href' && !isSafeUrl(attrValue)) {
                element.removeAttribute(attribute.name);
                return;
            }

            if (attrName === 'src' && !isSafeUrl(attrValue, tagName === 'img')) {
                element.removeAttribute(attribute.name);
                return;
            }

            if (attrName === 'style') {
                const sanitized = sanitizeStyle(attrValue);
                if (sanitized) {
                    element.setAttribute('style', sanitized);
                } else {
                    element.removeAttribute(attribute.name);
                }
            }
        });

        if (tagName === 'a') {
            element.setAttribute('rel', 'noopener noreferrer');
        }
    });

    return template.innerHTML;
}

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { feedbacks, avgRating, loadProductFeedbacks } = useFeedback();
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imgDirection, setImgDirection] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);

    // ── Data state ────────────────────────────────────────────────────────────
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    // Filter product feedbacks from state
    const productFeedbacks = product ? feedbacks.filter(f => f.productId === product.id) : [];

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        productApi
            .getById(id)
            .then((res) => setProduct(res.result))
            .catch(() => toast.error('Không thể tải thông tin sản phẩm'))
            .finally(() => setLoading(false));
    }, [id]);

    // Load product feedbacks
    useEffect(() => {
        if (!product?.id) return;
        loadProductFeedbacks(product.id).catch(() => {
            // Error already handled in context
        });
    }, [product?.id, loadProductFeedbacks]);

    if (loading) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <Loader2 className='w-10 h-10 animate-spin text-[#448B3D]' />
            </div>
        );
    }

    if (!product) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='text-center'>
                    <p className='text-xl font-semibold mb-4'>Không tìm thấy sản phẩm</p>
                    <Button onClick={() => navigate('/products')} className='rounded-xl bg-[#448B3D] text-white'>
                        Quay lại danh sách
                    </Button>
                </div>
            </div>
        );
    }

    const images = getImages(product);

    const goToImage = (index: number) => {
        setImgDirection(index > selectedImage ? 1 : -1);
        setSelectedImage(index);
    };
    const prevImage = () => {
        const newIdx = (selectedImage - 1 + images.length) % images.length;
        setImgDirection(-1);
        setSelectedImage(newIdx);
    };
    const nextImage = () => {
        const newIdx = (selectedImage + 1) % images.length;
        setImgDirection(1);
        setSelectedImage(newIdx);
    };

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart({
                id: product.id,
                name: product.productName,
                price: product.price,
                image: images[0],
                category: getCategoryNames(product),
            });
        }
        toast.success(`Đã thêm ${quantity} "${product.productName}" vào giỏ hàng!`);
    };

    const handleWishlist = () => {
        setWishlisted((prev) => !prev);
        toast.success(wishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích ❤️');
    };

    const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity === 0;
    const productDescriptionHtml = sanitizeCkEditorHtml(product.description);

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <Button variant='ghost' onClick={() => navigate('/products')} className='mb-6 rounded-xl'>
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Quay lại sản phẩm
                </Button>

                <div className='grid lg:grid-cols-2 gap-6 lg:gap-12'>
                    {/* ── Image Slider ── */}
                    <div>
                        <div className='relative rounded-2xl overflow-hidden mb-4 bg-card border border-border'>
                            <AnimatePresence mode='wait' custom={imgDirection}>
                                <motion.img
                                    key={selectedImage}
                                    src={images[selectedImage]}
                                    alt={product.productName}
                                    custom={imgDirection}
                                    variants={{
                                        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
                                        center: { x: 0, opacity: 1 },
                                        exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
                                    }}
                                    initial='enter'
                                    animate='center'
                                    exit='exit'
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                    className='w-full h-64 sm:h-80 lg:h-[500px] object-cover'
                                />
                            </AnimatePresence>

                            {isOutOfStock && (
                                <Badge className='absolute top-4 left-4 bg-gray-500 text-white border-0 z-10'>
                                    Hết hàng
                                </Badge>
                            )}

                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className='absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-md z-10'
                                        aria-label='Ảnh trước'
                                    >
                                        <ChevronLeft className='w-5 h-5' />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className='absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-md z-10'
                                        aria-label='Ảnh tiếp'
                                    >
                                        <ChevronRight className='w-5 h-5' />
                                    </button>
                                    <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10'>
                                        {images.map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => goToImage(i)}
                                                className={`rounded-full transition-all duration-300 ${i === selectedImage ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`}
                                                aria-label={`Ảnh ${i + 1}`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {images.length > 1 && (
                            <div className='grid grid-cols-4 gap-4'>
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => goToImage(index)}
                                        className={`rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-[#448B3D] scale-95' : 'border-border hover:border-[#448B3D]/50'}`}
                                    >
                                        <img src={image} alt='' className='w-full h-24 object-cover' />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Details ── */}
                    <div>
                        <div className='mb-4'>
                            <Badge className='mb-2'>{getCategoryNames(product)}</Badge>
                            <h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-2'>
                                {product.productName}
                            </h1>
                        </div>

                        {/* Price */}
                        <div className='mb-6'>
                            <span className='text-4xl font-bold text-[#448B3D]'>
                                {product.price.toLocaleString('vi-VN')}₫
                            </span>
                        </div>

                        {/* Stock */}
                        <div className='mb-6'>
                            <p className='text-sm'>
                                <span className='text-muted-foreground'>Tình trạng: </span>
                                {isOutOfStock ? (
                                    <span className='text-red-500 font-semibold'>Hết hàng</span>
                                ) : (
                                    <span className='text-[#7FD99E] font-semibold'>
                                        {product.stockQuantity} còn hàng
                                    </span>
                                )}
                            </p>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className='flex items-center space-x-4 mb-8'>
                            <div className='flex items-center border border-border rounded-xl overflow-hidden'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className='rounded-none'
                                    disabled={isOutOfStock}
                                >
                                    -
                                </Button>
                                <span className='px-6 py-2 font-semibold'>{quantity}</span>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                                    className='rounded-none'
                                    disabled={isOutOfStock}
                                >
                                    +
                                </Button>
                            </div>
                            <Button
                                size='lg'
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className='flex-1 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                            >
                                <ShoppingCart className='w-5 h-5 mr-2' />
                                {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                            </Button>
                            <Button
                                size='lg'
                                variant='outline'
                                onClick={handleWishlist}
                                className={`rounded-xl border-2 ${wishlisted ? 'border-red-400 text-red-500' : ''}`}
                            >
                                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                        </div>

                        {/* Info cards */}
                        <div className='grid grid-cols-2 gap-4 mb-8'>
                            <Card className='p-4 rounded-xl border-border flex items-center space-x-3'>
                                <Truck className='w-5 h-5 text-[#448B3D]' />
                                <div>
                                    <p className='text-sm font-semibold'>Miễn phí vận chuyển</p>
                                    <p className='text-xs text-muted-foreground'>Cho đơn hàng trên 500.000₫</p>
                                </div>
                            </Card>
                            <Card className='p-4 rounded-xl border-border flex items-center space-x-3'>
                                <Shield className='w-5 h-5 text-[#7FD99E]' />
                                <div>
                                    <p className='text-sm font-semibold'>Đảm bảo chất lượng</p>
                                    <p className='text-xs text-muted-foreground'>100% hài lòng</p>
                                </div>
                            </Card>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue='description' className='w-full'>
                            <TabsList className='w-full rounded-xl'>
                                <TabsTrigger value='description' className='flex-1 rounded-lg'>Mô tả</TabsTrigger>
                            </TabsList>
                            <TabsContent value='description' className='mt-4'>
                                {productDescriptionHtml ? (
                                    <div
                                        className='ckeditor-content'
                                        dangerouslySetInnerHTML={{ __html: productDescriptionHtml }}
                                    />
                                ) : (
                                    <p className='text-muted-foreground leading-relaxed'>
                                        Chưa có mô tả cho sản phẩm này.
                                    </p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* ── Đánh giá sản phẩm ── */}
                <div className='mt-12 pt-10 border-t border-border'>
                    <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
                        <div>
                            <h2 className='text-2xl font-bold text-foreground'>Đánh giá sản phẩm</h2>
                            {productFeedbacks.length > 0 ? (
                                <div className='flex items-center gap-2 mt-1'>
                                    <div className='flex gap-0.5'>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${i <= Math.round(avgRating(productFeedbacks)) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className='font-semibold text-[#448B3D]'>{avgRating(productFeedbacks).toFixed(1)}</span>
                                    <span className='text-sm text-muted-foreground'>({productFeedbacks.length} đánh giá)</span>
                                </div>
                            ) : (
                                <p className='text-sm text-muted-foreground mt-1'>Chưa có đánh giá nào</p>
                            )}
                        </div>
                        <Button
                            onClick={() => setShowFeedbackForm((v) => !v)}
                            className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white gap-2'
                        >
                            <MessageSquarePlus className='w-4 h-4' />
                            {showFeedbackForm ? 'Đóng' : 'Viết đánh giá'}
                        </Button>
                    </div>

                    {productFeedbacks.length > 0 && (
                        <RatingSummary feedbacks={productFeedbacks} avgRating={avgRating(productFeedbacks)} />
                    )}

                    <AnimatePresence>
                        {showFeedbackForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.25 }}
                                className='overflow-hidden mt-6'
                            >
                                <Card className='p-5 sm:p-6 rounded-2xl border-2 border-[#448B3D]/20'>
                                    <h3 className='font-bold text-lg text-foreground mb-4'>
                                        Đánh giá: {product.productName}
                                    </h3>
                                    <FeedbackForm
                                        type='product'
                                        productId={product.id}
                                        productName={product.productName}
                                        onSuccess={() => setShowFeedbackForm(false)}
                                    />
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {productFeedbacks.length === 0 ? (
                        <div className='text-center py-10 mt-6'>
                            <p className='text-4xl mb-3'>💬</p>
                            <p className='font-semibold text-foreground'>Chưa có đánh giá nào</p>
                            <p className='text-sm text-muted-foreground mt-1'>
                                Hãy là người đầu tiên đánh giá sản phẩm này!
                            </p>
                        </div>
                    ) : (
                        <div className='space-y-4 mt-6'>
                            {productFeedbacks.map((fb) => (
                                <FeedbackCard key={fb.id} feedback={fb} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
