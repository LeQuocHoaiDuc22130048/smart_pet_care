import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Tag } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { Button } from '../components/ui/Button';
import { products } from '../data/mockData';

const ProductCard = lazy(() => import('../components/ProductCard'));

const MOCK_LABELS = ['Chó Golden Retriever', 'Mèo Ba Tư', 'Thức ăn cho chó', 'Phụ kiện thú cưng', 'Đồ chơi mèo'];

const HOW_IT_WORKS = [
  { step: '1', icon: '📸', title: 'Tải ảnh lên', desc: 'Chụp hoặc chọn ảnh thú cưng / sản phẩm bạn muốn tìm' },
  { step: '2', icon: '🤖', title: 'AI phân tích', desc: 'Hệ thống AI nhận diện đối tượng trong ảnh của bạn' },
  { step: '3', icon: '🛍️', title: 'Xem kết quả', desc: 'Nhận danh sách sản phẩm phù hợp được gợi ý bởi AI' },
];

function ProcessingOverlay() {
  const steps = ['Phân tích ảnh', 'Nhận diện đối tượng', 'Tìm sản phẩm phù hợp'];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="text-center py-16">
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-purple-100 dark:border-purple-900/30 rounded-full" />
        <motion.div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full"
          animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-purple-500" />
        </div>
      </div>
      <p className="font-bold text-neutral-800 dark:text-neutral-200 text-lg mb-2">AI đang phân tích...</p>
      <p className="text-sm text-neutral-400 mb-6">Nhận diện đối tượng và tìm sản phẩm phù hợp</p>
      <div className="flex justify-center gap-2 flex-wrap">
        {steps.map((s, i) => (
          <motion.span key={s}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.3 }}
            className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-full font-medium">
            {s}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default function ImageSearch() {
  const [uploaded, setUploaded] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);
  const [aiLabel, setAiLabel] = useState('');

  const handleUpload = async () => {
    setUploaded(true);
    setSearching(true);
    setResults([]);
    await new Promise(r => setTimeout(r, 2200));
    const label = MOCK_LABELS[Math.floor(Math.random() * MOCK_LABELS.length)];
    setAiLabel(label);
    const shuffled = [...products].sort(() => Math.random() - 0.5).slice(0, 4);
    setResults(shuffled);
    setSearching(false);
  };

  const reset = () => { setUploaded(false); setResults([]); setAiLabel(''); setSearching(false); };

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <span className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> AI Image Search
          </span>
          <h1 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-2">Tìm kiếm bằng hình ảnh</h1>
          <p className="text-neutral-400 max-w-md mx-auto">Tải lên ảnh thú cưng hoặc sản phẩm để AI tìm kiếm sản phẩm phù hợp</p>
        </motion.div>
      </div>

      {/* Upload area */}
      <div className="max-w-2xl mx-auto">
        <div className="card p-6 mb-8">
          <ImageUploader onUpload={handleUpload} />
          {uploaded && !searching && (
            <div className="mt-4 flex justify-center">
              <Button variant="ghost" onClick={reset} size="sm">
                <RefreshCw className="w-4 h-4" /> Tải ảnh khác
              </Button>
            </div>
          )}
        </div>

        {/* Processing */}
        <AnimatePresence>
          {searching && <ProcessingOverlay />}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {results.length > 0 && !searching && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium border border-emerald-100 dark:border-emerald-900/30">
                  <Tag className="w-4 h-4" />
                  AI nhận diện: <strong>{aiLabel}</strong>
                </div>
                <span className="text-sm text-neutral-400">{results.length} sản phẩm phù hợp</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {results.map(p => (
                  <Suspense key={p.id} fallback={<ProductCardSkeleton />}>
                    <ProductCard product={p} />
                  </Suspense>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How it works */}
        {!uploaded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {HOW_IT_WORKS.map((item, i) => (
              <motion.div key={item.step} custom={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-5 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full text-xs font-bold flex items-center justify-center mx-auto mb-2">
                  {item.step}
                </div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200 text-sm">{item.title}</p>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
