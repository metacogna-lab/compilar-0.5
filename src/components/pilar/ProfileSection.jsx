import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Target, Zap } from 'lucide-react';

const pillarConfig = {
  purpose: { color: '#8B5CF6', label: 'Purpose', bg: 'bg-violet-500' },
  interpersonal: { color: '#EC4899', label: 'Interpersonal', bg: 'bg-pink-500' },
  learning: { color: '#4F46E5', label: 'Learning', bg: 'bg-indigo-500' },
  action: { color: '#10B981', label: 'Action', bg: 'bg-emerald-500' },
  resilience: { color: '#F59E0B', label: 'Resilience', bg: 'bg-amber-500' },
};

export default function ProfileSection({ 
  title, 
  pillar, 
  score, 
  type = 'strength',
  activities = [],
  description 
}) {
  const config = pillarConfig[pillar];
  const isStrength = type === 'strength';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'rounded-[28px] p-6 border backdrop-blur-xl',
        'bg-gradient-to-br from-white/5 to-white/[0.02]',
        'border-white/10'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className={cn('p-3 rounded-2xl', config.bg)}>
          {isStrength ? (
            <TrendingUp className="w-5 h-5 text-white" />
          ) : (
            <Target className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <span className="text-sm text-zinc-400">{title}</span>
          <h3 className="text-xl font-semibold text-white">{config.label}</h3>
        </div>
        {score !== undefined && (
          <div className="ml-auto">
            <div 
              className="text-3xl font-bold"
              style={{ color: config.color }}
            >
              {score}%
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-zinc-400 text-sm leading-relaxed mb-4">
          {description}
        </p>
      )}

      {/* Score bar */}
      {score !== undefined && (
        <div className="mb-4">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full', config.bg)}
            />
          </div>
        </div>
      )}

      {/* Activities */}
      {activities.length > 0 && (
        <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-sm text-zinc-400 mb-3">
            <Zap className="w-4 h-4" />
            <span>Recommended Activities</span>
          </div>
          {activities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className={cn('w-2 h-2 rounded-full', config.bg)} />
              <span className="text-sm text-white">{activity}</span>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}