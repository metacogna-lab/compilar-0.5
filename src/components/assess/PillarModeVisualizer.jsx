import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PillarModeVisualizer({ pillarData, currentMode, onModeToggle }) {
  if (!pillarData || !pillarData.egalitarian || !pillarData.hierarchical || !pillarData.currentPillar) {
    return null;
  }

  const egalitarian = pillarData.egalitarian.find(p => p.id === pillarData.currentPillar);
  const hierarchical = pillarData.hierarchical.find(p => p.id === pillarData.currentPillar);
  
  if (!egalitarian || !hierarchical) {
    return null;
  }

  const currentData = currentMode === 'egalitarian' ? egalitarian : hierarchical;
  const oppositeData = currentMode === 'egalitarian' ? hierarchical : egalitarian;

  return (
    <div className="relative">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-4 bg-white/5 rounded-full p-2 backdrop-blur-xl border border-white/10">
          <button
            onClick={() => onModeToggle('egalitarian')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              currentMode === 'egalitarian'
                ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Egalitarian
          </button>
          <ArrowLeftRight className="w-5 h-5 text-zinc-500" />
          <button
            onClick={() => onModeToggle('hierarchical')}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
              currentMode === 'hierarchical'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Hierarchical
          </button>
        </div>
      </div>

      {/* Animated Pillar Visualization */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 mb-2"
            >
              <Sparkles className="w-5 h-5 text-violet-400" />
              <h3 className="text-2xl font-bold text-white">{currentData.title}</h3>
            </motion.div>
            <p className="text-sm text-violet-400">{currentData.abbreviation}</p>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-zinc-300 leading-relaxed">{currentData.description}</p>
          </div>

          {/* Full Context */}
          <div className="mb-6 bg-black/20 rounded-lg p-4">
            <p className="text-sm text-zinc-400 leading-relaxed">{currentData.fullDescription}</p>
          </div>

          {/* High/Low States */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-400 mb-2">When High</h4>
              <p className="text-xs text-zinc-400">{currentData.highLowDescriptions?.High?.description}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-400 mb-2">When Low</h4>
              <p className="text-xs text-zinc-400">{currentData.highLowDescriptions?.Low?.description}</p>
            </div>
          </div>

          {/* Forces */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Key Forces</h4>
            <div className="grid gap-2">
              {currentData.forces?.map((force, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <p className="text-sm font-medium text-white mb-1">{force.name}</p>
                  <p className="text-xs text-zinc-400">{force.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Counterpart Info */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-xs text-zinc-500">
              Counterpart in {currentMode === 'egalitarian' ? 'Hierarchical' : 'Egalitarian'} mode: <span className="text-violet-400 font-semibold">{oppositeData.title}</span>
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}