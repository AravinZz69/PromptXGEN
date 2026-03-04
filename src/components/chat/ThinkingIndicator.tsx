import { motion } from 'framer-motion';
import { Sparkles, Bot } from 'lucide-react';

interface ThinkingIndicatorProps {
  className?: string;
}

export function ThinkingIndicator({ className = '' }: ThinkingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${className}`}
    >
      {/* Bot Avatar */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
          <Bot className="h-5 w-5 text-primary" />
        </div>
      </div>

      {/* Thinking Bubble */}
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-5 py-4 bg-muted/50 border border-border shadow-lg shadow-primary/5">
        {/* Section 1 - Sparkles + Thinking Text */}
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground italic">Thinking...</span>
        </div>

        {/* Section 2 - Three Bouncing Dots */}
        <div className="flex items-center gap-1.5 mb-3">
          {[0, 150, 300].map((delay, index) => (
            <span
              key={index}
              className="w-2 h-2 rounded-full bg-primary"
              style={{
                animation: 'bounce-dot 1.2s infinite ease-in-out',
                animationDelay: `${delay}ms`,
              }}
            />
          ))}
        </div>

        {/* Section 3 - Shimmer Loading Bar */}
        <div className="h-1 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
            style={{
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default ThinkingIndicator;
