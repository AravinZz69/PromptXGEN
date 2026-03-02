'use client';

import { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AIThinkingAnimationProps {
  className?: string;
  text?: string[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'brain' | 'dots' | 'pulse' | 'wave';
}

export const AIThinkingAnimation = memo(({
  className = '',
  text = ['Thinking', 'Analyzing', 'Processing', 'Generating'],
  size = 'md',
  variant = 'brain',
}: AIThinkingAnimationProps) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % text.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [text.length]);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {variant === 'brain' && (
        <div className={cn('relative', sizeClasses[size])}>
          {/* Brain SVG with pulsing animation */}
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full text-primary"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <motion.path
              d="M12 2C7.58 2 4 5.58 4 10c0 3.03 1.67 5.67 4.14 7.04C8.77 18.24 10.26 19 12 19s3.23-.76 3.86-1.96C18.33 15.67 20 13.03 20 10c0-4.42-3.58-8-8-8z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{
                pathLength: [0.5, 1, 0.5],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Neural connections */}
            <motion.circle
              cx="9"
              cy="9"
              r="1.5"
              fill="currentColor"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="15"
              cy="9"
              r="1.5"
              fill="currentColor"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
            />
            <motion.circle
              cx="12"
              cy="13"
              r="1.5"
              fill="currentColor"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
            />
            {/* Connection lines */}
            <motion.line
              x1="9"
              y1="9"
              x2="12"
              y2="13"
              stroke="currentColor"
              strokeWidth="0.5"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
            />
            <motion.line
              x1="15"
              y1="9"
              x2="12"
              y2="13"
              stroke="currentColor"
              strokeWidth="0.5"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
            />
          </motion.svg>
          
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full bg-primary/20 blur-md"
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {variant === 'dots' && (
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={cn(
                'rounded-full bg-primary',
                size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
              )}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {variant === 'pulse' && (
        <div className={cn('relative', sizeClasses[size])}>
          <motion.div
            className="absolute inset-0 rounded-full bg-primary"
            animate={{
              scale: [1, 2, 2.5],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-primary"
            animate={{
              scale: [1, 1.5, 2],
              opacity: [0.6, 0.3, 0],
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
          />
          <div className="absolute inset-[25%] rounded-full bg-primary" />
        </div>
      )}

      {variant === 'wave' && (
        <div className="flex items-end gap-0.5 h-8">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                'bg-primary rounded-full',
                size === 'sm' ? 'w-1' : size === 'md' ? 'w-1.5' : 'w-2'
              )}
              animate={{
                height: ['40%', '100%', '40%'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.1,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      {/* Cycling text */}
      <motion.span
        key={currentTextIndex}
        className={cn('text-muted-foreground', textSizes[size])}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {text[currentTextIndex]}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          ...
        </motion.span>
      </motion.span>
    </div>
  );
});

AIThinkingAnimation.displayName = 'AIThinkingAnimation';

// Inline version for chat bubbles
export function InlineThinking({ className = '' }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-current"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}

export default AIThinkingAnimation;
