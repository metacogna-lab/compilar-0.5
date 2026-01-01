import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const pillarColors = {
  purpose: { bg: 'bg-violet-500/20', border: 'border-violet-500/40', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
  interpersonal: { bg: 'bg-pink-500/20', border: 'border-pink-500/40', text: 'text-pink-400', glow: 'shadow-pink-500/20' },
  learning: { bg: 'bg-indigo-500/20', border: 'border-indigo-500/40', text: 'text-indigo-400', glow: 'shadow-indigo-500/20' },
  action: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  resilience: { bg: 'bg-amber-500/20', border: 'border-amber-500/40', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
};

const variants = {
  default: 'opacity-100',
  highlighted: 'ring-2 ring-offset-2 ring-offset-[#0F0F12]',
  selected: 'scale-105',
  dimmed: 'opacity-50',
};

export default function PilarCard({ 
  id, 
  label, 
  pillar = 'purpose', 
  variant = 'default', 
  onClick,
  description,
  icon: Icon 
}) {
  const colors = pillarColors[pillar] || pillarColors.purpose;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'relative cursor-pointer rounded-[28px] p-6 border backdrop-blur-xl',
        'transition-all duration-300 ease-out',
        colors.bg,
        colors.border,
        variants[variant],
        variant === 'highlighted' && `ring-${pillar === 'purpose' ? 'violet' : pillar === 'interpersonal' ? 'pink' : pillar === 'learning' ? 'indigo' : pillar === 'action' ? 'emerald' : 'amber'}-500`,
        'hover:shadow-2xl',
        colors.glow
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={cn('p-3 rounded-2xl', colors.bg)}>
            <Icon className={cn('w-6 h-6', colors.text)} />
          </div>
        )}
        <div className="flex-1">
          <h3 className={cn('text-lg font-semibold', colors.text)}>{label}</h3>
          {description && (
            <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      
      <div className={cn(
        'absolute inset-0 rounded-[28px] opacity-0 hover:opacity-100 transition-opacity duration-300',
        'bg-gradient-to-br from-white/5 to-transparent pointer-events-none'
      )} />
    </motion.div>
  );
}