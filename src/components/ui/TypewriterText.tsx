'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  text: string | string[];
  className?: string;
  speed?: number;
  delay?: number;
  cursor?: boolean;
  cursorChar?: string;
  onComplete?: () => void;
  loop?: boolean;
  deleteSpeed?: number;
  pauseDuration?: number;
}

export const TypewriterText = memo(({
  text,
  className = '',
  speed = 50,
  delay = 0,
  cursor = true,
  cursorChar = '|',
  onComplete,
  loop = false,
  deleteSpeed = 30,
  pauseDuration = 2000,
}: TypewriterTextProps) => {
  const texts = Array.isArray(text) ? text : [text];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const currentFullText = texts[currentTextIndex];

  const typeText = useCallback(() => {
    if (isDeleting) {
      // Deleting text
      if (displayText.length > 0) {
        setTimeout(() => {
          setDisplayText(prev => prev.slice(0, -1));
        }, deleteSpeed);
      } else {
        // Move to next text
        setIsDeleting(false);
        setCurrentTextIndex(prev => (prev + 1) % texts.length);
      }
    } else {
      // Typing text
      if (displayText.length < currentFullText.length) {
        setTimeout(() => {
          setDisplayText(prev => currentFullText.slice(0, prev.length + 1));
        }, speed);
      } else {
        // Text complete
        if (loop && texts.length > 1) {
          // Pause before deleting
          setTimeout(() => {
            setIsDeleting(true);
          }, pauseDuration);
        } else if (loop && texts.length === 1) {
          // Single text loop - restart
          setTimeout(() => {
            setDisplayText('');
          }, pauseDuration);
        } else {
          // Non-loop mode - mark complete
          setIsComplete(true);
          onComplete?.();
        }
      }
    }
  }, [displayText, currentFullText, isDeleting, loop, texts.length, speed, deleteSpeed, pauseDuration, onComplete]);

  useEffect(() => {
    const timer = setTimeout(typeText, delay);
    return () => clearTimeout(timer);
  }, [typeText, delay]);

  // Cursor blink effect
  useEffect(() => {
    if (!cursor) return;
    
    const blinkInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(blinkInterval);
  }, [cursor]);

  return (
    <span className={cn('inline', className)}>
      {displayText}
      {cursor && (
        <motion.span
          className="inline-block ml-0.5"
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.1 }}
        >
          {cursorChar}
        </motion.span>
      )}
    </span>
  );
});

TypewriterText.displayName = 'TypewriterText';

// Multi-line typewriter variant
export function TypewriterLines({
  lines,
  className = '',
  lineClassName = '',
  speed = 50,
  lineDelay = 500,
  cursor = true,
}: {
  lines: string[];
  className?: string;
  lineClassName?: string;
  speed?: number;
  lineDelay?: number;
  cursor?: boolean;
}) {
  const [currentLine, setCurrentLine] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);

  const handleLineComplete = () => {
    if (currentLine < lines.length - 1) {
      setCompletedLines(prev => [...prev, lines[currentLine]]);
      setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, lineDelay);
    }
  };

  return (
    <div className={className}>
      <AnimatePresence>
        {completedLines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={lineClassName}
          >
            {line}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {currentLine < lines.length && (
        <div className={lineClassName}>
          <TypewriterText
            text={lines[currentLine]}
            speed={speed}
            cursor={cursor && currentLine === lines.length - 1}
            onComplete={handleLineComplete}
          />
        </div>
      )}
    </div>
  );
}

export default TypewriterText;
