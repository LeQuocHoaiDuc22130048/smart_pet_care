import { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Shield, Truck, HeartHandshake, Camera, Bot, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { products, services, testimonials } from '../data/mockData';
import { Button } from '../components/ui/Button';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { StarRating } from '../components/ui/StarRating';
import { useProducts } from '../hooks/useProducts';

const ProductCard = lazy(() => import('../components/ProductCard'));
const ServiceCard = lazy(() => import('../components/ServiceCard'));
const RecommendationCarousel = lazy(() => import('../components/RecommendationCarousel'));

const GREEN = 'rgb(68,139,61)';
const GREEN_DARK = 'rgb(52,110,46)';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

/* ─── Hero Slider ───────────────────────────────────────────── */
const SLIDES = [
  {
    id: 1,
    badge: '🤖 AI-Powered Pet Care',
    title: 'Chăm sóc thú cưng',
    highlight: 'thông minh hơn',
    desc: 'Mua sắm sản phẩm, đặt lịch dịch vụ, và nhận tư vấn AI 24/7 cho thú cưng yêu quý của bạn.',
    cta: { label: 'Mua sắm ngay', to: '/products' },
    ctaSecondary: { label: 'Đặt dịch vụ', to: '/services' },
    image: 'https://placehold.co/560x420/d1fae5/166534?text=🐶+Happy+Pets',
    bg: 'from-green-50 via-emerald-50/60 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950',
    blob1: 'bg-green-200/30 dark:bg-green-900/10',
    blob2: 'bg-emerald-200/30 dark:bg-emerald-900/10',
  },
  {
    id: 2,
    badge: '✂️ Grooming Chuyên Nghiệp',
    title: 'Làm đẹp cho',
    highlight: 'thú cưng của bạn',
    desc: 'Dịch vụ grooming chuyên nghiệp với đội ngũ có kinh nghiệm. Đặt lịch ngay hôm nay!',
    cta: { label: 'Đặt lịch ngay', to: '/services' },
    ctaSecondary: { label: 'Xem dịch vụ', to: '/services' },
    image: 'https://placehold.co/560x420/bbf7d0/166534?text=✂️+Grooming',
    bg: 'from-emerald-50 via-teal-50/60 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950',
    blob1: 'bg-teal-200/30 dark:bg-teal-900/10',
    blob2: 'bg-green-200/30 dark:bg-green-900/10',
  },
  {
    id: 3,
    badge: '📷 AI Image Search',
    title: 'Tìm sản phẩm',
    highlight: 'bằng hình ảnh',
    desc: 'Chụp ảnh thú cưng hoặc sản phẩm, AI sẽ tìm kiếm và gợi ý sản phẩm phù hợp ngay lập tức.',
    cta: { label: 'Thử ngay', to: '/image-search' },
    ctaSecondary: { label: 'Xem sản phẩm', to: '/products' },
    image: 'https://placehold.co/560x420/a7f3d0/065f46?text=🔍+AI+Search',
    bg: 'from-teal-50 via-green-50/60 to-white dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-950',
    blob1: 'bg-emerald-200/30 dark:bg-emerald-900/10',
    blob2: 'bg-teal-200/30 dark:bg-teal-900/10',
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback((idx) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  }, [current]);

  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length);
  const next = useCallback(() => go((current + 1) % SLIDES.length), [current, go]);

  // Auto-advance
  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  const slide = SLIDES[current];

  const variants = {
    enter: (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <section className="relative overflow-hidden" aria-label="Hero banner" style={{ minHeight: '520px' }}>
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={slide.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`absolute inset-0 bg-linear-to-br ${slide.bg}`}
        >
          {/* Blobs */}
          <div className={`absolute -top-32 -right-32 w-96 h-96 ${slide.blob1} rounded-full blur-3xl pointer-events-none`} aria-hidden="true" />
          <div className={`absolute -bottom-20 -left-20 w-72 h-72 ${slide.blob2} rounded-full blur-3xl pointer-events-none`} aria-hidden="true" />

          <div className="container-page relative z-10 grid md:grid-cols-2 gap-10 items-center py-16 md:py-24">
            {/* Text */}
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full mb-5"
                style={{ backgroundColor: 'rgb(68 139 61 / 0.1)', color: GREEN }}
              >
                {slide.badge}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white leading-[1.1] tracking-tight mb-5"
              >
                {slide.title}<br />
                <span className="gradient-text">{slide.highlight}</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-neutral-500 dark:text-neutral-400 text-lg leading-relaxed mb-8 max-w-md"
              >
                {slide.desc}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                className="flex flex-wrap gap-3"
              >
                <Link to={slide.cta.to}><Button size="lg">{slide.cta.label} <ArrowRight className="w-4 h-4" /></Button></Link>
                <Link to={slide.ctaSecondary.to}><Button variant="outline" size="lg">{slide.ctaSecondary.label}</Button></Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                className="flex flex-wrap gap-8 mt-10"
              >
                {[['10K+', 'Khách hàng'], ['500+', 'Sản phẩm'], ['50+', 'Dịch vụ'], ['4.9★', 'Đánh giá']].map(([n, l]) => (
                  <div key={l}>
                    <p className="text-2xl font-extrabold" style={{ color: GREEN }}>{n}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{l}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
              className="relative flex justify-center"
            >
              <div className="relative">
                <img src={slide.image} alt={slide.title}
                  className="rounded-3xl shadow-2xl w-full max-w-md object-cover" />
                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -bottom-5 -left-5 card px-4 py-3 flex items-center gap-3 shadow-lg">
                  <span className="text-2xl" aria-hidden="true">🐾</span>
                  <div>
                    <p className="text-xs text-neutral-400">Đã phục vụ hôm nay</p>
                    <p className="font-bold text-sm" style={{ color: GREEN }}>128 thú cưng</p>
                  </div>
                </motion.div>
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -top-5 -right-5 card px-4 py-3 shadow-lg">
                  <div className="flex gap-0.5 mb-1">
                    {Array(5).fill(0).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-xs text-neutral-400">4.9/5 · 10K+ đánh giá</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Spacer so section has height */}
      <div className="invisible container-page grid md:grid-cols-2 gap-10 items-center py-16 md:py-24">
        <div className="h-64 md:h-80" />
        <div className="h-64 md:h-80" />
      </div>

      {/* Prev / Next arrows */}
      <button onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
        aria-label="Previous slide">
        <ChevronLeft className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
      </button>
      <button onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm shadow-md hover:scale-110 transition-transform"
        aria-label="Next slide">
        <ChevronRight className="w-5 h-5 text-neutral-700 dark:text-neutral-200" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2" role="tablist" aria-label="Slide indicators">
        {SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => go(i)}
            role="tab" aria-selected={i === current} aria-label={`Go to slide ${i + 1}`}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              width: i === current ? '24px' : '8px',
              backgroundColor: i === current ? GREEN : 'rgb(0 0 0 / 0.2)',
            }}
          />
        ))}
      </div>
    </section>
  );
}

