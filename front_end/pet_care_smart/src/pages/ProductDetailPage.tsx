import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCart } from '@/context/CartContext';
import {
    ShoppingCart, Heart, Star, Truck, Shield,
    ArrowLeft, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const PRODUCTS_DATA: Record<string, {
    id: string; name: string; price: number; discount?: number;
    rating: number; reviews: number; category: string; brand: string;
    stock: number; images: string[]; aiRecommended?: boolean;
    description: string; features: string[];
    specifications: Record<string, string>;
}> = {
    '1': {
        id: '1', name: 'Thức ăn chó hữu cơ cao cấp', price: 49.99, discount: 10,
        rating: 4.8, reviews: 234, category: 'Thức ăn', brand: 'PetNutrition', stock: 45,
        images: [
            'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        aiRecommended: true,
        description: 'Thức ăn chó hữu cơ cao cấp được làm từ gà thật, gạo lứt và rau củ tươi. Được bào chế đặc biệt cho chó trưởng thành với hàm lượng protein cao và các dưỡng chất thiết yếu.',
        features: ['100% thành phần hữu cơ', 'Công thức không chứa ngũ cốc', 'Giàu protein (30%)', 'Không chất bảo quản nhân tạo', 'Sản xuất tại Mỹ', 'Được bác sĩ thú y khuyên dùng'],
        specifications: { 'Trọng lượng': '30 lbs', 'Protein': '30%', 'Chất béo': '15%', 'Chất xơ': '4%', 'Giai đoạn': 'Trưởng thành', 'Kích cỡ': 'Giống lớn' }
    },
    '2': {
        id: '2', name: 'Cột cào móng mèo cao cấp', price: 89.99,
        rating: 4.9, reviews: 189, category: 'Đồ chơi', brand: 'FelineFun', stock: 30,
        images: [
            'https://images.unsplash.com/photo-1545249390-6bdfa286032f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBzY3JhdGNoaW5nJTIwcG9zdHxlbnwxfHx8fDE3NzA3ODk3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        aiRecommended: true,
        description: 'Cột cào móng cao cấp giúp mèo thỏa mãn bản năng cào và vui chơi. Chất liệu sisal tự nhiên bền bỉ, đế chắc chắn không bị lật.',
        features: ['Chất liệu sisal tự nhiên', 'Đế chống trượt', 'Chiều cao 70cm', 'Kèm đồ chơi treo', 'Dễ lắp ráp'],
        specifications: { 'Chiều cao': '70 cm', 'Đường kính đế': '40 cm', 'Chất liệu': 'Sisal tự nhiên', 'Màu sắc': 'Nâu tự nhiên', 'Trọng lượng': '3.5 kg' }
    },
    '3': {
        id: '3', name: 'Bộ dây dắt & vòng cổ chó', price: 34.99,
        rating: 4.6, reviews: 567, category: 'Phụ kiện', brand: 'PawGear', stock: 80,
        images: [
            'https://images.unsplash.com/photo-1600277971170-8a7d75fb1bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBsZWFzaCUyMGNvbGxhcnxlbnwxfHx8fDE3NzA2OTk0NDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        description: 'Bộ dây dắt và vòng cổ điều chỉnh được, phù hợp mọi kích cỡ chó. Chất liệu nylon cao cấp, khóa kim loại chắc chắn.',
        features: ['Điều chỉnh kích cỡ linh hoạt', 'Chất liệu nylon cao cấp', 'Khóa kim loại bền', 'Phản quang ban đêm', 'Nhiều màu sắc'],
        specifications: { 'Chiều dài dây': '1.5 m', 'Chất liệu': 'Nylon cao cấp', 'Khóa': 'Kim loại không gỉ', 'Phù hợp': 'Chó mọi kích cỡ' }
    },
    '4': {
        id: '4', name: 'Giường thú cưng chỉnh hình', price: 79.99, discount: 15,
        rating: 4.7, reviews: 423, category: 'Giường', brand: 'ComfortPaw', stock: 25,
        images: [
            'https://images.unsplash.com/photo-1553736026-ff14d158d222?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBiZWQlMjBjb3p5fGVufDF8fHx8MTc3MDc4OTczN3ww&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        aiRecommended: true,
        description: 'Giường thú cưng chỉnh hình với bọt nhớ cao cấp, giúp giảm áp lực lên khớp. Lý tưởng cho thú cưng lớn tuổi hoặc có vấn đề về xương khớp.',
        features: ['Bọt nhớ chỉnh hình', 'Vỏ bọc có thể giặt máy', 'Đế chống trượt', 'Thành giường cao hỗ trợ cổ', 'Kháng khuẩn'],
        specifications: { 'Kích thước': '90 x 70 cm', 'Chiều cao': '20 cm', 'Chất liệu': 'Bọt nhớ + Vải nhung', 'Tải trọng': '30 kg', 'Màu sắc': 'Xám' }
    },
    '5': {
        id: '5', name: 'Đồ chơi thông minh tương tác', price: 44.99,
        rating: 4.5, reviews: 312, category: 'Đồ chơi', brand: 'SmartPet', stock: 60,
        images: [
            'https://images.unsplash.com/photo-1744608257939-1ecbd90f1320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3lzJTIwY29sb3JmdWx8ZW58MXx8fHwxNzcwNzYxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        description: 'Đồ chơi tương tác thông minh kích thích trí tuệ và vận động cho thú cưng. Có thể lập trình chuyển động ngẫu nhiên để giữ thú cưng luôn hứng thú.',
        features: ['Chuyển động ngẫu nhiên AI', 'Pin sạc USB-C', 'Chế độ tự động tắt', 'An toàn cho thú cưng', 'Chống nước IPX4'],
        specifications: { 'Pin': 'Li-ion 1200mAh', 'Thời gian dùng': '4-6 giờ', 'Sạc': 'USB-C 1.5h', 'Kích thước': '12 x 8 cm', 'Chất liệu': 'ABS an toàn' }
    },
    '6': {
        id: '6', name: 'Thức ăn mèo tự nhiên', price: 39.99,
        rating: 4.8, reviews: 198, category: 'Thức ăn', brand: 'PetNutrition', stock: 55,
        images: [
            'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        description: 'Thức ăn mèo tự nhiên với thành phần cá hồi và rau củ tươi. Bổ sung omega-3 giúp lông mèo bóng mượt và tăng cường hệ miễn dịch.',
        features: ['Cá hồi tự nhiên', 'Giàu Omega-3', 'Không màu nhân tạo', 'Hỗ trợ tiêu hóa', 'Tăng cường miễn dịch'],
        specifications: { 'Trọng lượng': '2 kg', 'Protein': '35%', 'Chất béo': '12%', 'Độ ẩm': '10%', 'Giai đoạn': 'Mọi lứa tuổi' }
    }
};

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [imgDirection, setImgDirection] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);

    const product = PRODUCTS_DATA[id || '1'] ?? PRODUCTS_DATA['1'];
    const finalPrice = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;

    const goToImage = (index: number) => {
        setImgDirection(index > selectedImage ? 1 : -1);
        setSelectedImage(index);
    };
    const prevImage = () => {
        const newIdx = (selectedImage - 1 + product.images.length) % product.images.length;
        setImgDirection(-1);
        setSelectedImage(newIdx);
    };
    const nextImage = () => {
        const newIdx = (selectedImage + 1) % product.images.length;
        setImgDirection(1);
        setSelectedImage(newIdx);
    };

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart({
                id: product.id,
                name: product.name,
                price: finalPrice,
                image: product.images[0],
                category: product.category
            });
        }
        toast.success(`Đã thêm ${quantity} "${product.name}" vào giỏ hàng!`);
    };

    const handleWishlist = () => {
        setWishlisted((prev) => !prev);
        toast.success(wishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích ❤️');
    };

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <Button variant='ghost' onClick={() => navigate('/products')} className='mb-6 rounded-xl'>
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Quay lại sản phẩm
                </Button>

                <div className='grid lg:grid-cols-2 gap-12'>
                    {/* ── Image Slider ── */}
                    <div>
                        <div className='relative rounded-2xl overflow-hidden mb-4 bg-card border border-border'>
                            <AnimatePresence mode='wait' custom={imgDirection}>
                                <motion.img
                                    key={selectedImage}
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    custom={imgDirection}
                                    variants={{
                                        enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
                                        center: { x: 0, opacity: 1 },
                                        exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })
                                    }}
                                    initial='enter'
                                    animate='center'
                                    exit='exit'
                                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                                    className='w-full h-[500px] object-cover'
                                />
                            </AnimatePresence>

                            {product.aiRecommended && (
                                <Badge className='absolute top-4 left-4 bg-gradient-to-r from-[#B490F5] to-[#9370DB] text-white border-0 z-10'>
                                    <Sparkles className='w-3 h-3 mr-1' />
                                    AI Gợi ý
                                </Badge>
                            )}
                            {product.discount && (
                                <Badge className='absolute top-4 right-4 bg-[#FFB86F] text-white border-0 text-lg px-3 py-1 z-10'>
                                    -{product.discount}% OFF
                                </Badge>
                            )}

                            {product.images.length > 1 && (
                                <>
                                    <button onClick={prevImage} className='absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-md z-10' aria-label='Ảnh trước'>
                                        <ChevronLeft className='w-5 h-5' />
                                    </button>
                                    <button onClick={nextImage} className='absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all shadow-md z-10' aria-label='Ảnh tiếp'>
                                        <ChevronRight className='w-5 h-5' />
                                    </button>
                                    <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10'>
                                        {product.images.map((_, i) => (
                                            <button key={i} onClick={() => goToImage(i)} className={`rounded-full transition-all duration-300 ${i === selectedImage ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`} aria-label={`Ảnh ${i + 1}`} />
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className='grid grid-cols-4 gap-4'>
                            {product.images.map((image, index) => (
                                <button key={index} onClick={() => goToImage(index)} className={`rounded-xl overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-[#448B3D] scale-95' : 'border-border hover:border-[#448B3D]/50'}`}>
                                    <img src={image} alt='' className='w-full h-24 object-cover' />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Details ── */}
                    <div>
                        <div className='mb-4'>
                            <Badge className='mb-2'>{product.category}</Badge>
                            <h1 className='text-3xl font-bold text-foreground mb-2'>{product.name}</h1>
                            <p className='text-sm text-muted-foreground'>Thương hiệu: {product.brand}</p>
                        </div>

                        {/* Rating */}
                        <div className='flex items-center space-x-2 mb-6'>
                            <div className='flex items-center space-x-1'>
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-[#FFB86F] text-[#FFB86F]' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className='font-semibold'>{product.rating}</span>
                            <span className='text-muted-foreground'>({product.reviews} đánh giá)</span>
                        </div>

                        {/* Price */}
                        <div className='mb-6'>
                            {product.discount ? (
                                <div className='flex items-baseline space-x-3'>
                                    <span className='text-4xl font-bold text-[#448B3D]'>${finalPrice.toFixed(2)}</span>
                                    <span className='text-2xl text-muted-foreground line-through'>${product.price}</span>
                                    <span className='text-lg text-[#FFB86F] font-semibold'>
                                        Tiết kiệm ${(product.price - finalPrice).toFixed(2)}
                                    </span>
                                </div>
                            ) : (
                                <span className='text-4xl font-bold text-[#448B3D]'>${product.price}</span>
                            )}
                        </div>

                        {/* Stock */}
                        <div className='mb-6'>
                            <p className='text-sm'>
                                <span className='text-muted-foreground'>Tình trạng: </span>
                                <span className='text-[#7FD99E] font-semibold'>{product.stock} còn hàng</span>
                            </p>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className='flex items-center space-x-4 mb-8'>
                            <div className='flex items-center border border-border rounded-xl overflow-hidden'>
                                <Button variant='ghost' size='sm' onClick={() => setQuantity(Math.max(1, quantity - 1))} className='rounded-none'>-</Button>
                                <span className='px-6 py-2 font-semibold'>{quantity}</span>
                                <Button variant='ghost' size='sm' onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className='rounded-none'>+</Button>
                            </div>
                            <Button size='lg' onClick={handleAddToCart} className='flex-1 rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white'>
                                <ShoppingCart className='w-5 h-5 mr-2' />
                                Thêm vào giỏ
                            </Button>
                            <Button size='lg' variant='outline' onClick={handleWishlist} className={`rounded-xl border-2 ${wishlisted ? 'border-red-400 text-red-500' : ''}`}>
                                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                            </Button>
                        </div>

                        {/* Info cards */}
                        <div className='grid grid-cols-2 gap-4 mb-8'>
                            <Card className='p-4 rounded-xl border-border flex items-center space-x-3'>
                                <Truck className='w-5 h-5 text-[#448B3D]' />
                                <div>
                                    <p className='text-sm font-semibold'>Miễn phí vận chuyển</p>
                                    <p className='text-xs text-muted-foreground'>Cho đơn hàng trên $50</p>
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
                                <TabsTrigger value='features' className='flex-1 rounded-lg'>Tính năng</TabsTrigger>
                                <TabsTrigger value='specs' className='flex-1 rounded-lg'>Thông số</TabsTrigger>
                            </TabsList>
                            <TabsContent value='description' className='mt-4'>
                                <p className='text-muted-foreground leading-relaxed'>{product.description}</p>
                            </TabsContent>
                            <TabsContent value='features' className='mt-4'>
                                <ul className='space-y-2'>
                                    {product.features.map((feature, index) => (
                                        <li key={index} className='flex items-center space-x-2'>
                                            <div className='w-2 h-2 rounded-full bg-[#448B3D]' />
                                            <span className='text-muted-foreground'>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                            <TabsContent value='specs' className='mt-4'>
                                <div className='space-y-3'>
                                    {Object.entries(product.specifications).map(([key, value]) => (
                                        <div key={key} className='flex justify-between py-2 border-b border-border'>
                                            <span className='text-muted-foreground'>{key}</span>
                                            <span className='font-semibold'>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
