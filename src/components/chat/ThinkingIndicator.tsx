import { motion } from 'framer-motion';
import { Sparkles, Bot } from 'lucide-react';

interface ThinkingIndicatorProps {
  className?: string;
}

export function ThinkingIndicator({ className = '' }: ThinkingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${className}`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary animate-pulse" />
        </div>
      </div>

      {/* Thinking Bubble */}
      <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-card/80 backdrop-blur-sm border border-border/60 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            {[0, 150, 300].map((delay, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/70"
                style={{
                  animation: 'bounce-dot 1.2s infinite ease-in-out',
                  animationDelay: `${delay}ms`,
                }}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}

export default ThinkingIndicator;