/* ─── Quick Access ──────────────────────────────────────────── */
function QuickAccess() {
  const items = [
    { icon: <Bot className="w-7 h-7" />, label: 'AI Chatbot', desc: 'Tư vấn 24/7', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30', to: '/' },
    { icon: <Camera className="w-7 h-7" />, label: 'Tìm bằng ảnh', desc: 'AI nhận diện', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30', to: '/image-search' },
    { icon: <HeartHandshake className="w-7 h-7" />, label: 'Đặt dịch vụ', desc: 'Grooming & Vet', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30', to: '/services' },
    { icon: <Shield className="w-7 h-7" />, label: 'Bảo hiểm', desc: 'An tâm hơn', color: 'bg-green-50 dark:bg-green-950/30', to: '/' },
  ];
  return (
    <section className="container-page -mt-6 relative z-10" aria-label="Quick access">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {items.map((item, i) => (
          <motion.div key={item.label} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            <Link to={item.to}
              className={`${item.color} rounded-2xl p-5 flex flex-col items-center text-center card-hover`}
              style={i === 3 ? { color: GREEN } : {}}>
              {item.icon}
              <p className="font-semibold text-sm mt-2">{item.label}</p>
              <p className="text-xs opacity-60 mt-0.5">{item.desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Featured Products ─────────────────────────────────────── */
function FeaturedProducts() {
  const { products: featured, loading } = useProducts();
  return (
    <section className="section container-page" aria-label="Featured products">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Sản phẩm nổi bật</h2>
          <p className="text-sm text-neutral-400 mt-1">Được yêu thích nhất tuần này</p>
        </div>
        <Link to="/products" className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: GREEN }}>
          Xem tất cả <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading
          ? Array(4).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)
          : featured.slice(0, 4).map(p => (
              <Suspense key={p.id} fallback={<ProductCardSkeleton />}>
                <ProductCard product={p} />
              </Suspense>
            ))
        }
      </div>
    </section>
  );
}

/* ─── Trust Badges ──────────────────────────────────────────── */
function TrustBadges() {
  return (
    <section className="py-12 text-white" style={{ backgroundColor: GREEN }} aria-label="Trust indicators">
      <div className="container-page grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {[
          { icon: <Truck className="w-8 h-8 mx-auto mb-3" />, title: 'Giao hàng nhanh', desc: 'Miễn phí cho đơn từ 300K' },
          { icon: <Shield className="w-8 h-8 mx-auto mb-3" />, title: 'Sản phẩm chính hãng', desc: '100% hàng chính hãng, có kiểm định' },
          { icon: <HeartHandshake className="w-8 h-8 mx-auto mb-3" />, title: 'Hỗ trợ 24/7', desc: 'AI chatbot và đội ngũ chuyên gia' },
        ].map((b, i) => (
          <motion.div key={b.title} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
            {b.icon}
            <p className="font-bold text-lg">{b.title}</p>
            <p className="text-green-100 text-sm mt-1">{b.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── Services Preview ──────────────────────────────────────── */
function ServicesPreview() {
  return (
    <section className="section bg-neutral-50 dark:bg-neutral-900/50" aria-label="Services preview">
      <div className="container-page">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Dịch vụ của chúng tôi</h2>
            <p className="text-sm text-neutral-400 mt-1">Chuyên nghiệp, tận tâm, đáng tin cậy</p>
          </div>
          <Link to="/services" className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: GREEN }}>
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.slice(0, 3).map((s, i) => (
            <motion.div key={s.id} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}>
              <Suspense fallback={<div className="card h-48 skeleton" />}>
                <ServiceCard service={s} />
              </Suspense>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ──────────────────────────────────────────── */
function Testimonials() {
  return (
    <section className="section container-page" aria-label="Customer testimonials">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Khách hàng nói gì</h2>
        <p className="text-sm text-neutral-400 mt-2">Hơn 10,000 khách hàng tin tưởng PetCare</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {testimonials.map((t, i) => (
          <motion.div key={t.id} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="card card-hover p-5 flex flex-col gap-3">
            <StarRating rating={t.rating} size="sm" />
            <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed flex-1">"{t.comment}"</p>
            <div className="flex items-center gap-3 pt-2 border-t border-neutral-100 dark:border-neutral-700">
              <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{t.name}</p>
                <p className="text-xs text-neutral-400">{t.pet}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─── AI Banner ─────────────────────────────────────────────── */
function AIBanner() {
  return (
    <section className="section container-page">
      <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
        className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-white text-center"
        style={{ background: `linear-gradient(135deg, ${GREEN_DARK}, ${GREEN}, rgb(34,197,94))` }}>
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          {['🐾','🐶','🐱','🐰','🦜'].map((e, i) => (
            <span key={i} className="absolute text-5xl select-none"
              style={{ top: `${10 + i * 18}%`, left: `${5 + i * 20}%`, transform: `rotate(${i * 25}deg)` }}>{e}</span>
          ))}
        </div>
        <div className="relative z-10">
          <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-80" aria-hidden="true" />
          <h2 className="text-3xl font-extrabold mb-3">Tìm kiếm bằng hình ảnh với AI</h2>
          <p className="text-green-100 max-w-md mx-auto mb-6">Chụp ảnh thú cưng hoặc sản phẩm, AI sẽ tìm kiếm và gợi ý sản phẩm phù hợp ngay lập tức.</p>
          <Link to="/image-search">
            <Button variant="ghost" size="lg" className="bg-white hover:bg-green-50" style={{ color: GREEN }}>
              Thử ngay <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

export default function Home() {
  return (
    <div>
      <HeroSlider />
      <QuickAccess />
      <FeaturedProducts />
      <TrustBadges />
      <ServicesPreview />
      <section className="container-page">
        <Suspense fallback={<div className="h-64 skeleton rounded-2xl" />}>
          <RecommendationCarousel
            products={products.slice(4, 10)}
            title="AI gợi ý cho bạn"
            subtitle="Dựa trên thú cưng và lịch sử mua hàng của bạn"
          />
        </Suspense>
      </section>
      <Testimonials />
      <AIBanner />
    </div>
  );
}
