import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield
};

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber'
};

export default function PillarFilterChips({ selectedPillar, onPillarSelect, mode }) {
  const pillars = [
    { id: 'purpose', label: 'Purpose' },
    { id: 'interpersonal', label: 'Interpersonal' },
    { id: 'learning', label: 'Learning' },
    { id: 'action', label: 'Action' },
    { id: 'resilience', label: 'Resilience' }
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2 text-zinc-500 text-sm">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-medium">Focus on:</span>
      </div>
      
      <button
        onClick={() => onPillarSelect(null)}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
          selectedPillar === null
            ? 'bg-white/10 text-white border-white/20'
            : 'bg-transparent text-zinc-500 border-transparent hover:border-white/10'
        )}
      >
        All Pillars
      </button>

      {pillars.map((pillar) => {
        const Icon = pillarIcons[pillar.id];
        const color = pillarColors[pillar.id];
        const isSelected = selectedPillar === pillar.id;

        return (
          <motion.button
            key={pillar.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onPillarSelect(isSelected ? null : pillar.id)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5',
              isSelected
                ? `bg-${color}-500/20 text-${color}-300 border-${color}-500/30`
                : 'bg-white/5 text-zinc-400 border-transparent hover:border-white/10 hover:text-white'
            )}
          >
            <Icon className="w-3 h-3" />
            {pillar.label}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <X className="w-3 h-3" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}