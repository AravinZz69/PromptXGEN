import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCredits } from '@/hooks/useCredits';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Zap, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LowCreditWarningProps {
  /** Override automatic display logic */
  forceShow?: boolean;
  /** Called when user dismisses the warning */
  onDismiss?: () => void;
  /** Variant of the warning */
  variant?: 'toast' | 'banner' | 'inline';
  /** Additional CSS classes */
  className?: string;
}

export function LowCreditWarning({
  forceShow,
  onDismiss,
  variant = 'toast',
  className,
}: LowCreditWarningProps) {
  const navigate = useNavigate();
  const { credits, isLoading, isLowCredits, hasCredits } = useCredits();
  const [isDismissed, setIsDismissed] = useState(false);

  // Reset dismissed state when credits change
  useEffect(() => {
    if (credits?.remainingCredits && credits.remainingCredits >= 10) {
      setIsDismissed(false);
    }
  }, [credits?.remainingCredits]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  // Determine if we should show the warning
  const shouldShow = forceShow ?? (!isLoading && !isDismissed && (isLowCredits || !hasCredits));

  if (!shouldShow) return null;

  const isExhausted = !hasCredits;

  // Toast variant (floating notification)
  if (variant === 'toast') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className={cn(
            'fixed bottom-4 right-4 z-50 p-4 rounded-xl shadow-2xl max-w-sm',
            isExhausted
              ? 'bg-red-950/90 border border-red-500/50'
              : 'bg-amber-950/90 border border-amber-500/50',
            'backdrop-blur-lg',
            className
          )}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-start gap-3">
            {isExhausted ? (
              <Ban className="h-6 w-6 text-red-400 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0" />
            )}
            <div>
              <h4 className={cn('font-semibold', isExhausted ? 'text-red-200' : 'text-amber-200')}>
                {isExhausted ? 'Credits Exhausted' : 'Low Credits Warning'}
              </h4>
              <p className="text-sm text-gray-300 mt-1">
                {isExhausted
                  ? "You've run out of credits. Upgrade your plan to continue using AI features."
                  : `Only ${credits?.remainingCredits} credits remaining. Consider upgrading for uninterrupted access.`}
              </p>
              <Button
                size="sm"
                onClick={handleUpgrade}
                className={cn(
                  'mt-3',
                  isExhausted
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                )}
              >
                <Zap className="h-4 w-4 mr-1" />
                Upgrade Plan
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Banner variant (full-width at top)
  if (variant === 'banner') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={cn(
            'w-full py-2 px-4',
            isExhausted
              ? 'bg-red-600/90'
              : 'bg-amber-600/90',
            'backdrop-blur-sm',
            className
          )}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isExhausted ? (
                <Ban className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium text-white">
                {isExhausted
                  ? "You've run out of credits!"
                  : `Low credits: ${credits?.remainingCredits} remaining`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleUpgrade}
                className="h-7 text-xs"
              >
                <Zap className="h-3 w-3 mr-1" />
                Upgrade
              </Button>
              <button onClick={handleDismiss} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Inline variant (embedded in content)
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        'rounded-lg p-3 flex items-center justify-between',
        isExhausted
          ? 'bg-red-500/10 border border-red-500/30'
          : 'bg-amber-500/10 border border-amber-500/30',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {isExhausted ? (
          <Ban className={cn('h-4 w-4', 'text-red-400')} />
        ) : (
          <AlertTriangle className={cn('h-4 w-4', 'text-amber-400')} />
        )}
        <span className={cn('text-sm', isExhausted ? 'text-red-300' : 'text-amber-300')}>
          {isExhausted
            ? 'No credits remaining'
            : `${credits?.remainingCredits} credits left`}
        </span>
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleUpgrade}
        className={cn(
          'h-7 text-xs',
          isExhausted
            ? 'text-red-400 hover:text-red-300 hover:bg-red-500/20'
            : 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/20'
        )}
      >
        <Zap className="h-3 w-3 mr-1" />
        Upgrade
      </Button>
    </motion.div>
  );
}

// Export a hook for programmatic warning display
export function useShowLowCreditWarning() {
  const [isVisible, setIsVisible] = useState(false);

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  const Warning = () => (
    <LowCreditWarning forceShow={isVisible} onDismiss={hide} variant="toast" />
  );

  return { show, hide, Warning, isVisible };
}

export default LowCreditWarning;
