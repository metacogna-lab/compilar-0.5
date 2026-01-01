import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, ChevronRight } from 'lucide-react';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', title: 'Purpose' },
  interpersonal: { icon: Heart, color: 'pink', title: 'Interpersonal' },
  learning: { icon: BookOpen, color: 'indigo', title: 'Learning' },
  action: { icon: Zap, color: 'emerald', title: 'Action' },
  resilience: { icon: Shield, color: 'amber', title: 'Resilience' }
};

const forces = {
  purpose: {
    egalitarian: [
      { name: 'Group Prospects', desc: 'Belief the team will succeed together' },
      { name: 'Collective Goal Clarity', desc: 'Shared understanding of objectives' }
    ],
    hierarchical: [
      { name: 'Own Prospects', desc: 'Focus on personal advancement' },
      { name: 'Personal Advancement', desc: 'Individual career progression' }
    ]
  },
  interpersonal: {
    egalitarian: [
      { name: 'Popularity', desc: 'Being liked and accepted by peers' },
      { name: 'Warmth & Acceptance', desc: 'Feeling welcomed and valued' }
    ],
    hierarchical: [
      { name: 'Status', desc: 'Formal power and authority from position' },
      { name: 'Formal Authority', desc: 'Power derived from rank' }
    ]
  },
  learning: {
    egalitarian: [
      { name: 'Indirect Reciprocity', desc: 'Unconditional helping without deals' },
      { name: 'Pay-it-Forward Culture', desc: 'Help circulates freely' }
    ],
    hierarchical: [
      { name: 'Direct Reciprocity', desc: 'Help given with expectation of return' },
      { name: 'Favor Trading', desc: 'Explicit tracking of exchanges' }
    ]
  },
  action: {
    egalitarian: [
      { name: 'Diverse Expression', desc: 'Freedom to challenge status quo' },
      { name: 'Psychological Safety', desc: 'Can voice concerns without fear' }
    ],
    hierarchical: [
      { name: 'Normative Expression', desc: 'Defending existing norms and plans' },
      { name: 'Change Suppression', desc: 'Blocking divergent ideas' }
    ]
  },
  resilience: {
    egalitarian: [
      { name: 'Outgoing Respect', desc: 'Believing others are competent' },
      { name: 'Peer Competence', desc: 'Trust in others\' abilities' }
    ],
    hierarchical: [
      { name: 'Incoming Respect', desc: 'How competent others think you are' },
      { name: 'Reputation Management', desc: 'Maintaining image in others\' eyes' }
    ]
  }
};

export default function SimpleForceExplainer({ userProfile }) {
  const [selectedPillar, setSelectedPillar] = useState('purpose');

  const config = pillarConfig[selectedPillar];
  const Icon = config.icon;
  const pillarForces = forces[selectedPillar];

  return (
    <div className="space-y-6">
      <p className="text-zinc-400 max-w-3xl">
        Each pillar has 4 forces - 2 for egalitarian mode, 2 for hierarchical mode. These describe the psychological dynamics at play.
      </p>

      {/* Pillar Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(pillarConfig).map(([pillar, cfg]) => {
          const PillarIcon = cfg.icon;
          return (
            <button
              key={pillar}
              onClick={() => setSelectedPillar(pillar)}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all ${
                selectedPillar === pillar
                  ? `bg-${cfg.color}-500/20 border-2 border-${cfg.color}-500/40 text-${cfg.color}-300`
                  : 'bg-white/5 border-2 border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              <PillarIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{cfg.title}</span>
            </button>
          );
        })}
      </div>

      {/* Force Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedPillar}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid md:grid-cols-2 gap-4"
        >
          {/* Egalitarian Forces */}
          <div className="p-6 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Icon className={`w-4 h-4 text-indigo-400`} />
              </div>
              <h4 className="text-white font-semibold">Egalitarian Forces</h4>
            </div>
            <div className="space-y-3">
              {pillarForces.egalitarian.map((force, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm font-medium text-white mb-1">{force.name}</p>
                  <p className="text-xs text-zinc-400">{force.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hierarchical Forces */}
          <div className="p-6 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Icon className={`w-4 h-4 text-amber-400`} />
              </div>
              <h4 className="text-white font-semibold">Hierarchical Forces</h4>
            </div>
            <div className="space-y-3">
              {pillarForces.hierarchical.map((force, i) => (
                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm font-medium text-white mb-1">{force.name}</p>
                  <p className="text-xs text-zinc-400">{force.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
        <p className="text-sm text-zinc-400">
          Want to explore all 20 forces in depth? Check out the full framework definitions.
        </p>
      </div>
    </div>
  );
}