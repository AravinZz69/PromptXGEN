/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * HeroPreview Sub-Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Live preview of hero section
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React from 'react';

export function HeroPreview({ heroData = {} }) {
  const {
    badge = '',
    headline = '',
    subHeadline = '',
    cta1Label = '',
    cta1Color = 'primary',
    cta2Label = '',
    cta2Color = 'outline',
    backgroundStyle = 'gradient',
    backgroundColor = '#0d0f1f',
    heroImageUrl = '',
  } = heroData;

  const getBgStyle = () => {
    switch (backgroundStyle) {
      case 'gradient':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        };
      case 'solid':
        return {
          backgroundColor,
        };
      case 'particles':
        return {
          background: `linear-gradient(135deg, ${backgroundColor} 0%, #1a1a2e 100%)`,
        };
      case 'mesh':
        return {
          background: `radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 1) 0px, transparent 0%),
                       radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 1) 0px, transparent 50%),
                       radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 1) 0px, transparent 50%),
                       radial-gradient(at 10% 29%, hsla(256, 96%, 67%, 1) 0px, transparent 50%),
                       radial-gradient(at 97% 96%, hsla(38, 60%, 74%, 1) 0px, transparent 50%),
                       radial-gradient(at 33% 50%, hsla(222, 67%, 73%, 1) 0px, transparent 50%),
                       radial-gradient(at 79% 53%, hsla(343, 68%, 79%, 1) 0px, transparent 50%)`,
          backgroundColor: '#0d0f1f',
        };
      default:
        return { backgroundColor };
    }
  };

  const getCTAStyle = (color) => {
    switch (color) {
      case 'primary':
        return 'bg-indigo-600 text-white hover:bg-indigo-700';
      case 'accent':
        return 'bg-purple-600 text-white hover:bg-purple-700';
      case 'outline':
        return 'border-2 border-white text-white bg-transparent hover:bg-white/10';
      default:
        return 'bg-indigo-600 text-white hover:bg-indigo-700';
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-gray-400 ml-2">Hero Section Preview</span>
      </div>

      <div
        className="relative min-h-[400px] flex items-center justify-center p-12 overflow-hidden"
        style={getBgStyle()}
      >
        {/* Background effects */}
        {backgroundStyle === 'particles' && (
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {badge && (
            <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm">
              {badge}
            </div>
          )}

          {headline && (
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              {headline}
            </h1>
          )}

          {subHeadline && (
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              {subHeadline}
            </p>
          )}

          {(cta1Label || cta2Label) && (
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {cta1Label && (
                <button
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${getCTAStyle(cta1Color)}`}
                >
                  {cta1Label}
                </button>
              )}
              {cta2Label && (
                <button
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${getCTAStyle(cta2Color)}`}
                >
                  {cta2Label}
                </button>
              )}
            </div>
          )}

          {heroImageUrl && (
            <div className="pt-8">
              <img
                src={heroImageUrl}
                alt="Hero"
                className="rounded-lg shadow-2xl max-h-64 mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeroPreview;
