import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pillarForces = {
  purpose: {
    egalitarian: [
      { name: 'Collective Goal Clarity', description: 'Shared understanding of team objectives', strength: 0.9 },
      { name: 'Team Success Belief', description: 'Confidence in group\'s ability to achieve outcomes', strength: 0.85 },
      { name: 'Shared Future Vision', description: 'Common picture of where the team is heading', strength: 0.8 },
      { name: 'Joint Accountability', description: 'Everyone owns the outcome together', strength: 0.75 }
    ],
    hierarchical: [
      { name: 'Personal Advancement', description: 'Focus on individual career progression', strength: 0.9 },
      { name: 'Credit Attribution', description: 'Ensuring personal contributions are recognized', strength: 0.85 },
      { name: 'Self-Serving Goals', description: 'Pursuing individual objectives within group context', strength: 0.8 },
      { name: 'Competitive Positioning', description: 'Maintaining advantage over peers', strength: 0.7 }
    ]
  },
  interpersonal: {
    egalitarian: [
      { name: 'Warmth & Acceptance', description: 'Feeling welcomed and valued by others', strength: 0.9 },
      { name: 'Informal Influence', description: 'Ability to shape decisions through relationships', strength: 0.8 },
      { name: 'Social Support', description: 'Others have your back when things go wrong', strength: 0.85 },
      { name: 'Relational Safety', description: 'Can disagree without social punishment', strength: 0.75 }
    ],
    hierarchical: [
      { name: 'Formal Authority', description: 'Power derived from position and rank', strength: 0.95 },
      { name: 'Command Capacity', description: 'Ability to compel others to act', strength: 0.9 },
      { name: 'Decision Rights', description: 'Mandate to make binding choices', strength: 0.85 },
      { name: 'Hierarchical Control', description: 'Using rank to settle disputes', strength: 0.8 }
    ]
  },
  learning: {
    egalitarian: [
      { name: 'Unconditional Helping', description: 'Giving assistance without expecting repayment', strength: 0.85 },
      { name: 'Resource Fluidity', description: 'Effort moves to where it\'s needed most', strength: 0.8 },
      { name: 'Pay-it-Forward Culture', description: 'Help circulates through the whole group', strength: 0.75 },
      { name: 'Low Transaction Costs', description: 'Minimal negotiation overhead for cooperation', strength: 0.7 }
    ],
    hierarchical: [
      { name: 'Conditional Help', description: 'Assistance given with expectation of return', strength: 0.85 },
      { name: 'Favor Trading', description: 'Explicit tracking of exchanges', strength: 0.8 },
      { name: 'Transactional Norms', description: 'Everything operates on deal-making', strength: 0.75 },
      { name: 'Resource Bargaining', description: 'Help is negotiated and leveraged', strength: 0.7 }
    ]
  },
  action: {
    egalitarian: [
      { name: 'Psychological Safety', description: 'Can voice concerns without fear of punishment', strength: 0.9 },
      { name: 'Challenge Welcome', description: 'Dissent is invited and considered seriously', strength: 0.85 },
      { name: 'Innovation Space', description: 'Room for novel ideas and experiments', strength: 0.8 },
      { name: 'Open Dialogue', description: 'Genuine two-way communication', strength: 0.75 }
    ],
    hierarchical: [
      { name: 'Status Quo Defense', description: 'Protecting existing arrangements from change', strength: 0.85 },
      { name: 'Norm Enforcement', description: 'Ensuring compliance with established rules', strength: 0.9 },
      { name: 'Change Suppression', description: 'Blocking divergent ideas and suggestions', strength: 0.8 },
      { name: 'Stability Preference', description: 'Prioritizing predictability over adaptation', strength: 0.75 }
    ]
  },
  resilience: {
    egalitarian: [
      { name: 'Peer Competence', description: 'Believing others have the skills to deliver', strength: 0.85 },
      { name: 'Trust in Intentions', description: 'Confidence in others\' good faith', strength: 0.9 },
      { name: 'Role Model Effect', description: 'Wanting to emulate colleagues', strength: 0.8 },
      { name: 'Horizontal Delegation', description: 'Comfortable sharing work peer-to-peer', strength: 0.75 }
    ],
    hierarchical: [
      { name: 'Perceived Competence', description: 'How others rate your abilities', strength: 0.9 },
      { name: 'Reputation Management', description: 'Maintaining image in others\' eyes', strength: 0.85 },
      { name: 'Approval Seeking', description: 'Sensitivity to signals of validation', strength: 0.8 },
      { name: 'Performance Visibility', description: 'Making competence apparent to gatekeepers', strength: 0.75 }
    ]
  }
};

export default function ForcesPanel({ pillar, mode, isOpen, onClose, onForceClick }) {
  if (!isOpen || !pillar) return null;

  const forces = pillarForces[pillar]?.[mode] || [];
  const pillarColor = {
    purpose: 'violet',
    interpersonal: 'pink',
    learning: 'indigo',
    action: 'emerald',
    resilience: 'amber'
  }[pillar];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 max-w-2xl w-full relative"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>

            <h2 className="text-2xl font-bold text-white mb-2 capitalize">
              {pillar} Forces
            </h2>
            <p className="text-zinc-400 text-sm mb-6">
              {mode === 'egalitarian' ? 'Egalitarian Collaboration' : 'Hierarchical Command'} Mode
            </p>

            <div className="space-y-3">
              {forces.map((force, index) => (
                <motion.div
                  key={force.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onForceClick(force)}
                  className={cn(
                    'p-4 rounded-xl border backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02]',
                    `bg-${pillarColor}-500/5 border-${pillarColor}-500/20 hover:border-${pillarColor}-500/40`
                  )}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-white font-medium">{force.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className="text-xs text-zinc-500">{Math.round(force.strength * 100)}%</div>
                      <Info className="w-4 h-4 text-zinc-500" />
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400">{force.description}</p>
                  
                  {/* Strength bar */}
                  <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full bg-gradient-to-r from-${pillarColor}-500 to-${pillarColor}-400`}
                      initial={{ width: 0 }}
                      animate={{ width: `${force.strength * 100}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}