import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PillarForceChip({ chip, onExplore }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const isPillar = chip.type === 'Pillar';
  
  const colors = {
    Pillar: {
      bg: 'bg-violet-500/20',
      border: 'border-violet-500/40',
      text: 'text-violet-300',
      hover: 'hover:bg-violet-500/30 hover:border-violet-500/60'
    },
    Force: {
      bg: 'bg-pink-500/20',
      border: 'border-pink-500/40',
      text: 'text-pink-300',
      hover: 'hover:bg-pink-500/30 hover:border-pink-500/60'
    }
  };

  const style = colors[chip.type] || colors.Force;

  return (
    <div className="relative inline-block">
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => {
          if (onExplore) {
            onExplore(chip);
          }
        }}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer',
          style.bg,
          style.border,
          style.text,
          style.hover
        )}
      >
        <Sparkles className="w-3 h-3" />
        <span className="text-xs font-medium">{chip.label}</span>
        <span className="text-[10px] opacity-70">
          {chip.certainty}%
        </span>
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 border border-white/10 rounded-lg shadow-xl z-50"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5">
                <Info className="w-3 h-3 text-violet-400" />
                <span className="text-xs font-semibold text-white">{chip.label}</span>
              </div>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded', style.bg, style.text)}>
                {chip.type}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-2">
              {isPillar 
                ? `This pillar represents a key coordination pattern in ${chip.mode} mode.`
                : `This force influences how the ${chip.mode} pattern manifests.`}
            </p>
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-zinc-500">Certainty: {chip.certainty}%</span>
              <span className="text-violet-400">Click to explore →</span>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rotate-45 bg-zinc-900 border-r border-b border-white/10" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}