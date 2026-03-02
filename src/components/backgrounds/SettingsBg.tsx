'use client';

import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CircuitPath {
  id: number;
  path: string;
  length: number;
  delay: number;
  duration: number;
}

const generateRandomPath = (): { path: string; length: number } => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const startX = Math.random() * width;
  const startY = Math.random() * height;
  
  let path = `M ${startX} ${startY}`;
  let currentX = startX;
  let currentY = startY;
  let totalLength = 0;
  
  const segments = Math.floor(Math.random() * 4) + 3;
  
  for (let i = 0; i < segments; i++) {
    const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
    const distance = Math.random() * 150 + 50;
    
    if (direction === 'horizontal') {
      const newX = Math.random() > 0.5 
        ? Math.min(currentX + distance, width - 50)
        : Math.max(currentX - distance, 50);
      path += ` L ${newX} ${currentY}`;
      totalLength += Math.abs(newX - currentX);
      currentX = newX;
    } else {
      const newY = Math.random() > 0.5
        ? Math.min(currentY + distance, height - 50)
        : Math.max(currentY - distance, 50);
      path += ` L ${currentX} ${newY}`;
      totalLength += Math.abs(newY - currentY);
      currentY = newY;
    }
  }
  
  return { path, length: totalLength };
};

const SettingsBg = memo(() => {
  const [circuits, setCircuits] = useState<CircuitPath[]>([]);
  const [nodes, setNodes] = useState<{ x: number; y: number; id: number }[]>([]);

  useEffect(() => {
    // Generate initial circuits
    const initialCircuits: CircuitPath[] = [];
    const initialNodes: { x: number; y: number; id: number }[] = [];
    
    for (let i = 0; i < 5; i++) {
      const { path, length } = generateRandomPath();
      initialCircuits.push({
        id: i,
        path,
        length,
        delay: i * 0.5,
        duration: Math.random() * 2 + 2,
      });
    }

    // Generate random nodes
    for (let i = 0; i < 15; i++) {
      initialNodes.push({
        id: i,
        x: Math.random() * (window.innerWidth - 100) + 50,
        y: Math.random() * (window.innerHeight - 100) + 50,
      });
    }

    setCircuits(initialCircuits);
    setNodes(initialNodes);

    // Periodically add new circuits
    const interval = setInterval(() => {
      const { path, length } = generateRandomPath();
      const newCircuit: CircuitPath = {
        id: Date.now(),
        path,
        length,
        delay: 0,
        duration: Math.random() * 2 + 2,
      };
      
      setCircuits(prev => {
        const updated = [...prev, newCircuit];
        if (updated.length > 8) {
          return updated.slice(-8);
        }
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#1e293b]">
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Circuit paths */}
        <AnimatePresence>
          {circuits.map((circuit) => (
            <motion.path
              key={circuit.id}
              d={circuit.path}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                pathLength: { duration: circuit.duration, ease: 'easeInOut' },
                opacity: { duration: circuit.duration * 1.5, times: [0, 0.1, 0.8, 1] },
              }}
              style={{
                strokeDasharray: circuit.length,
                strokeDashoffset: circuit.length,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Pulsing nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="3"
              fill="#38bdf8"
              filter="url(#glow)"
              animate={{
                r: [3, 5, 3],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="8"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.5"
              animate={{
                r: [8, 15, 8],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          </g>
        ))}
      </svg>

      {/* Gradient overlay */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(30, 41, 59, 0.8) 100%)',
        }}
      />
    </div>
  );
});

SettingsBg.displayName = 'SettingsBg';

export default SettingsBg;
