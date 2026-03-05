import { useEffect, useState, useRef } from 'react'
import { Layers, Globe2, ImageIcon, Code2, ArrowUp, Star } from 'lucide-react'

// Sparkle particle positions: [top%, left%, duration, delay]
const SPARKLE_POSITIONS = [
  ['8%', '12%', 3.2, 0],
  ['14%', '78%', 2.6, 0.8],
  ['22%', '45%', 4.1, 1.5],
  ['6%', '55%', 2.9, 0.3],
  ['35%', '5%', 3.7, 2.1],
  ['42%', '92%', 2.4, 0.6],
  ['58%', '18%', 3.5, 1.8],
  ['65%', '70%', 2.8, 0.2],
  ['72%', '38%', 4.3, 2.5],
  ['80%', '85%', 3.1, 1.1],
  ['88%', '25%', 2.7, 0.9],
  ['15%', '32%', 3.9, 1.6],
  ['50%', '58%', 2.5, 3.0],
  ['30%', '65%', 3.4, 0.5],
]

// Feature cards data
const CARDS = [
  {
    icon: Layers,
    title: 'Task Automation',
    desc: 'Automates tasks like scheduling and reminders.',
    orbColor: '#3b82f6',
    bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(255,255,255,0.03) 100%)',
    borderColor: 'rgba(59,130,246,0.22)',
    borderHover: 'rgba(59,130,246,0.45)',
    shadowHover: '0 20px 40px -10px rgba(59,130,246,0.25)',
    example: 'Create a weekly task automation plan for my team',
  },
  {
    icon: Globe2,
    title: 'Multi-language Support',
    desc: 'Communicates fluently in various languages.',
    orbColor: '#a855f7',
    bgGradient: 'linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(255,255,255,0.03) 100%)',
    borderColor: 'rgba(168,85,247,0.22)',
    borderHover: 'rgba(168,85,247,0.45)',
    shadowHover: '0 20px 40px -10px rgba(168,85,247,0.25)',
    example: 'Translate this message to French, Spanish, and Japanese',
  },
  {
    icon: ImageIcon,
    title: 'Image Generation',
    desc: 'Creates custom images based on user prompts.',
    orbColor: '#ec4899',
    bgGradient: 'linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(255,255,255,0.03) 100%)',
    borderColor: 'rgba(236,72,153,0.22)',
    borderHover: 'rgba(236,72,153,0.45)',
    shadowHover: '0 20px 40px -10px rgba(236,72,153,0.25)',
    example: 'Generate a futuristic city skyline at sunset',
  },
  {
    icon: Code2,
    title: 'Code Snippets',
    desc: 'Provides quick, functional code examples on demand.',
    orbColor: '#10b981',
    bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(255,255,255,0.03) 100%)',
    borderColor: 'rgba(16,185,129,0.22)',
    borderHover: 'rgba(16,185,129,0.45)',
    shadowHover: '0 20px 40px -10px rgba(16,185,129,0.25)',
    example: 'Write a React hook for infinite scroll pagination',
  },
]

// Suggestion chips
const CHIPS = [
  'Tell me a fun fact!',
  'Recommend a movie to watch.',
  'How do I make pancakes?',
  "What's the latest in AI?",
  'Write me a poem about space.',
]

// Card sparkle positions for internal sparkles
const CARD_SPARKLES = [
  { char: '✦', top: '15%', right: '20%', opacity: 0.2, dur: 2.1, delay: 0 },
  { char: '★', top: '40%', right: '8%', opacity: 0.25, dur: 2.8, delay: 0.5 },
  { char: '✦', top: '70%', right: '30%', opacity: 0.3, dur: 2.4, delay: 1.2 },
]

