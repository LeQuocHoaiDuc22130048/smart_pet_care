import { createContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export const ToastContext = createContext();

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error:   <XCircle    className="w-5 h-5 text-red-500" />,
  warning: <AlertCircle className="w-5 h-5 text-amber-500" />,
  info:    <Info       className="w-5 h-5 text-blue-500" />,
};

const BG = {
  success: 'border-l-emerald-500',
  error:   'border-l-red-500',
  warning: 'border-l-amber-500',
  info:    'border-l-blue-500',
};

function Toast({ id, type = 'info', title, message, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`card flex items-start gap-3 p-4 min-w-72 max-w-sm border-l-4 ${BG[type]}`}
      role="alert"
      aria-live="polite"
    >
      <span className="shrink-0 mt-0.5">{ICONS[type]}</span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</p>}
        {message && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{message}</p>}
      </div>
      <button onClick={() => onDismiss(id)}
        className="shrink-0 p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
        aria-label="Dismiss notification">
        <X className="w-3.5 h-3.5 text-neutral-400" />
      </button>
    </motion.div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts(t => t.filter(x => x.id !== id));
  }, []);

  const toast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = ++counterRef.current;
    setToasts(t => [...t, { id, type, title, message }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Convenience methods
  toast.success = (title, message) => toast({ type: 'success', title, message });
  toast.error   = (title, message) => toast({ type: 'error',   title, message, duration: 6000 });
  toast.warning = (title, message) => toast({ type: 'warning', title, message });
  toast.info    = (title, message) => toast({ type: 'info',    title, message });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-label="Notifications">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast {...t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
