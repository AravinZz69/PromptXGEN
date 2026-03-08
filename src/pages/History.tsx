import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MiniNavbar } from '@/components/ui/mini-navbar';
import Sidebar from '@/components/ui/sidebar-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCredits } from '@/hooks/useCredits';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getHistory,
  deleteFromHistory,
  clearHistory,
  toggleFavorite,
  searchHistory,
  HistoryItem,
} from '@/lib/historyService';
import {
  getChatHistory,
  deleteChatConversation,
  toggleChatFavorite,
  clearChatHistory,
  ChatConversation,
} from '@/lib/chatHistoryService';
import {
  Search,
  Trash2,
  Star,
  Clock,
  Copy,
  Check,
  ChevronRight,
  FileText,
  Sparkles,
  X,
  AlertTriangle,
  Download,
  Filter,
  MessageSquare,
  Bot,
  User,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const History = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatConversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [selectedChat, setSelectedChat] = useState<ChatConversation | null>(null);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<'all' | 'prompt' | 'template' | 'chat' | 'favorites'>('all');
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Get user info
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const currentPlan = credits?.planType === 'pro' ? 'Pro' : credits?.planType === 'enterprise' ? 'Enterprise' : 'Free';

  // Load history
  useEffect(() => {
    loadHistory();
    loadChatHistory();
  }, []);

  const loadHistory = () => {
    const items = getHistory();
    setHistory(items);
  };

  const loadChatHistory = async () => {
    setIsLoadingChats(true);
    try {
      const chats = await getChatHistory();
      setChatHistory(chats);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  // Filter and search prompt/template history
  const filteredHistory = history.filter(item => {
    // Apply type filter
    if (filter === 'favorites' && !item.isFavorite) return false;
    if (filter === 'prompt' && item.type !== 'prompt') return false;
    if (filter === 'template' && item.type !== 'template') return false;
    if (filter === 'chat') return false; // Chats are handled separately

    // Apply search
    if (searchQuery) {
      const inputStr = typeof item.input === 'string' 
        ? item.input 
        : JSON.stringify(item.input);
      const lowerQuery = searchQuery.toLowerCase();
      
      return (
        inputStr.toLowerCase().includes(lowerQuery) ||
        item.output?.toLowerCase().includes(lowerQuery) ||
        item.templateName?.toLowerCase().includes(lowerQuery)
      );
    }
    
    return true;
  });

  // Filter and search chat history
  const filteredChatHistory = chatHistory.filter(chat => {
    if (filter === 'prompt' || filter === 'template') return false;
    if (filter === 'favorites' && !chat.is_favorite) return false;
    
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      if (chat.title.toLowerCase().includes(lowerQuery)) return true;
      return chat.messages.some(msg => 
        msg.content.toLowerCase().includes(lowerQuery)
      );
    }
    
    return true;
  });

  // Combined items count for display
  const totalFilteredItems = (filter === 'chat' ? 0 : filteredHistory.length) + 
                             (filter === 'prompt' || filter === 'template' ? 0 : filteredChatHistory.length);

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    loadHistory();
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  const handleDeleteChat = async (id: string) => {
    const success = await deleteChatConversation(id);
    if (success) {
      loadChatHistory();
      if (selectedChat?.id === id) {
        setSelectedChat(null);
      }
    }
  };

  const handleClearAll = async () => {
    clearHistory();
    await clearChatHistory();
    setHistory([]);
    setChatHistory([]);
    setSelectedItem(null);
    setSelectedChat(null);
  };

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id);
    loadHistory();
  };

  const handleToggleChatFavorite = async (id: string) => {
    await toggleChatFavorite(id);
    loadChatHistory();
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (item: HistoryItem) => {
    const content = `# ${item.templateName || 'Generated Prompt'}
    
## Input
${typeof item.input === 'string' ? item.input : JSON.stringify(item.input, null, 2)}

## Output
${item.output}

---
Generated: ${new Date(item.createdAt).toLocaleString()}
Type: ${item.type}${item.category ? `\nCategory: ${item.category}` : ''}
`;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.templateName || 'prompt'}-${item.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getInputPreview = (input: Record<string, string | number> | string): string => {
    if (typeof input === 'string') {
      return input.slice(0, 100) + (input.length > 100 ? '...' : '');
    }
    const values = Object.values(input).filter(v => v);
    return values.slice(0, 2).join(', ').slice(0, 100) + (values.length > 2 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        userName={userName}
        userRole={`${currentPlan} Plan`}
        userInitials={userInitials}
        onNavigate={(id) => {
          if (id === 'dashboard') navigate('/dashboard');
          else if (id === 'generate') navigate('/generate');
          else if (id === 'generative-ai') navigate('/generative-ai');
          else if (id === 'templates') navigate('/templates');
          else if (id === 'bookmarks') navigate('/templates?bookmarks=true');
          else if (id === 'history') navigate('/history');
          else if (id === 'analytics') navigate('/analytics');
          else if (id === 'profile') navigate('/profile');
          else if (id === 'settings') navigate('/settings');
          else if (id === 'upgrade') navigate('/upgrade');
        }}
        onLogout={() => {
          signOut();
          navigate('/');
        }}
      />

      {/* Main Content */}
      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        <main className="container mx-auto px-4 py-8 pt-28 pb-16 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Generation History</h1>
                <p className="text-muted-foreground">View and manage your past generations</p>
              </div>
              
              {(history.length > 0 || chatHistory.length > 0) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:border-red-500/50">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All History?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all {history.length + chatHistory.length} items from your history. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-red-500 hover:bg-red-600">
                        Clear All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>

            {/* Search and Filters */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search history..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  {(['all', 'prompt', 'template', 'chat', 'favorites'] as const).map((f) => (
                    <Button
                      key={f}
                      variant={filter === f ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setFilter(f);
                        setSelectedItem(null);
                        setSelectedChat(null);
                      }}
                      className="capitalize"
                    >
                      {f === 'favorites' && <Star className="h-3 w-3 mr-1" />}
                      {f === 'chat' && <MessageSquare className="h-3 w-3 mr-1" />}
                      {f}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* History List */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    History ({totalFilteredItems})
                  </h2>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  {totalFilteredItems === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground/30 mb-4" />
                      {searchQuery || filter !== 'all' ? (
                        <>
                          <p className="text-muted-foreground mb-2">No results found</p>
                          <Button
                            variant="link"
                            onClick={() => {
                              setSearchQuery('');
                              setFilter('all');
                            }}
                          >
                            Clear filters
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-muted-foreground mb-2">No history yet</p>
                          <p className="text-sm text-muted-foreground mb-4">
                            Your generated prompts, templates and AI chats will appear here
                          </p>
                          <div className="flex gap-2">
                            <Button onClick={() => navigate('/generate')}>
                              Generate Prompt
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/generative-ai')}>
                              Start AI Chat
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {/* Prompt/Template History Items */}
                      {filter !== 'chat' && filteredHistory.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedItem?.id === item.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                          }`}
                          onClick={() => {
                            setSelectedItem(item);
                            setSelectedChat(null);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {item.type === 'template' ? (
                                  <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                ) : (
                                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                                )}
                                <span className="font-medium text-foreground truncate">
                                  {item.templateName || `${item.promptType} Prompt`}
                                </span>
                                {item.isFavorite && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {getInputPreview(item.input)}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                {item.category && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                    {item.category}
                                  </span>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(item.createdAt)}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </motion.div>
                      ))}

                      {/* Chat History Items */}
                      {(filter === 'all' || filter === 'chat' || filter === 'favorites') && filteredChatHistory.map((chat) => (
                        <motion.div
                          key={chat.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                            selectedChat?.id === chat.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                          }`}
                          onClick={() => {
                            setSelectedChat(chat);
                            setSelectedItem(null);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                <span className="font-medium text-foreground truncate">
                                  {chat.title}
                                </span>
                                {chat.is_favorite && (
                                  <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {chat.messages.length} messages · AI Chat
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                                  {chat.model}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(chat.created_at)}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Detail View */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-foreground">Details</h2>
                </div>

                {selectedItem ? (
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {selectedItem.templateName || `${selectedItem.promptType} Prompt`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedItem.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleFavorite(selectedItem.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              selectedItem.isFavorite
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(selectedItem)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this history item.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(selectedItem.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Input</h4>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm">
                        {typeof selectedItem.input === 'string' ? (
                          <p>{selectedItem.input}</p>
                        ) : (
                          <div className="space-y-1">
                            {Object.entries(selectedItem.input).map(([key, value]) => (
                              value && (
                                <p key={key}>
                                  <span className="text-muted-foreground">{key}:</span>{' '}
                                  <span className="text-foreground">{value}</span>
                                </p>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Output */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Output</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(selectedItem.output)}
                        >
                          {copied ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <Copy className="h-3 w-3 mr-1" />
                          )}
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 max-h-[300px] overflow-y-auto">
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selectedItem.output}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : selectedChat ? (
                  <div className="p-4">
                    {/* Chat Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {selectedChat.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedChat.created_at).toLocaleString()} · {selectedChat.messages.length} messages
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleChatFavorite(selectedChat.id)}
                        >
                          <Star
                            className={`h-4 w-4 ${
                              selectedChat.is_favorite
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-muted-foreground'
                            }`}
                          />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate('/generative-ai')}
                        >
                          Continue
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this AI chat conversation.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteChat(selectedChat.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {selectedChat.messages.map((msg, idx) => (
                        <div
                          key={msg.id || idx}
                          className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                        >
                          {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/50'
                            }`}
                          >
                            {msg.role === 'assistant' ? (
                              <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {msg.content}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm">{msg.content}</p>
                            )}
                          </div>
                          {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">Select an item to view details</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default History;
