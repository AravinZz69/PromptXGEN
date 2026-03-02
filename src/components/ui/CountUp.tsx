'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  separator?: string;
  startOnView?: boolean;
}

export function CountUp({
  value,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  separator = ',',
  startOnView = true,
}: CountUpProps) {
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const ref = useRef<HTMLSpanElement>(null);

  // Spring animation for smooth counting
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  // Transform spring value to display value
  const displayValue = useTransform(springValue, (current) => {
    const formatted = current.toFixed(decimals);
    const [intPart, decPart] = formatted.split('.');
    
    // Add thousands separator
    const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    
    return decPart ? `${withSeparator}.${decPart}` : withSeparator;
  });

  // Intersection Observer for view-based start
  useEffect(() => {
    if (!startOnView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  // Start counting when hasStarted becomes true
  useEffect(() => {
    if (hasStarted) {
      springValue.set(value);
    }
  }, [hasStarted, value, springValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

// Simpler version without animation for static numbers
export function FormattedNumber({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  separator = ',',
  className = '',
}: Omit<CountUpProps, 'duration' | 'startOnView'>) {
  const formatted = value.toFixed(decimals);
  const [intPart, decPart] = formatted.split('.');
  const withSeparator = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  const display = decPart ? `${withSeparator}.${decPart}` : withSeparator;

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

export default CountUp;
