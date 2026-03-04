import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MiniNavbar } from "@/components/ui/mini-navbar";
import Sidebar from "@/components/ui/sidebar-menu";
import PromptChat from "@/components/ui/prompt-chat";
import { addToHistory } from "@/lib/historyService";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react";

const PromptGenerator = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [promptType, setPromptType] = useState("");
  const [copied, setCopied] = useState(false);

  const generatePrompt = async (input: string, type: string) => {
    setIsLoading(true);
    setInputText(input);
    setPromptType(type);

    try {
      // Build system prompt based on type
      let systemPrompt = "";
      let userPrompt = "";
      
      if (type === "basic") {
        systemPrompt = `You are an expert prompt engineer. Your task is to take a user's simple request and transform it into a well-structured, effective AI prompt that will get better results. Keep it concise but comprehensive.`;
        userPrompt = `Transform this request into an optimized AI prompt:

"${input}"

Create a clear, effective prompt that:
1. Clearly states the task
2. Provides necessary context
3. Specifies the desired output format
4. Is ready to use with any AI assistant

Return ONLY the optimized prompt, nothing else.`;
      } else if (type === "advanced") {
        systemPrompt = `You are an expert prompt engineer specializing in creating detailed, comprehensive prompts. Your prompts should be thorough, well-structured, and designed to extract maximum value from AI assistants.`;
        userPrompt = `Create an advanced, detailed AI prompt based on this request:

"${input}"

Generate a comprehensive prompt that includes:
1. Clear role/persona for the AI
2. Detailed context and background
3. Specific instructions and constraints
4. Expected output format and structure
5. Quality criteria and examples if relevant

Return ONLY the optimized prompt, nothing else.`;
      } else if (type === "chain-of-thought") {
        systemPrompt = `You are an expert in creating chain-of-thought prompts that guide AI through systematic reasoning processes. Your prompts help break down complex problems into logical steps.`;
        userPrompt = `Create a chain-of-thought prompt for this request:

"${input}"

Generate a prompt that:
1. Instructs the AI to think step-by-step
2. Breaks down the problem into logical stages
3. Encourages showing reasoning at each step
4. Guides towards a well-reasoned conclusion
5. Uses structured formatting for clarity

Return ONLY the optimized prompt, nothing else.`;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0]?.message?.content;
      
      if (!generatedContent) {
        throw new Error('No content generated');
      }

      setGeneratedPrompt(generatedContent);
      
      // Save to history
      addToHistory({
        type: 'prompt',
        promptType: type,
        input: input,
        output: generatedContent,
      });
      
      toast({
        title: "Prompt Generated!",
        description: `Your ${type} prompt is ready to use.`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate prompt. Please try again.",
        variant: "destructive",
      });
      setGeneratedPrompt(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (generatedPrompt) {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedPrompt) {
      const blob = new Blob([generatedPrompt], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `prompt-${promptType}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Downloaded!",
        description: "Prompt saved as text file.",
      });
    }
  };

  const handleRegenerate = () => {
    if (inputText && promptType) {
      generatePrompt(inputText, promptType);
    }
  };

  const handleClose = () => {
    setGeneratedPrompt(null);
    setInputText("");
    setPromptType("");
  };

  // Get user initials
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen bg-background relative flex">
      {/* Sidebar - Always visible, expands on hover */}
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
          else if (id === 'analytics') navigate('/analytics');
        }}
        onLogout={() => {
          signOut();
          navigate('/');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 relative ml-[70px]">
        <MiniNavbar />

        {/* Main Content */}
        <main>
          <PromptChat onGenerate={generatePrompt} isLoading={isLoading} />
        </main>
      </div>

      {/* Generated Prompt Modal */}
      <AnimatePresence>
        {generatedPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Generated Prompt</h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                    {promptType}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-4 overflow-y-auto max-h-[60vh]">
                <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-pre:border-border bg-muted/50 p-4 rounded-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {generatedPrompt}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  Original: "{inputText.slice(0, 50)}..."
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRegenerate}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Regenerate
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PromptGenerator;
