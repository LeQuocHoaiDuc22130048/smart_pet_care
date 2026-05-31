import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import { useFeedback } from '@/context/FeedbackContext';
import { useWishlist } from '@/context/WishlistContext';
import FeedbackCard from '@/components/feedback/FeedbackCard';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import RatingSummary from '@/components/feedback/RatingSummary';
import {
    ShoppingCart, Heart, Star, Truck, Shield,
    ArrowLeft, ChevronLeft, ChevronRight, MessageSquarePlus, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { productApi, type Product } from '@/lib/productApi';
import { sanitizeHtml } from '@/lib/htmlSafety';

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

function getPrimaryImage(product: Product): string {
    const primary = product.images?.find((image) => image.isPrimary);
    return primary?.imageUrl
        ?? product.images?.[0]?.imageUrl
        ?? 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop';
}

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const { feedbacks, avgRating, loadProductFeedbacks } = useFeedback();
    const [showFeedbackForm, setShowFeedbackForm] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imgDirection, setImgDirection] = useState(1);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    // ── Data state ────────────────────────────────────────────────────────────
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [relatedLoading, setRelatedLoading] = useState(false);

    // Filter product feedbacks from state
    const productFeedbacks = product ? feedbacks.filter(f => f.productId === product.id) : [];

    useEffect(() => {
        if (!id) return;
        // Display the loading state again when navigating between product IDs.
        setLoading(true);
        setSelectedImage(0);
        setDescriptionExpanded(false);
        productApi
            .getById(id)
            .then((res) => setProduct(res.result))
            .catch(() => toast.error('Không thể tải thông tin sản phẩm'))
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!product?.id) return;

        let mounted = true;

        const loadRelatedProducts = async () => {
            const categoryIds = product.category?.map((category) => category.categoryId) ?? [];

            setRelatedLoading(true);

            if (categoryIds.length === 0) {
                setRelatedProducts([]);
                setRelatedLoading(false);
                return;
            }

            try {
                const res = await productApi.getAll();
                if (!mounted) return;

                const related = (res.result ?? [])
                    .filter((item) => {
                        if (item.id === product.id || item.status !== 'ACTIVE') return false;
                        const itemCategoryIds = item.category?.map((category) => category.categoryId) ?? [];
                        return itemCategoryIds.some((categoryId) => categoryIds.includes(categoryId));
                    })
                    .sort((a, b) => b.stockQuantity - a.stockQuantity)
                    .slice(0, 4);

                setRelatedProducts(related);
            } catch {
                if (mounted) setRelatedProducts([]);
            } finally {
                if (mounted) setRelatedLoading(false);
            }
        };

        void loadRelatedProducts();

        return () => {
            mounted = false;
        };
    }, [product?.id, product?.category]);

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

    const handleAddRelatedToCart = (relatedProduct: Product) => {
        addToCart({
            id: relatedProduct.id,
            name: relatedProduct.productName,
            price: relatedProduct.price,
            image: getPrimaryImage(relatedProduct),
            category: getCategoryNames(relatedProduct),
        });
        toast.success('Đã thêm vào giỏ hàng!');
    };

    const handleWishlist = () => {
        const liked = isWishlisted(product.id);
        toggleWishlist({
            id: product.id,
            name: product.productName,
            price: product.price,
            image: images[0],
            category: getCategoryNames(product),
        });
        toast.success(liked ? 'Đã xóa khỏi yêu thích' : '❤️ Đã thêm vào yêu thích');
    };

    const isOutOfStock = product.status === 'OUT_OF_STOCK' || product.stockQuantity === 0;
    const wishlisted = isWishlisted(product.id);
    const productDescriptionHtml = sanitizeHtml(product.description);

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
                                    <div>
                                        <div className='relative'>
                                            <div
                                                className={`ckeditor-content transition-all duration-300 ${descriptionExpanded ? '' : 'max-h-72 overflow-hidden'}`}
                                                dangerouslySetInnerHTML={{ __html: productDescriptionHtml }}
                                            />
                                            {!descriptionExpanded && (
                                                <div className='pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent' />
                                            )}
                                        </div>
                                        <Button
                                            type='button'
                                            variant='outline'
                                            onClick={() => setDescriptionExpanded((value) => !value)}
                                            className='mt-4 rounded-xl border-[#448B3D]/40 text-[#448B3D] hover:bg-[#448B3D]/10 hover:text-[#336B2D]'
                                        >
                                            {descriptionExpanded ? (
                                                <>
                                                    Thu gọn
                                                    <ChevronUp className='w-4 h-4 ml-2' />
                                                </>
                                            ) : (
                                                <>
                                                    Xem thêm mô tả
                                                    <ChevronDown className='w-4 h-4 ml-2' />
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                ) : (
                                    <p className='text-muted-foreground leading-relaxed'>
                                        Chưa có mô tả cho sản phẩm này.
                                    </p>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>

                {/* ── Sản phẩm liên quan ── */}
                <div className='mt-12 pt-10 border-t border-border'>
                    <div className='flex items-center justify-between gap-4 mb-6'>
                        <div>
                            <h2 className='text-2xl font-bold text-foreground'>Sản phẩm liên quan</h2>
                            <p className='text-sm text-muted-foreground mt-1'>
                                Gợi ý dựa trên danh mục của sản phẩm đang xem
                            </p>
                        </div>
                        <Button
                            variant='outline'
                            onClick={() => navigate('/products')}
                            className='hidden sm:inline-flex rounded-xl'
                        >
                            Xem tất cả
                        </Button>
                    </div>

                    {relatedLoading ? (
                        <div className='h-40 flex items-center justify-center text-muted-foreground'>
                            <Loader2 className='w-5 h-5 animate-spin mr-2 text-[#448B3D]' />
                            Đang tải sản phẩm liên quan...
                        </div>
                    ) : relatedProducts.length === 0 ? (
                        <div className='rounded-xl border border-dashed border-border py-10 text-center'>
                            <p className='font-semibold text-foreground'>Chưa có sản phẩm liên quan</p>
                            <p className='text-sm text-muted-foreground mt-1'>
                                Bạn có thể xem thêm các sản phẩm khác trong cửa hàng.
                            </p>
                            <Button
                                variant='outline'
                                onClick={() => navigate('/products')}
                                className='mt-4 rounded-xl'
                            >
                                Xem tất cả sản phẩm
                            </Button>
                        </div>
                    ) : (
                        <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5'>
                            {relatedProducts.map((relatedProduct) => {
                                const relatedOutOfStock = relatedProduct.status === 'OUT_OF_STOCK' || relatedProduct.stockQuantity === 0;

                                return (
                                    <Card
                                        key={relatedProduct.id}
                                        className='group overflow-hidden rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-lg transition-all duration-300 bg-card flex flex-col'
                                    >
                                        <div className='relative overflow-hidden bg-gray-50'>
                                            <img
                                                src={getPrimaryImage(relatedProduct)}
                                                alt={relatedProduct.productName}
                                                className='w-full h-40 sm:h-48 object-contain group-hover:scale-105 transition-transform duration-500 cursor-pointer'
                                                onClick={() => navigate(`/products/${relatedProduct.id}`)}
                                            />
                                            {relatedOutOfStock && (
                                                <Badge className='absolute top-2 left-2 bg-gray-500 text-white border-0 text-xs px-2 py-0.5'>
                                                    Hết hàng
                                                </Badge>
                                            )}
                                        </div>
                                        <div className='p-3 sm:p-4 flex flex-col flex-1'>
                                            <p className='text-xs text-muted-foreground mb-1 line-clamp-1'>
                                                {getCategoryNames(relatedProduct)}
                                            </p>
                                            <h3
                                                className='font-bold text-sm sm:text-base text-foreground mb-2 hover:text-[#448B3D] transition-colors cursor-pointer leading-snug line-clamp-2 flex-1'
                                                onClick={() => navigate(`/products/${relatedProduct.id}`)}
                                            >
                                                {relatedProduct.productName}
                                            </h3>
                                            <div className='flex items-center justify-between gap-2 mt-auto'>
                                                <span className='text-lg font-bold text-[#448B3D]'>
                                                    {relatedProduct.price.toLocaleString('vi-VN')}₫
                                                </span>
                                                <Button
                                                    size='sm'
                                                    onClick={() => handleAddRelatedToCart(relatedProduct)}
                                                    disabled={relatedOutOfStock}
                                                    className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white h-9 w-9 p-0 shrink-0'
                                                    aria-label='Thêm vào giỏ'
                                                >
                                                    <ShoppingCart className='w-4 h-4' />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
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
