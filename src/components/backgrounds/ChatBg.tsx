'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

const ChatBg = memo(() => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0a0f]">
      {/* Aurora blobs */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%)',
          filter: 'blur(80px)',
          left: '-10%',
          top: '10%',
        }}
        animate={{
          x: ['0%', '20%', '10%', '0%'],
          y: ['0%', '10%', '25%', '0%'],
          scale: [1, 1.1, 0.95, 1],
          background: [
            'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%)',
            'linear-gradient(180deg, rgba(139, 92, 246, 0.25) 0%, rgba(244, 63, 94, 0.2) 100%)',
            'linear-gradient(225deg, rgba(244, 63, 94, 0.25) 0%, rgba(99, 102, 241, 0.2) 100%)',
            'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(139, 92, 246, 0.2) 100%)',
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'linear-gradient(45deg, rgba(139, 92, 246, 0.2) 0%, rgba(244, 63, 94, 0.15) 100%)',
          filter: 'blur(80px)',
          right: '-5%',
          top: '30%',
        }}
        animate={{
          x: ['0%', '-15%', '-5%', '0%'],
          y: ['0%', '15%', '-10%', '0%'],
          scale: [1, 0.9, 1.15, 1],
          background: [
            'linear-gradient(45deg, rgba(139, 92, 246, 0.2) 0%, rgba(244, 63, 94, 0.15) 100%)',
            'linear-gradient(90deg, rgba(244, 63, 94, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%)',
            'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
            'linear-gradient(45deg, rgba(139, 92, 246, 0.2) 0%, rgba(244, 63, 94, 0.15) 100%)',
          ],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'linear-gradient(270deg, rgba(99, 102, 241, 0.2) 0%, rgba(20, 184, 166, 0.15) 100%)',
          filter: 'blur(80px)',
          left: '30%',
          bottom: '-10%',
        }}
        animate={{
          x: ['0%', '10%', '-10%', '0%'],
          y: ['0%', '-20%', '-5%', '0%'],
          scale: [1, 1.2, 0.9, 1],
          background: [
            'linear-gradient(270deg, rgba(99, 102, 241, 0.2) 0%, rgba(20, 184, 166, 0.15) 100%)',
            'linear-gradient(315deg, rgba(20, 184, 166, 0.2) 0%, rgba(244, 63, 94, 0.15) 100%)',
            'linear-gradient(0deg, rgba(139, 92, 246, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%)',
            'linear-gradient(270deg, rgba(99, 102, 241, 0.2) 0%, rgba(20, 184, 166, 0.15) 100%)',
          ],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{
          background: 'linear-gradient(180deg, rgba(244, 63, 94, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
          filter: 'blur(60px)',
          right: '20%',
          top: '5%',
        }}
        animate={{
          x: ['0%', '-20%', '5%', '0%'],
          y: ['0%', '30%', '15%', '0%'],
          scale: [0.9, 1.1, 1, 0.9],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Noise grain overlay */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 15, 0.5) 100%)',
        }}
      />
    </div>
  );
});

ChatBg.displayName = 'ChatBg';

export default ChatBg;
