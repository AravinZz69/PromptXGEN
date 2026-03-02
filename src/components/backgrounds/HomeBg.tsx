'use client';

import { useEffect, useRef, memo, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  pulseOffset: number;
}

const HomeBg = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isVisibleRef = useRef(true);

  const colors = ['#00d4ff', '#7c3aed', '#00d4ff', '#7c3aed', '#ffffff'];

  const initParticles = useCallback((width: number, height: number) => {
    const isMobile = width < 768;
    const count = isMobile ? 40 : 80;
    particlesRef.current = [];

    for (let i = 0; i < count; i++) {
      const baseRadius = Math.random() * 2 + 1;
      particlesRef.current.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: baseRadius,
        baseRadius,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseOffset: Math.random() * Math.PI * 2,
      });
    }
  }, []);

  const animate = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!isVisibleRef.current) {
      animationRef.current = requestAnimationFrame(() => animate(ctx, width, height));
      return;
    }

    ctx.fillStyle = '#0a0f1e';
    ctx.fillRect(0, 0, width, height);

    const time = Date.now() * 0.001;
    const particles = particlesRef.current;

    // Update and draw particles
    particles.forEach((p, i) => {
      // Mouse repulsion
      const dx = mouseRef.current.x - p.x;
      const dy = mouseRef.current.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100 && dist > 0) {
        const force = (100 - dist) / 100;
        p.vx -= (dx / dist) * force * 0.5;
        p.vy -= (dy / dist) * force * 0.5;
      }

      // Apply velocity with damping
      p.vx *= 0.99;
      p.vy *= 0.99;
      p.x += p.vx;
      p.y += p.vy;

      // Boundary wrap
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      // Pulse size
      p.radius = p.baseRadius + Math.sin(time * 2 + p.pulseOffset) * 0.5;

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const ddx = p2.x - p.x;
        const ddy = p2.y - p.y;
        const distance = Math.sqrt(ddx * ddx + ddy * ddy);

        if (distance < 120) {
          const opacity = (1 - distance / 120) * 0.3;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Draw particle
      ctx.beginPath();
      const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2);
      gradient.addColorStop(0, p.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Vignette overlay
    const vignette = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height) / 1.5
    );
    vignette.addColorStop(0, 'transparent');
    vignette.addColorStop(1, 'rgba(10, 15, 30, 0.7)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

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
      initParticles(canvas.width, canvas.height);
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
  }, [initParticles, animate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ background: '#0a0f1e' }}
    />
  );
});

HomeBg.displayName = 'HomeBg';

export default HomeBg;
