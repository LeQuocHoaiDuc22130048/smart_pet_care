import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/context/CartContext';
import {
    Filter,
    Grid,
    List,
    ShoppingCart,
    SlidersHorizontal,
    Sparkles,
    Star
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PRODUCTS = [
    {
        id: '1',
        name: 'Premium Organic Dog Food',
        price: 49.99,
        rating: 4.8,
        reviews: 234,
        category: 'Food',
        brand: 'PetNutrition',
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
        brand: 'FelineFun',
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
        brand: 'PawGear',
        image: 'https://images.unsplash.com/photo-1600277971170-8a7d75fb1bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBsZWFzaCUyMGNvbGxhcnxlbnwxfHx8fDE3NzA2OTk0NDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '4',
        name: 'Orthopedic Pet Bed',
        price: 79.99,
        rating: 4.7,
        reviews: 423,
        category: 'Beds',
        brand: 'ComfortPaw',
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
        brand: 'SmartPet',
        image: 'https://images.unsplash.com/photo-1744608257939-1ecbd90f1320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3lzJTIwY29sb3JmdWx8ZW58MXx8fHwxNzcwNzYxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '6',
        name: 'Natural Cat Food',
        price: 39.99,
        rating: 4.8,
        reviews: 198,
        category: 'Food',
        brand: 'PetNutrition',
        image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080'
    }
];

const ProductListingPage = () => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [priceRange, setPriceRange] = useState([0, 200]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('popular');
    const [showFilters, setShowFilters] = useState(false);
    const { addToCart } = useCart();

    const categories = ['Food', 'Toys', 'Accessories', 'Beds', 'Health'];
    const brands = [
        'PetNutrition',
        'FelineFun',
        'PawGear',
        'ComfortPaw',
        'SmartPet'
    ];

    const filteredProducts = PRODUCTS.filter((product) => {
        if (
            selectedCategories.length > 0 &&
            !selectedCategories.includes(product.category)
        ) {
            return false;
        }
        if (
            selectedBrands.length > 0 &&
            !selectedBrands.includes(product.brand)
        ) {
            return false;
        }
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
            return false;
        }
        return true;
    });

    const handleAddToCart = (product: (typeof PRODUCTS)[0]) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.discount
                ? product.price * (1 - product.discount / 100)
                : product.price,
            image: product.image,
            category: product.category
        });
        toast.success(`${product.name} added to cart!`);
    };

    return (
        <div className='min-h-screen bg-background'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-foreground mb-2'>
                        Premium Pet Products
                    </h1>
                    <p className='text-muted-foreground'>
                        Discover the best products for your furry friends
                    </p>
                </div>

                {/* AI Recommendation Banner */}
                <Card className='p-6 mb-8 bg-gradient-to-r from-[#5B9FD8]/10 to-[#B490F5]/10 border-[#5B9FD8]/20 rounded-2xl'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-[#5B9FD8] to-[#B490F5] flex items-center justify-center'>
                                <Sparkles className='w-6 h-6 text-white' />
                            </div>
                            <div>
                                <h3 className='font-semibold text-foreground mb-1'>
                                    AI-Powered Recommendations
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                    Products marked with ✨ are specially
                                    recommended for you
                                </p>
                            </div>
                        </div>
                        <Button variant='outline' className='rounded-xl'>
                            Personalize
                        </Button>
                    </div>
                </Card>

                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* Filters Sidebar */}
                    <aside
                        className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}
                    >
                        <Card className='p-6 rounded-2xl sticky top-20'>
                            <div className='flex items-center justify-between mb-6'>
                                <h3 className='font-semibold text-foreground flex items-center'>
                                    <SlidersHorizontal className='w-5 h-5 mr-2' />
                                    Filters
                                </h3>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        setSelectedBrands([]);
                                        setPriceRange([0, 200]);
                                    }}
                                    className='text-xs text-[#5B9FD8]'
                                >
                                    Clear All
                                </Button>
                            </div>

                            {/* Price Range */}
                            <div className='mb-6'>
                                <Label className='mb-3 block'>
                                    Price Range
                                </Label>
                                <Slider
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    max={200}
                                    step={10}
                                    className='mb-2'
                                />
                                <div className='flex justify-between text-sm text-muted-foreground'>
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className='mb-6'>
                                <Label className='mb-3 block'>Category</Label>
                                <div className='space-y-2'>
                                    {categories.map((category) => (
                                        <div
                                            key={category}
                                            className='flex items-center space-x-2'
                                        >
                                            <Checkbox
                                                id={category}
                                                checked={selectedCategories.includes(
                                                    category
                                                )}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedCategories([
                                                            ...selectedCategories,
                                                            category
                                                        ]);
                                                    } else {
                                                        setSelectedCategories(
                                                            selectedCategories.filter(
                                                                (c) =>
                                                                    c !==
                                                                    category
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={category}
                                                className='text-sm text-muted-foreground cursor-pointer'
                                            >
                                                {category}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Brands */}
                            <div>
                                <Label className='mb-3 block'>Brand</Label>
                                <div className='space-y-2'>
                                    {brands.map((brand) => (
                                        <div
                                            key={brand}
                                            className='flex items-center space-x-2'
                                        >
                                            <Checkbox
                                                id={brand}
                                                checked={selectedBrands.includes(
                                                    brand
                                                )}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setSelectedBrands([
                                                            ...selectedBrands,
                                                            brand
                                                        ]);
                                                    } else {
                                                        setSelectedBrands(
                                                            selectedBrands.filter(
                                                                (b) =>
                                                                    b !== brand
                                                            )
                                                        );
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={brand}
                                                className='text-sm text-muted-foreground cursor-pointer'
                                            >
                                                {brand}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Products Grid */}
                    <div className='flex-1'>
                        {/* Toolbar */}
                        <div className='flex items-center justify-between mb-6'>
                            <div className='flex items-center space-x-4'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => setShowFilters(!showFilters)}
                                    className='lg:hidden rounded-xl'
                                >
                                    <Filter className='w-4 h-4 mr-2' />
                                    Filters
                                </Button>
                                <p className='text-sm text-muted-foreground'>
                                    {filteredProducts.length} products found
                                </p>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Select
                                    value={sortBy}
                                    onValueChange={setSortBy}
                                >
                                    <SelectTrigger className='w-40 rounded-xl'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='popular'>
                                            Most Popular
                                        </SelectItem>
                                        <SelectItem value='price-low'>
                                            Price: Low to High
                                        </SelectItem>
                                        <SelectItem value='price-high'>
                                            Price: High to Low
                                        </SelectItem>
                                        <SelectItem value='rating'>
                                            Highest Rated
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className='hidden md:flex items-center border border-border rounded-xl p-1'>
                                    <Button
                                        variant={
                                            viewMode === 'grid'
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        size='sm'
                                        onClick={() => setViewMode('grid')}
                                        className='rounded-lg'
                                    >
                                        <Grid className='w-4 h-4' />
                                    </Button>
                                    <Button
                                        variant={
                                            viewMode === 'list'
                                                ? 'default'
                                                : 'ghost'
                                        }
                                        size='sm'
                                        onClick={() => setViewMode('list')}
                                        className='rounded-lg'
                                    >
                                        <List className='w-4 h-4' />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Products */}
                        <div
                            className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}
                        >
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className='group cursor-pointer overflow-hidden rounded-2xl border-border hover:shadow-xl transition-all duration-300 bg-white'
                                >
                                    <div className='relative'>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className='w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500'
                                            onClick={() =>
                                                navigate(
                                                    `/products/${product.id}`
                                                )
                                            }
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

                                    <div className='p-5'>
                                        <div className='flex items-start justify-between mb-2'>
                                            <div className='flex-1'>
                                                <p className='text-xs text-muted-foreground mb-1'>
                                                    {product.category}
                                                </p>
                                                <h3
                                                    className='font-semibold text-foreground mb-1 hover:text-[#5B9FD8] transition-colors'
                                                    onClick={() =>
                                                        navigate(
                                                            `/products/${product.id}`
                                                        )
                                                    }
                                                >
                                                    {product.name}
                                                </h3>
                                            </div>
                                        </div>

                                        <div className='flex items-center space-x-1 mb-3'>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${
                                                        i <
                                                        Math.floor(
                                                            product.rating
                                                        )
                                                            ? 'fill-[#FFB86F] text-[#FFB86F]'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                            <span className='text-sm text-muted-foreground ml-2'>
                                                ({product.reviews})
                                            </span>
                                        </div>

                                        <div className='flex items-center justify-between'>
                                            <div>
                                                {product.discount ? (
                                                    <div className='flex items-center space-x-2'>
                                                        <span className='text-xl font-bold text-[#5B9FD8]'>
                                                            $
                                                            {(
                                                                product.price *
                                                                (1 -
                                                                    product.discount /
                                                                        100)
                                                            ).toFixed(2)}
                                                        </span>
                                                        <span className='text-sm text-muted-foreground line-through'>
                                                            ${product.price}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className='text-xl font-bold text-[#5B9FD8]'>
                                                        ${product.price}
                                                    </span>
                                                )}
                                            </div>
                                            <Button
                                                size='sm'
                                                onClick={() =>
                                                    handleAddToCart(product)
                                                }
                                                className='rounded-xl bg-[#5B9FD8] hover:bg-[#3D7BA8] text-white'
                                            >
                                                <ShoppingCart className='w-4 h-4 mr-1' />
                                                Add
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListingPage;
