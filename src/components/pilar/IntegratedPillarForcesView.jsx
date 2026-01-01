import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, ArrowRight, Info } from 'lucide-react';
import { coreForces, pillarForceMap } from './SimplifiedForces';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose', description: 'Why we exist and where we\'re going' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal', description: 'How we relate and connect' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning', description: 'How we grow and adapt' },
  action: { icon: Zap, color: 'emerald', label: 'Action', description: 'How we get things done' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience', description: 'How we handle pressure' }
};

export default function IntegratedPillarForcesView({ currentMode = 'egalitarian', selectedPillar, onPillarSelect, userProfile }) {
  const pillars = Object.keys(pillarConfig);
  const userScores = userProfile?.pillar_scores || {};

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-violet-400 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Understanding the Framework</h3>
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">
              Ben Heslop's PILAR framework shows how <span className="font-semibold text-white">8 core psychological forces</span> operate 
              across <span className="font-semibold text-white">5 pillars</span> in two distinct modes. Each pillar contains specific forces that 
              manifest differently depending on whether your team operates in <span className="text-indigo-300 font-medium">egalitarian</span> or{' '}
              <span className="text-amber-300 font-medium">hierarchical</span> mode.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Egalitarian = Distributed power, group focus</span>
              </div>
              <span>|</span>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Hierarchical = Concentrated authority, individual focus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Integrated Pillars + Forces View */}
      {pillars.map((pillar, index) => {
        const config = pillarConfig[pillar];
        const Icon = config.icon;
        const forceIds = pillarForceMap[pillar] || [];
        const pillarForces = coreForces.filter(f => forceIds.includes(f.id));
        const isSelected = selectedPillar === pillar;
        const score = userScores[pillar];

        return (
          <motion.div
            key={pillar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-2xl border transition-all ${
              isSelected
                ? `bg-${config.color}-500/20 border-${config.color}-500/30`
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            {/* Pillar Header */}
            <button
              onClick={() => onPillarSelect?.(isSelected ? null : pillar)}
              className="w-full p-5 flex items-center gap-4 text-left"
            >
              <div className={`w-14 h-14 rounded-xl bg-${config.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-7 h-7 text-${config.color}-400`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-1">{config.label}</h3>
                <p className="text-sm text-zinc-400">{config.description}</p>
              </div>
              {score !== undefined && (
                <div className="text-right">
                  <div className={`text-2xl font-bold text-${config.color}-400`}>{score}%</div>
                  <div className="text-xs text-zinc-500">Your score</div>
                </div>
              )}
            </button>

            {/* Forces List - Always Visible */}
            <div className="px-5 pb-5">
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {pillarForces.length} Force{pillarForces.length !== 1 ? 's' : ''} in this Pillar
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    currentMode === 'egalitarian'
                      ? 'bg-indigo-500/20 text-indigo-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {currentMode} mode
                  </span>
                </div>

                <div className="space-y-3">
                  {pillarForces.map((force, idx) => (
                    <motion.div
                      key={force.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: isSelected ? idx * 0.1 : 0 }}
                      className="rounded-lg bg-black/20 border border-white/5 overflow-hidden"
                    >
                      {/* Force Header */}
                      <div className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-white">{force.name}</h4>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              currentMode === 'egalitarian' ? 'bg-indigo-400' : 'bg-amber-400'
                            }`} />
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 mb-3">{force.description}</p>

                        {/* Mode Manifestations Side by Side */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`p-2 rounded transition-all ${
                            currentMode === 'egalitarian'
                              ? 'bg-indigo-500/20 border border-indigo-500/30'
                              : 'bg-white/5'
                          }`}>
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-1 h-1 rounded-full bg-indigo-400" />
                              <span className="text-indigo-300 font-medium text-[10px] uppercase tracking-wider">Egalitarian</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-tight">{force.egalitarian}</p>
                          </div>
                          <div className={`p-2 rounded transition-all ${
                            currentMode === 'hierarchical'
                              ? 'bg-amber-500/20 border border-amber-500/30'
                              : 'bg-white/5'
                          }`}>
                            <div className="flex items-center gap-1 mb-1">
                              <div className="w-1 h-1 rounded-full bg-amber-400" />
                              <span className="text-amber-300 font-medium text-[10px] uppercase tracking-wider">Hierarchical</span>
                            </div>
                            <p className="text-xs text-zinc-300 leading-tight">{force.hierarchical}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <Link to={createPageUrl(`Pillar?pillar=${pillar}`)}>
                  <Button
                    size="sm"
                    className={`w-full mt-3 bg-${config.color}-500/20 hover:bg-${config.color}-500/30 text-${config.color}-300`}
                  >
                    Take {config.label} Assessment
                    <ArrowRight className="w-3 h-3 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}