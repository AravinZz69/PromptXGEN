import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { requireCredits, recordCreditUsage, CreditExhaustedError } from '@/utils/creditGuard';
import { LowCreditWarning } from '@/components/credits/LowCreditWarning';
import { CreditCostBadge } from '@/components/credits/CreditCostBadge';
import { ColorOrb } from '@/components/ui/ai-input';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { ChatMessage, ErrorMessage, ThinkingIndicator, ChatInput } from '@/components/chat';
import {
  Trash2,
  MessageSquare,
  Sparkles,
  ChevronDown,
} from 'lucide-react';

const GenerativeAI = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetch: refetchCredits, hasCredits, isLowCredits } = useCredits();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Use the streaming chat hook with credit callbacks
  const {
    messages,
    phase,
    error,
    sendMessage,
    stopGeneration,
    clearChat,
    regenerateResponse,
    isThinking,
    isStreaming,
    isBusy,
    MODEL,
  } = useStreamingChat({
    onCreditCheck: async () => {
      try {
        await requireCredits();
      } catch (err) {
        if (err instanceof CreditExhaustedError) {
          toast({
            title: 'No Credits',
            description: 'You have run out of credits. Please upgrade your plan.',
            variant: 'destructive',
          });
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
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Scroll to bottom when messages change or while streaming
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Check if user has scrolled up to show scroll button
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 0);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClearChat = () => {
    clearChat();
    toast({
      title: 'Chat Cleared',
      description: 'All messages have been removed.',
    });
  };

  // Status dot color based on phase
  const getStatusColor = () => {
    switch (phase) {
      case 'thinking':
        return 'bg-orange-500';
      case 'streaming':
        return 'bg-blue-500';
      case 'error':
        return 'bg-destructive';
      default:
        return 'bg-green-500';
    }
  };

  // Suggestions for empty state
  const suggestions = [
    "Explain Newton's Laws",
    'UPSC preparation tips',
    'Solve a JEE problem',
    'NEET Biology topics',
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole="Free Plan"
        userInitials={userInitials}
        onNavigate={(id) => {
          if (id === 'dashboard') navigate('/dashboard');
          else if (id === 'generate') navigate('/generate');
          else if (id === 'generative-ai') navigate('/generative-ai');
          else if (id === 'templates') navigate('/templates');
          else if (id === 'bookmarks') navigate('/templates?bookmarks=true');
          else if (id === 'history') navigate('/history');
          else if (id === 'settings') navigate('/settings');
          else if (id === 'upgrade') navigate('/upgrade');
        }}
        onLogout={() => {
          signOut();
          navigate('/');
        }}
      />

      {/* Main Content */}
      <div className="flex-1 relative ml-[70px] flex flex-col h-screen">
        <MiniNavbar />

        {/* Chat Container */}
        <div className="flex-1 flex flex-col pt-24 pb-4 px-4 max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ColorOrb dimension="40px" tones={{ base: "oklch(22.64% 0 0)" }} />
                {/* Status Dot */}
                <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ${getStatusColor()} ring-2 ring-background`} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded-full">
                    Llama 3.3
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isThinking ? 'Thinking...' : isStreaming ? 'Generating...' : 'Ready to help'}
                </p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearChat}
                disabled={isBusy}
                className="gap-1 text-muted-foreground hover:text-destructive hover:border-destructive/50"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto space-y-4 mb-4 relative"
          >
            {messages.length === 0 ? (
              /* Empty State */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="relative mb-6">
                  <Sparkles
                    className="h-16 w-16 text-primary"
                    style={{ animation: 'float 3s ease-in-out infinite' }}
                  />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 font-display">
                  Hello! I'm your AI assistant.
                </h2>
                <p className="text-muted-foreground max-w-md mb-6">
                  I can help you with JEE, NEET, UPSC, GATE preparation, or any academic topic.
                </p>

                {/* Feature Pills */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                  {['Generate prompts', 'Explain concepts', 'Solve problems', 'Study tips'].map(
                    (feature, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 rounded-full border border-border"
                      >
                        ✦ {feature}
                      </span>
                    )
                  )}
                </div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(suggestion)}
                      disabled={!hasCredits}
                      className="text-left p-3 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      <MessageSquare className="h-4 w-4 mb-1 text-primary group-hover:scale-110 transition-transform" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Messages List */
              <AnimatePresence mode="popLayout">
                {messages.map((message, index) => {
                  const isLastAssistant =
                    message.role === 'assistant' &&
                    index === messages.length - 1;

                  return (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isStreaming={isLastAssistant && message.isStreaming}
                      userInitials={userInitials}
                      onRegenerate={
                        isLastAssistant && !message.isStreaming
                          ? regenerateResponse
                          : undefined
                      }
                    />
                  );
                })}

                {/* Thinking Indicator */}
                {isThinking && <ThinkingIndicator />}

                {/* Error Message */}
                {phase === 'error' && error && (
                  <ErrorMessage
                    error={error}
                    onRetry={() => {
                      const lastUserMsg = [...messages]
                        .reverse()
                        .find((m) => m.role === 'user');
                      if (lastUserMsg) sendMessage(lastUserMsg.content);
                    }}
                  />
                )}
              </AnimatePresence>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />

            {/* Scroll to Bottom FAB */}
            <AnimatePresence>
              {showScrollButton && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToBottom}
                  className="fixed bottom-32 right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <ChevronDown className="h-5 w-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <div>
            {/* Low Credit Warning */}
            {(isLowCredits || !hasCredits) && (
              <div className="mb-3">
                <LowCreditWarning variant="inline" />
              </div>
            )}

            <ChatInput
              onSend={sendMessage}
              onStop={stopGeneration}
              phase={phase}
              disabled={!hasCredits}
              placeholder="Ask me anything... (Press Enter to send)"
              suggestions={suggestions}
              showSuggestions={false}
            />

            <div className="flex items-center justify-between mt-2">
              <CreditCostBadge model={MODEL} size="xs" variant="badge" />
              <p className="text-xs text-muted-foreground text-center">
                AI can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerativeAI;
