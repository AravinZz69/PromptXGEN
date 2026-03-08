import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Coins, Sparkles } from 'lucide-react';
import { calculateEstimatedCost, MODEL_COSTS } from '@/hooks/useCredits';
import { cn } from '@/lib/utils';

interface CreditCostBadgeProps {
  /** Model being used for generation */
  model: string;
  /** Estimated prompt length in characters (will be converted to tokens) */
  estimatedPromptLength?: number;
  /** Estimated response length in characters (will be converted to tokens) */
  estimatedResponseLength?: number;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
  /** Show as a tooltip instead of inline badge */
  variant?: 'badge' | 'inline' | 'tooltip';
}

export function CreditCostBadge({
  model,
  estimatedPromptLength = 400,
  estimatedResponseLength = 2000,
  size = 'sm',
  className,
  variant = 'badge',
}: CreditCostBadgeProps) {
  // Convert character length to approximate tokens (4 chars ≈ 1 token)
  const estimatedPromptTokens = Math.ceil(estimatedPromptLength / 4);
  const estimatedResponseTokens = Math.ceil(estimatedResponseLength / 4);

  const estimatedCost = useMemo(
    () => calculateEstimatedCost(model, estimatedPromptTokens, estimatedResponseTokens),
    [model, estimatedPromptTokens, estimatedResponseTokens]
  );

  const baseCost = MODEL_COSTS[model] || MODEL_COSTS['default'];

  const sizeClasses = {
    xs: {
      container: 'px-1.5 py-0.5 text-[10px] gap-0.5',
      icon: 'h-2.5 w-2.5',
    },
    sm: {
      container: 'px-2 py-0.5 text-xs gap-1',
      icon: 'h-3 w-3',
    },
    md: {
      container: 'px-2.5 py-1 text-sm gap-1.5',
      icon: 'h-4 w-4',
    },
  }[size];

  // Inline variant - just shows the cost text
  if (variant === 'inline') {
    return (
      <span className={cn('text-muted-foreground', className)}>
        ~{estimatedCost} credits
      </span>
    );
  }

  // Tooltip variant - shows model info on hover
  if (variant === 'tooltip') {
    return (
      <div className="relative group inline-block">
        <motion.span
          className={cn(
            'inline-flex items-center rounded-full',
            'bg-primary/10 text-primary border border-primary/30',
            'cursor-help',
            sizeClasses.container,
            className
          )}
        >
          <Coins className={sizeClasses.icon} />
          ~{estimatedCost}
        </motion.span>
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 rounded-lg shadow-xl border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          <div className="text-xs space-y-1">
            <p className="text-muted-foreground">
              <span className="text-muted-foreground">Model:</span> {model}
            </p>
            <p className="text-muted-foreground">
              <span className="text-muted-foreground">Base cost:</span> {baseCost} credits
            </p>
            <p className="text-muted-foreground">
              <span className="text-muted-foreground">Token cost:</span> ~{estimatedCost - baseCost} credits
            </p>
            <hr className="border-gray-700 my-1" />
            <p className="font-medium text-primary">
              Total: ~{estimatedCost} credits
            </p>
          </div>
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      </div>
    );
  }

  // Default badge variant
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center rounded-full',
        'bg-primary/10 text-primary border border-primary/30',
        sizeClasses.container,
        className
      )}
      title={`Estimated cost: ~${estimatedCost} credits (${model})`}
    >
      <Coins className={sizeClasses.icon} />
      <span className="font-medium">~{estimatedCost}</span>
      <span className="text-primary/70">credits</span>
    </motion.span>
  );
}

// Export a simpler version for button labels
export function CreditCostLabel({
  model,
  className,
}: {
  model: string;
  className?: string;
}) {
  const cost = calculateEstimatedCost(model);
  
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs text-muted-foreground', className)}>
      <Sparkles className="h-3 w-3" />
      ~{cost} credits
    </span>
  );
}

export default CreditCostBadge;
