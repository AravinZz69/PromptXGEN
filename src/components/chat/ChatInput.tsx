import { useState, useRef, useEffect, KeyboardEvent } from 'react';
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
  onSend,
  onStop,
  phase,
  disabled = false,
  placeholder = 'Ask me anything...',
  suggestions = [],
  showSuggestions = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isBusy = phase === 'thinking' || phase === 'streaming';

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isBusy || disabled) return;
    onSend(input.trim());
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setInput('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSend(suggestion);
  };

  return (
    <div className="pt-4">
      {/* Suggestion Chips */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              disabled={isBusy || disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-full hover:border-primary/50 hover:text-foreground hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="h-3 w-3" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Input Pill */}
        <div
          className={`
            flex items-end gap-2 p-3 rounded-2xl
            bg-white/[0.03] backdrop-blur-sm
            transition-all duration-300
            ${disabled ? 'opacity-50' : ''}
            ${input.trim() 
              ? 'border border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
              : 'border border-border hover:border-border'
            }
          `}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground min-h-[40px] max-h-[200px] py-2"
          />

          {/* Send/Stop Button */}
          {isBusy ? (
            <button
              onClick={onStop}
              className="p-2.5 rounded-xl bg-destructive text-destructive-foreground flex-shrink-0 transition-all hover:bg-destructive/90"
              style={{ animation: 'stop-pulse 1.5s ease-in-out infinite' }}
              title="Stop generating"
            >
              <Square className="h-5 w-5 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!input.trim() || disabled}
              className={`
                p-2.5 rounded-xl flex-shrink-0 transition-all
                ${input.trim() && !disabled
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
                }
              `}
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Helper Row */}
        <div className="flex items-center justify-between mt-2 px-2">
          <span className="text-xs text-muted-foreground">
            Shift+Enter for new line
          </span>
          {input.length > 100 && (
            <span className={`text-xs ${input.length > 4000 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {input.length} characters
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
