import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { requireCredits, recordCreditUsage, CreditExhaustedError } from '@/utils/creditGuard';
import { LowCreditWarning } from '@/components/credits/LowCreditWarning';
import { CreditCostBadge } from '@/components/credits/CreditCostBadge';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { ChatMessage, ErrorMessage, ThinkingIndicator, ChatInput } from '@/components/chat';
import ChatWelcome from '@/components/chat/ChatWelcome';
import {
  Trash2,
  ChevronDown,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

const GenerativeAI = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetch: refetchCredits, hasCredits, isLowCredits } = useCredits();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "instant" }); }, []);

  const {
    messages, phase, error, sendMessage, stopGeneration, clearChat,
    regenerateResponse, isThinking, isStreaming, isBusy, MODEL,
  } = useStreamingChat({
    onCreditCheck: async () => {
      try { await requireCredits(); } catch (err) {
        if (err instanceof CreditExhaustedError) {
          toast({ title: 'No Credits', description: 'Please upgrade your plan.', variant: 'destructive' });
          throw err;
        }
        throw err;
      }
    },
    onCreditRecord: async (model, input, output, action) => {
      await recordCreditUsage(model, input, output, action);
      refetchCredits();
    },
  });

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isStreaming]);

  useEffect(() => {
    const c = chatContainerRef.current;
    if (!c) return;
    const h = () => setShowScrollButton(c.scrollHeight - c.scrollTop - c.clientHeight > 100 && messages.length > 0);
    c.addEventListener('scroll', h);
    return () => c.removeEventListener('scroll', h);
  }, [messages.length]);

  const statusLabel = isThinking ? 'Thinking...' : isStreaming ? 'Generating...' : 'Online';
  const statusDot = isThinking ? 'bg-amber-400' : isStreaming ? 'bg-blue-400' : 'bg-emerald-400';

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute top-[-5%] left-[15%] w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-5%] right-[15%] w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-border/30">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground h-9 w-9 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <motion.div 
                  className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
                  animate={{ boxShadow: ['0 0 0px 0px hsl(var(--primary) / 0)', '0 0 16px 2px hsl(var(--primary) / 0.12)', '0 0 0px 0px hsl(var(--primary) / 0)'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ${statusDot} ring-2 ring-background`} />
              </div>
              <div>
                <h1 className="text-sm font-semibold text-foreground leading-tight">AI Assistant</h1>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusDot} ${isThinking || isStreaming ? 'animate-pulse' : ''}`} />
                  <span className="text-[11px] text-muted-foreground">{statusLabel}</span>
                  <span className="text-[11px] text-muted-foreground/40">· Llama 3.3</span>
                </div>
              </div>
            </div>
          </div>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { clearChat(); toast({ title: 'Chat Cleared' }); }}
              disabled={isBusy}
              className="text-muted-foreground hover:text-destructive rounded-xl gap-1.5 text-xs h-8"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 pb-4 relative pt-4 chat-scroll">
          {messages.length === 0 ? (
            <ChatWelcome onSend={sendMessage} />
          ) : (
            <div className="space-y-5">
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => {
                  const isLastAssistant = message.role === 'assistant' && index === messages.length - 1;
                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isStreaming={isLastAssistant && message.isStreaming}
                      userInitials={userInitials}
                      onRegenerate={isLastAssistant && !message.isStreaming ? regenerateResponse : undefined}
                    />
                  );
                })}
                {isThinking && <ThinkingIndicator />}
                {phase === 'error' && error && (
                  <ErrorMessage
                    error={error}
                    onRetry={() => {
                      const last = [...messages].reverse().find((m) => m.role === 'user');
                      if (last) sendMessage(last.content);
                    }}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
          <div ref={messagesEndRef} />

          <AnimatePresence>
            {showScrollButton && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="fixed bottom-32 right-8 p-2.5 rounded-full bg-card/80 backdrop-blur-xl border border-border/50 text-muted-foreground shadow-2xl hover:text-foreground transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {messages.length > 0 && (
          <div className="px-4 pb-4">
            {(isLowCredits || !hasCredits) && (
              <div className="mb-3"><LowCreditWarning variant="inline" /></div>
            )}
            <ChatInput
              onSend={sendMessage}
              onStop={stopGeneration}
              phase={phase}
              disabled={!hasCredits}
              placeholder="Type your message..."
              suggestions={[]}
              showSuggestions={false}
            />
            <div className="flex items-center justify-between mt-2 px-1">
              <CreditCostBadge model={MODEL} size="xs" variant="badge" />
              <p className="text-[11px] text-muted-foreground/40">AI can make mistakes. Verify important info.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GenerativeAI;
