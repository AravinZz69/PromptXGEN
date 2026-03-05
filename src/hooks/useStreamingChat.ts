/**
 * EXISTING CHATBOT FINDINGS:
 * API key var:     import.meta.env.VITE_GROQ_API_KEY
 * API URL:         https://api.groq.com/openai/v1/chat/completions
 * Model used:      llama-3.3-70b-versatile
 * Theme accent:    Primary hsl(217 91% 60%), Accent hsl(260 80% 60%)
 */

import { useState, useCallback, useRef } from 'react';
import { saveChatConversation, ChatMessage as DbChatMessage } from '@/lib/chatHistoryService';

// ── CONSTANTS ──────────────────────────────────────────────────────────────
const MODEL = 'llama-3.3-70b-versatile';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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
  const abortRef = useRef<AbortController | null>(null);

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

      // 7. STREAMING fetch call to Groq API
      const response = await fetch(API_URL, {
        method: 'POST',
        signal: abortRef.current.signal,
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL,
          stream: true, // ← KEY: enable streaming
          max_tokens: 2048,
          temperature: 0.7,
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

      // Record credit usage if callback provided
      if (onCreditRecord && fullContent) {
        try {
          await onCreditRecord(MODEL, userText, fullContent, 'Generative AI chat');
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
          
          const saved = await saveChatConversation(dbMessages, conversationId || undefined, MODEL);
          if (saved && !conversationId) {
            setConversationId(saved.id);
          }
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
    MODEL,
  };
}
