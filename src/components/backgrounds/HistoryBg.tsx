'use client';

import { memo, useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

interface DataLine {
  id: number;
  y: number;
  width: number;
  speed: number;
  opacity: number;
  color: string;
  x: number;
  hasPulse: boolean;
  pulseX: number;
}

const HistoryBg = memo(() => {
  const [lines, setLines] = useState<DataLine[]>([]);
  const animationRef = useRef<number>();
  const isVisibleRef = useRef(true);

  const colors = [
    'rgba(107, 33, 168, 0.6)',
    'rgba(139, 92, 246, 0.5)',
    'rgba(167, 139, 250, 0.4)',
    'rgba(124, 58, 237, 0.5)',
  ];

  const initLines = useCallback(() => {
    const height = window.innerHeight;
    const isMobile = window.innerWidth < 768;
    const numLines = isMobile ? 15 : 30;
    const newLines: DataLine[] = [];

    for (let i = 0; i < numLines; i++) {
      newLines.push({
        id: i,
        y: Math.random() * height,
        width: Math.random() * 150 + 50,
        speed: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * window.innerWidth - 200,
        hasPulse: Math.random() > 0.7,
        pulseX: 0,
      });
    }

    setLines(newLines);
  }, []);

  useEffect(() => {
    initLines();

    const handleResize = () => initLines();
    const handleVisibility = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [initLines]);

  useEffect(() => {
    const animate = () => {
      if (!isVisibleRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      setLines(prev => prev.map(line => {
        let newX = line.x + line.speed;
        let newPulseX = line.pulseX;

        // Reset line when it goes off screen
        if (newX > window.innerWidth + 100) {
          newX = -line.width - 100;
          newPulseX = 0;
        }

        // Update pulse position
        if (line.hasPulse) {
          newPulseX = (newPulseX + line.speed * 2) % (line.width + 50);
        }

        return {
          ...line,
          x: newX,
          pulseX: newPulseX,
        };
      }));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0a0f]">
      {/* Timeline lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent"/>
            <stop offset="20%" stopColor="currentColor"/>
            <stop offset="80%" stopColor="currentColor"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>

        {lines.map((line) => (
          <g key={line.id}>
            {/* Main line */}
            <rect
              x={line.x}
              y={line.y}
              width={line.width}
              height={2}
              fill={line.color}
              style={{
                filter: 'url(#lineGlow)',
                opacity: line.opacity,
              }}
            />

            {/* Pulse effect */}
            {line.hasPulse && (
              <rect
                x={line.x + line.pulseX}
                y={line.y - 1}
                width={20}
                height={4}
                fill="rgba(255, 255, 255, 0.8)"
                style={{
                  filter: 'url(#lineGlow)',
                }}
              />
            )}
          </g>
        ))}
      </svg>

      {/* Floating time markers */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-16 rounded-full"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(107, 33, 168, 0.5), transparent)',
            left: `${20 + i * 20}%`,
          }}
          animate={{
            y: ['10%', '90%'],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            delay: i * 1.5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 15, 0.7) 100%)',
        }}
      />

      {/* Side fades */}
      <div 
        className="absolute inset-y-0 left-0 w-1/4"
        style={{
          background: 'linear-gradient(to right, #0a0a0f 0%, transparent 100%)',
        }}
      />
      <div 
        className="absolute inset-y-0 right-0 w-1/4"
        style={{
          background: 'linear-gradient(to left, #0a0a0f 0%, transparent 100%)',
        }}
      />
    </div>
  );
});

HistoryBg.displayName = 'HistoryBg';

export default HistoryBg;
