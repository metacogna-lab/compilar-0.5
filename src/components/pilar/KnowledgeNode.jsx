import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KnowledgeNode({ data, config, isSelected, onClick, activePlan }) {
  const Icon = config.icon;
  const color = config.color;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-2xl cursor-pointer transition-all",
        "bg-gradient-to-br from-white/5 to-transparent border",
        isSelected 
          ? `border-${color}-500/50 bg-${color}-500/10` 
          : "border-white/10 hover:border-white/20"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg bg-${color}-500/20 flex items-center justify-center`}>
            <Icon className={`w-4 h-4 text-${color}-400`} />
          </div>
          <span className="font-medium text-white capitalize">{data.pillar}</span>
        </div>
        {activePlan && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20">
            <Target className="w-3 h-3 text-violet-400" />
            <span className="text-xs text-violet-400">Active</span>
          </div>
        )}
      </div>

      {/* Score Ring */}
      <div className="flex items-center gap-4 mb-3">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <motion.circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke={`url(#gradient-${data.pillar})`}
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ strokeDasharray: "0 176" }}
              animate={{ 
                strokeDasharray: `${(data.score || 0) * 1.76} 176` 
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id={`gradient-${data.pillar}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={`var(--${color}-400, #8b5cf6)`} />
                <stop offset="100%" stopColor={`var(--${color}-600, #7c3aed)`} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">
              {data.score !== undefined ? Math.round(data.score) : '—'}
            </span>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            {data.trend === 'improving' && (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-400">Improving</span>
              </>
            )}
            {data.trend === 'stable' && (
              <>
                <Minus className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs text-zinc-400">Stable</span>
              </>
            )}
            {data.trend === 'unknown' && (
              <span className="text-xs text-zinc-500">Not assessed</span>
            )}
          </div>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            data.status === 'strong' ? "bg-emerald-500/20 text-emerald-400" :
            data.status === 'developing' ? "bg-amber-500/20 text-amber-400" :
            data.status === 'needs_work' ? "bg-red-500/20 text-red-400" :
            "bg-zinc-500/20 text-zinc-400"
          )}>
            {data.status === 'not_started' ? 'Start here' : data.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Subdomain bars */}
      <div className="space-y-1.5">
        {data.subdomains.slice(0, 3).map((sub, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 w-20 truncate">{sub.name}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sub.score || 0}%` }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(
                  "h-full rounded-full",
                  sub.score >= 70 ? "bg-emerald-500" :
                  sub.score >= 50 ? "bg-amber-500" :
                  sub.score ? "bg-red-500" : "bg-zinc-600"
                )}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Focus indicator */}
      {(data.status === 'needs_work' || data.status === 'not_started') && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs text-amber-400">Recommended focus area</span>
        </motion.div>
      )}
    </motion.div>
  );
}