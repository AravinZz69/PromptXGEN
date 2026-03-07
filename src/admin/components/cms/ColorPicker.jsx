/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ColorPicker Sub-Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Color input with both color picker and hex text input
 * 
 * @props
 * - label: Label text
 * - value: Current hex color value
 * - onChange: Callback when color changes
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React from 'react';

export function ColorPicker({ label, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex gap-3 items-center">
        {/* Color input */}
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-16 rounded-lg cursor-pointer border border-border bg-muted"
        />
        
        {/* Hex text input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-muted border border-border text-white placeholder-muted-foreground rounded-lg px-3 py-2 focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm"
        />
      </div>
    </div>
  );
}

export default ColorPicker;
