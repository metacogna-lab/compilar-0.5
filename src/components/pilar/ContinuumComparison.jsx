import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';

const pillars = [
  { 
    id: 'purpose', 
    icon: Compass, 
    color: 'violet',
    egalitarian: 'GrpProsp (Group Prospects)',
    hierarchical: 'OwnProsp (Own Prospects)',
    tension: 'In healthy systems, leaders align personal ambitions with group missions; in unhealthy systems, OwnProsp rises while GrpProsp stagnates.'
  },
  { 
    id: 'interpersonal', 
    icon: Heart, 
    color: 'pink',
    egalitarian: 'Popularity (Informal Liking)',
    hierarchical: 'Status (Formal Authority)',
    tension: 'Popularity without status can lead to shadow leadership; status without popularity leads to compliance without commitment.'
  },
  { 
    id: 'learning', 
    icon: BookOpen, 
    color: 'indigo',
    egalitarian: 'IndRecip (Unconditional Help)',
    hierarchical: 'DirRecip (Conditional Help)',
    tension: 'Direct reciprocity protects scarce resources but can erode solidarity; indirect reciprocity builds solidarity but can be exploited without safeguards.'
  },
  { 
    id: 'action', 
    icon: Zap, 
    color: 'emerald',
    egalitarian: 'DivsExp (Diverse Expression)',
    hierarchical: 'NormExp (Normative Expression)',
    tension: 'Teams must protect core constraints (safety, legality) while still permitting challenge on how work is done.'
  },
  { 
    id: 'resilience', 
    icon: Shield, 
    color: 'amber',
    egalitarian: 'OutResp (Respect for Others)',
    hierarchical: 'IncResp (Being Respected)',
    tension: 'High mutual respect (both outgoing and incoming) produces the most resilient engagement; asymmetry leads to disengagement or domination.'
  }
];

export default function ContinuumComparison() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Pillar Continuums</h2>
        <p className="text-zinc-400">
          Egalitarian and hierarchical modes are not separate models but two ends of five underlying continuums. 
          Teams can move along these spectrums as situations demand.
        </p>
      </div>

      <div className="space-y-6">
        {pillars.map((pillar, index) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border bg-${pillar.color}-500/5 border-${pillar.color}-500/20`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg bg-${pillar.color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${pillar.color}-400`} />
                </div>
                <h3 className="text-white font-semibold capitalize">{pillar.id}</h3>
              </div>

              {/* Continuum Visual */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium text-indigo-400`}>{pillar.egalitarian}</span>
                  <ArrowLeftRight className="w-4 h-4 text-zinc-500" />
                  <span className={`text-sm font-medium text-amber-400`}>{pillar.hierarchical}</span>
                </div>
                <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500/30 via-zinc-500/30 to-amber-500/30 relative">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-zinc-700" />
                </div>
              </div>

              {/* Tension Summary */}
              <p className="text-xs text-zinc-400 leading-relaxed italic">
                {pillar.tension}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Mission Command Agility */}
      <div className="mt-6 p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400" />
          Mission Command Agility
        </h3>
        <p className="text-sm text-zinc-400 mb-3">
          The capacity for teams and leaders to shift between egalitarian and hierarchical expression as situations demand – 
          for example, collaborating openly during planning, then tightening hierarchy during execution, then re-opening egalitarian space in debrief.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-400">Make both modes explicit</span>
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-400">Practice deliberate shifts</span>
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-400">Debrief balance</span>
        </div>
      </div>
    </div>
  );
}