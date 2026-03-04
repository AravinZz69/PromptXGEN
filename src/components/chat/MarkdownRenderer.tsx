import { useState, useMemo, ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

// ── BLINKING CURSOR ──────────────────────────────────────────────────────────
function CursorBlink() {
  return (
    <span
      className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
      style={{ animation: 'blink 1s ease-in-out infinite' }}
    />
  );
}

// ── CODE BLOCK WITH COPY ─────────────────────────────────────────────────────
function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
        <span className="text-xs text-muted-foreground font-mono">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-500" />
              <span className="text-green-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto bg-black/30">
        <code className="text-sm font-mono text-gray-200">{code}</code>
      </pre>
    </div>
  );
}

// ── INLINE PARSING ───────────────────────────────────────────────────────────
function parseInline(text: string): ReactNode[] {
  const elements: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold + Italic: ***text***
    let match = remaining.match(/^\*\*\*(.+?)\*\*\*/);
    if (match) {
      elements.push(
        <strong key={key++} className="font-semibold text-foreground">
          <em className="italic">{match[1]}</em>
        </strong>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold: **text**
    match = remaining.match(/^\*\*(.+?)\*\*/);
    if (match) {
      elements.push(
        <strong key={key++} className="font-semibold text-foreground">
          {match[1]}
        </strong>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Italic: *text*
    match = remaining.match(/^\*(.+?)\*/);
    if (match) {
      elements.push(
        <em key={key++} className="italic text-gray-300">
          {match[1]}
        </em>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Inline code: `code`
    match = remaining.match(/^`([^`]+)`/);
    if (match) {
      elements.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono text-sm border border-primary/20"
        >
          {match[1]}
        </code>
      );
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Plain text (up to next special character)
    match = remaining.match(/^[^*`]+/);
    if (match) {
      elements.push(<span key={key++}>{match[0]}</span>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Single special character that didn't match pattern
    elements.push(<span key={key++}>{remaining[0]}</span>);
    remaining = remaining.slice(1);
  }

  return elements;
}

// ── MAIN PARSER ──────────────────────────────────────────────────────────────
function parseMarkdown(content: string): ReactNode[] {
  const elements: ReactNode[] = [];
  const lines = content.split('\n');
  let key = 0;
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent = '';
  let listItems: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (listItems.length === 0) return;

    if (listType === 'ul') {
      elements.push(
        <ul key={key++} className="space-y-1 my-2 ml-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="leading-7 text-gray-200">{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
    } else if (listType === 'ol') {
      elements.push(
        <ol key={key++} className="space-y-1 my-2 ml-2">
          {listItems.map((item, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="text-primary font-mono text-sm min-w-[20px]">{i + 1}.</span>
              <span className="leading-7 text-gray-200">{parseInline(item)}</span>
            </li>
          ))}
        </ol>
      );
    }

    listItems = [];
    listType = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start/end
    if (line.startsWith('```')) {
      if (!inCodeBlock) {
        flushList();
        inCodeBlock = true;
        codeBlockLang = line.slice(3).trim();
        codeBlockContent = '';
      } else {
        elements.push(
          <CodeBlock key={key++} language={codeBlockLang} code={codeBlockContent.trim()} />
        );
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockContent = '';
      }
      continue;
    }

    // Inside code block
    if (inCodeBlock) {
      codeBlockContent += (codeBlockContent ? '\n' : '') + line;
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Horizontal rule
    if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/)) {
      flushList();
      elements.push(<hr key={key++} className="border-white/10 my-4" />);
      continue;
    }

    // ## Heading 2
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-lg font-bold text-primary mt-4 mb-2 font-display">
          {parseInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    // ### Heading 3
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-base font-semibold text-primary mt-3 mb-1 font-display">
          {parseInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // # Heading 1
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-xl font-bold text-primary mt-4 mb-2 font-display">
          {parseInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={key++}
          className="border-l-2 border-primary pl-4 my-2 text-gray-300 italic bg-primary/5 py-2 rounded-r-lg"
        >
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Bullet list item
    if (line.match(/^[-*]\s+/)) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(line.replace(/^[-*]\s+/, ''));
      continue;
    }

    // Numbered list item
    if (line.match(/^\d+\.\s+/)) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(line.replace(/^\d+\.\s+/, ''));
      continue;
    }

    // Regular paragraph
    flushList();
    elements.push(
      <p key={key++} className="leading-7 text-gray-200 mb-2">
        {parseInline(line)}
      </p>
    );
  }

  // Flush remaining list and unclosed code block
  flushList();
  
  if (inCodeBlock && codeBlockContent) {
    elements.push(
      <CodeBlock key={key++} language={codeBlockLang} code={codeBlockContent.trim()} />
    );
  }

  return elements;
}

// ── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function MarkdownRenderer({ content, isStreaming = false }: MarkdownRendererProps) {
  const elements = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className="markdown-content space-y-1">
      {elements}
      {isStreaming && <CursorBlink />}
    </div>
  );
}

export default MarkdownRenderer;
