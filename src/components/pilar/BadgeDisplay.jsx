import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const pillarColors = {
  purpose: 'from-violet-500 to-violet-600',
  interpersonal: 'from-pink-500 to-pink-600',
  learning: 'from-indigo-500 to-indigo-600',
  action: 'from-emerald-500 to-emerald-600',
  resilience: 'from-amber-500 to-amber-600',
};

export default function BadgeDisplay({ badge, size = 'md', showDetails = true, locked = false }) {
  const sizes = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={cn(
        "flex flex-col items-center gap-2",
        locked && "opacity-40"
      )}
    >
      <div className={cn(
        "rounded-full flex items-center justify-center",
        sizes[size],
        locked 
          ? "bg-zinc-800 border-2 border-zinc-700" 
          : badge.pillar 
            ? `bg-gradient-to-br ${pillarColors[badge.pillar]} shadow-lg`
            : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30"
      )}>
        <span className={locked ? "grayscale" : ""}>{badge.icon}</span>
      </div>
      {showDetails && (
        <div className="text-center">
          <p className={cn(
            "text-sm font-medium",
            locked ? "text-zinc-500" : "text-white"
          )}>
            {badge.name}
          </p>
          {!locked && badge.earned_at && (
            <p className="text-xs text-zinc-500">
              {new Date(badge.earned_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
}