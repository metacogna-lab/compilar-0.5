import React from 'react';

export default function InfoCard({ title, children, variant = 'default' }) {
  const variants = {
    default: 'bg-white/5 border-white/10',
    info: 'bg-indigo-500/10 border-indigo-500/30',
    success: 'bg-emerald-500/10 border-emerald-500/30',
    warning: 'bg-amber-500/10 border-amber-500/30'
  };

  return (
    <div className={`p-4 rounded-lg border ${variants[variant]}`}>
      {title && (
        <h4 className="text-white font-medium mb-2">{title}</h4>
      )}
      <div className="text-sm text-zinc-300">
        {children}
      </div>
    </div>
  );
}