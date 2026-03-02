'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOut
      when: 'beforeChildren',
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.3,
      ease: [0.55, 0.06, 0.68, 0.19], // easeIn
    },
  },
};

const childVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// Wrapper for staggered children animations
export function StaggerContainer({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      variants={{
        enter: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      initial="initial"
      animate="enter"
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Individual stagger item
export function StaggerItem({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
}

export default PageTransition;
