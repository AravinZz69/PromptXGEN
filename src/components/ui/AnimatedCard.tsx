'use client';

import { ReactNode, useRef, useState, MouseEvent } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  maxTilt?: number;
  shine?: boolean;
}

export function AnimatedCard({
  children,
  className = '',
  glowColor = 'rgba(124, 58, 237, 0.5)',
  maxTilt = 8,
  shine = true,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion values for tilt effect
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  // Motion values for shine effect
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);

  // Spring config for smooth animations
  const springConfig = { damping: 25, stiffness: 200 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  // Border glow intensity based on hover
  const glowOpacity = useTransform(
    [springRotateX, springRotateY],
    ([x, y]) => {
      const intensity = (Math.abs(x as number) + Math.abs(y as number)) / (maxTilt * 2);
      return isHovered ? 0.3 + intensity * 0.4 : 0;
    }
  );

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate rotation based on mouse position
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateXValue = (mouseY / (rect.height / 2)) * -maxTilt;
    const rotateYValue = (mouseX / (rect.width / 2)) * maxTilt;

    rotateX.set(rotateXValue);
    rotateY.set(rotateYValue);

    // Update shine position
    const shineXValue = ((e.clientX - rect.left) / rect.width) * 100;
    const shineYValue = ((e.clientY - rect.top) / rect.height) * 100;
    shineX.set(shineXValue);
    shineY.set(shineYValue);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-card border border-border',
        'transition-shadow duration-300',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
        rotateX: springRotateX,
        rotateY: springRotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Glow border effect */}
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          boxShadow: `0 0 30px ${glowColor}`,
          opacity: glowOpacity,
        }}
      />

      {/* Inner border glow */}
      <motion.div
        className="absolute inset-[1px] rounded-xl pointer-events-none"
        style={{
          border: `1px solid ${glowColor}`,
          opacity: isHovered ? 0.5 : 0,
        }}
        animate={{ opacity: isHovered ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Shine effect overlay */}
      {shine && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: useTransform(
              [shineX, shineY],
              ([x, y]) =>
                `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`
            ),
            opacity: isHovered ? 1 : 0,
          }}
        />
      )}

      {/* Card content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

export default AnimatedCard;
