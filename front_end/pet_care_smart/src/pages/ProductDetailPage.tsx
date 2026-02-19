import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ShoppingCart,
    Heart,
    Star,
    Truck,
    Shield,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// import { toast } from 'sonner';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    //   const { addToCart } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);

    // Mock product data
    const product = {
        id: id || '1',
        name: 'Premium Organic Dog Food',
        price: 49.99,
        discount: 10,
        rating: 4.8,
        reviews: 234,
        category: 'Food',
        brand: 'PetNutrition',
        stock: 45,
        images: [
            'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
            'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080'
        ],
        aiRecommended: true,
        description:
            'Premium organic dog food made with real chicken, brown rice, and vegetables. Specially formulated for adult dogs with high-quality protein and essential nutrients.',
        features: [
            '100% organic ingredients',
            'Grain-free formula',
            'Rich in protein (30%)',
            'No artificial preservatives',
            'Made in USA',
            'Veterinarian recommended'
        ],
        specifications: {
            Weight: '30 lbs',
            Protein: '30%',
            Fat: '15%',
            Fiber: '4%',
            'Life Stage': 'Adult',
            Size: 'Large Breed'
        }
    };

    const finalPrice = product.discount
        ? product.price * (1 - product.discount / 100)
        : product.price;

    // const handleAddToCart = () => {
    //     for (let i = 0; i < quantity; i++) {
    //         addToCart({
    //             id: product.id,
    //             name: product.name,
    //             price: finalPrice,
    //             image: product.images[0],
    //             category: product.category
    //         });
    //     }
    //     toast.success(`${quantity} ${product.name} added to cart!`);
    // };

    return (
        <div className='min-h-screen bg-background py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Back Button */}
                <Button
                    variant='ghost'
                    onClick={() => navigate('/products')}
                    className='mb-6 rounded-xl'
                >
                    <ArrowLeft className='w-4 h-4 mr-2' />
                    Back to Products
                </Button>

                <div className='grid lg:grid-cols-2 gap-12'>
                    {/* Images */}
                    <div>
                        <div className='relative rounded-2xl overflow-hidden mb-4 bg-white border border-border'>
                            <img
                                src={product.images[selectedImage]}
                                alt={product.name}
                                className='w-full h-[500px] object-cover'
                            />
                            {product.aiRecommended && (
                                <Badge className='absolute top-4 left-4 bg-gradient-to-r from-[#B490F5] to-[#9370DB] text-white border-0'>
                                    <Sparkles className='w-3 h-3 mr-1' />
                                    AI Recommended
                                </Badge>
                            )}
                            {product.discount && (
                                <Badge className='absolute top-4 right-4 bg-[#FFB86F] text-white border-0 text-lg px-3 py-1'>
                                    -{product.discount}% OFF
                                </Badge>
                            )}
                        </div>
                        <div className='grid grid-cols-4 gap-4'>
                            {product.images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`rounded-xl overflow-hidden border-2 transition-all ${
                                        selectedImage === index
                                            ? 'border-[#5B9FD8]'
                                            : 'border-border hover:border-[#5B9FD8]/50'
                                    }`}
                                >
                                    <img
                                        src={image}
                                        alt=''
                                        className='w-full h-24 object-cover'
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <div className='mb-4'>
                            <Badge className='mb-2'>{product.category}</Badge>
                            <h1 className='text-3xl font-bold text-foreground mb-2'>
                                {product.name}
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                by {product.brand}
                            </p>
                        </div>

                        {/* Rating */}
                        <div className='flex items-center space-x-2 mb-6'>
                            <div className='flex items-center space-x-1'>
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${
                                            i < Math.floor(product.rating)
                                                ? 'fill-[#FFB86F] text-[#FFB86F]'
                                                : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className='font-semibold'>
                                {product.rating}
                            </span>
                            <span className='text-muted-foreground'>
                                ({product.reviews} reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <div className='mb-6'>
                            {product.discount ? (
                                <div className='flex items-baseline space-x-3'>
                                    <span className='text-4xl font-bold text-[#5B9FD8]'>
                                        ${finalPrice.toFixed(2)}
                                    </span>
                                    <span className='text-2xl text-muted-foreground line-through'>
                                        ${product.price}
                                    </span>
                                    <span className='text-lg text-[#FFB86F] font-semibold'>
                                        Save $
                                        {(product.price - finalPrice).toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                            ) : (
                                <span className='text-4xl font-bold text-[#5B9FD8]'>
                                    ${product.price}
                                </span>
                            )}
                        </div>

                        {/* Stock */}
                        <div className='mb-6'>
                            <p className='text-sm'>
                                <span className='text-muted-foreground'>
                                    Availability:
                                </span>{' '}
                                <span className='text-[#7FD99E] font-semibold'>
                                    {product.stock} in stock
                                </span>
                            </p>
                        </div>

                        {/* Quantity & Add to Cart */}
                        <div className='flex items-center space-x-4 mb-8'>
                            <div className='flex items-center border border-border rounded-xl overflow-hidden'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                        setQuantity(Math.max(1, quantity - 1))
                                    }
                                    className='rounded-none'
                                >
                                    -
                                </Button>
                                <span className='px-6 py-2 font-semibold'>
                                    {quantity}
                                </span>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() =>
                                        setQuantity(
                                            Math.min(
                                                product.stock,
                                                quantity + 1
                                            )
                                        )
                                    }
                                    className='rounded-none'
                                >
                                    +
                                </Button>
                            </div>
                            <Button
                                size='lg'
                                // onClick={handleAddToCart}
                                className='flex-1 rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                            >
                                <ShoppingCart className='w-5 h-5 mr-2' />
                                Add to Cart
                            </Button>
                            <Button
                                size='lg'
                                variant='outline'
                                className='rounded-xl border-2'
                            >
                                <Heart className='w-5 h-5' />
                            </Button>
                        </div>

                        {/* Features */}
                        <div className='grid grid-cols-2 gap-4 mb-8'>
                            <Card className='p-4 rounded-xl border-border flex items-center space-x-3'>
                                <Truck className='w-5 h-5 text-[#5B9FD8]' />
                                <div>
                                    <p className='text-sm font-semibold'>
                                        Free Shipping
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        On orders over $50
                                    </p>
                                </div>
                            </Card>
                            <Card className='p-4 rounded-xl border-border flex items-center space-x-3'>
                                <Shield className='w-5 h-5 text-[#7FD99E]' />
                                <div>
                                    <p className='text-sm font-semibold'>
                                        Quality Guarantee
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        100% satisfaction
                                    </p>
                                </div>
                            </Card>
                        </div>

                        {/* Tabs */}
                        <Tabs defaultValue='description' className='w-full'>
                            <TabsList className='w-full rounded-xl'>
                                <TabsTrigger
                                    value='description'
                                    className='flex-1 rounded-lg'
                                >
                                    Description
                                </TabsTrigger>
                                <TabsTrigger
                                    value='features'
                                    className='flex-1 rounded-lg'
                                >
                                    Features
                                </TabsTrigger>
                                <TabsTrigger
                                    value='specs'
                                    className='flex-1 rounded-lg'
                                >
                                    Specifications
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value='description' className='mt-4'>
                                <p className='text-muted-foreground leading-relaxed'>
                                    {product.description}
                                </p>
                            </TabsContent>
                            <TabsContent value='features' className='mt-4'>
                                <ul className='space-y-2'>
                                    {product.features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className='flex items-center space-x-2'
                                        >
                                            <div className='w-2 h-2 rounded-full bg-[#5B9FD8]'></div>
                                            <span className='text-muted-foreground'>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </TabsContent>
                            <TabsContent value='specs' className='mt-4'>
                                <div className='space-y-3'>
                                    {Object.entries(product.specifications).map(
                                        ([key, value]) => (
                                            <div
                                                key={key}
                                                className='flex justify-between py-2 border-b border-border'
                                            >
                                                <span className='text-muted-foreground'>
                                                    {key}
                                                </span>
                                                <span className='font-semibold'>
                                                    {value}
                                                </span>
                                            </div>
                                        )
                                    )}
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
