import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, Sparkles, Brain, Code2, Globe2, PenLine, Lightbulb, BookOpen, Zap } from 'lucide-react'

const FEATURE_CARDS = [
  {
    icon: Brain,
    title: 'Deep Reasoning',
    desc: 'Step-by-step analysis of complex problems',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-500/[0.08]',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
    glowColor: 'shadow-violet-500/20',
    example: 'Break down the concept of quantum entanglement step by step',
  },
  {
    icon: Code2,
    title: 'Code Assistant',
    desc: 'Write, debug, and explain code instantly',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-500/[0.08]',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
    glowColor: 'shadow-emerald-500/20',
    example: 'Write a React hook for debounced search with TypeScript',
  },
  {
    icon: Globe2,
    title: 'Multi-language',
    desc: 'Translate and communicate across languages',
    color: 'from-sky-500 to-blue-600',
    bg: 'bg-sky-500/[0.08]',
    iconBg: 'bg-sky-500/20',
    iconColor: 'text-sky-400',
    glowColor: 'shadow-sky-500/20',
    example: 'Translate "The future belongs to those who believe" into 5 languages',
  },
  {
    icon: PenLine,
    title: 'Creative Writing',
    desc: 'Stories, essays, and content creation',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-500/[0.08]',
    iconBg: 'bg-rose-500/20',
    iconColor: 'text-rose-400',
    glowColor: 'shadow-rose-500/20',
    example: 'Write a short sci-fi story about AI discovering emotions',
  },
]

const SUGGESTIONS = [
  { icon: Lightbulb, text: "Explain Newton's Laws simply" },
  { icon: BookOpen, text: 'UPSC preparation strategy' },
  { icon: Zap, text: 'Solve a JEE physics problem' },
  { icon: Brain, text: 'NEET biology key concepts' },
]

const ChatWelcome = ({ onSend }) => {
  const [visible, setVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  const fillInput = (text) => {
    setInputValue(text)
    textareaRef.current?.focus()
  }

  const handleSend = () => {
    if (!inputValue.trim()) return
    onSend(inputValue.trim())
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInputValue(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-full px-4 py-8 gap-7 overflow-hidden select-none">
      {/* Background orbs */}
      <div className="absolute top-[5%] left-[10%] w-[400px] h-[400px] bg-primary/[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[5%] right-[10%] w-[350px] h-[350px] bg-accent/[0.05] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[500px] h-[300px] bg-primary/[0.03] rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div 
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-5 relative"
          animate={{ boxShadow: ['0 0 20px 0px hsl(var(--primary) / 0.1)', '0 0 40px 5px hsl(var(--primary) / 0.15)', '0 0 20px 0px hsl(var(--primary) / 0.1)'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="w-7 h-7 text-primary" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          What can I help with?
        </h1>
        <p className="text-muted-foreground mt-2.5 max-w-md mx-auto text-sm leading-relaxed">
          Ask anything — from academics to coding to creative writing
        </p>
      </motion.div>

      {/* Feature Cards */}
      <motion.div 
        className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {FEATURE_CARDS.map((card, i) => {
          const Icon = card.icon
          const isHovered = hoveredCard === i
          return (
            <motion.button
              key={i}
              onClick={() => fillInput(card.example)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className={`group relative rounded-2xl p-5 text-left cursor-pointer border border-border/50 backdrop-blur-sm overflow-hidden transition-colors duration-300 ${
                isHovered ? 'border-border bg-card/80' : 'bg-card/40 hover:bg-card/60'
              }`}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500`} />
              
              {/* Icon container */}
              <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                <Icon size={18} className={card.iconColor} />
              </div>

              <div className="relative">
                <div className="text-foreground font-semibold text-[13px] mb-1">{card.title}</div>
                <div className="text-muted-foreground text-[11px] leading-relaxed">{card.desc}</div>
              </div>
            </motion.button>
          )
        })}
      </motion.div>

      {/* Suggestion pills */}
      <motion.div 
        className="flex flex-wrap justify-center gap-2 max-w-2xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {SUGGESTIONS.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.button
              key={i}
              onClick={() => fillInput(s.text)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs border border-border/60 bg-card/30 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:bg-card/60 hover:border-border transition-all duration-200"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Icon size={13} className="text-primary/70" />
              {s.text}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Input Bar */}
      <motion.div 
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 16 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className={`rounded-2xl backdrop-blur-xl overflow-hidden transition-all duration-300 ${
            isFocused
              ? 'bg-card/70 border border-primary/30 shadow-[0_0_40px_-8px_hsl(var(--primary)/0.15),0_8px_32px_-8px_rgba(0,0,0,0.4)]'
              : 'bg-card/50 border border-border/60 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3)]'
          }`}
        >
          <div className="flex items-end px-4 py-3 gap-3">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              rows={1}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border-none outline-none resize-none text-foreground text-sm leading-relaxed py-1 placeholder:text-muted-foreground/40 max-h-[120px] overflow-y-auto"
            />
            <motion.button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                inputValue.trim()
                  ? 'bg-primary text-primary-foreground shadow-[0_4px_20px_-4px_hsl(var(--primary)/0.5)]'
                  : 'bg-muted/50 text-muted-foreground/40'
              }`}
              whileHover={inputValue.trim() ? { scale: 1.05 } : {}}
              whileTap={inputValue.trim() ? { scale: 0.92 } : {}}
            >
              <ArrowUp size={18} strokeWidth={2.5} />
            </motion.button>
          </div>
        </div>

        <p className="text-muted-foreground/25 text-[11px] mt-2.5 text-center tracking-wide">
          Enter to send · Shift+Enter for new line
        </p>
      </motion.div>
    </div>
  )
}

export default ChatWelcome
