import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp } from 'lucide-react';

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className='fixed bottom-24 right-6 z-40 w-11 h-11 rounded-full bg-[#448B3D] text-white shadow-lg flex items-center justify-center hover:bg-[#336B2D] transition-colors'
                    aria-label='Lên đầu trang'
                >
                    <ChevronUp className='w-5 h-5' />
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
