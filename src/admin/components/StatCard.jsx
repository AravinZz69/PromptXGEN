import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Stat card for KPI display
 * @param {Object} props
 * @param {string} props.title - Metric name
 * @param {string|number} props.value - Metric value
 * @param {string} props.change - Change value (e.g., "+8.2%")
 * @param {string} props.changeType - "positive" or "negative"
 * @param {React.ComponentType} props.icon - Lucide icon component
 * @param {string} props.color - Icon background color: blue, green, indigo, emerald, red, amber
 */
export default function StatCard({ title, value, change, changeType = 'positive', icon: Icon, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    indigo: 'bg-primary/20 text-primary',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    red: 'bg-red-500/20 text-red-400',
    amber: 'bg-amber-500/20 text-amber-400',
  };

  const isPositive = changeType === 'positive';

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-border hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-200">
      <div className="flex items-start justify-between">
        {/* Icon */}
        <div className={`p-3 rounded-xl ${colors[color] || colors.blue}`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        
        {/* Trend badge */}
        {change && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            isPositive 
              ? 'bg-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/20 text-red-400'
          }`}>
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>
      
      {/* Value */}
      <div className="mt-4">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
      </div>
    </div>
  );
}
