'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export const SkeletonLoader = memo(({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true,
}: SkeletonLoaderProps) => {
  const baseClasses = 'bg-muted rounded relative overflow-hidden';

  const shimmerGradient = animate ? (
    <motion.div
      className="absolute inset-0 -translate-x-full"
      style={{
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
      }}
      animate={{ x: ['0%', '200%'] }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  ) : null;

  if (variant === 'text') {
    return (
      <div className={cn('space-y-2', className)}>
        {[...Array(lines)].map((_, i) => (
          <div
            key={i}
            className={cn(baseClasses, 'h-4')}
            style={{
              width: width || (i === lines - 1 && lines > 1 ? '60%' : '100%'),
            }}
          >
            {shimmerGradient}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full', className)}
        style={{
          width: width || '40px',
          height: height || width || '40px',
        }}
      >
        {shimmerGradient}
      </div>
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={cn(baseClasses, className)}
        style={{
          width: width || '100%',
          height: height || '100px',
        }}
      >
        {shimmerGradient}
      </div>
    );
  }

  // Card variant
  return (
    <div className={cn('space-y-4 p-4 rounded-xl border border-border', className)}>
      <div className="flex items-center gap-3">
        <div className={cn(baseClasses, 'rounded-full w-10 h-10')}>
          {shimmerGradient}
        </div>
        <div className="flex-1 space-y-2">
          <div className={cn(baseClasses, 'h-4 w-1/3')}>
            {shimmerGradient}
          </div>
          <div className={cn(baseClasses, 'h-3 w-1/4')}>
            {shimmerGradient}
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <div className={cn(baseClasses, 'h-4 w-full')}>
          {shimmerGradient}
        </div>
        <div className={cn(baseClasses, 'h-4 w-full')}>
          {shimmerGradient}
        </div>
        <div className={cn(baseClasses, 'h-4 w-2/3')}>
          {shimmerGradient}
        </div>
      </div>
      <div className={cn(baseClasses, 'h-32 w-full rounded-lg')}>
        {shimmerGradient}
      </div>
    </div>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

// Common skeleton patterns
export function ChatMessageSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <SkeletonLoader variant="circular" width={36} height={36} />
      <div className="flex-1 space-y-2">
        <SkeletonLoader variant="text" lines={1} width="20%" />
        <SkeletonLoader variant="text" lines={3} />
      </div>
    </div>
  );
}

export function PromptCardSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border space-y-3">
      <div className="flex justify-between items-start">
        <SkeletonLoader variant="text" lines={1} width="60%" />
        <SkeletonLoader variant="circular" width={24} height={24} />
      </div>
      <SkeletonLoader variant="text" lines={2} />
      <div className="flex gap-2">
        <SkeletonLoader variant="rectangular" width={60} height={24} className="rounded-full" />
        <SkeletonLoader variant="rectangular" width={80} height={24} className="rounded-full" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border">
      {[...Array(columns)].map((_, i) => (
        <div key={i} className="flex-1">
          <SkeletonLoader
            variant="text"
            lines={1}
            width={i === 0 ? '80%' : i === columns - 1 ? '40%' : '60%'}
          />
        </div>
      ))}
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-border space-y-2">
      <SkeletonLoader variant="text" lines={1} width="40%" />
      <SkeletonLoader variant="rectangular" width="60%" height={32} />
      <SkeletonLoader variant="text" lines={1} width="80%" />
    </div>
  );
}

export default SkeletonLoader;
