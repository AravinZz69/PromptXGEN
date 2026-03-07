import React from 'react';

/**
 * Badge component for status/label display
 * @param {Object} props
 * @param {string} props.label - Badge text
 * @param {string} props.variant - Color variant: success, warning, danger, info, neutral, purple
 */
export default function Badge({ label, variant = 'neutral' }) {
  const variants = {
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    neutral: 'bg-gray-500/20 text-muted-foreground border-gray-500/30',
    purple: 'bg-primary/20 text-primary border-indigo-500/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant] || variants.neutral}`}
    >
      {label}
    </span>
  );
}
