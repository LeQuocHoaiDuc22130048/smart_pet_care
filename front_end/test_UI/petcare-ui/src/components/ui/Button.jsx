import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const PRIMARY = 'rgb(68,139,61)';
const PRIMARY_DARK = 'rgb(52,110,46)';

const BASE = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

const SIZES = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-7 py-3',
};

// Tailwind classes per variant (primary uses inline style)
const VARIANT_CLS = {
  primary:   'text-white',
  secondary: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white',
  outline:   'border-2 text-white',
  ghost:     'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700',
  danger:    'bg-red-500 hover:bg-red-600 text-white',
};

export const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, children, className = '', style = {}, ...props },
  ref
) {
  const cls = `${BASE} ${SIZES[size]} ${VARIANT_CLS[variant]} ${className}`;

  // Inline styles for primary/outline to use exact brand green
  let inlineStyle = { ...style };
  if (variant === 'primary') {
    inlineStyle = { backgroundColor: PRIMARY, ...style };
  } else if (variant === 'outline') {
    inlineStyle = { borderColor: PRIMARY, color: PRIMARY, ...style };
  }

  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      className={cls}
      disabled={loading || props.disabled}
      style={inlineStyle}
      onMouseEnter={e => {
        if (variant === 'primary') e.currentTarget.style.backgroundColor = PRIMARY_DARK;
        if (variant === 'outline') { e.currentTarget.style.backgroundColor = PRIMARY; e.currentTarget.style.color = 'white'; }
      }}
      onMouseLeave={e => {
        if (variant === 'primary') e.currentTarget.style.backgroundColor = PRIMARY;
        if (variant === 'outline') { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = PRIMARY; }
      }}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      )}
      {children}
    </motion.button>
  );
});
