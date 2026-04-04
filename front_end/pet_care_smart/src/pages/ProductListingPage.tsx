import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import {
    Filter, Grid, List, ShoppingCart,
    SlidersHorizontal, Star, Search, X
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PRODUCTS = [
    { id: '1', name: 'Thức ăn chó hữu cơ cao cấp', price: 49.99, rating: 4.8, reviews: 234, category: 'Thức ăn', brand: 'PetNutrition', image: 'https://images.unsplash.com/photo-1747577672457-bd82ee9d9e4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcmVtaXVtJTIwZG9nJTIwZm9vZCUyMGJhZ3xlbnwxfHx8fDE3NzA3NjEwNDd8MA&ixlib=rb-4.1.0&q=80&w=1080', aiRecommended: true, discount: 10 },
    { id: '2', name: 'Cột cào móng mèo cao cấp', price: 89.99, rating: 4.9, reviews: 189, category: 'Đồ chơi', brand: 'FelineFun', image: 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXQlMjBzY3JhdGNoaW5nJTIwcG9zdHxlbnwxfHx8fDE3NzA3ODk3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080', aiRecommended: true },
    { id: '3', name: 'Bộ dây dắt & vòng cổ chó', price: 34.99, rating: 4.6, reviews: 567, category: 'Phụ kiện', brand: 'PawGear', image: 'https://images.unsplash.com/photo-1600277971170-8a7d75fb1bd9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBsZWFzaCUyMGNvbGxhcnxlbnwxfHx8fDE3NzA2OTk0NDd8MA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: '4', name: 'Giường thú cưng chỉnh hình', price: 79.99, rating: 4.7, reviews: 423, category: 'Giường', brand: 'ComfortPaw', image: 'https://images.unsplash.com/photo-1553736026-ff14d158d222?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBiZWQlMjBjb3p5fGVufDF8fHx8MTc3MDc4OTczN3ww&ixlib=rb-4.1.0&q=80&w=1080', aiRecommended: true, discount: 15 },
    { id: '5', name: 'Đồ chơi thông minh tương tác', price: 44.99, rating: 4.5, reviews: 312, category: 'Đồ chơi', brand: 'SmartPet', image: 'https://images.unsplash.com/photo-1744608257939-1ecbd90f1320?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjB0b3lzJTIwY29sb3JmdWx8ZW58MXx8fHwxNzcwNzYxMDAwfDA&ixlib=rb-4.1.0&q=80&w=1080' },
    { id: '6', name: 'Thức ăn mèo tự nhiên', price: 39.99, rating: 4.8, reviews: 198, category: 'Thức ăn', brand: 'PetNutrition', image: 'https://images.unsplash.com/photo-1767023023369-96a7c923be0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkb2clMjBmb29kJTIwYm93bCUyMGhlYWx0aHl8ZW58MXx8fHwxNzcwNzQyNDk0fDA&ixlib=rb-4.1.0&q=80&w=1080' },
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
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProducts = PRODUCTS.filter((p) => {
        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedCategories.length > 0 && !selectedCategories.includes(p.category)) return false;
        if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
        if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
        return true;
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return b.reviews - a.reviews;
    });

    const toggleCategory = (cat: string, checked: boolean) =>
        setSelectedCategories(prev => checked ? [...prev, cat] : prev.filter(c => c !== cat));

    const toggleBrand = (brand: string, checked: boolean) =>
        setSelectedBrands(prev => checked ? [...prev, brand] : prev.filter(b => b !== brand));

    const clearAll = () => {
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceRange([0, 200]);
        setSearchQuery('');
    };

    const activeFilterCount = selectedCategories.length + selectedBrands.length +
        (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0);

    const handleAddToCart = (product: (typeof PRODUCTS)[0]) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.discount ? product.price * (1 - product.discount / 100) : product.price,
            image: product.image,
            category: product.category,
        });
        toast.success(`Đã thêm vào giỏ hàng!`);
    };

    // ── Shared filter panel content ──────────────────────────────────────────
    const FilterPanel = () => (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-foreground flex items-center gap-2'>
                    <SlidersHorizontal className='w-4 h-4' />
                    Bộ lọc
                    {activeFilterCount > 0 && (
                        <span className='bg-[#448B3D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                            {activeFilterCount}
                        </span>
                    )}
                </h3>
                {activeFilterCount > 0 && (
                    <button onClick={clearAll} className='text-xs text-[#448B3D] hover:underline font-medium'>
                        Xóa tất cả
                    </button>
                )}
            </div>

            {/* Price Range */}
            <div>
                <div className='flex items-center justify-between mb-3'>
                    <Label className='font-semibold'>Khoảng giá</Label>
                    <span className='text-sm font-semibold text-[#448B3D]'>
                        ${priceRange[0]} – ${priceRange[1]}
                    </span>
                </div>
                <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={200}
                    step={5}
                    className='py-1'
                />
                <div className='flex justify-between text-xs text-muted-foreground mt-2'>
                    <span>$0</span>
                    <span>$200</span>
                </div>
            </div>

            {/* Categories */}
            <div>
                <Label className='mb-3 block font-semibold'>Danh mục</Label>
                <div className='space-y-2.5'>
                    {CATEGORIES.map(cat => (
                        <div key={cat} className='flex items-center gap-2.5'>
                            <Checkbox
                                id={`cat-${cat}`}
                                checked={selectedCategories.includes(cat)}
                                onCheckedChange={checked => toggleCategory(cat, !!checked)}
                                className='size-3.5'
                            />
                            <label htmlFor={`cat-${cat}`} className='text-sm text-muted-foreground cursor-pointer select-none'>
                                {cat}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Brands */}
            <div>
                <Label className='mb-3 block font-semibold'>Thương hiệu</Label>
                <div className='space-y-2.5'>
                    {BRANDS.map(brand => (
                        <div key={brand} className='flex items-center gap-2.5'>
                            <Checkbox
                                id={`brand-${brand}`}
                                checked={selectedBrands.includes(brand)}
                                onCheckedChange={checked => toggleBrand(brand, !!checked)}
                                className='size-3.5'
                            />
                            <label htmlFor={`brand-${brand}`} className='text-sm text-muted-foreground cursor-pointer select-none'>
                                {brand}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className='min-h-screen bg-background'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8'>

                {/* Header */}
                <div className='mb-6'>
                    <h1 className='text-2xl sm:text-3xl font-bold text-foreground mb-1'>🛒 Tất cả sản phẩm</h1>
                    <p className='text-muted-foreground text-sm sm:text-base'>Thức ăn, thuốc, phụ kiện cho vật nuôi — Giá tốt, giao tận nơi</p>
                </div>

                {/* Search + toolbar row */}
                <div className='flex flex-col sm:flex-row gap-3 mb-6'>
                    {/* Search */}
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                        <Input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder='Tìm sản phẩm...'
                            className='pl-9 rounded-xl h-11'
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'>
                                <X className='w-4 h-4' />
                            </button>
                        )}
                    </div>

                    {/* Sort */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className='w-full sm:w-44 rounded-xl h-11'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='popular'>Phổ biến nhất</SelectItem>
                            <SelectItem value='price-low'>Giá: Thấp → Cao</SelectItem>
                            <SelectItem value='price-high'>Giá: Cao → Thấp</SelectItem>
                            <SelectItem value='rating'>Đánh giá cao nhất</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Filter button — mobile */}
                    <Button
                        variant='outline'
                        onClick={() => setFilterDrawerOpen(true)}
                        className='lg:hidden rounded-xl h-11 gap-2 shrink-0'
                    >
                        <Filter className='w-4 h-4' />
                        Bộ lọc
                        {activeFilterCount > 0 && (
                            <span className='bg-[#448B3D] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>

                    {/* View toggle — desktop */}
                    <div className='hidden md:flex items-center border border-border rounded h-11 shrink-0'>
                        <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size='sm' onClick={() => setViewMode('grid')} className='rounded-none h-full  p-0'>
                            <Grid className='w-4 h-4' />
                        </Button>
                        <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size='sm' onClick={() => setViewMode('list')} className='rounded-none h-full p-0'>
                            <List className='w-4 h-4' />
                        </Button>
                    </div>
                </div>

                {/* Active filter chips */}
                {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                    <div className='flex flex-wrap gap-2 mb-5'>
                        {selectedCategories.map(cat => (
                            <button key={cat} onClick={() => toggleCategory(cat, false)}
                                className='flex items-center gap-1 bg-[#448B3D]/10 text-[#448B3D] text-sm font-medium px-3 py-1 rounded-full hover:bg-[#448B3D]/20 transition-colors'>
                                {cat} <X className='w-3 h-3' />
                            </button>
                        ))}
                        {selectedBrands.map(brand => (
                            <button key={brand} onClick={() => toggleBrand(brand, false)}
                                className='flex items-center gap-1 bg-[#448B3D]/10 text-[#448B3D] text-sm font-medium px-3 py-1 rounded-full hover:bg-[#448B3D]/20 transition-colors'>
                                {brand} <X className='w-3 h-3' />
                            </button>
                        ))}
                    </div>
                )}

                <div className='flex gap-6 lg:gap-8'>
                    {/* ── Desktop sidebar filter ── */}
                    <aside className='hidden lg:block w-56 shrink-0'>
                        <div className='sticky top-20 bg-card border border-border rounded-2xl p-5'>
                            <FilterPanel />
                        </div>
                    </aside>

                    {/* ── Products area ── */}
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm text-muted-foreground mb-4'>
                            {filteredProducts.length} sản phẩm
                        </p>

                        {/* Grid view */}
                        {viewMode === 'grid' && (
                            <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5'>
                                {filteredProducts.map(product => (
                                    <Card key={product.id}
                                        className='group cursor-pointer overflow-hidden rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-lg transition-all duration-300 bg-card flex flex-col'>
                                        <div className='relative overflow-hidden'>
                                            <img
                                                src={product.image}
                                                alt={product.name}
                                                className='w-full h-40 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500'
                                                onClick={() => navigate(`/products/${product.id}`)}
                                            />
                                            {product.aiRecommended && (
                                                <Badge className='absolute top-2 left-2 bg-[#448B3D] text-white border-0 text-xs px-2 py-0.5'>
                                                    ⭐ Bán chạy
                                                </Badge>
                                            )}
                                            {product.discount && (
                                                <Badge className='absolute top-2 right-2 bg-red-500 text-white border-0 text-xs px-2 py-0.5 font-bold'>
                                                    -{product.discount}%
                                                </Badge>
                                            )}
                                        </div>
                                        <div className='p-3 sm:p-4 flex flex-col flex-1'>
                                            <p className='text-xs text-muted-foreground mb-0.5'>{product.category}</p>
                                            <h3
                                                className='font-bold text-sm sm:text-base text-foreground mb-2 hover:text-[#448B3D] transition-colors cursor-pointer leading-snug line-clamp-2 flex-1'
                                                onClick={() => navigate(`/products/${product.id}`)}
                                            >
                                                {product.name}
                                            </h3>
                                            <div className='flex items-center gap-0.5 mb-2'>
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                ))}
                                                <span className='text-xs text-muted-foreground ml-1'>({product.reviews})</span>
                                            </div>
                                            <div className='flex items-center justify-between gap-2 mt-auto'>
                                                <div>
                                                    {product.discount ? (
                                                        <div className='flex flex-col'>
                                                            <span className='text-lg sm:text-xl font-bold text-[#448B3D]'>
                                                                ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                                            </span>
                                                            <span className='text-xs text-muted-foreground line-through'>${product.price}</span>
                                                        </div>
                                                    ) : (
                                                        <span className='text-lg sm:text-xl font-bold text-[#448B3D]'>${product.price}</span>
                                                    )}
                                                </div>
                                                <Button
                                                    size='sm'
                                                    onClick={() => handleAddToCart(product)}
                                                    className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white h-9 w-9 sm:w-auto sm:px-3 p-0 shrink-0'
                                                    aria-label='Thêm vào giỏ'
                                                >
                                                    <ShoppingCart className='w-4 h-4' />
                                                    <span className='hidden sm:inline ml-1.5'>Thêm</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* List view */}
                        {viewMode === 'list' && (
                            <div className='space-y-3'>
                                {filteredProducts.map(product => (
                                    <Card key={product.id}
                                        className='group overflow-hidden rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-md transition-all duration-300 bg-card'>
                                        <div className='flex gap-4 p-3 sm:p-4'>
                                            <div className='relative shrink-0 overflow-hidden rounded-lg'>
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className='w-24 h-24 sm:w-32 sm:h-32 object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer'
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                />
                                                {product.discount && (
                                                    <Badge className='absolute top-1 left-1 bg-red-500 text-white border-0 text-xs px-1.5 py-0.5 font-bold'>
                                                        -{product.discount}%
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className='flex-1 min-w-0 flex flex-col'>
                                                <div className='flex items-start justify-between gap-2'>
                                                    <div className='flex-1 min-w-0'>
                                                        <p className='text-xs text-muted-foreground mb-0.5'>{product.category}</p>
                                                        <h3
                                                            className='font-bold text-base sm:text-lg text-foreground hover:text-[#448B3D] transition-colors cursor-pointer leading-snug'
                                                            onClick={() => navigate(`/products/${product.id}`)}
                                                        >
                                                            {product.name}
                                                        </h3>
                                                    </div>
                                                    {product.aiRecommended && (
                                                        <Badge className='bg-[#448B3D] text-white border-0 text-xs shrink-0'>⭐ Bán chạy</Badge>
                                                    )}
                                                </div>
                                                <div className='flex items-center gap-0.5 mt-1.5'>
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                                                    ))}
                                                    <span className='text-xs text-muted-foreground ml-1'>({product.reviews})</span>
                                                </div>
                                                <div className='flex items-center justify-between gap-3 mt-auto pt-3'>
                                                    <div>
                                                        {product.discount ? (
                                                            <div className='flex items-baseline gap-2'>
                                                                <span className='text-xl font-bold text-[#448B3D]'>
                                                                    ${(product.price * (1 - product.discount / 100)).toFixed(2)}
                                                                </span>
                                                                <span className='text-sm text-muted-foreground line-through'>${product.price}</span>
                                                            </div>
                                                        ) : (
                                                            <span className='text-xl font-bold text-[#448B3D]'>${product.price}</span>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size='sm'
                                                        onClick={() => handleAddToCart(product)}
                                                        className='rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white h-10 px-4 shrink-0'
                                                    >
                                                        <ShoppingCart className='w-4 h-4 mr-1.5' />
                                                        Thêm vào giỏ
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {filteredProducts.length === 0 && (
                            <div className='text-center py-16'>
                                <p className='text-foreground font-semibold text-lg mb-2'>Không tìm thấy sản phẩm</p>
                                <p className='text-muted-foreground text-sm mb-6'>Thử thay đổi từ khóa hoặc bộ lọc</p>
                                <Button variant='outline' className='rounded-xl' onClick={clearAll}>
                                    Xóa bộ lọc
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Mobile filter drawer ── */}
            <AnimatePresence>
                {filterDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className='fixed inset-0 bg-black/50 z-40 lg:hidden'
                            onClick={() => setFilterDrawerOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className='fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-card border-l border-border z-50 flex flex-col lg:hidden'
                        >
                            <div className='flex items-center justify-between p-5 border-b border-border'>
                                <h3 className='font-bold text-lg text-foreground'>Bộ lọc</h3>
                                <button onClick={() => setFilterDrawerOpen(false)} className='p-2 rounded-lg hover:bg-muted transition-colors'>
                                    <X className='w-5 h-5' />
                                </button>
                            </div>
                            <div className='flex-1 overflow-y-auto p-5'>
                                <FilterPanel />
                            </div>
                            <div className='p-4 border-t border-border'>
                                <Button
                                    className='w-full rounded-xl bg-[#448B3D] hover:bg-[#336B2D] text-white font-bold h-12'
                                    onClick={() => setFilterDrawerOpen(false)}
                                >
                                    Xem {filteredProducts.length} sản phẩm
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductListingPage;
