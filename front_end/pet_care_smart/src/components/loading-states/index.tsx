import { Loader2 } from "lucide-react";
import { motion } from "motion/react";

/**
 * Global Loading Overlay
 * Full-screen loading indicator
 */
export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Animated rings */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-primary/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-secondary/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
          
          {/* Spinner */}
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
}

/**
 * Page Loading
 * Used for page transitions
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          {/* Pet paw animation */}
          <motion.div
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <span className="text-3xl">🐾</span>
          </motion.div>
        </div>
        <p className="text-sm font-medium text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

/**
 * Button Loading Spinner
 * Small spinner for buttons
 */
export function ButtonSpinner({ className = "" }: { className?: string }) {
  return (
    <Loader2 className={`animate-spin ${className}`} />
  );
}

/**
 * Inline Loading
 * Inline loading indicator
 */
export function InlineLoading({ 
  message = "Loading...",
  size = "md" 
}: { 
  message?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className="flex items-center gap-3 text-muted-foreground">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

/**
 * Content Loading
 * Loading state for content sections
 */
export function ContentLoading({ 
  message = "Loading content..." 
}: { 
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <motion.div
        className="relative mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent-purple/20 rounded-full blur-2xl"></div>
        <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </motion.div>
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * Progress Bar Loading
 * Animated progress bar
 */
export function ProgressLoading({ 
  progress,
  message 
}: { 
  progress: number;
  message?: string;
}) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-2">
        <div className="flex items-center justify-between text-sm font-medium mb-2">
          <span className="text-foreground">{message || "Loading..."}</span>
          <span className="text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Dots Loading Animation
 * Three animated dots
 */
export function DotsLoading({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Pulse Loading
 * Pulsing circle animation
 */
export function PulseLoading({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className="relative flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} rounded-full bg-primary/20`}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className={`absolute ${sizeClasses[size]} rounded-full bg-primary/40`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />
      <div className={`absolute ${sizeClasses[size]} rounded-full bg-primary`} />
    </div>
  );
}
