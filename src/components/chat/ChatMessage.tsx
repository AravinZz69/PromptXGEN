import { useState } from 'react';
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
  message, isStreaming = false, userInitials = 'U', onCopy, onRegenerate,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    onCopy?.(message.content);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Bot Avatar */}
      {!isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}

      {/* Message */}
      <div
        className={`group relative ${
          isUser
            ? 'max-w-[75%] px-4 py-3 bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-[0_4px_16px_-2px_hsl(var(--primary)/0.3)]'
            : 'max-w-[85%] px-4 py-3 bg-card/60 backdrop-blur-sm border border-border/40 rounded-2xl rounded-bl-md'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-li:text-foreground/90 prose-code:bg-muted prose-code:text-foreground prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-pre:bg-muted/80 prose-pre:border prose-pre:border-border/40">
            <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
          </div>
        )}

        {/* Bot actions */}
        {!isUser && !isStreaming && message.content && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30">
            <span className="text-[11px] text-muted-foreground/50">{formatTime(message.timestamp)}</span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <MsgAction onClick={handleCopy} active={copied}
                activeEl={<Check className="h-3.5 w-3.5 text-emerald-400" />}
                el={<Copy className="h-3.5 w-3.5" />} />
              <MsgAction onClick={() => setLiked(liked === 'up' ? null : 'up')} active={liked === 'up'}
                activeEl={<ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />}
                el={<ThumbsUp className="h-3.5 w-3.5" />} />
              <MsgAction onClick={() => setLiked(liked === 'down' ? null : 'down')} active={liked === 'down'}
                activeEl={<ThumbsDown className="h-3.5 w-3.5 text-rose-400" />}
                el={<ThumbsDown className="h-3.5 w-3.5" />} />
              {onRegenerate && (
                <MsgAction onClick={onRegenerate} el={<RotateCcw className="h-3.5 w-3.5" />} />
              )}
            </div>
          </div>
        )}

        {isUser && (
          <div className="flex justify-end mt-1">
            <span className="text-[11px] text-primary-foreground/50">{formatTime(message.timestamp)}</span>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground text-xs font-semibold shadow-md">
            {userInitials}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function MsgAction({ onClick, active, activeEl, el }: {
  onClick: () => void; active?: boolean; activeEl?: React.ReactNode; el: React.ReactNode;
}) {
  return (
    <button onClick={onClick}
      className={`p-1.5 rounded-lg transition-colors ${active ? 'bg-muted/60' : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'}`}>
      {active && activeEl ? activeEl : el}
    </button>
  );
}

export function ErrorMessage({ error, onRetry }: { error: string; onRetry?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
      <div className="flex-shrink-0 mt-1">
        <div className="w-8 h-8 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <AlertCircle className="h-4 w-4 text-destructive" />
        </div>
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 bg-destructive/[0.06] border border-destructive/20">
        <p className="text-sm text-destructive mb-2">{error || 'Something went wrong.'}</p>
        {onRetry && (
          <button onClick={onRetry} className="text-sm text-destructive hover:text-destructive/80 font-medium">Try again →</button>
        )}
      </div>
    </motion.div>
  );
}

export default ChatMessage;
