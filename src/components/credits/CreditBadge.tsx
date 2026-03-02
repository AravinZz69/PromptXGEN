import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCredits } from '@/hooks/useCredits';
import { Coins, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CreditModal } from './CreditModal';

interface CreditBadgeProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function CreditBadge({ className, showLabel = true, size = 'md' }: CreditBadgeProps) {
  const { credits, isLoading, creditPercentage } = useCredits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animatedCredits, setAnimatedCredits] = useState(0);

  // Animate credit counter
  useEffect(() => {
    if (credits?.remainingCredits !== undefined) {
      const target = credits.remainingCredits;
      const start = animatedCredits;
      const diff = target - start;
      const duration = 500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        setAnimatedCredits(Math.round(start + diff * eased));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [credits?.remainingCredits]);

  // Get color based on percentage
  const getStatusColor = () => {
    if (credits?.planType === 'enterprise') return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    if (creditPercentage > 50) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    if (creditPercentage > 20) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    return 'text-red-400 bg-red-500/10 border-red-500/30';
  };

  const getPlanIcon = () => {
    switch (credits?.planType) {
      case 'enterprise':
        return <Sparkles className={sizeClasses.icon} />;
      case 'pro':
        return <Zap className={sizeClasses.icon} />;
      default:
        return <Coins className={sizeClasses.icon} />;
    }
  };

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 'h-4 w-4',
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 'h-5 w-5',
    },
  }[size];

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center rounded-full border backdrop-blur-sm animate-pulse',
          'bg-gray-500/10 border-gray-500/30',
          sizeClasses.container,
          className
        )}
      >
        <div className={cn('rounded-full bg-gray-500/30', sizeClasses.icon)} />
        <span className="text-gray-400">...</span>
      </div>
    );
  }

  const isUnlimited = credits?.planType === 'enterprise';

  return (
    <>
      <motion.button
        onClick={() => setIsModalOpen(true)}
        className={cn(
          'flex items-center rounded-full border backdrop-blur-sm cursor-pointer',
          'transition-all duration-200 hover:scale-105 hover:shadow-lg',
          getStatusColor(),
          sizeClasses.container,
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {getPlanIcon()}
        <AnimatePresence mode="wait">
          <motion.span
            key={animatedCredits}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="font-semibold tabular-nums"
          >
            {isUnlimited ? '∞' : animatedCredits.toLocaleString()}
          </motion.span>
        </AnimatePresence>
        {showLabel && (
          <span className="text-gray-400 font-normal">
            {isUnlimited ? '' : 'credits'}
          </span>
        )}
      </motion.button>

      <CreditModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}

export default CreditBadge;
