"use client";

import { useState, useRef, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  Code2,
  Palette,
  Layers,
  Rocket,
  Sparkles,
  MessageSquare,
  PenTool,
  Search,
  Loader2,
  ImageIcon,
  CircleUserRound,
  Wand2,
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

  return { textareaRef, adjustHeight };
}

interface PromptChatProps {
  onGenerate?: (prompt: string, type: string) => void;
  isLoading?: boolean;
}

const PROMPT_TYPES = [
  { id: "basic", label: "Basic", icon: Sparkles, desc: "Simple & direct" },
  { id: "advanced", label: "Advanced", icon: Wand2, desc: "Detailed & structured" },
  { id: "chain-of-thought", label: "Chain of Thought", icon: Layers, desc: "Step-by-step reasoning" },
];

const QUICK_ACTIONS = [
  { icon: Code2, label: "Code Helper", prompt: "Write code to " },
  { icon: PenTool, label: "Blog Post", prompt: "Write a blog post about " },
  { icon: MessageSquare, label: "Email Copy", prompt: "Write a professional email for " },
  { icon: Search, label: "SEO Content", prompt: "Create SEO-optimized content for " },
  { icon: Rocket, label: "Marketing", prompt: "Create marketing copy for " },
  { icon: Layers, label: "Product Desc", prompt: "Write a product description for " },
  { icon: ImageIcon, label: "Image Prompt", prompt: "Create an image of " },
  { icon: CircleUserRound, label: "Social Post", prompt: "Write a social media post about " },
];

export default function PromptChat({ onGenerate, isLoading = false }: PromptChatProps) {
  const [message, setMessage] = useState("");
  const [selectedType, setSelectedType] = useState("basic");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 52,
    maxHeight: 160,
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

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center bg-background">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-accent/[0.02] pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-accent/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Center content */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center max-w-3xl mx-auto px-4">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-5">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            AskJai
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-md mx-auto">
            Generate powerful, optimized prompts for any AI model
          </p>
        </div>

        {/* Prompt Type Selector */}
        <div className="flex items-center gap-2 mb-6">
          {PROMPT_TYPES.map((type) => {
            const Icon = type.icon;
            const isActive = selectedType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                )}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input section pinned to bottom area */}
      <div className="relative z-10 w-full max-w-3xl px-4 mb-[12vh]">
        {/* Input container */}
        <div className="bg-card/70 backdrop-blur-xl rounded-2xl border border-border shadow-xl overflow-hidden transition-all duration-200 focus-within:border-primary/50 focus-within:shadow-[0_0_30px_rgba(var(--primary),0.08)]">
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
              "w-full px-5 py-4 resize-none border-none",
              "bg-transparent text-foreground text-sm",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground/60 min-h-[52px]"
            )}
            style={{ overflow: "hidden" }}
          />

          {/* Footer */}
          <div className="flex items-center justify-between px-4 pb-3">
            <span className="text-xs text-muted-foreground/50">
              {selectedType === "basic" ? "Quick & direct" : selectedType === "advanced" ? "Detailed & structured" : "Step-by-step reasoning"}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!message.trim() || isLoading}
              size="sm"
              className={cn(
                "flex items-center gap-2 px-5 rounded-xl transition-all",
                message.trim() && !isLoading
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
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

        {/* Quick Actions */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-5">
          {QUICK_ACTIONS.map((action, i) => (
            <Button
              key={i}
              variant="outline"
              size="sm"
              onClick={() => {
                setMessage(action.prompt);
                adjustHeight();
              }}
              className="flex items-center gap-1.5 rounded-full border-border bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card hover:border-primary/30 text-xs"
            >
              <action.icon className="w-3.5 h-3.5" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
