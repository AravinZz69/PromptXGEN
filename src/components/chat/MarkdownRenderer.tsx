import { useState, useMemo, ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';
import katex from 'katex';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

// ── KATEX MATH RENDERER ──────────────────────────────────────────────────────
function renderMath(expression: string, displayMode = false): string {
  try {
    return katex.renderToString(expression.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
    });
  } catch {
    return expression;
  }
}

// Math display block component with copy button
function MathBlock({ expression, raw }: { expression: string; raw: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group katex-display-wrapper my-4">
      <span dangerouslySetInnerHTML={{ __html: expression }} />
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-xs text-primary bg-primary/20 px-2 py-0.5 rounded transition-opacity"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

// Inline math component
function MathInline({ expression }: { expression: string }) {
  return (
    <span
      className="katex-inline-wrapper"
      dangerouslySetInnerHTML={{ __html: expression }}
    />
  );
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
    <div className="my-3 rounded-xl overflow-hidden border border-border">
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b border-border">
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

// ── STEP HEADING COMPONENT ───────────────────────────────────────────────────
function StepHeading({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex items-center gap-2 bg-primary/15 border border-primary/30 rounded-lg px-3 py-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        <span className="text-primary font-semibold text-xs tracking-widest uppercase">
          {text}
        </span>
      </div>
      <div className="flex-1 h-px bg-primary/15" />
    </div>
  );
}

// ── INLINE PARSING WITH MATH PROTECTION ──────────────────────────────────────
interface MathToken {
  type: 'display' | 'inline';
  expr: string;
  raw: string;
}

function parseInline(text: string): ReactNode[] {
  const elements: ReactNode[] = [];
  const mathTokens: MathToken[] = [];
  let key = 0;

  // STEP 1: Extract and protect math expressions FIRST (before bold/italic)
  let protectedText = text
    // Display math: $$...$$
    .replace(/\$\$(.+?)\$\$/gs, (match, expr) => {
      mathTokens.push({ type: 'display', expr, raw: match });
      return `%%MATH_${mathTokens.length - 1}%%`;
    })
    // Inline math: $...$
    .replace(/\$([^\$\n]+?)\$/g, (match, expr) => {
      mathTokens.push({ type: 'inline', expr, raw: match });
      return `%%MATH_${mathTokens.length - 1}%%`;
    })
    // \boxed{} standalone (fallback if not wrapped in $)
    .replace(/\\boxed\{(.+?)\}/g, (match, val) => {
      mathTokens.push({ type: 'inline', expr: `\\boxed{${val}}`, raw: match });
      return `%%MATH_${mathTokens.length - 1}%%`;
    })
    // \frac, \sqrt, etc without $ wrapper
    .replace(/\\(frac|sqrt|sum|int|prod|lim|infty|alpha|beta|gamma|delta|theta|pi|sigma|omega)\{/g, (match) => {
      // Find the full expression - this is a simple heuristic
      return match; // Keep as-is for now, will be handled by $ wrapper
    });

  // STEP 2: Parse the protected text for bold/italic/code
  let remaining = protectedText;

  while (remaining.length > 0) {
    // Check for math placeholder
    let match = remaining.match(/^%%MATH_(\d+)%%/);
    if (match) {
      const tokenIndex = parseInt(match[1], 10);
      const token = mathTokens[tokenIndex];
      if (token) {
        const rendered = renderMath(token.expr, token.type === 'display');
        if (token.type === 'display') {
          elements.push(
            <MathBlock key={key++} expression={rendered} raw={token.expr} />
          );
        } else {
          elements.push(<MathInline key={key++} expression={rendered} />);
        }
      }
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Bold + Italic: ***text***
    match = remaining.match(/^\*\*\*(.+?)\*\*\*/);
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
        <em key={key++} className="italic text-muted-foreground">
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

    // Plain text (up to next special character or math placeholder)
    match = remaining.match(/^[^*`%]+/);
    if (match) {
      elements.push(<span key={key++}>{match[0]}</span>);
      remaining = remaining.slice(match[0].length);
      continue;
    }

    // Handle % that's not part of placeholder
    if (remaining.startsWith('%') && !remaining.startsWith('%%MATH_')) {
      elements.push(<span key={key++}>%</span>);
      remaining = remaining.slice(1);
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
        <ul key={key++} className="space-y-2 my-3 ml-1">
          {listItems.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2.5 flex-shrink-0" />
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
      elements.push(<hr key={key++} className="border-border my-4" />);
      continue;
    }

    // Step headings: "STEP 1:", "STEP 2.", "SOLUTION:", etc.
    const stepMatch = line.match(/^(STEP\s+\d+[:.]?|SOLUTION[:.]?|ANSWER[:.]?|METHOD[:.]?|APPROACH[:.]?|RESULT[:.]?)\s*(.*)/i);
    if (stepMatch) {
      flushList();
      const stepLabel = stepMatch[1].replace(/[:.]\s*$/, '').toUpperCase();
      const restOfLine = stepMatch[2];
      elements.push(<StepHeading key={key++} text={stepLabel} />);
      if (restOfLine.trim()) {
        elements.push(
          <p key={key++} className="leading-7 text-gray-200 mb-2">
            {parseInline(restOfLine)}
          </p>
        );
      }
      continue;
    }

    // ## Heading 2
    if (line.startsWith('## ')) {
      flushList();
      elements.push(
        <h2 key={key++} className="text-indigo-300 font-semibold text-xs tracking-wide uppercase mt-5 mb-2">
          {parseInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    // ### Heading 3
    if (line.startsWith('### ')) {
      flushList();
      elements.push(
        <h3 key={key++} className="text-indigo-300 font-semibold text-xs tracking-wide uppercase mt-4 mb-1">
          {parseInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // # Heading 1
    if (line.startsWith('# ')) {
      flushList();
      elements.push(
        <h1 key={key++} className="text-indigo-300 font-semibold text-sm tracking-wide uppercase mt-5 mb-2">
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
          className="relative border-l-2 border-primary pl-6 pr-4 my-3 py-3 bg-primary/[0.08] rounded-r-lg"
        >
          <span className="absolute -top-2 left-2 text-6xl text-indigo-500/20 font-serif leading-none select-none">"</span>
          <p className="italic text-gray-200 relative z-10">{parseInline(line.slice(2))}</p>
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
