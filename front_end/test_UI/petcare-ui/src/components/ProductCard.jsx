import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/useToast';
import { Badge } from './ui/Badge';
import { StarRating } from './ui/StarRating';

export default memo(function ProductCard({ product }) {
  const { addToCart } = useApp();
  const toast = useToast();
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    toast.success('Đã thêm vào giỏ', product.name);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(w => !w);
    toast.info(wishlisted ? 'Đã xóa khỏi yêu thích' : 'Đã thêm vào yêu thích');
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="card card-hover group overflow-hidden flex flex-col"
      aria-label={product.name}
    >
      {/* Image */}
      <Link to={`/products/${product.id}`} className="relative block overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-700" tabIndex={-1} aria-hidden="true">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5">
          <Badge label={product.badge} />
        </div>
        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 transition-colors ${wishlisted ? 'fill-red-500 text-red-500' : 'text-neutral-500'}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-2">
        <span className="text-xs font-medium capitalize" style={{ color: 'rgb(68,139,61)' }}>{product.category}</span>
        <Link to={`/products/${product.id}`} className="flex-1">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 line-clamp-2 transition-colors leading-snug hover:text-green-700">
            {product.name}
          </h3>
        </Link>
        <StarRating rating={product.rating} reviews={product.reviews} />
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-base font-bold" style={{ color: 'rgb(68,139,61)' }}>
            {product.price.toLocaleString('vi-VN')}đ
          </span>
          <motion.button
            whileTap={{ scale: 0.93 }}
            onClick={handleAdd}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-300 ${
              added ? 'bg-emerald-500 text-white' : 'text-white'
            }`}
            style={!added ? { backgroundColor: 'rgb(68,139,61)' } : {}}
            aria-label={`Add ${product.name} to cart`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={added ? 'check' : 'cart'}
                initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}
                transition={{ duration: 0.2 }}>
                {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              </motion.span>
            </AnimatePresence>
            {added ? 'Đã thêm' : 'Thêm'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
});