const ChatWelcome = ({ onSend }) => {
  const [visible, setVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const textareaRef = useRef(null)

  // Staggered mount animation
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(timer)
  }, [])

  // Fill input and focus textarea
  const fillInput = (text) => {
    setInputValue(text)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  // Handle send
  const handleSend = () => {
    if (!inputValue.trim()) return
    onSend(inputValue.trim())
    setInputValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // Handle keydown
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Auto-resize textarea
  const handleInput = (e) => {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const baseTransition = {
    transition: 'all 650ms cubic-bezier(0.16,1,0.3,1)',
  }

  const getVisibleStyle = (delay = 0) => ({
    ...baseTransition,
    transitionDelay: `${delay}ms`,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(20px)',
  })

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full px-6 py-12 gap-7 overflow-hidden">
      {/* CSS Keyframes */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.08; transform: scale(0.7); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
        @keyframes shimmer-text {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-8px, -8px); }
        }
      `}</style>

      {/* Sparkle Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {SPARKLE_POSITIONS.map(([top, left, dur, delay], i) => (
          <div
            key={i}
            className="absolute w-[3px] h-[3px] rounded-full bg-white/60"
            style={{
              top,
              left,
              animation: `twinkle ${dur}s ${delay}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>

      {/* Ambient Blobs */}
      <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-indigo-500/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-[10%] w-80 h-80 bg-purple-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Heading Block */}
      <div className="text-center" style={getVisibleStyle(0)}>
        <h1
          className="text-3xl md:text-4xl font-bold tracking-tight"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #c7d2fe 40%, #fff 60%, #a5b4fc 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'shimmer-text 4s linear infinite',
          }}
        >
          Welcome to PromptXGEN.
        </h1>
        <p className="text-sm text-white/40 mt-2 max-w-sm mx-auto leading-relaxed">
          Uses multiple sources and tools to answer questions with citations
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl mx-auto"
        style={getVisibleStyle(100)}
      >
        {CARDS.map((card, i) => {
          const Icon = card.icon
          const isHovered = hoveredCard === i

          return (
            <button
              key={i}
              onClick={() => fillInput(card.example)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className="relative overflow-hidden rounded-[18px] p-5 text-left transition-all duration-300 group cursor-pointer"
              style={{
                background: card.bgGradient,
                border: `1px solid ${isHovered ? card.borderHover : card.borderColor}`,
                boxShadow: isHovered ? card.shadowHover : 'none',
                transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
                transitionDelay: `${70 * i}ms`,
              }}
            >
              {/* Card Sparkles */}
              {CARD_SPARKLES.map((sparkle, j) => (
                <span
                  key={j}
                  className="absolute text-white pointer-events-none"
                  style={{
                    top: sparkle.top,
                    right: sparkle.right,
                    opacity: sparkle.opacity,
                    fontSize: '8px',
                    animation: `twinkle ${sparkle.dur}s ${sparkle.delay}s infinite ease-in-out`,
                  }}
                >
                  {sparkle.char}
                </span>
              ))}

              {/* Colored Orb */}
              <div
                className="absolute -bottom-5 -right-5 w-20 h-20 rounded-full blur-xl opacity-20 transition-transform duration-500"
                style={{
                  backgroundColor: card.orbColor,
                  animation: isHovered ? 'orb-drift 2s ease-in-out infinite' : 'none',
                }}
              />

              {/* Icon */}
              <Icon
                size={20}
                className="mb-7"
                style={{
                  color: card.orbColor,
                  filter: `drop-shadow(0 0 8px ${card.orbColor}40)`,
                }}
              />

              {/* Title */}
              <div className="text-white/90 font-semibold text-[13px] mb-1.5">
                {card.title}
              </div>

              {/* Description */}
              <div className="text-white/[0.38] text-[11.5px] leading-[1.55]">
                {card.desc}
              </div>
            </button>
          )
        })}
      </div>

      {/* Suggestion Chips Row */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 w-full max-w-3xl mx-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={getVisibleStyle(280)}
      >
        {CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => fillInput(chip)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-[13px] border border-white/10 bg-white/5 text-white/50 whitespace-nowrap hover:bg-white/10 hover:text-white/90 hover:border-white/[0.22] transition-all duration-200 cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="w-full max-w-3xl mx-auto" style={getVisibleStyle(380)}>
        {/* Pill Container */}
        <div
          className="rounded-[18px] bg-white/[0.05] backdrop-blur-md overflow-hidden transition-all duration-[250ms]"
          style={{
            border: isFocused ? '1px solid rgba(99,102,241,0.55)' : '1px solid rgba(255,255,255,0.09)',
            boxShadow: isFocused
              ? '0 0 0 3px rgba(99,102,241,0.12), 0 8px 32px -8px rgba(0,0,0,0.4)'
              : 'none',
          }}
        >
          {/* Top Row */}
          <div className="flex items-center px-4 py-1 gap-2">
            {/* Textarea */}
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={1}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-white/[0.88] text-sm leading-relaxed py-2.5 placeholder:text-white/[0.22] max-h-[120px] overflow-y-auto"
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-9 h-9 rounded-[11px] flex items-center justify-center transition-all duration-200"
              style={{
                background: inputValue.trim()
                  ? 'linear-gradient(to bottom right, #6366f1, #7c3aed)'
                  : 'rgba(255,255,255,0.08)',
                color: inputValue.trim() ? '#fff' : 'rgba(255,255,255,0.22)',
                boxShadow: inputValue.trim()
                  ? '0 4px 16px -4px rgba(99,102,241,0.65)'
                  : 'none',
                cursor: inputValue.trim() ? 'pointer' : 'default',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (inputValue.trim()) {
                  e.currentTarget.style.transform = 'scale(1.07)'
                  e.currentTarget.style.filter = 'brightness(1.1)'
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.filter = 'brightness(1)'
              }}
              onMouseDown={(e) => {
                if (inputValue.trim()) {
                  e.currentTarget.style.transform = 'scale(0.94)'
                }
              }}
              onMouseUp={(e) => {
                if (inputValue.trim()) {
                  e.currentTarget.style.transform = 'scale(1.07)'
                }
              }}
            >
              <ArrowUp size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Bottom Row */}
          <div className="flex justify-center px-4 pb-2.5">
            <button className="text-white/[0.28] text-xs flex items-center gap-1.5 hover:text-white/[0.58] transition-colors cursor-pointer">
              <Star size={13} />
              Saved prompts
            </button>
          </div>
        </div>

        {/* Hint Text */}
        <p className="text-white/[0.18] text-[11px] mt-2.5 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

export default ChatWelcome
