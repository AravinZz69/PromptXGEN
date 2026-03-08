import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Square, Sparkles } from 'lucide-react';
import type { ChatPhase } from '@/hooks/useStreamingChat';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop?: () => void;
  phase: ChatPhase;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: string[];
  showSuggestions?: boolean;
}

export function ChatInput({
  onSend, onStop, phase, disabled = false,
  placeholder = 'Type your message...', suggestions = [], showSuggestions = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBusy = phase === 'thinking' || phase === 'streaming';

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isBusy || disabled) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') setInput('');
  };

  return (
    <div>
      {showSuggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => onSend(s)} disabled={isBusy || disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground border border-border/60 bg-card/30 rounded-full hover:border-primary/30 hover:text-foreground hover:bg-card/60 transition-all disabled:opacity-50">
              <Sparkles className="h-3 w-3" />{s}
            </button>
          ))}
        </div>
      )}

      <div
        className={`flex items-end gap-3 p-3 rounded-2xl backdrop-blur-xl transition-all duration-300
          ${disabled ? 'opacity-50' : ''}
          ${isFocused && input.trim()
            ? 'bg-card/70 border border-primary/30 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.12),0_8px_32px_-8px_rgba(0,0,0,0.4)]'
            : 'bg-card/50 border border-border/50 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]'
          }`}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground/40 min-h-[36px] max-h-[180px] py-1.5 text-sm leading-relaxed"
        />

        {isBusy ? (
          <motion.button
            onClick={onStop}
            className="p-2.5 rounded-xl bg-destructive/90 text-destructive-foreground flex-shrink-0 shadow-md"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            title="Stop"
          >
            <Square className="h-4 w-4 fill-current" />
          </motion.button>
        ) : (
          <motion.button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            className={`p-2.5 rounded-xl flex-shrink-0 transition-all duration-200 ${
              input.trim() && !disabled
                ? 'bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]'
                : 'bg-muted/50 text-muted-foreground/40'
            }`}
            whileHover={input.trim() && !disabled ? { scale: 1.05 } : {}}
            whileTap={input.trim() && !disabled ? { scale: 0.92 } : {}}
            title="Send"
          >
            <Send className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      <div className="flex items-center justify-between mt-1.5 px-1">
        <span className="text-[11px] text-muted-foreground/30">Shift+Enter for new line</span>
        {input.length > 100 && (
          <span className={`text-[11px] ${input.length > 4000 ? 'text-destructive' : 'text-muted-foreground/30'}`}>{input.length}</span>
        )}
      </div>
    </div>
  );
}

export default ChatInput;
