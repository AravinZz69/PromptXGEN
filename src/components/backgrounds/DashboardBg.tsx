'use client';

import { useEffect, useRef, memo, useCallback } from 'react';
import { motion } from 'framer-motion';

const DashboardBg = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(true);

  const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!isVisibleRef.current) {
      animationRef.current = requestAnimationFrame(() => animate(ctx, width, height));
      return;
    }

    const time = Date.now() * 0.001;
    const isMobile = width < 768;
    const gridSize = isMobile ? 40 : 30;
    const dotSize = 2;

    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Draw animated dot grid
    for (let x = gridSize / 2; x < width; x += gridSize) {
      for (let y = gridSize / 2; y < height; y += gridSize) {
        // Wave effect offset by position
        const waveOffset = (x + y) * 0.01;
        const wave = Math.sin(time * 1.5 + waveOffset) * 0.5 + 0.5;
        
        // Mouse proximity effect
        const dx = mouseRef.current.x - x;
        const dy = mouseRef.current.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseInfluence = dist < 150 ? (150 - dist) / 150 : 0;
        
        // Calculate dot properties
        const scale = 1 + wave * 0.5 + mouseInfluence * 1.5;
        const opacity = 0.3 + wave * 0.3 + mouseInfluence * 0.4;
        
        ctx.beginPath();
        ctx.fillStyle = `rgba(79, 70, 229, ${opacity})`;
        ctx.arc(x, y, dotSize * scale, 0, Math.PI * 2);
        ctx.fill();

        // Glow effect for dots near mouse
        if (mouseInfluence > 0) {
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20 * mouseInfluence);
          gradient.addColorStop(0, `rgba(79, 70, 229, ${mouseInfluence * 0.3})`);
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.arc(x, y, 20 * mouseInfluence, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    animationRef.current = requestAnimationFrame(() => animate(ctx, width, height));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    animate(ctx, canvas.width, canvas.height);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Floating gradient orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: ['-10%', '20%', '-10%'],
          y: ['10%', '30%', '10%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-80 h-80 rounded-full right-0"
        style={{
          background: 'radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
        animate={{
          x: ['10%', '-20%', '10%'],
          y: ['60%', '40%', '60%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          bottom: '10%',
          right: '30%',
        }}
        animate={{
          x: ['0%', '30%', '0%'],
          y: ['0%', '-20%', '0%'],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
});

DashboardBg.displayName = 'DashboardBg';

export default DashboardBg;
