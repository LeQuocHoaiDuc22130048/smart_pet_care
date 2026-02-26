import { motion, type HTMLMotionProps } from 'motion/react';
import { type ReactNode } from 'react';

/**
 * Animation Configuration
 * Centralized animation settings for consistency
 */
export const animations = {
    // Durations (in seconds)
    duration: {
        fast: 0.15,
        normal: 0.3,
        slow: 0.5
    },

    // Easing functions
    easing: {
        easeOut: [0.4, 0, 0.2, 1],
        easeIn: [0.4, 0, 1, 1],
        easeInOut: [0.4, 0, 0.2, 1],
        spring: { type: 'spring', stiffness: 300, damping: 30 }
    },

    // Common animations
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
    },

    fadeInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 }
    },

    fadeInDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
    },

    scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 }
    },

    slideInLeft: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 }
    },

    slideInRight: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 }
    }
};

/**
 * Fade In Animation Component
 */
export function FadeIn({
    children,
    delay = 0,
    duration = animations.duration.normal,
    className = ''
}: {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration, delay, ease: animations.easing.easeOut }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Fade In Up Animation Component
 */
export function FadeInUp({
    children,
    delay = 0,
    duration = animations.duration.normal,
    className = ''
}: {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration, delay, ease: animations.easing.easeOut }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Scale In Animation Component
 */
export function ScaleIn({
    children,
    delay = 0,
    duration = animations.duration.normal,
    className = ''
}: {
    children: ReactNode;
    delay?: number;
    duration?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration, delay, ease: animations.easing.easeOut }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Stagger Children Animation
 * Animates children with a stagger effect
 */
export function StaggerChildren({
    children,
    staggerDelay = 0.1,
    className = ''
}: {
    children: ReactNode;
    staggerDelay?: number;
    className?: string;
}) {
    return (
        <motion.div
            initial='hidden'
            animate='visible'
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay
                    }
                }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Stagger Item (use as child of StaggerChildren)
 */
export function StaggerItem({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Hover Scale Animation
 */
export function HoverScale({
    children,
    scale = 1.05,
    className = ''
}: {
    children: ReactNode;
    scale?: number;
    className?: string;
}) {
    return (
        <motion.div
            whileHover={{ scale }}
            transition={{ duration: animations.duration.fast }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Hover Lift Animation (moves up)
 */
export function HoverLift({
    children,
    lift = -4,
    className = ''
}: {
    children: ReactNode;
    lift?: number;
    className?: string;
}) {
    return (
        <motion.div
            whileHover={{ y: lift }}
            transition={{ duration: animations.duration.fast }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Press Animation (tap feedback)
 */
export function PressAnimation({
    children,
    scale = 0.95,
    className = '',
    ...props
}: {
    children: ReactNode;
    scale?: number;
    className?: string;
} & HTMLMotionProps<'div'>) {
    return (
        <motion.div
            whileTap={{ scale }}
            transition={{ duration: animations.duration.fast }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
}

/**
 * Success Animation
 * Animated checkmark or success indicator
 */
export function SuccessAnimation({
    size = 'md',
    className = ''
}: {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}) {
    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-16 h-16',
        lg: 'w-24 h-24'
    };

    return (
        <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20
            }}
            className={`${sizeClasses[size]} ${className}`}
        >
            <div className='w-full h-full rounded-full bg-gradient-to-br from-success to-success-light flex items-center justify-center'>
                <motion.svg
                    className='w-1/2 h-1/2 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={3}
                        d='M5 13l4 4L19 7'
                    />
                </motion.svg>
            </div>
        </motion.div>
    );
}

/**
 * Page Transition Wrapper
 */
export function PageTransition({
    children,
    className = ''
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
                duration: animations.duration.normal,
                ease: animations.easing.easeOut
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/**
 * Add to Cart Animation
 * Button with success feedback
 */
export function AddToCartButton({
    onClick,
    isAdding,
    isAdded,
    children,
    className = ''
}: {
    onClick: () => void;
    isAdding: boolean;
    isAdded: boolean;
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.button
            onClick={onClick}
            disabled={isAdding}
            whileTap={{ scale: 0.95 }}
            animate={{
                scale: isAdded ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.3 }}
            className={className}
        >
            {children}
        </motion.button>
    );
}
