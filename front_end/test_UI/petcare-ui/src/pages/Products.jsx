import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Button } from '../components/ui/Button';
import { useProducts } from '../hooks/useProducts';
import { useDebounce } from '../hooks/useDebounce';

const ProductCard = lazy(() => import('../components/ProductCard'));

const CATEGORIES = [
  { value: 'all',         label: 'Tất cả' },
  { value: 'food',        label: '🍖 Thức ăn' },
  { value: 'accessories', label: '🎀 Phụ kiện' },
  { value: 'healthcare',  label: '💊 Sức khỏe' },
];

const SORT_OPTIONS = [
  { value: 'default',    label: 'Mặc định' },
  { value: 'price-asc',  label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating',     label: 'Đánh giá cao nhất' },
];

const RATINGS = [
  { value: 0,   label: 'Tất cả' },
  { value: 4,   label: '4★+' },
  { value: 4.5, label: '4.5★+' },
  { value: 4.8, label: '4.8★+' },
];

function FilterPanel({ category, setCategory, maxPrice, setMaxPrice, minRating, setMinRating, onReset }) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Danh mục</h3>
        <div className="space-y-1">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategory(c.value)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                category === c.value
                  ? 'bg-green-50 dark:bg-green-950/40'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
              }`}
              style={category === c.value ? { color: 'rgb(68,139,61)' } : {}}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price */}
      <div>
        <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">
          Giá tối đa
        </h3>
        <div className="px-1">
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-neutral-400">0đ</span>
            <span className="font-semibold" style={{ color: 'rgb(68,139,61)' }}>{maxPrice.toLocaleString('vi-VN')}đ</span>
          </div>
          <input type="range" min={50000} max={500000} step={10000} value={maxPrice}
            onChange={e => setMaxPrice(+e.target.value)}
            className="w-full cursor-pointer accent-green-600"
            aria-label={`Maximum price: ${maxPrice.toLocaleString('vi-VN')} VND`}
          />
          <div className="flex justify-between text-xs text-neutral-400 mt-1">
            <span>50K</span><span>500K</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Đánh giá</h3>
        <div className="flex flex-wrap gap-2">
          {RATINGS.map(r => (
            <button key={r.value} onClick={() => setMinRating(r.value)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                minRating === r.value
                  ? 'text-white border-transparent'
                  : 'border-neutral-200 dark:border-neutral-600 text-neutral-600 dark:text-neutral-300 hover:border-green-400'
              }`}
              style={minRating === r.value ? { backgroundColor: 'rgb(68,139,61)', borderColor: 'rgb(68,139,61)' } : {}}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={onReset}
        className="w-full text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-1.5 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
        <X className="w-4 h-4" /> Xóa bộ lọc
      </button>
    </div>
  );
}

export default function Products() {
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory]       = useState('all');
  const [sort, setSort]               = useState('default');
  const [maxPrice, setMaxPrice]       = useState(500000);
  const [minRating, setMinRating]     = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const search = useDebounce(searchInput, 300);
  const { products, loading, error } = useProducts({ category, maxPrice, minRating, search, sort });

  const reset = () => { setCategory('all'); setMaxPrice(500000); setMinRating(0); setSearchInput(''); setSort('default'); };

  return (
    <div className="container-page py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100">Sản phẩm</h1>
        <p className="text-neutral-400 mt-1">Tìm kiếm sản phẩm tốt nhất cho thú cưng của bạn</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" aria-hidden="true" />
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm sản phẩm..."
            className="input pl-10"
            aria-label="Search products"
          />
          {searchInput && (
            <button onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              aria-label="Clear search">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="relative">
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="input pr-9 appearance-none cursor-pointer min-w-40"
            aria-label="Sort products">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" aria-hidden="true" />
        </div>
        <Button variant="ghost" onClick={() => setSidebarOpen(true)} className="md:hidden">
          <SlidersHorizontal className="w-4 h-4" /> Lọc
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 shrink-0" aria-label="Product filters">
          <div className="card p-5 sticky top-24">
            <FilterPanel {...{ category, setCategory, maxPrice, setMaxPrice, minRating, setMinRating, onReset: reset }} />
          </div>
        </aside>

        {/* Mobile drawer */}
        <AnimatePresence>
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-label="Filter drawer">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-neutral-900 p-5 overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Bộ lọc</h3>
                  <button onClick={() => setSidebarOpen(false)} aria-label="Close filter drawer">
                    <X className="w-5 h-5 text-neutral-500" />
                  </button>
                </div>
                <FilterPanel {...{ category, setCategory, maxPrice, setMaxPrice, minRating, setMinRating, onReset: reset }} />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {loading ? 'Đang tải...' : <><span className="font-semibold" style={{ color: 'rgb(68,139,61)' }}>{products.length}</span> sản phẩm</>}
            </p>
          </div>

          {error ? (
            <EmptyState icon="⚠️" title="Không thể tải sản phẩm" description={error}
              action={{ label: 'Thử lại', onClick: () => window.location.reload() }} />
          ) : loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <EmptyState icon="🔍" title="Không tìm thấy sản phẩm"
              description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
              action={{ label: 'Xóa bộ lọc', onClick: reset, variant: 'outline' }} />
          ) : (
            <motion.div layout className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {products.map(p => (
                  <Suspense key={p.id} fallback={<ProductCardSkeleton />}>
                    <ProductCard product={p} />
                  </Suspense>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
