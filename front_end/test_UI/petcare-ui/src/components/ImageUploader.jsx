import { useState, useRef, memo } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default memo(function ImageUploader({ onUpload }) {
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload?.(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
            aria-label="Upload image by clicking or dragging"
            className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 scale-[1.01]'
                : 'border-neutral-300 dark:border-neutral-600 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-neutral-800'
            }`}
          >
            <motion.div animate={dragging ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}>
              <Upload className="w-12 h-12 text-orange-400 mx-auto mb-3" aria-hidden="true" />
            </motion.div>
            <p className="font-semibold text-neutral-700 dark:text-neutral-300">Kéo thả ảnh vào đây</p>
            <p className="text-sm text-neutral-400 mt-1">hoặc <span className="text-orange-500 font-medium">click để chọn ảnh</span></p>
            <p className="text-xs text-neutral-400 mt-3 bg-neutral-100 dark:bg-neutral-700 inline-block px-3 py-1 rounded-full">
              PNG, JPG, WEBP · Tối đa 10MB
            </p>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} aria-hidden="true" />
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="relative rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800"
          >
            <img src={preview} alt="Uploaded preview" className="w-full max-h-72 object-contain" />
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            <button
              onClick={reset}
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors shadow-md"
              aria-label="Remove uploaded image"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
              <ImageIcon className="w-3 h-3" aria-hidden="true" /> Ảnh đã tải lên
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
