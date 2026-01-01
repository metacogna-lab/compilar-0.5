import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { coreForces, pillarForceMap } from './SimplifiedForces';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet' },
  interpersonal: { icon: Heart, color: 'pink' },
  learning: { icon: BookOpen, color: 'indigo' },
  action: { icon: Zap, color: 'emerald' },
  resilience: { icon: Shield, color: 'amber' }
};

export default function InteractiveForceNetwork({ selectedPillar, selectedForce, onForceSelect, currentMode = 'egalitarian' }) {
  const [hoveredForce, setHoveredForce] = useState(null);
  const pillars = Object.keys(pillarConfig);

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-sm text-zinc-400">
          Showing forces in <span className={`font-bold ${currentMode === 'egalitarian' ? 'text-indigo-400' : 'text-amber-400'}`}>{currentMode}</span> mode.
          Ben Heslop's framework identifies <span className="font-bold text-white">8 core forces</span> across 5 pillars.
        </p>
      </div>

      <div className="grid gap-3">
        {pillars.map((pillar) => {
          const config = pillarConfig[pillar];
          const Icon = config.icon;
          const forceIds = pillarForceMap[pillar] || [];
          const pillarForces = coreForces.filter(f => forceIds.includes(f.id));

          return (
            <motion.div
              key={pillar}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`p-4 rounded-xl border transition-all ${
                selectedPillar === pillar
                  ? `bg-${config.color}-500/20 border-${config.color}-500/40`
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${config.color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${config.color}-400`} />
                </div>
                <h3 className="text-white font-semibold capitalize">{pillar}</h3>
                <span className="ml-auto text-xs text-zinc-500">{pillarForces.length} force{pillarForces.length !== 1 ? 's' : ''}</span>
              </div>

              <div className="grid gap-2">
                {pillarForces.map((force) => (
                  <motion.button
                    key={force.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onForceSelect?.(force)}
                    onMouseEnter={() => setHoveredForce(force)}
                    onMouseLeave={() => setHoveredForce(null)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      selectedForce?.id === force.id
                        ? `bg-${config.color}-500/30 border-${config.color}-500/50`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-sm font-medium text-white mb-2">{force.name}</p>
                    <p className="text-xs text-zinc-400 mb-2">{force.description}</p>
                    <div className={`p-2 rounded text-xs ${
                      currentMode === 'egalitarian'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      <span className="font-medium">{currentMode === 'egalitarian' ? 'Egalitarian:' : 'Hierarchical:'}</span>
                      {' '}
                      {currentMode === 'egalitarian' ? force.egalitarian : force.hierarchical}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Force Detail Panel */}
      <AnimatePresence>
        {selectedForce && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20"
          >
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-violet-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-bold text-white mb-2">{selectedForce.name}</h4>
                <p className="text-sm text-zinc-300 mb-4">{selectedForce.description}</p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <p className="text-indigo-300 font-medium text-xs mb-2">EGALITARIAN MODE</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{selectedForce.egalitarian}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <p className="text-amber-300 font-medium text-xs mb-2">HIERARCHICAL MODE</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">{selectedForce.hierarchical}</p>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 mt-4">
                  Toggle the mode above to see how this force manifests differently in {currentMode === 'egalitarian' ? 'hierarchical' : 'egalitarian'} mode.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}