import React from 'react';

export default function ChartCard({ title, subtitle, children, actions, className = '' }) {
  return (
    <div className={`bg-card border border-border/50 rounded-2xl overflow-hidden hover:border-border transition-colors duration-200 ${className}`}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div>
          <h3 className="text-foreground font-semibold text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-5">
        {children}
      </div>
    </div>
  );
}
