import { useState, memo } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';

export default memo(function RecommendationCarousel({ products, title = 'Gợi ý cho bạn', subtitle }) {
  const [start, setStart] = useState(0);
  const visible = 4;
  const canPrev = start > 0;
  const canNext = start < products.length - visible;

  return (
    <section className="py-8" aria-label={title}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-neutral-800 dark:text-neutral-100">
            <Sparkles className="w-5 h-5 text-orange-500" aria-hidden="true" />
            {title}
          </h2>
          {subtitle && <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex gap-2" role="group" aria-label="Carousel navigation">
          <button
            onClick={() => setStart(s => Math.max(0, s - 1))}
            disabled={!canPrev}
            className="p-2 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-orange-50 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
            aria-label="Previous products"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setStart(s => Math.min(products.length - visible, s + 1))}
            disabled={!canNext}
            className="p-2 rounded-full border border-neutral-200 dark:border-neutral-700 hover:bg-orange-50 dark:hover:bg-neutral-800 disabled:opacity-30 transition-colors"
            aria-label="Next products"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" aria-live="polite">
        <AnimatePresence mode="popLayout">
          {products.slice(start, start + visible).map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </AnimatePresence>
      </div>

      {/* Dots */}
      {products.length > visible && (
        <div className="flex justify-center gap-1.5 mt-5" aria-hidden="true">
          {Array.from({ length: products.length - visible + 1 }, (_, i) => (
            <button key={i} onClick={() => setStart(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${i === start ? 'bg-orange-500 w-4' : 'bg-neutral-300 dark:bg-neutral-600'}`}
            />
          ))}
        </div>
      )}
    </section>
  );
});
