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
    Star
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PRODUCTS = [
    {
        id: '1',
        name: 'Thức ăn chó hữu cơ cao cấp',
        price: 49.99,
        rating: 4.8,
        reviews: 234,
        category: 'Thức ăn',
        brand: 'PetNutrition',
        image: 'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080',
        aiRecommended: true,
        discount: 10
    },
    {
        id: '2',
        name: 'Cột cào móng mèo cao cấp',
        price: 89.99,
        rating: 4.9,
        reviews: 189,
        category: 'Đồ chơi',
        brand: 'FelineFun',
        image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBzY3JhdGNoaW5nJTIwcG9zdHxlbnwxfHx8fDE3NzA3ODk3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
        aiRecommended: true
    },
    {
        id: '3',
        name: 'Bộ dây dắt & vòng cổ chó',
        price: 34.99,
        rating: 4.6,
        reviews: 567,
        category: 'Phụ kiện',
        brand: 'PawGear',
        image: 'https://images.unsplash.com/photo-1600277971170-8a7d75fb1bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBsZWFzaCUyMGNvbGxhcnxlbnwxfHx8fDE3NzA2OTk0NDd8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '4',
        name: 'Giường thú cưng chỉnh hình',
        price: 79.99,
        rating: 4.7,
        reviews: 423,
        category: 'Giường',
        brand: 'ComfortPaw',
        image: 'https://images.unsplash.com/photo-1553736026-ff14d158d222?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBiZWQlMjBjb3p5fGVufDF8fHx8MTc3MDc4OTczN3ww&ixlib=rb-4.1.0&q=80&w=1080',
        aiRecommended: true,
        discount: 15
    },
    {
        id: '5',
        name: 'Đồ chơi thông minh tương tác',
        price: 44.99,
        rating: 4.5,
        reviews: 312,
        category: 'Đồ chơi',
        brand: 'SmartPet',
        image: 'https://images.unsplash.com/photo-1744608257939-1ecbd90f1320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3lzJTIwY29sb3JmdWx8ZW58MXx8fHwxNzcwNzYxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
        id: '6',
        name: 'Thức ăn mèo tự nhiên',
        price: 39.99,
        rating: 4.8,
        reviews: 198,
        category: 'Thức ăn',
        brand: 'PetNutrition',
        image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080'
    }
];

const CATEGORIES = ['Thức ăn', 'Đồ chơi', 'Phụ kiện', 'Giường', 'Sức khỏe'];
const BRANDS = ['PetNutrition', 'FelineFun', 'PawGear', 'ComfortPaw', 'SmartPet'];

const ProductListingPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [priceRange, setPriceRange] = useState([0, 200]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('popular');
    const [showFilters, setShowFilters] = useState(false);

    const filteredProducts = PRODUCTS.filter((p) => {
        if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.reviews - a.reviews; // popular
    });

    const toggleCategory = (cat: string, checked: boolean) => {
        setSelectedCategories((prev) =>
            checked ? [...prev, cat] : prev.filter((c) => c !== cat)
        );
    };

    const toggleBrand = (brand: string, checked: boolean) => {
        setSelectedBrands((prev) =>
            checked ? [...prev, brand] : prev.filter((b) => b !== brand)
        );
    };

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
        toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
    };

    return (
        <div className='min-h-screen bg-background'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl sm:text-4xl font-bold text-foreground mb-2'>🛒 Tất cả sản phẩm</h1>
                    <p className='text-lg text-muted-foreground'>Thức ăn, thuốc, phụ kiện cho vật nuôi — Giá tốt, giao tận nơi</p>
                </div>

                {/* AI Banner */}
                <Card className='p-5 mb-8 bg-green-50 border-2 border-[#448B3D]/30 rounded-xl'>
                    <div className='flex items-center justify-between flex-wrap gap-3'>
                        <div className='flex items-center space-x-4'>
                            <div className='text-4xl'>📞</div>
                            <div>
                                <h3 className='font-bold text-lg text-foreground'>Cần tư vấn chọn sản phẩm?</h3>
                                <p className='text-base text-muted-foreground'>
                                    Gọi ngay <a href='tel:+84702500551' className='font-bold text-[#448B3D] underline'>(84) 702 500 551</a> — Miễn phí tư vấn
                                </p>
                            </div>
                        </div>
                        <a href='tel:+84702500551'>
                            <Button className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-12 px-6 text-base'>
                                📞 Gọi ngay
                            </Button>
                        </a>
                    </div>
                </Card>

                <div className='flex flex-col lg:flex-row gap-8'>
                    {/* Sidebar Filters */}
                    <aside className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                        <Card className='p-6 rounded-2xl sticky top-20'>
                            <div className='flex items-center justify-between mb-6'>
                                <h3 className='font-semibold text-foreground flex items-center'>
                                    <SlidersHorizontal className='w-5 h-5 mr-2' />
                                    Bộ lọc
                                </h3>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        setSelectedBrands([]);
                                        setPriceRange([0, 200]);
                                    }}
                                    className='text-xs text-[#448B3D]'
                                >
                                    Xóa tất cả
                                </Button>
                            </div>

                            {/* Price Range */}
                            <div className='mb-6'>
                                <Label className='mb-3 block'>Khoảng giá</Label>
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
                                <Label className='mb-3 block'>Danh mục</Label>
                                <div className='space-y-2'>
                                    {CATEGORIES.map((cat) => (
                                        <div key={cat} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`cat-${cat}`}
                                                checked={selectedCategories.includes(cat)}
                                                onCheckedChange={(checked) => toggleCategory(cat, !!checked)}
                                                className='w-4 h-4'
                                            />
                                            <label htmlFor={`cat-${cat}`} className='text-sm text-muted-foreground cursor-pointer'>
                                                {cat}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Brands */}
                            <div>
                                <Label className='mb-3 block'>Thương hiệu</Label>
                                <div className='space-y-2'>
                                    {BRANDS.map((brand) => (
                                        <div key={brand} className='flex items-center space-x-2'>
                                            <Checkbox
                                                id={`brand-${brand}`}
                                                checked={selectedBrands.includes(brand)}
                                                onCheckedChange={(checked) => toggleBrand(brand, !!checked)}
                                                className='w-4 h-4'
                                            />
                                            <label htmlFor={`brand-${brand}`} className='text-sm text-muted-foreground cursor-pointer'>
                                                {brand}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </aside>

                    {/* Products */}
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
                                    Bộ lọc
                                </Button>
                                <p className='text-sm text-muted-foreground'>
                                    {filteredProducts.length} sản phẩm
                                </p>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className='w-44 rounded-xl'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='popular'>Phổ biến nhất</SelectItem>
                                        <SelectItem value='price-low'>Giá: Thấp → Cao</SelectItem>
                                        <SelectItem value='price-high'>Giá: Cao → Thấp</SelectItem>
                                        <SelectItem value='rating'>Đánh giá cao nhất</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className='hidden md:flex items-center border border-border rounded-xl p-1'>
                                    <Button
                                        variant={viewMode === 'grid' ? 'default' : 'ghost'}
                                        size='sm'
                                        onClick={() => setViewMode('grid')}
                                        className='rounded-lg'
                                    >
                                        <Grid className='w-4 h-4' />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                                        size='sm'
                                        onClick={() => setViewMode('list')}
                                        className='rounded-lg'
                                    >
                                        <List className='w-4 h-4' />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Grid / List */}
                        <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className='group cursor-pointer overflow-hidden rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-lg transition-all duration-300 bg-card'
                                >
                                    <div className='relative overflow-hidden'>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className='w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500'
                                            onClick={() => navigate(`/products/${product.id}`)}
                                        />
                                        {product.aiRecommended && (
                                            <Badge className='absolute top-3 left-3 bg-[#448B3D] text-white border-0 text-sm px-2 py-1'>
                                                ⭐ Bán chạy
                                            </Badge>
                                        )}
                                        {product.discount && (
                                            <Badge className='absolute top-3 right-3 bg-red-500 text-white border-0 text-sm px-2 py-1 font-bold'>
                                                -{product.discount}%
                                            </Badge>
                                        )}
                                    </div>

                                    <div className='p-5'>
                                        <p className='text-sm text-muted-foreground mb-1 font-medium'>{product.category}</p>
                                        <h3
                                            className='font-bold text-lg text-foreground mb-2 hover:text-[#448B3D] transition-colors cursor-pointer leading-snug'
                                            onClick={() => navigate(`/products/${product.id}`)}
                                        >
                                            {product.name}
                                        </h3>

                                        <div className='flex items-center space-x-1 mb-3'>
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                />
                                            ))}
                                            <span className='text-sm text-muted-foreground ml-1'>({product.reviews})</span>
                                        </div>

                                        <div className='flex items-center justify-between gap-2'>
                                            <div>
                                                {product.discount ? (
                                                    <div className='flex items-center gap-2 flex-wrap'>
                                                        <span className='text-2xl font-bold text-[#448B3D]'>
                                                            ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                                        </span>
                                                        <span className='text-base text-muted-foreground line-through'>
                                                            ${product.price}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className='text-2xl font-bold text-[#448B3D]'>${product.price}</span>
                                                )}
                                            </div>
                                            <Button
                                                size='sm'
                                                onClick={() => handleAddToCart(product)}
                                                className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-11 px-4 text-base shrink-0'
                                            >
                                                <ShoppingCart className='w-4 h-4 mr-1' />
                                                Thêm
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className='text-center py-16'>
                                <p className='text-muted-foreground text-lg'>Không tìm thấy sản phẩm phù hợp.</p>
                                <Button
                                    variant='outline'
                                    className='mt-4 rounded-xl'
                                    onClick={() => {
                                        setSelectedCategories([]);
                                        setSelectedBrands([]);
                                        setPriceRange([0, 200]);
                                    }}
                                >
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductListingPage;
