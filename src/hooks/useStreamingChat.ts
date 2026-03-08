/**
 * DYNAMIC AI MODEL CHAT:
 * Uses AI models configured in Supabase admin panel
 * Falls back to Groq with environment variable if no models configured
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { saveChatConversation, ChatMessage as DbChatMessage, saveAiInteraction } from '@/lib/chatHistoryService';
import { getDefaultAIModelConfig, AIModelConfig, trackModelUsage } from '@/lib/aiModelService';

// ── FALLBACK CONSTANTS ──────────────────────────────────────────────────────
const FALLBACK_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export type ChatPhase = 'idle' | 'thinking' | 'streaming' | 'done' | 'error';

interface UseStreamingChatOptions {
  systemPrompt?: string;
  onCreditCheck?: () => Promise<void>;
  onCreditRecord?: (model: string, input: string, output: string, action: string) => Promise<void>;
  autoSave?: boolean; // Auto-save conversations to database
}

export function useStreamingChat(options: UseStreamingChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  // phase: 'idle' | 'thinking' | 'streaming' | 'done' | 'error'
  const [phase, setPhase] = useState<ChatPhase>('idle');
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [modelConfig, setModelConfig] = useState<AIModelConfig | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load AI model config on mount
  useEffect(() => {
    const loadModelConfig = async () => {
      try {
        const config = await getDefaultAIModelConfig();
        setModelConfig(config);
        console.log('[Chat] Loaded AI model:', config.model, 'from', config.provider);
      } catch (err) {
        console.warn('[Chat] Failed to load model config, using fallback');
      }
    };
    loadModelConfig();
  }, []);

  const {
    systemPrompt = `You are a helpful AI assistant specialized in education, particularly for Indian competitive exams like JEE, NEET, UPSC, GATE, and general academics. You provide clear, accurate, and well-structured responses. Use markdown formatting for better readability:
- Use **bold** for emphasis
- Use bullet points and numbered lists
- Use code blocks with \`\`\`language for code
- Use ## and ### for section headings
- Use > for important quotes or notes
Be concise but thorough.`,
    onCreditCheck,
    onCreditRecord,
    autoSave = true,
  } = options;

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || phase === 'thinking' || phase === 'streaming') return;

    // Get model config (use state or fetch fresh)
    const config = modelConfig || await getDefaultAIModelConfig();
    const apiUrl = config.apiUrl || FALLBACK_API_URL;
    const apiKey = config.apiKey || import.meta.env.VITE_GROQ_API_KEY;
    const model = config.model || FALLBACK_MODEL;
    const maxTokens = config.maxTokens || 2048;

    // 1. Add user message immediately
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setStreamingContent('');
    setError(null);

    // 2. Enter THINKING phase (show thinking animation)
    setPhase('thinking');

    // 3. Add a placeholder assistant message that will be updated live
    const assistantMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    }]);

    // 4. Check credits if callback provided
    if (onCreditCheck) {
      try {
        await onCreditCheck();
      } catch (err) {
        // Remove the placeholder message on credit error
        setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
        setPhase('error');
        setError('No credits available');
        return;
      }
    }

    try {
      // 5. Build conversation history for context
      const history = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // 6. Create AbortController so user can stop generation
      abortRef.current = new AbortController();
      const startTime = Date.now();

      // 7. STREAMING fetch call to configured AI API
      const response = await fetch(apiUrl, {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          stream: true,
          max_tokens: maxTokens,
          temperature: config.temperature ?? 0.7,
          top_p: config.topP ?? 1,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history,
            { role: 'user', content: userText },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      // 8. Switch from THINKING to STREAMING phase
      // Add a small artificial delay so the thinking animation is visible
      await new Promise(r => setTimeout(r, 800));
      setPhase('streaming');

      // 9. Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });

          // OpenAI/Groq sends "data: {...}\n\n" lines
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            if (!data) continue;

            try {
              const json = JSON.parse(data);
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                setStreamingContent(fullContent);
                // Live-update the assistant message in the messages array
                setMessages(prev => prev.map(m =>
                  m.id === assistantMsgId
                    ? { ...m, content: fullContent }
                    : m
                ));
              }
            } catch {
              // Skip malformed JSON chunks silently
            }
          }
        }
      }

      // 10. Finalize: mark message as done (no longer streaming)
      const finalMessages = messages.map(m =>
        m.id === assistantMsgId
          ? { ...m, content: fullContent, isStreaming: false }
          : m
      );
      // Add the user message that was added at the start
      const allMessages = [...finalMessages.slice(0, -1), userMsg, { 
        id: assistantMsgId, 
        role: 'assistant' as const, 
        content: fullContent, 
        timestamp: new Date(),
        isStreaming: false 
      }];
      
      setMessages(allMessages);

      // Track model usage in Supabase
      const latencyMs = Date.now() - startTime;
      const tokensUsed = Math.ceil((userText.length + fullContent.length) / 4);
      // Fire and forget - don't await
      trackModelUsage(config.model, tokensUsed, latencyMs).catch(() => {});

      // Record credit usage if callback provided
      if (onCreditRecord && fullContent) {
        try {
          await onCreditRecord(model, userText, fullContent, 'Generative AI chat');
        } catch (creditError) {
          console.warn('Failed to record credit usage:', creditError);
        }
      }

      // 11. Auto-save conversation to database
      if (autoSave && fullContent) {
        try {
          // Convert messages to database format
          const dbMessages: DbChatMessage[] = allMessages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.timestamp.toISOString(),
          }));
          
          const saved = await saveChatConversation(dbMessages, conversationId || undefined, model);
          if (saved && !conversationId) {
            setConversationId(saved.id);
          }
          
          // Also save individual interaction to prompt_history for admin tracking
          await saveAiInteraction(userText, fullContent, model, 'chat');
        } catch (saveError) {
          console.warn('Failed to save conversation:', saveError);
        }
      }

      setPhase('done');
      setTimeout(() => setPhase('idle'), 300);

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // User stopped generation — keep what streamed so far
        setMessages(prev => prev.map(m =>
          m.isStreaming ? { ...m, isStreaming: false } : m
        ));
        setPhase('idle');
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setPhase('error');
        // Remove the empty placeholder message on error
        setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
      }
    }
  }, [messages, phase, systemPrompt, onCreditCheck, onCreditRecord, autoSave, conversationId]);

  // Allow user to stop generation mid-stream
  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // Clear entire conversation (starts a new chat)
  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStreamingContent('');
    setPhase('idle');
    setError(null);
    setConversationId(null); // Reset to start a new conversation
  }, []);

  // Regenerate last response
  const regenerateResponse = useCallback(async () => {
    if (messages.length < 2) return;
    
    // Find last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove last assistant message
      setMessages(prev => prev.slice(0, -1));
      // Regenerate
      await sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    phase,           // 'idle' | 'thinking' | 'streaming' | 'done' | 'error'
    streamingContent,
    error,
    sendMessage,
    stopGeneration,
    clearChat,
    regenerateResponse,
    isThinking: phase === 'thinking',
    isStreaming: phase === 'streaming',
    isBusy: phase === 'thinking' || phase === 'streaming',
    conversationId,
    setConversationId,
    MODEL: modelConfig?.model || FALLBACK_MODEL,
  };
}
