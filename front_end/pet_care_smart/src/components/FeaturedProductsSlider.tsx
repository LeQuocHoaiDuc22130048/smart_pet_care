import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Loader2, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';
import { productApi, type Product } from '@/lib/productApi';

function getPrimaryImage(product: Product): string {
    const primary = product.images?.find((image) => image.isPrimary);
    return primary?.imageUrl
        ?? product.images?.[0]?.imageUrl
        ?? 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop';
}

function getCategoryNames(product: Product): string {
    return product.category?.map((category) => category.categoryName).join(', ') || 'Khác';
}

function formatVnd(value: number): string {
    return value.toLocaleString('vi-VN') + 'đ';
}

const FeaturedProductsSlider = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        let mounted = true;

        const loadProducts = async () => {
            setLoading(true);
            try {
                const response = await productApi.getAll();
                if (!mounted) return;
                setProducts((response.result ?? [])
                    .filter((product) => product.status === 'ACTIVE')
                    .sort((a, b) => b.stockQuantity - a.stockQuantity)
                    .slice(0, 10));
            } catch (error) {
                console.error('Error loading featured products:', error);
                setProducts([]);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        void loadProducts();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        updateScrollState();
    }, [products.length]);

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
        setTimeout(updateScrollState, 350);
    };

    const handleAddToCart = (product: Product) => {
        addToCart({
            id: product.id,
            name: product.productName,
            price: product.price,
            image: getPrimaryImage(product),
            category: getCategoryNames(product)
        });
        toast.success('Đã thêm vào giỏ hàng!');
    };

    return (
        <section className='py-20 bg-background'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between mb-10 gap-4'>
                    <div>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-2'>Sản phẩm nổi bật</h2>
                        <p className='text-muted-foreground text-base'>Dữ liệu lấy trực tiếp từ kho sản phẩm đang hoạt động</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft || loading || products.length === 0}
                            className='w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all'
                            aria-label='Scroll left'
                        >
                            <ChevronLeft className='w-5 h-5' />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight || loading || products.length === 0}
                            className='w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all'
                            aria-label='Scroll right'
                        >
                            <ChevronRight className='w-5 h-5' />
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className='h-60 flex items-center justify-center text-muted-foreground'>
                        <Loader2 className='w-6 h-6 animate-spin mr-2 text-[#448B3D]' />
                        Đang tải sản phẩm nổi bật...
                    </div>
                ) : products.length === 0 ? (
                    <div className='h-60 flex items-center justify-center rounded-xl border border-dashed text-muted-foreground'>
                        Chưa có sản phẩm đang hoạt động
                    </div>
                ) : (
                    <div
                        ref={scrollRef}
                        onScroll={updateScrollState}
                        className='flex space-x-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4'
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08, duration: 0.4 }}
                                className='flex-shrink-0 w-56 sm:w-64 lg:w-72'
                            >
                                <Card className='group cursor-pointer overflow-hidden rounded-2xl border-border hover:shadow-xl transition-all duration-300 bg-card'>
                                    <div className='relative overflow-hidden'>
                                        <img
                                            src={getPrimaryImage(product)}
                                            alt={product.productName}
                                            className='w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500'
                                            onClick={() => navigate(`/products/${product.id}`)}
                                        />
                                        {index < 3 && (
                                            <Badge className='absolute top-3 left-3 bg-gradient-to-r from-[#B490F5] to-[#9370DB] text-white border-0'>
                                                <Sparkles className='w-3 h-3 mr-1' />
                                                Nổi bật
                                            </Badge>
                                        )}
                                    </div>
                                    <div className='p-4'>
                                        <p className='text-xs text-muted-foreground mb-1'>{getCategoryNames(product)}</p>
                                        <h3
                                            className='font-semibold text-foreground mb-2 hover:text-[#448B3D] transition-colors line-clamp-2 cursor-pointer'
                                            onClick={() => navigate(`/products/${product.id}`)}
                                        >
                                            {product.productName}
                                        </h3>
                                        <div className='flex items-center space-x-1 mb-3'>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-3.5 h-3.5 ${i < 5 ? 'fill-[#FFB86F] text-[#FFB86F]' : 'text-gray-300'}`}
                                                />
                                            ))}
                                            <span className='text-xs text-muted-foreground ml-1'>Còn {product.stockQuantity}</span>
                                        </div>
                                        <div className='flex items-center justify-between gap-3'>
                                            <span className='text-lg font-bold text-[#448B3D]'>{formatVnd(product.price)}</span>
                                            <Button
                                                size='sm'
                                                onClick={() => handleAddToCart(product)}
                                                className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'
                                            >
                                                <ShoppingCart className='w-4 h-4' />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}

                <div className='text-center mt-8'>
                    <Button variant='outline' size='lg' onClick={() => navigate('/products')} className='rounded-xl border-2 px-8'>
                        Xem tất cả sản phẩm
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProductsSlider;
