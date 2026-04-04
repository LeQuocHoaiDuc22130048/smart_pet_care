import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, ShoppingCart, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

const FEATURED = [
    {
        id: '1',
        name: 'Premium Organic Dog Food',
        price: 49.99,
        rating: 4.8,
        reviews: 234,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        aiRecommended: true,
        discount: 10
    },
    {
        id: '2',
        name: 'Luxury Cat Scratching Post',
        price: 89.99,
        rating: 4.9,
        reviews: 189,
        category: 'Toys',
        image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBzY3JhdGNoaW5nJTIwcG9zdHxlbnwxfHx8fDE3NzA3ODk3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        aiRecommended: true
    },
    {
        id: '3',
        name: 'Adjustable Dog Leash & Collar Set',
        price: 34.99,
        rating: 4.6,
        reviews: 567,
        category: 'Accessories',
        image: 'https://images.unsplash.com/photo-1600277971170-8a7d75fb1bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBsZWFzaCUyMGNvbGxhcnxlbnwxfHx8fDE3NzA2OTk0NDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '4',
        name: 'Orthopedic Pet Bed',
        price: 79.99,
        rating: 4.7,
        reviews: 423,
        category: 'Beds',
        image: 'https://images.unsplash.com/photo-1553736026-ff14d158d222?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBiZWQlMjBjb3p5fGVufDF8fHx8MTc3MDc4OTczN3ww&ixlib=rb-4.1.0&q=80&w=1080',
        aiRecommended: true,
        discount: 15
    },
    {
        id: '5',
        name: 'Interactive Smart Toy',
        price: 44.99,
        rating: 4.5,
        reviews: 312,
        category: 'Toys',
        image: 'https://images.unsplash.com/photo-1744608257939-1ecbd90f1320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3lzJTIwY29sb3JmdWx8ZW58MXx8fHwxNzcwNzYxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '6',
        name: 'Natural Cat Food',
        price: 39.99,
        rating: 4.8,
        reviews: 198,
        category: 'Food',
        image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080'
    }
];

const FeaturedProductsSlider = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollState = () => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    const scroll = (dir: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
        setTimeout(updateScrollState, 350);
    };

    const handleAddToCart = (product: (typeof FEATURED)[0]) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
            image: product.image,
            category: product.category
        });
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <section className='py-20 bg-background'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between mb-10'>
                    <div>
                        <h2 className='text-3xl sm:text-4xl font-bold text-foreground mb-2'>Sản phẩm bán chạy</h2>
                        <p className='text-muted-foreground text-base'>Được bà con tin dùng nhiều nhất</p>
                    </div>
                    <div className='flex items-center space-x-2'>
                        <button
                            onClick={() => scroll('left')}
                            disabled={!canScrollLeft}
                            className='w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all'
                            aria-label='Scroll left'
                        >
                            <ChevronLeft className='w-5 h-5' />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            disabled={!canScrollRight}
                            className='w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all'
                            aria-label='Scroll right'
                        >
                            <ChevronRight className='w-5 h-5' />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    onScroll={updateScrollState}
                    className='flex space-x-5 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4'
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {FEATURED.map((product, index) => (
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
                                        src={product.image}
                                        alt={product.name}
                                        className='w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500'
                                        onClick={() => navigate(`/products/${product.id}`)}
                                    />
                                    {product.aiRecommended && (
                                        <Badge className='absolute top-3 left-3 bg-gradient-to-r from-[#B490F5] to-[#9370DB] text-white border-0'>
                                            <Sparkles className='w-3 h-3 mr-1' />
                                            AI Pick
                                        </Badge>
                                    )}
                                    {product.discount && (
                                        <Badge className='absolute top-3 right-3 bg-[#FFB86F] text-white border-0'>
                                            -{product.discount}%
                                        </Badge>
                                    )}
                                </div>
                                <div className='p-4'>
                                    <p className='text-xs text-muted-foreground mb-1'>{product.category}</p>
                                    <h3
                                        className='font-semibold text-foreground mb-2 hover:text-[#448B3D] transition-colors line-clamp-2 cursor-pointer'
                                        onClick={() => navigate(`/products/${product.id}`)}
                                    >
                                        {product.name}
                                    </h3>
                                    <div className='flex items-center space-x-1 mb-3'>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-[#FFB86F] text-[#FFB86F]' : 'text-gray-300'}`}
                                            />
                                        ))}
                                        <span className='text-xs text-muted-foreground ml-1'>({product.reviews})</span>
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <div>
                                            {product.discount ? (
                                                <div className='flex items-center space-x-1.5'>
                                                    <span className='text-lg font-bold text-[#448B3D]'>
                                                        ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                                    </span>
                                                    <span className='text-sm text-muted-foreground line-through'>
                                                        ${product.price}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className='text-lg font-bold text-[#448B3D]'>${product.price}</span>
                                            )}
                                        </div>
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
