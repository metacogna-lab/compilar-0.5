import React from 'react';
import { cn } from '@/lib/utils';

const pillarColors = {
  purpose: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  interpersonal: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  learning: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  action: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  resilience: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

export default function PillarBadge({ pillar, className }) {
  if (!pillar) return null;
  
  const normalizedPillar = pillar.toLowerCase();
  const colorClass = pillarColors[normalizedPillar] || 'bg-violet-500/20 text-violet-300 border-violet-500/30';
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium",
      colorClass,
      className
    )}>
      {pillar}
    </span>
  );
}