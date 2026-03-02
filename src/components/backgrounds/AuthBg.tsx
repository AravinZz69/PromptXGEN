'use client';

import { memo, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const AuthBg = memo(() => {
  const [turbulenceFreq, setTurbulenceFreq] = useState(0.015);
  const animationRef = useRef<number>();

  useEffect(() => {
    let time = 0;
    
    const animate = () => {
      time += 0.005;
      const freq = 0.015 + Math.sin(time) * 0.005;
      setTurbulenceFreq(freq);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Morphing blob with SVG filter */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="morphBlob">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={turbulenceFreq}
              numOctaves="3"
              result="noise"
              seed="1"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="80"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="3" />
          </filter>
          
          <linearGradient id="blobGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed">
              <animate
                attributeName="stop-color"
                values="#7c3aed;#f43f5e;#7c3aed"
                dur="8s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#a855f7">
              <animate
                attributeName="stop-color"
                values="#a855f7;#ec4899;#a855f7"
                dur="6s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#f43f5e">
              <animate
                attributeName="stop-color"
                values="#f43f5e;#7c3aed;#f43f5e"
                dur="10s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          <radialGradient id="blobRadial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(124, 58, 237, 0.8)" />
            <stop offset="100%" stopColor="rgba(244, 63, 94, 0.4)" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width="100%" height="100%" fill="#0a0a0f" />

        {/* Morphing blob */}
        <g filter="url(#morphBlob)">
          <ellipse
            cx="250"
            cy="300"
            rx="250"
            ry="200"
            fill="url(#blobGradient)"
            opacity="0.6"
          />
        </g>

        {/* Secondary blob */}
        <motion.ellipse
          cx="350"
          cy="350"
          rx="180"
          ry="150"
          fill="url(#blobRadial)"
          opacity="0.4"
          filter="url(#morphBlob)"
          animate={{
            cx: [350, 300, 350],
            cy: [350, 280, 350],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </svg>

      {/* Floating light particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/30"
          style={{
            left: `${Math.random() * 50}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 5 + Math.random() * 5,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Gradient overlay for right side (form area) */}
      <div 
        className="absolute top-0 right-0 w-1/2 h-full"
        style={{
          background: 'linear-gradient(to right, transparent 0%, #0a0a0f 30%, #0a0a0f 100%)',
        }}
      />

      {/* Top/bottom vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0.5) 0%, transparent 20%, transparent 80%, rgba(10, 10, 15, 0.5) 100%)',
        }}
      />
    </div>
  );
});

AuthBg.displayName = 'AuthBg';

export default AuthBg;
