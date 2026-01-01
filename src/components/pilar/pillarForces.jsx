import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, BookOpen, Zap, Shield } from 'lucide-react';

const pillarIcons = {
  prospects: Target,
  involved: Users,
  liked: BookOpen,
  agency: Zap,
  respect: Shield
};

export default function PillarForces({ pillarColors, mode = 'egalitarian' }) {
  const pillars = [
    {
      id: 'prospects',
      name: mode === 'egalitarian' ? 'Group Prospects' : 'Own Prospects',
      abbreviation: mode === 'egalitarian' ? 'GrpProsp' : 'OwnProsp',
      description: mode === 'egalitarian' 
        ? 'Collective success belief' 
        : 'Personal advancement focus'
    },
    {
      id: 'involved',
      name: mode === 'egalitarian' ? 'Indirect Reciprocity' : 'Direct Reciprocity',
      abbreviation: mode === 'egalitarian' ? 'IndRecip' : 'DirRecip',
      description: mode === 'egalitarian' 
        ? 'Unconditional helping flows' 
        : 'Conditional assistance exchanges'
    },
    {
      id: 'liked',
      name: mode === 'egalitarian' ? 'Popularity' : 'Status',
      abbreviation: mode === 'egalitarian' ? 'Pop' : 'Stat',
      description: mode === 'egalitarian' 
        ? 'Warmth and social support' 
        : 'Formal authority and power'
    },
    {
      id: 'agency',
      name: mode === 'egalitarian' ? 'Diverse Expression' : 'Normative Expression',
      abbreviation: mode === 'egalitarian' ? 'DivsExp' : 'NormExp',
      description: mode === 'egalitarian' 
        ? 'Psychological safety for dissent' 
        : 'Control through conformity'
    },
    {
      id: 'respect',
      name: mode === 'egalitarian' ? 'Outgoing Respect' : 'Incoming Respect',
      abbreviation: mode === 'egalitarian' ? 'OutResp' : 'IncResp',
      description: mode === 'egalitarian' 
        ? 'Assessing others\' competence' 
        : 'Managing personal reputation'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
    >
      <div className="bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl max-w-md">
        <h3 className="text-lg font-bold text-white mb-4 text-center">
          {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Pillars
        </h3>
        
        <div className="grid grid-cols-1 gap-3">
          {pillars.map((pillar, idx) => {
            const Icon = pillarIcons[pillar.id];
            const color = pillarColors[pillar.id];
            
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div 
                  className="p-2 rounded-lg flex-shrink-0"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-white truncate">{pillar.name}</p>
                    <span 
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ 
                        backgroundColor: `${color}20`, 
                        color 
                      }}
                    >
                      {pillar.abbreviation}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">{pillar.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}