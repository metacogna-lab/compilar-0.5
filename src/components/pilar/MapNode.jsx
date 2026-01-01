import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Lock, Check, Sparkles } from 'lucide-react';

const pillarConfig = {
  purpose: { 
    color: '#8B5CF6', 
    bg: 'bg-violet-500', 
    glow: 'shadow-violet-500/50',
    label: 'Purpose'
  },
  interpersonal: { 
    color: '#EC4899', 
    bg: 'bg-pink-500', 
    glow: 'shadow-pink-500/50',
    label: 'Interpersonal'
  },
  learning: { 
    color: '#4F46E5', 
    bg: 'bg-indigo-500', 
    glow: 'shadow-indigo-500/50',
    label: 'Learning'
  },
  action: { 
    color: '#10B981', 
    bg: 'bg-emerald-500', 
    glow: 'shadow-emerald-500/50',
    label: 'Action'
  },
  resilience: { 
    color: '#F59E0B', 
    bg: 'bg-amber-500', 
    glow: 'shadow-amber-500/50',
    label: 'Resilience'
  },
};

const variantStyles = {
  neutral: 'opacity-80',
  recommended: 'ring-4 ring-white/30 animate-pulse',
  locked: 'opacity-40 cursor-not-allowed',
  completed: 'ring-4 ring-emerald-400/50',
};

export default function MapNode({ 
  pillar, 
  variant = 'neutral', 
  onClick, 
  score,
  position,
  size = 'lg'
}) {
  const config = pillarConfig[pillar];
  const isLocked = variant === 'locked';
  const isCompleted = variant === 'completed';
  const isRecommended = variant === 'recommended';

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  return (
    <motion.button
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={!isLocked ? { scale: 1.1 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'relative rounded-full flex flex-col items-center justify-center',
        'transition-all duration-300',
        sizeClasses[size],
        config.bg,
        variantStyles[variant],
        !isLocked && `hover:shadow-2xl ${config.glow}`,
        'shadow-xl'
      )}
      style={position ? { position: 'absolute', left: position.x, top: position.y } : {}}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-2 rounded-full bg-white/20 blur-sm" />
      
      {/* Icon overlay */}
      <div className="relative z-10 flex flex-col items-center">
        {isLocked && <Lock className="w-6 h-6 text-white/80" />}
        {isCompleted && <Check className="w-6 h-6 text-white" strokeWidth={3} />}
        {isRecommended && <Sparkles className="w-6 h-6 text-white animate-pulse" />}
        {!isLocked && !isCompleted && !isRecommended && (
          <span className="text-white font-bold text-lg">{config.label[0]}</span>
        )}
      </div>

      {/* Score indicator */}
      {score !== undefined && (
        <div className="absolute -bottom-1 -right-1 bg-[#0F0F12] rounded-full px-2 py-0.5 text-xs font-bold text-white border-2 border-current" style={{ borderColor: config.color }}>
          {score}%
        </div>
      )}

      {/* Label below */}
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute -bottom-8 text-sm font-medium text-zinc-300 whitespace-nowrap"
      >
        {config.label}
      </motion.span>
    </motion.button>
  );
}