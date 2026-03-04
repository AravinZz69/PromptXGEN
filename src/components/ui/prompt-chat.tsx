"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  FileUp,
  MonitorIcon,
  CircleUserRound,
  ArrowUpIcon,
  Paperclip,
  Code2,
  Palette,
  Layers,
  Rocket,
  Sparkles,
  MessageSquare,
  PenTool,
  Search,
  Loader2,
} from "lucide-react";

interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

interface PromptChatProps {
  onGenerate?: (prompt: string, type: string) => void;
  isLoading?: boolean;
}

export default function PromptChat({ onGenerate, isLoading = false }: PromptChatProps) {
  const [message, setMessage] = useState("");
  const [selectedType, setSelectedType] = useState("basic");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  const handleSubmit = () => {
    if (message.trim() && onGenerate) {
      onGenerate(message, selectedType);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleQuickAction = (action: string) => {
    setMessage(action);
    adjustHeight();
  };

  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center flex flex-col items-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Centered AI Title */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
            AskJai
          </h1>
          <p className="mt-3 text-neutral-300 text-lg max-w-md mx-auto">
            Generate powerful, optimized prompts for any AI model
          </p>
        </div>
      </div>

      {/* Input Box Section */}
      <div className="relative z-10 w-full max-w-3xl px-4 mb-[15vh]">
        {/* Prompt Type Selector */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Button
            variant={selectedType === "basic" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("basic")}
            className={cn(
              "rounded-full",
              selectedType !== "basic" && "border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-700"
            )}
          >
            Basic
          </Button>
          <Button
            variant={selectedType === "advanced" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("advanced")}
            className={cn(
              "rounded-full",
              selectedType !== "advanced" && "border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-700"
            )}
          >
            Advanced
          </Button>
          <Button
            variant={selectedType === "chain-of-thought" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType("chain-of-thought")}
            className={cn(
              "rounded-full",
              selectedType !== "chain-of-thought" && "border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-700"
            )}
          >
            Chain of Thought
          </Button>
        </div>

        <div className="relative bg-black/60 backdrop-blur-md rounded-xl border border-neutral-700">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to create... (e.g., 'Write a blog post about AI trends')"
            className={cn(
              "w-full px-4 py-3 resize-none border-none",
              "bg-transparent text-white text-sm",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-neutral-400 min-h-[48px]"
            )}
            style={{ overflow: "hidden" }}
          />

          {/* Footer Buttons */}
          <div className="flex items-center justify-between p-3">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-neutral-700"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!message.trim() || isLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  message.trim() && !isLoading
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4" />
                )}
                <span>{isLoading ? "Generating..." : "Generate"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-center flex-wrap gap-3 mt-6">
          <QuickAction 
            icon={<Code2 className="w-4 h-4" />} 
            label="Code Helper" 
            onClick={() => handleQuickAction("Write code to ")}
          />
          <QuickAction 
            icon={<PenTool className="w-4 h-4" />} 
            label="Blog Post" 
            onClick={() => handleQuickAction("Write a blog post about ")}
          />
          <QuickAction 
            icon={<MessageSquare className="w-4 h-4" />} 
            label="Email Copy" 
            onClick={() => handleQuickAction("Write a professional email for ")}
          />
          <QuickAction 
            icon={<Search className="w-4 h-4" />} 
            label="SEO Content" 
            onClick={() => handleQuickAction("Create SEO-optimized content for ")}
          />
          <QuickAction 
            icon={<Rocket className="w-4 h-4" />} 
            label="Marketing" 
            onClick={() => handleQuickAction("Create marketing copy for ")}
          />
          <QuickAction 
            icon={<Layers className="w-4 h-4" />} 
            label="Product Desc" 
            onClick={() => handleQuickAction("Write a product description for ")}
          />
          <QuickAction 
            icon={<ImageIcon className="w-4 h-4" />} 
            label="Image Prompt" 
            onClick={() => handleQuickAction("Create an image of ")}
          />
          <QuickAction 
            icon={<CircleUserRound className="w-4 h-4" />} 
            label="Social Post" 
            onClick={() => handleQuickAction("Write a social media post about ")}
          />
        </div>
      </div>
    </div>
  );
}

interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-neutral-700 bg-black/50 text-neutral-300 hover:text-white hover:bg-neutral-700"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  );
}
