import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function ForcePillarMatrix({ mode, graphData }) {
  const pillarNodes = graphData.nodes.filter(n => n.type === "pillar");
  const forceNodes = graphData.nodes.filter(n => n.type === "force");

  const pillarColors = {
    prospects: '#10B981',
    involved: '#EC4899',
    liked: '#4F46E5',
    agency: '#8B5CF6',
    respect: '#F59E0B'
  };

  // Group forces by pillar
  const forcesByPillar = {};
  forceNodes.forEach(force => {
    const pillarId = force.group?.toLowerCase();
    if (!forcesByPillar[pillarId]) {
      forcesByPillar[pillarId] = [];
    }
    forcesByPillar[pillarId].push(force);
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 p-6 flex flex-col items-center justify-center overflow-auto"
    >
      <div className="w-full max-w-5xl">
        <h3 className="text-lg font-bold text-white text-center mb-6">Force-Pillar Matrix</h3>
        
        <div className="grid gap-4">
          {pillarNodes.map((pillar, idx) => {
            const pillarForces = forcesByPillar[pillar.id] || [];
            const color = pillarColors[pillar.id];
            
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white/5 rounded-lg border border-white/10 p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <h4 className="font-semibold text-white text-sm">{pillar.label}</h4>
                  <span className="text-xs text-zinc-500">({pillarForces.length} forces)</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {pillarForces.map((force, fIdx) => (
                    <motion.div
                      key={force.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.1 + fIdx * 0.05 }}
                      className="flex items-start gap-2 p-2 rounded bg-black/20 hover:bg-black/40 transition-colors"
                    >
                      <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">{force.label}</p>
                        <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{force.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}