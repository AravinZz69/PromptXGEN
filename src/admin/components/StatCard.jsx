import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, color = 'blue' }) {
  const colors = {
    blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', glow: 'shadow-green-500/10' },
    indigo: { bg: 'bg-primary/10', text: 'text-primary', glow: 'shadow-primary/10' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', glow: 'shadow-red-500/10' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
  };

  const c = colors[color] || colors.blue;
  const isPositive = changeType === 'positive';

  return (
    <div className={`group relative bg-card border border-border/50 rounded-2xl p-5 hover:border-primary/20 hover:shadow-xl ${c.glow} transition-all duration-300 overflow-hidden`}>
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl ${c.bg} transition-transform duration-200 group-hover:scale-110`}>
            {Icon && <Icon className={`w-5 h-5 ${c.text}`} />}
          </div>
          
          {change && change !== '-' && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            }`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {change}
            </div>
          )}
        </div>
        
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground mt-1 font-medium">{title}</p>
      </div>
    </div>
  );
}
