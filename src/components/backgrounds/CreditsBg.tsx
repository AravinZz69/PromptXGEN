'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { Engine, ISourceOptions } from '@tsparticles/engine';

const CreditsBg = memo(() => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options: ISourceOptions = {
    background: {
      color: { value: 'transparent' },
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ['#fbbf24', '#e2e8f0', '#fcd34d', '#f9fafb'],
      },
      move: {
        direction: 'top',
        enable: true,
        outModes: { default: 'out' },
        speed: { min: 0.5, max: 2 },
        straight: false,
      },
      number: {
        density: { enable: true, width: 800, height: 800 },
        value: window.innerWidth < 768 ? 30 : 60,
      },
      opacity: {
        value: { min: 0.3, max: 0.8 },
        animation: {
          enable: true,
          speed: 1,
          sync: false,
        },
      },
      shape: {
        type: ['circle', 'star'],
        options: {
          star: {
            sides: 4,
          },
        },
      },
      size: {
        value: { min: 2, max: 6 },
        animation: {
          enable: true,
          speed: 2,
          sync: false,
        },
      },
      twinkle: {
        particles: {
          enable: true,
          frequency: 0.05,
          opacity: 1,
        },
      },
    },
    detectRetina: true,
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#08090a]">
      {/* Radial gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(251, 191, 36, 0.05) 0%, transparent 50%)',
        }}
      />

      {/* Particles */}
      {init && (
        <Particles
          id="credits-particles"
          options={options}
          className="absolute inset-0"
        />
      )}

      {/* Floating glow orbs */}
      <motion.div
        className="absolute w-64 h-64 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
          filter: 'blur(40px)',
          left: '10%',
          top: '20%',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <motion.div
        className="absolute w-48 h-48 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(226, 232, 240, 0.08) 0%, transparent 70%)',
          filter: 'blur(30px)',
          right: '15%',
          bottom: '30%',
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.4, 0.6],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Bottom gradient fade */}
      <div 
        className="absolute inset-x-0 bottom-0 h-1/4"
        style={{
          background: 'linear-gradient(to top, #08090a 0%, transparent 100%)',
        }}
      />
    </div>
  );
});

CreditsBg.displayName = 'CreditsBg';

export default CreditsBg;
