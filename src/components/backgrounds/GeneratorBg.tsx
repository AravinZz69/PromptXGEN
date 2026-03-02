'use client';

import { useEffect, useRef, memo, useState } from 'react';
import { motion } from 'framer-motion';

const characters = '{}[]<>/\\|@#$%^&*()_+-=~`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789∆∇∂∞∑∏√∫≈≠≤≥±÷×';

interface Column {
  chars: string[];
  y: number;
  speed: number;
  opacity: number;
}

const GeneratorBg = memo(() => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const animationRef = useRef<number>();
  const isVisibleRef = useRef(true);

  useEffect(() => {
    const initColumns = () => {
      const width = window.innerWidth;
      const isMobile = width < 768;
      const colWidth = isMobile ? 30 : 20;
      const numColumns = Math.ceil(width / colWidth);
      
      const newColumns: Column[] = [];
      for (let i = 0; i < numColumns; i++) {
        const charCount = Math.floor(Math.random() * 15) + 10;
        const chars: string[] = [];
        for (let j = 0; j < charCount; j++) {
          chars.push(characters[Math.floor(Math.random() * characters.length)]);
        }
        newColumns.push({
          chars,
          y: Math.random() * -500,
          speed: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.3,
        });
      }
      setColumns(newColumns);
    };

    initColumns();

    const handleResize = () => {
      initColumns();
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    let lastTime = 0;
    
    const animate = (time: number) => {
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = time - lastTime;
      if (deltaTime > 50) { // ~20fps for performance
        lastTime = time;
        setColumns(prev => prev.map(col => {
          const newY = col.y + col.speed;
          const height = window.innerHeight + 500;
          return {
            ...col,
            y: newY > height ? -300 : newY,
            chars: col.chars.map((char, i) => 
              Math.random() > 0.98 
                ? characters[Math.floor(Math.random() * characters.length)]
                : char
            ),
          };
        }));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      style={{ background: '#050a05' }}
    >
      {/* Matrix columns */}
      <div className="absolute inset-0">
        {columns.map((col, i) => (
          <div
            key={i}
            className="absolute text-xs font-mono"
            style={{
              left: `${(i / columns.length) * 100}%`,
              top: col.y,
              opacity: col.opacity,
              transform: 'translateX(-50%)',
              willChange: 'top',
            }}
          >
            {col.chars.map((char, j) => (
              <div
                key={j}
                className="leading-tight"
                style={{
                  color: j === 0 ? '#fff' : '#00ff88',
                  textShadow: j === 0 
                    ? '0 0 10px #00ff88, 0 0 20px #00ff88' 
                    : '0 0 5px #00ff88',
                  opacity: 1 - (j / col.chars.length) * 0.7,
                }}
              >
                {char}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Scanline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.03) 2px, rgba(0, 255, 136, 0.03) 4px)',
        }}
      />

      {/* Bottom blur gradient */}
      <div 
        className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #050a05 0%, transparent 100%)',
        }}
      />

      {/* Top vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, #050a05 80%)',
          opacity: 0.5,
        }}
      />
    </div>
  );
});

GeneratorBg.displayName = 'GeneratorBg';

export default GeneratorBg;
