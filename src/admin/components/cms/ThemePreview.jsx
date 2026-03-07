/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * ThemePreview Sub-Component
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 
 * Live preview of theme settings
 * Shows how colors, fonts, and styles look in real-time
 * 
 * @props
 * - themeData: Object containing theme settings
 * 
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

import React from 'react';

export function ThemePreview({ themeData = {} }) {
  const {
    primaryColor = '#6366f1',
    accentColor = '#a855f7',
    backgroundColor = '#0d0f1f',
    textColor = '#ffffff',
    buttonColor = '#6366f1',
    headingFont = 'Inter',
    bodyFont = 'Inter',
    baseFontSize = '16px',
    borderRadius = 'rounded',
  } = themeData;

  const radiusClass = {
    sharp: '0px',
    rounded: '8px',
    pill: '9999px',
  }[borderRadius] || '8px';

  return (
    <div className="bg-muted border border-border rounded-xl p-6 space-y-4 sticky top-6">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
        Live Preview
      </h3>

      {/* Preview card */}
      <div
        className="p-6 space-y-4 transition-all"
        style={{
          backgroundColor,
          color: textColor,
          fontFamily: bodyFont,
          fontSize: baseFontSize,
          borderRadius: radiusClass,
          border: `1px solid ${primaryColor}20`,
        }}
      >
        {/* Heading */}
        <h1
          style={{
            fontFamily: headingFont,
            color: primaryColor,
            fontSize: 'calc(' + baseFontSize + ' * 1.5)',
            fontWeight: 'bold',
          }}
        >
          Your Brand Heading
        </h1>

        {/* Body text */}
        <p style={{ color: textColor, opacity: 0.9 }}>
          This is how your body text will appear with the selected font and colors.
          The preview updates in real-time as you make changes.
        </p>

        {/* Accent badge */}
        <div
          className="inline-block px-3 py-1 text-sm font-medium"
          style={{
            backgroundColor: `${accentColor}20`,
            color: accentColor,
            borderRadius: radiusClass,
          }}
        >
          ✨ Accent Badge
        </div>

        {/* Primary button */}
        <button
          className="w-full py-2 font-medium transition-transform hover:scale-[1.02]"
          style={{
            backgroundColor: buttonColor,
            color: '#ffffff',
            borderRadius: radiusClass,
          }}
        >
          Primary Button
        </button>

        {/* Color swatches */}
        <div className="flex gap-2 pt-2">
          <div className="flex-1 space-y-1">
            <div
              className="h-10 rounded"
              style={{ backgroundColor: primaryColor }}
            />
            <p className="text-xs opacity-60">Primary</p>
          </div>
          <div className="flex-1 space-y-1">
            <div
              className="h-10 rounded"
              style={{ backgroundColor: accentColor }}
            />
            <p className="text-xs opacity-60">Accent</p>
          </div>
          <div className="flex-1 space-y-1">
            <div
              className="h-10 rounded"
              style={{ backgroundColor: buttonColor }}
            />
            <p className="text-xs opacity-60">Button</p>
          </div>
        </div>
      </div>

      {/* Applied fonts info */}
      <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
        <p>Heading: <span className="text-white">{headingFont}</span></p>
        <p>Body: <span className="text-white">{bodyFont}</span></p>
        <p>Size: <span className="text-white">{baseFontSize}</span></p>
        <p>Radius: <span className="text-white">{borderRadius}</span></p>
      </div>
    </div>
  );
}

export default ThemePreview;
