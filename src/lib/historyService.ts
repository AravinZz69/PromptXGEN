// History Service - Manages prompt generation history in localStorage

export interface HistoryItem {
  id: string;
  type: 'prompt' | 'template';
  templateId?: string;
  templateName?: string;
  category?: string;
  input: Record<string, string | number> | string;
  output: string;
  promptType?: string; // basic, advanced, chain-of-thought
  createdAt: string;
  isFavorite?: boolean;
}

const HISTORY_KEY = 'promptGenius_history';
const MAX_HISTORY_ITEMS = 100;

// Generate unique ID
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get all history items
export const getHistory = (): HistoryItem[] => {
  try {
    const data = localStorage.getItem(HISTORY_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
};

// Add new history item
export const addToHistory = (item: Omit<HistoryItem, 'id' | 'createdAt'>): HistoryItem => {
  const history = getHistory();
  
  const newItem: HistoryItem = {
    ...item,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  
  // Add to beginning of array
  history.unshift(newItem);
  
  // Limit history size
  if (history.length > MAX_HISTORY_ITEMS) {
    history.pop();
  }
  
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return newItem;
};

// Delete history item
export const deleteFromHistory = (id: string): void => {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
};

// Clear all history
export const clearHistory = (): void => {
  localStorage.removeItem(HISTORY_KEY);
};

// Toggle favorite
export const toggleFavorite = (id: string): void => {
  const history = getHistory();
  const item = history.find(h => h.id === id);
  if (item) {
    item.isFavorite = !item.isFavorite;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }
};

// Get favorites only
export const getFavorites = (): HistoryItem[] => {
  return getHistory().filter(item => item.isFavorite);
};

// Search history
export const searchHistory = (query: string): HistoryItem[] => {
  const history = getHistory();
  const lowerQuery = query.toLowerCase();
  
  return history.filter(item => {
    const inputStr = typeof item.input === 'string' 
      ? item.input 
      : JSON.stringify(item.input);
    
    return (
      inputStr.toLowerCase().includes(lowerQuery) ||
      item.output.toLowerCase().includes(lowerQuery) ||
      item.templateName?.toLowerCase().includes(lowerQuery) ||
      item.category?.toLowerCase().includes(lowerQuery)
    );
  });
};

// Get history by type
export const getHistoryByType = (type: 'prompt' | 'template'): HistoryItem[] => {
  return getHistory().filter(item => item.type === type);
};

// Get recent history (last N items)
export const getRecentHistory = (count: number = 5): HistoryItem[] => {
  return getHistory().slice(0, count);
};
