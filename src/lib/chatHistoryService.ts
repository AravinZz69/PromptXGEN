// Chat History Service - Manages AI chat conversations in Supabase

import { supabase } from './supabase';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Generate a title from the first user message
const generateTitle = (messages: ChatMessage[]): string => {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Chat';
  
  const content = firstUserMessage.content.trim();
  // Truncate to first 50 characters or first sentence
  const truncated = content.slice(0, 50);
  return truncated.length < content.length ? truncated + '...' : truncated;
};

// Get all chat conversations for the current user
export const getChatHistory = async (): Promise<ChatConversation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }

  return data || [];
};

// Get a single conversation by ID
export const getChatConversation = async (id: string): Promise<ChatConversation | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching conversation:', error);
    return null;
  }

  return data;
};

// Save a new conversation or update existing one
export const saveChatConversation = async (
  messages: ChatMessage[],
  conversationId?: string,
  model: string = 'llama-3.3-70b-versatile'
): Promise<ChatConversation | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const title = generateTitle(messages);

  if (conversationId) {
    // Update existing conversation
    const { data, error } = await supabase
      .from('chat_conversations')
      .update({
        messages,
        title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return null;
    }

    return data;
  } else {
    // Create new conversation
    const { data, error } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: user.id,
        title,
        messages,
        model,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving conversation:', error);
      return null;
    }

    return data;
  }
};

// Delete a conversation
export const deleteChatConversation = async (id: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }

  return true;
};

// Toggle favorite status
export const toggleChatFavorite = async (id: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  // First get current status
  const { data: current } = await supabase
    .from('chat_conversations')
    .select('is_favorite')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!current) return false;

  // Toggle it
  const { error } = await supabase
    .from('chat_conversations')
    .update({ is_favorite: !current.is_favorite })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error toggling favorite:', error);
    return false;
  }

  return true;
};

// Clear all chat history for the user
export const clearChatHistory = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error('Error clearing chat history:', error);
    return false;
  }

  return true;
};

// Search chat conversations
export const searchChatHistory = async (query: string): Promise<ChatConversation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id)
    .or(`title.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching chat history:', error);
    return [];
  }

  // Also filter by message content client-side (JSONB search is complex in Supabase)
  const lowerQuery = query.toLowerCase();
  return (data || []).filter(conv => {
    // Match title
    if (conv.title.toLowerCase().includes(lowerQuery)) return true;
    
    // Match message content
    return conv.messages.some((msg: ChatMessage) => 
      msg.content.toLowerCase().includes(lowerQuery)
    );
  });
};

// Get favorite conversations
export const getFavoriteChatHistory = async (): Promise<ChatConversation[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorite chats:', error);
    return [];
  }

  return data || [];
};

// Save individual AI interaction to prompt_history for admin tracking
export const saveAiInteraction = async (
  input: string,
  output: string,
  model: string = 'llama-3.3-70b-versatile',
  promptType: string = 'chat'
): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('prompt_history').insert({
      user_id: user.id,
      input_text: input,
      output_text: output,
      model: model,
      prompt_type: promptType,
      tokens_used: Math.ceil((input.length + output.length) / 4),
      credits_used: 1,
      metadata: { source: 'generative-ai' },
    });
    console.log('AI interaction saved to prompt_history');
  } catch (error) {
    console.error('Error saving AI interaction:', error);
  }
};
