import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCredits } from '@/hooks/useCredits';
import { requireCredits, recordCreditUsage, CreditExhaustedError } from '@/utils/creditGuard';
import { LowCreditWarning } from '@/components/credits/LowCreditWarning';
import { CreditCostBadge } from '@/components/credits/CreditCostBadge';
import { MorphPanel, ColorOrb } from '@/components/ui/ai-input';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  MessageSquare,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const GenerativeAI = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refetch: refetchCredits, hasCredits, isLowCredits } = useCredits();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const MODEL_NAME = 'llama-3.3-70b-versatile';

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userInitials = userName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const assistantMessageId = (Date.now() + 1).toString();

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add empty assistant message that will be streamed into
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);
    setStreamingId(assistantMessageId);

    try {
      // Check credits before making the AI call
      await requireCredits();
    } catch (err) {
      if (err instanceof CreditExhaustedError) {
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
        toast({
          title: 'No Credits',
          description: 'You have run out of credits. Please upgrade your plan.',
          variant: 'destructive',
        });
        setIsLoading(false);
        setStreamingId(null);
        return;
      }
      throw err;
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant specialized in education, particularly for Indian competitive exams like JEE, NEET, UPSC, GATE, and general academics. You provide clear, accurate, and well-structured responses. Use markdown formatting for better readability. Be concise but thorough.`
            },
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: text }
          ],
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  accumulatedContent += content;
                  // Update message with streaming content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                }
              } catch {
                // Skip invalid JSON lines
              }
            }
          }
        }
      }

      // If no content was streamed, show error
      if (!accumulatedContent) {
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: 'Sorry, I could not generate a response.' }
            : msg
        ));
      } else {
        // Deduct credits after successful generation
        try {
          await recordCreditUsage(MODEL_NAME, text, accumulatedContent, 'Generative AI chat');
          refetchCredits(); // Refresh credit display
        } catch (creditError) {
          console.warn('Failed to record credit usage:', creditError);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      // Remove empty assistant message on error
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      toast({
        title: 'Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setStreamingId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([]);
    toast({
      title: 'Chat Cleared',
      description: 'All messages have been removed.',
    });
  };

  const regenerateResponse = async () => {
    if (messages.length < 2) return;
    
    // Remove last assistant message and regenerate
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      setMessages(prev => prev.slice(0, -1));
      await handleSubmit(lastUserMessage.content);
    }
  };

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
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">AI Assistant</h1>
                <p className="text-sm text-muted-foreground">Powered by Llama 3.3 70B</p>
              </div>
            </div>
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearChat}
                className="gap-1 text-muted-foreground"
              >
                <Trash2 className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full text-center"
              >
                <div className="relative mb-6">
                  <ColorOrb dimension="80px" tones={{ base: "oklch(22.64% 0 0)" }} />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground max-w-md mb-8">
                  Ask me anything about JEE, NEET, UPSC, GATE preparation, or any academic topic.
                </p>
                
                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                  {[
                    'Explain Newton\'s Laws of Motion',
                    'Tips for UPSC Prelims preparation',
                    'Solve this JEE Physics problem',
                    'NEET Biology important topics',
                  ].map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className="text-left p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="h-4 w-4 mb-1 text-primary" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted/50 border border-border'
                      }`}
                    >
                      {message.role === 'assistant' ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-headings:my-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                          {streamingId === message.id && (
                            <span className="inline-block w-2 h-4 bg-primary ml-1 animate-pulse" />
                          )}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                      
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                          <button
                            onClick={() => copyToClipboard(message.content, message.id)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copiedId === message.id ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {message.role === 'user' && (
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium">
                          {userInitials}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-primary" />
                </div>
                <div className="bg-muted/50 border border-border rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border pt-4">
            {/* Low Credit Warning */}
            {(isLowCredits || !hasCredits) && (
              <div className="mb-3">
                <LowCreditWarning variant="inline" />
              </div>
            )}
            
            {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && (
              <div className="flex justify-center mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={regenerateResponse}
                  disabled={isLoading}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>
            )}
            
            <div className="relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything... (Press Enter to send, Shift+Enter for new line)"
                className="min-h-[60px] max-h-[200px] pr-12 resize-none bg-card border-border rounded-xl"
                disabled={isLoading || !hasCredits}
              />
              <Button
                onClick={() => handleSubmit()}
                disabled={!input.trim() || isLoading || !hasCredits}
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8 rounded-lg"
                title={!hasCredits ? 'No credits remaining' : 'Send message'}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <CreditCostBadge model={MODEL_NAME} size="xs" variant="badge" />
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
