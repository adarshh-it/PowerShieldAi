import React from 'react';

export default function PremiumCard({ 
  children, 
  title, 
  subtitle, 
  action, 
  glowType = "default", // default, cyan, teal, amber, danger
  className = "" 
}) {
  const glowClasses = {
    default: "glass-panel",
    cyan: "glass-panel-glow-cyan",
    teal: "glass-panel-glow-teal",
    amber: "glass-panel-glow-amber",
    danger: "glass-panel-glow-danger"
  };

  const selectedGlow = glowClasses[glowType] || glowClasses.default;

  return (
    <div className={`p-6 rounded-2xl ${selectedGlow} transition-all duration-300 hover:shadow-2xl hover:border-white/[0.09] ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-center justify-between mb-5 border-b border-white/[0.04] pb-4">
          <div>
            {title && <h3 className="text-lg font-semibold tracking-tight text-white leading-none">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div>
        {children}
      </div>
    </div>
  );
}
