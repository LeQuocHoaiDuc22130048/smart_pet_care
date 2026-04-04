import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight, Tag, Package } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductCardSkeleton } from '../components/ui/Skeleton';

const RecommendationCarousel = lazy(() => import('../components/RecommendationCarousel'));

function CartItem({ item, onRemove, onUpdateQty }) {
  return (
    <motion.div layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16, height: 0 }}
      transition={{ duration: 0.25 }}
      className="card p-4 flex gap-4 items-center">
      <Link to={`/products/${item.id}`} className="shrink-0" tabIndex={-1}>
        <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.id}`}
          className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 hover:text-green-700 transition-colors line-clamp-2 leading-snug">
          {item.name}
        </Link>
        <span className="text-xs text-neutral-400 capitalize mt-0.5 block">{item.category}</span>
        <p className="font-bold mt-1.5 text-sm" style={{ color: 'rgb(68,139,61)' }}>{item.price.toLocaleString('vi-VN')}đ</p>
      </div>
      <div className="flex flex-col items-end gap-3 shrink-0">
        <button onClick={() => onRemove(item.id)}
          className="text-neutral-300 hover:text-red-500 transition-colors p-1"
          aria-label={`Remove ${item.name} from cart`}>
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="flex items-center border border-neutral-200 dark:border-neutral-600 rounded-full overflow-hidden text-sm"
          role="group" aria-label={`Quantity for ${item.name}`}>
          <button onClick={() => onUpdateQty(item.id, item.qty - 1)}
            className="px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-bold"
            aria-label="Decrease quantity">−</button>
          <span className="px-3 font-semibold text-neutral-800 dark:text-neutral-100 min-w-[2rem] text-center" aria-live="polite">{item.qty}</span>
          <button onClick={() => onUpdateQty(item.id, item.qty + 1)}
            className="px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors font-bold"
            aria-label="Increase quantity">+</button>
        </div>
        <p className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
          {(item.price * item.qty).toLocaleString('vi-VN')}đ
        </p>
      </div>
    </motion.div>
  );
}

export default function Cart() {
  const { cart, removeFromCart, updateQty, cartTotal } = useApp();
  const toast = useToast();
  const shipping = cartTotal >= 300000 ? 0 : 30000;
  const total = cartTotal + shipping;

  const handleRemove = (id) => {
    const item = cart.find(i => i.id === id);
    removeFromCart(id);
    toast.info('Đã xóa khỏi giỏ hàng', item?.name);
  };

  if (cart.length === 0) return (
    <div className="container-page py-10">
      <EmptyState icon="🛒" title="Giỏ hàng trống"
        description="Hãy thêm sản phẩm vào giỏ hàng của bạn"
        action={{ label: 'Mua sắm ngay', to: '/products' }} />
    </div>
  );

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-8">
        Giỏ hàng
        <span className="text-2xl" style={{ color: 'rgb(68,139,61)' }}>({cart.length})</span>
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          <AnimatePresence mode="popLayout">
            {cart.map(item => (
              <CartItem key={item.id} item={item} onRemove={handleRemove} onUpdateQty={updateQty} />
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-4">
            <h3 className="font-semibold text-neutral-800 dark:text-neutral-100 mb-3 flex items-center gap-2 text-sm">
              <Tag className="w-4 h-4" style={{ color: 'rgb(68,139,61)' }} /> Mã giảm giá
            </h3>
            <div className="flex gap-2">
              <input placeholder="Nhập mã..." className="input text-sm flex-1" aria-label="Coupon code" />
              <Button variant="outline" size="sm">Áp dụng</Button>
            </div>
          </div>

          {/* Order summary */}
          <div className="card p-5">
            <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" style={{ color: 'rgb(68,139,61)' }} /> Tóm tắt đơn hàng
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                <span>Tạm tính ({cart.length} sản phẩm)</span>
                <span>{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-300">
                <span>Phí vận chuyển</span>
                <span className={shipping === 0 ? 'text-emerald-500 font-semibold' : ''}>
                  {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}đ`}
                </span>
              </div>
              {shipping > 0 && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-xs bg-green-50 dark:bg-green-950/20 px-3 py-2 rounded-lg"
                  style={{ color: 'rgb(68,139,61)' }}>
                  Mua thêm <strong>{(300000 - cartTotal).toLocaleString('vi-VN')}đ</strong> để được miễn phí ship
                </motion.p>
              )}
              <div className="divider pt-1" />
              <div className="flex justify-between font-bold text-neutral-900 dark:text-neutral-100 text-base pt-1">
                <span>Tổng cộng</span>
                <span className="text-xl" style={{ color: 'rgb(68,139,61)' }}>{total.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>
            <Button size="lg" className="w-full mt-5">
              Thanh toán <ArrowRight className="w-4 h-4" />
            </Button>
            <Link to="/products"
              className="block text-center text-sm text-neutral-400 hover:text-green-700 mt-3 transition-colors">
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <Suspense fallback={<div className="h-64 skeleton rounded-2xl mt-8" />}>
        <RecommendationCarousel
          products={cart.slice(0, 1).flatMap(() => [])}
          title="Có thể bạn cũng thích"
        />
      </Suspense>
    </div>
  );
}
