'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { useCursorStore, CursorState } from '@/hooks/useCursor';

const CustomCursor = memo(() => {
  const { cursorState, setCursorState, isHidden } = useCursorStore();
  const [isClicking, setIsClicking] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Motion values for smooth tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring config for smooth ring following
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const ringX = useSpring(mouseX, springConfig);
  const ringY = useSpring(mouseY, springConfig);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mouse move handler
  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  // Click handlers
  const handleMouseDown = useCallback(() => setIsClicking(true), []);
  const handleMouseUp = useCallback(() => setIsClicking(false), []);

  // Detect cursor state from data attributes
  const handleElementDetection = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const cursorAttr = target.closest('[data-cursor]')?.getAttribute('data-cursor') as CursorState | null;
    
    if (cursorAttr) {
      setCursorState(cursorAttr);
      return;
    }

    // Auto-detect interactive elements
    const isButton = target.closest('button, [role="button"], .btn');
    const isLink = target.closest('a, [role="link"]');
    const isInput = target.closest('input, textarea, select');
    const isText = target.closest('p, h1, h2, h3, h4, h5, h6, span, label') && !isButton && !isLink;

    if (isButton) {
      setCursorState('button');
    } else if (isLink) {
      setCursorState('link');
    } else if (isInput) {
      setCursorState('text');
    } else if (isText) {
      setCursorState('text');
    } else {
      setCursorState('default');
    }
  }, [setCursorState]);

  useEffect(() => {
    if (isMobile) return;

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousemove', handleElementDetection);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousemove', handleElementDetection);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'auto';
    };
  }, [handleMouseMove, handleElementDetection, handleMouseDown, handleMouseUp, isMobile]);

  // Don't render on mobile
  if (isMobile || isHidden) return null;

  // Get ring styles based on state
  const getRingStyles = () => {
    switch (cursorState) {
      case 'button':
      case 'link':
        return {
          width: 60,
          height: 60,
          backgroundColor: 'rgba(124, 58, 237, 0.2)',
          borderColor: 'rgba(124, 58, 237, 0.5)',
          scale: isClicking ? 0.8 : 1,
        };
      case 'text':
        return {
          width: 4,
          height: 30,
          backgroundColor: 'rgba(124, 58, 237, 0.5)',
          borderColor: 'transparent',
          borderRadius: 2,
          scale: 1,
        };
      case 'loading':
        return {
          width: 40,
          height: 40,
          backgroundColor: 'transparent',
          borderColor: 'rgba(0, 212, 255, 0.8)',
          borderWidth: 2,
          borderStyle: 'dashed' as const,
          scale: 1,
        };
      case 'disabled':
        return {
          width: 30,
          height: 30,
          backgroundColor: 'rgba(100, 100, 100, 0.3)',
          borderColor: 'rgba(100, 100, 100, 0.5)',
          scale: 1,
        };
      default:
        return {
          width: 40,
          height: 40,
          backgroundColor: 'transparent',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          scale: isClicking ? 0.6 : 1,
        };
    }
  };

  const ringStyles = getRingStyles();
  const showDot = cursorState === 'default' || cursorState === 'disabled';

  return (
    <>
      {/* Small dot - follows exactly */}
      <AnimatePresence>
        {showDot && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9999]"
            style={{
              x: mouseX,
              y: mouseY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div
              className="w-2 h-2 rounded-full bg-white"
              style={{
                boxShadow: '0 0 10px rgba(124, 58, 237, 0.8)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Larger ring - follows with spring lag */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full border-2"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          mixBlendMode: cursorState === 'default' ? 'difference' : 'normal',
        }}
        animate={{
          width: ringStyles.width,
          height: ringStyles.height,
          backgroundColor: ringStyles.backgroundColor,
          borderColor: ringStyles.borderColor,
          scale: ringStyles.scale,
          rotate: cursorState === 'loading' ? 360 : 0,
          borderRadius: cursorState === 'text' ? 2 : '50%',
        }}
        transition={{
          width: { duration: 0.2 },
          height: { duration: 0.2 },
          scale: { type: 'spring', stiffness: 500, damping: 30 },
          rotate: { duration: 1, repeat: cursorState === 'loading' ? Infinity : 0, ease: 'linear' },
        }}
      />

      {/* Glow effect for button/link hover */}
      <AnimatePresence>
        {(cursorState === 'button' || cursorState === 'link') && (
          <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[9997] rounded-full"
            style={{
              x: ringX,
              y: ringY,
              translateX: '-50%',
              translateY: '-50%',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1.5, 
              opacity: 0.3,
              width: 80,
              height: 80,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div 
              className="w-full h-full rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)',
                filter: 'blur(10px)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

CustomCursor.displayName = 'CustomCursor';

export default CustomCursor;
