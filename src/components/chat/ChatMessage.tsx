import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Copy, Check, ThumbsUp, ThumbsDown, RotateCcw, AlertCircle } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { Message } from '@/hooks/useStreamingChat';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
  userInitials?: string;
  onCopy?: (content: string) => void;
  onRegenerate?: () => void;
}

export function ChatMessage({
  message,
  isStreaming = false,
  userInitials = 'U',
  onCopy,
  onRegenerate,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<'up' | 'down' | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  // Trigger entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setHasAnimated(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Bot Avatar (left side for assistant) */}
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
            <Bot className="h-5 w-5 text-primary" />
          </div>
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`
          max-w-[85%] px-4 py-3
          ${isUser
            ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl rounded-br-sm'
            : 'bg-muted/50 border border-border rounded-2xl rounded-bl-sm'
          }
          ${hasAnimated ? '' : 'opacity-0'}
          transition-opacity duration-300
        `}
      >
        {/* Content */}
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
          </div>
        )}

        {/* Timestamp & Actions for Assistant */}
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
            <div className="flex items-center gap-1">
              {/* Copy */}
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                title="Copy message"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>

              {/* Thumbs Up */}
              <button
                onClick={() => setLiked(liked === 'up' ? null : 'up')}
                className={`p-1.5 rounded-lg transition-colors ${
                  liked === 'up'
                    ? 'text-green-500 bg-green-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
                title="Good response"
              >
                <ThumbsUp className="h-4 w-4" />
              </button>

              {/* Thumbs Down */}
              <button
                onClick={() => setLiked(liked === 'down' ? null : 'down')}
                className={`p-1.5 rounded-lg transition-colors ${
                  liked === 'down'
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
                title="Bad response"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>

              {/* Regenerate */}
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  title="Regenerate response"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Timestamp for User */}
        {isUser && (
          <div className="flex justify-end mt-1">
            <span className="text-xs text-primary-foreground/70">
              {formatTime(message.timestamp)}
            </span>
          </div>
        )}
      </div>

      {/* User Avatar (right side for user) */}
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
            {userInitials}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// Error Message Component
export function ErrorMessage({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 bg-destructive/10 border border-destructive/20">
        <p className="text-sm text-destructive mb-2">{error || 'Something went wrong. Please try again.'}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-destructive hover:text-destructive/80 font-medium transition-colors"
          >
            Try again →
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default ChatMessage;
