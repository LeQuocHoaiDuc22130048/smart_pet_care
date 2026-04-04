import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Check, ArrowLeft, Heart, Share2, Shield, Truck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import { fetchProductById, fetchRecommendations } from '../mock-api/productsApi';
import { Badge } from '../components/ui/Badge';
import { StarRating } from '../components/ui/StarRating';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const RecommendationCarousel = lazy(() => import('../components/RecommendationCarousel'));

function DetailSkeleton() {
  return (
    <div className="grid md:grid-cols-2 gap-10 card p-8">
      <div className="space-y-3">
        <Skeleton className="w-full h-72" />
        <div className="flex gap-2">
          {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="w-16 h-16" />)}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useApp();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    setProduct(null);
    Promise.all([fetchProductById(id), fetchRecommendations(+id)])
      .then(([p, recs]) => { setProduct(p); setRecommendations(recs); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    toast.success('Đã thêm vào giỏ hàng', `${qty}x ${product.name}`);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleWishlist = () => {
    setWishlisted(w => !w);
    toast.info(wishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Đã sao chép link', 'Chia sẻ với bạn bè của bạn');
  };

  // Mock multiple images
  const images = product ? [product.image, product.image, product.image] : [];

  return (
    <div className="container-page py-10">
      <Link to="/products"
        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-orange-500 mb-8 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Quay lại sản phẩm
      </Link>

      {loading ? <DetailSkeleton /> : !product ? (
        <EmptyState icon="😿" title="Không tìm thấy sản phẩm"
          description="Sản phẩm này không tồn tại hoặc đã bị xóa"
          action={{ label: 'Xem tất cả sản phẩm', to: '/products' }} />
      ) : (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="card p-6 md:p-8 grid md:grid-cols-2 gap-10">
            {/* Gallery */}
            <div>
              <div className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-700 aspect-square mb-3">
                <AnimatePresence mode="wait">
                  <motion.img key={activeImg}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    src={images[activeImg]} alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <Badge label={product.badge} />
                </div>
              </div>
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-orange-500' : 'border-transparent hover:border-orange-300'}`}
                    aria-label={`View image ${i + 1}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">
              <div>
                <span className="text-xs font-medium text-orange-500 capitalize bg-orange-50 dark:bg-orange-950/30 px-2.5 py-1 rounded-full">
                  {product.category}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 leading-tight">
                {product.name}
              </h1>
              <StarRating rating={product.rating} reviews={product.reviews} size="md" />
              <p className="text-3xl font-extrabold text-orange-500">
                {product.price.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{product.description}</p>

              {/* Qty */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Số lượng:</span>
                <div className="flex items-center border border-neutral-200 dark:border-neutral-600 rounded-full overflow-hidden" role="group" aria-label="Quantity selector">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-bold text-lg leading-none"
                    aria-label="Decrease quantity">−</button>
                  <span className="px-4 py-2 font-bold text-neutral-900 dark:text-neutral-100 min-w-[3rem] text-center" aria-live="polite">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)}
                    className="px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-bold text-lg leading-none"
                    aria-label="Increase quantity">+</button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button onClick={handleAdd} size="lg"
                  className={`flex-1 transition-all duration-300 ${added ? '!bg-emerald-500 hover:!bg-emerald-600' : ''}`}>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span key={added ? 'check' : 'cart'} className="flex items-center gap-2"
                      initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      {added ? <><Check className="w-5 h-5" /> Đã thêm!</> : <><ShoppingCart className="w-5 h-5" /> Thêm vào giỏ</>}
                    </motion.span>
                  </AnimatePresence>
                </Button>
                <Button variant="ghost" onClick={handleWishlist} aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className="border border-neutral-200 dark:border-neutral-600">
                  <Heart className={`w-5 h-5 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button variant="ghost" onClick={handleShare} aria-label="Share product"
                  className="border border-neutral-200 dark:border-neutral-600">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Trust */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: <Shield className="w-4 h-4 text-emerald-500" />, text: 'Chính hãng' },
                  { icon: <Truck className="w-4 h-4 text-blue-500" />, text: 'Miễn phí ship' },
                  { icon: <RefreshCw className="w-4 h-4 text-orange-500" />, text: 'Đổi trả 7 ngày' },
                ].map(item => (
                  <div key={item.text} className="flex flex-col items-center gap-1.5 p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-xl text-center">
                    {item.icon}
                    <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Suspense fallback={<div className="h-64 skeleton rounded-2xl mt-8" />}>
              <RecommendationCarousel products={recommendations} title="Sản phẩm tương tự" subtitle="Bạn có thể cũng thích" />
            </Suspense>
          )}
        </motion.div>
      )}
    </div>
  );
}
