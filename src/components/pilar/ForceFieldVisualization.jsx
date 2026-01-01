import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';
import { coreForces, pillarForceMap } from './SimplifiedForces';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning' },
  action: { icon: Zap, color: 'emerald', label: 'Action' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience' }
};

export default function ForceFieldVisualization({ currentMode = 'egalitarian', selectedPillar, onPillarSelect }) {
  const pillars = Object.keys(pillarConfig);

  return (
    <div className="space-y-6">
      {pillars.map((pillar, index) => {
        const config = pillarConfig[pillar];
        const Icon = config.icon;
        const forceIds = pillarForceMap[pillar] || [];
        const pillarForces = coreForces.filter(f => forceIds.includes(f.id));
        const isSelected = selectedPillar === pillar;

        return (
          <motion.div
            key={pillar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onPillarSelect?.(isSelected ? null : pillar)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              isSelected
                ? `bg-${config.color}-500/20 border-${config.color}-500/30`
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-${config.color}-500/20 flex items-center justify-center`}>
                <Icon className={`w-5 h-5 text-${config.color}-400`} />
              </div>
              <h4 className="text-white font-semibold">{config.label}</h4>
            </div>

            {pillarForces.length > 0 && (
              <div className="space-y-2">
                {pillarForces.map((force) => (
                  <div key={force.id} className="p-3 rounded-lg bg-black/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium text-sm">{force.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className={`p-2 rounded ${currentMode === 'egalitarian' ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-white/5'}`}>
                        <p className="text-indigo-300 font-medium mb-1">Egalitarian</p>
                        <p className="text-zinc-400 leading-tight">{force.egalitarian}</p>
                      </div>
                      <div className={`p-2 rounded ${currentMode === 'hierarchical' ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5'}`}>
                        <p className="text-amber-300 font-medium mb-1">Hierarchical</p>
                        <p className="text-zinc-400 leading-tight">{force.hierarchical}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}