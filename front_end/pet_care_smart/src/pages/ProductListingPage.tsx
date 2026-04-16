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
import WishlistButton from '@/components/WishlistButton';
import { motion, AnimatePresence } from 'motion/react';
import {
    Filter, Grid, List, ShoppingCart,
    SlidersHorizontal, Star, Search, X, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { productApi, type Product, type Category } from '@/lib/productApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getPrimaryImage(product: Product): string {
    if (product.primaryImageUrl) return product.primaryImageUrl;
    const primary = product.images?.find((i) => i.isPrimary);
    if (primary) return primary.imageUrl;
    if (product.images?.[0]) return product.images[0].imageUrl;
    return 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop';
}

function getCategoryNames(product: Product): string {
    return product.category?.map((c) => c.categoryName).join(', ') || 'Khác';
}

const ProductListingPage = () => {
    const navigate = useNavigate();
    const { addToCart } = useCart();

    // ── Data state ────────────────────────────────────────────────────────────
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Filter state ──────────────────────────────────────────────────────────
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [priceRange, setPriceRange] = useState([0, 5000000]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState('popular');
    const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // ── Fetch data ────────────────────────────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsRes, categoriesRes] = await Promise.all([
                    productApi.getAll(),
                    productApi.getAllCategories(),
                ]);
                setProducts(productsRes.result ?? []);
                setCategories(categoriesRes.result ?? []);
            } catch {
                toast.error('Không thể tải danh sách sản phẩm');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Filter & sort ─────────────────────────────────────────────────────────
    const maxPrice = Math.max(...products.map((p) => p.price), 5000000);

    const filteredProducts = products
        .filter((p) => {
            // Tạm thời hiển thị cả INACTIVE để test
            // if (p.status === 'INACTIVE') return false;
            if (searchQuery && !p.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            if (selectedCategories.length > 0) {
                const productCatIds = p.category?.map((c) => c.categoryId) ?? [];
                if (!selectedCategories.some((id) => productCatIds.includes(id))) return false;
            }
            if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            return b.stockQuantity - a.stockQuantity;
        });

    const toggleCategory = (id: string, checked: boolean) =>
        setSelectedCategories((prev) => (checked ? [...prev, id] : prev.filter((c) => c !== id)));

    const clearAll = () => {
        setSelectedCategories([]);
        setPriceRange([0, maxPrice]);
        setSearchQuery('');
    };

    const activeFilterCount =
        selectedCategories.length + (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0);

    const handleAddToCart = (product: Product) => {
        addToCart({
            id: product.id,
            name: product.productName,
            price: product.price,
            image: getPrimaryImage(product),
            category: getCategoryNames(product),
        });
        toast.success('Đã thêm vào giỏ hàng!');
    };

    // ── Filter panel ──────────────────────────────────────────────────────────
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
                        {priceRange[0].toLocaleString('vi-VN')}₫ – {priceRange[1].toLocaleString('vi-VN')}₫
                    </span>
                </div>
                <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={maxPrice}
                    step={50000}
                    className='py-1'
                />
            </div>

            {/* Categories */}
            {categories.length > 0 && (
                <div>
                    <Label className='mb-3 block font-semibold'>Danh mục</Label>
                    <div className='space-y-2.5'>
                        {categories.map((cat) => (
                            <div key={cat.categoryId} className='flex items-center gap-2.5'>
                                <Checkbox
                                    id={`cat-${cat.categoryId}`}
                                    checked={selectedCategories.includes(cat.categoryId)}
                                    onCheckedChange={(checked) => toggleCategory(cat.categoryId, !!checked)}
                                    className='size-3.5'
                                />
                                <label
                                    htmlFor={`cat-${cat.categoryId}`}
                                    className='text-sm text-muted-foreground cursor-pointer select-none'
                                >
                                    {cat.categoryName}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='text-center'>
                    <Loader2 className='w-10 h-10 animate-spin text-[#448B3D] mx-auto mb-3' />
                    <p className='text-muted-foreground'>Đang tải sản phẩm...</p>
                </div>
            </div>
        );
    }

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
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder='Tìm sản phẩm...'
                            className='pl-9 rounded-xl h-11'
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                            >
                                <X className='w-4 h-4' />
                            </button>
                        )}
                    </div>

                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className='w-full sm:w-44 rounded-xl h-11'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='popular'>Phổ biến nhất</SelectItem>
                            <SelectItem value='price-low'>Giá: Thấp → Cao</SelectItem>
                            <SelectItem value='price-high'>Giá: Cao → Thấp</SelectItem>
                        </SelectContent>
                    </Select>

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

                    <div className='hidden md:flex items-center border border-border rounded h-11 shrink-0'>
                        <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size='sm'
                            onClick={() => setViewMode('grid')}
                            className='rounded-none h-full p-0'
                        >
                            <Grid className='w-4 h-4' />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size='sm'
                            onClick={() => setViewMode('list')}
                            className='rounded-none h-full p-0'
                        >
                            <List className='w-4 h-4' />
                        </Button>
                    </div>
                </div>

                {/* Active filter chips */}
                {selectedCategories.length > 0 && (
                    <div className='flex flex-wrap gap-2 mb-5'>
                        {selectedCategories.map((id) => {
                            const cat = categories.find((c) => c.categoryId === id);
                            return cat ? (
                                <button
                                    key={id}
                                    onClick={() => toggleCategory(id, false)}
                                    className='flex items-center gap-1 bg-[#448B3D]/10 text-[#448B3D] text-sm font-medium px-3 py-1 rounded-full hover:bg-[#448B3D]/20 transition-colors'
                                >
                                    {cat.categoryName} <X className='w-3 h-3' />
                                </button>
                            ) : null;
                        })}
                    </div>
                )}

                <div className='flex gap-6 lg:gap-8'>
                    {/* Desktop sidebar */}
                    <aside className='hidden lg:block w-56 shrink-0'>
                        <div className='sticky top-20 bg-card border border-border rounded-2xl p-5'>
                            <FilterPanel />
                        </div>
                    </aside>

                    {/* Products area */}
                    <div className='flex-1 min-w-0'>
                        <p className='text-sm text-muted-foreground mb-4'>
                            {filteredProducts.length} sản phẩm
                        </p>

                        {/* Grid view */}
                        {viewMode === 'grid' && (
                            <div className='grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5'>
                                {filteredProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        className='group cursor-pointer overflow-hidden rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-lg transition-all duration-300 bg-card flex flex-col'
                                    >
                                        <div className='relative overflow-hidden bg-gray-50'>
                                            <img
                                                src={getPrimaryImage(product)}
                                                alt={product.productName}
                                                className='w-full h-40 sm:h-52 object-contain group-hover:scale-105 transition-transform duration-500'
                                                onClick={() => navigate(`/products/${product.id}`)}
                                            />
                                            {product.status === 'OUT_OF_STOCK' && (
                                                <Badge className='absolute top-2 left-2 bg-gray-500 text-white border-0 text-xs px-2 py-0.5'>
                                                    Hết hàng
                                                </Badge>
                                            )}
                                            <div className='absolute bottom-2 right-2'>
                                                <WishlistButton
                                                    item={{
                                                        id: product.id,
                                                        name: product.productName,
                                                        price: product.price,
                                                        image: getPrimaryImage(product),
                                                        category: getCategoryNames(product),
                                                    }}
                                                    size='sm'
                                                />
                                            </div>
                                        </div>
                                        <div className='p-3 sm:p-4 flex flex-col flex-1'>
                                            <p className='text-xs text-muted-foreground mb-0.5'>
                                                {getCategoryNames(product)}
                                            </p>
                                            <h3
                                                className='font-bold text-sm sm:text-base text-foreground mb-2 hover:text-[#448B3D] transition-colors cursor-pointer leading-snug line-clamp-2 flex-1'
                                                onClick={() => navigate(`/products/${product.id}`)}
                                            >
                                                {product.productName}
                                            </h3>
                                            <div className='flex items-center justify-between gap-2 mt-auto'>
                                                <span className='text-lg sm:text-xl font-bold text-[#448B3D]'>
                                                    {product.price.toLocaleString('vi-VN')}₫
                                                </span>
                                                <Button
                                                    size='sm'
                                                    onClick={() => handleAddToCart(product)}
                                                    disabled={product.status === 'OUT_OF_STOCK'}
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
                                {filteredProducts.map((product) => (
                                    <Card
                                        key={product.id}
                                        className='group overflow-hidden rounded-xl border-2 border-border hover:border-[#448B3D] hover:shadow-md transition-all duration-300 bg-card'
                                    >
                                        <div className='flex gap-4 p-3 sm:p-4'>
                                            <div className='relative shrink-0 overflow-hidden rounded-lg bg-gray-50'>
                                                <img
                                                    src={getPrimaryImage(product)}
                                                    alt={product.productName}
                                                    className='w-24 h-24 sm:w-32 sm:h-32 object-contain group-hover:scale-105 transition-transform duration-500 cursor-pointer'
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                />
                                            </div>
                                            <div className='flex-1 min-w-0 flex flex-col'>
                                                <p className='text-xs text-muted-foreground mb-0.5'>
                                                    {getCategoryNames(product)}
                                                </p>
                                                <h3
                                                    className='font-bold text-base sm:text-lg text-foreground hover:text-[#448B3D] transition-colors cursor-pointer leading-snug'
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                >
                                                    {product.productName}
                                                </h3>
                                                {product.description && (
                                                    <p className='text-sm text-muted-foreground mt-1 line-clamp-2'>
                                                        {product.description}
                                                    </p>
                                                )}
                                                <div className='flex items-center justify-between gap-3 mt-auto pt-3'>
                                                    <span className='text-xl font-bold text-[#448B3D]'>
                                                        {product.price.toLocaleString('vi-VN')}₫
                                                    </span>
                                                    <Button
                                                        size='sm'
                                                        onClick={() => handleAddToCart(product)}
                                                        disabled={product.status === 'OUT_OF_STOCK'}
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

                        {filteredProducts.length === 0 && !loading && (
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

            {/* Mobile filter drawer */}
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
                            className='fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-card border-r border-border z-50 flex flex-col lg:hidden'
                        >
                            <div className='flex items-center justify-between p-5 border-b border-border'>
                                <h3 className='font-bold text-lg text-foreground'>Bộ lọc</h3>
                                <button
                                    onClick={() => setFilterDrawerOpen(false)}
                                    className='p-2 rounded-lg hover:bg-muted transition-colors'
                                >
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
