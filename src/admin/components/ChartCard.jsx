import React from 'react';

/**
 * Chart card wrapper with title and optional actions
 * @param {Object} props
 * @param {string} props.title - Chart title
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.ReactNode} props.children - Chart content
 * @param {React.ReactNode} props.actions - Optional action buttons
 * @param {string} props.className - Additional classes
 */
export default function ChartCard({ title, subtitle, children, actions, className = '' }) {
  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      
      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
