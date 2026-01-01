import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

const pillarConfig = {
  purpose: { 
    icon: Compass, 
    color: 'violet', 
    label: 'Purpose',
    description: 'Why we exist and where we\'re going',
    position: { x: 50, y: 10 },
    details: {
      construct: 'Direction and meaning',
      mechanism: 'Aligns individual and collective goals',
      markers: ['Clear vision', 'Shared values', 'Meaningful work']
    }
  },
  interpersonal: { 
    icon: Heart, 
    color: 'pink', 
    label: 'Interpersonal',
    description: 'How we relate and connect',
    position: { x: 85, y: 35 },
    details: {
      construct: 'Relationships and trust',
      mechanism: 'Builds social bonds and cooperation',
      markers: ['Strong trust', 'Open communication', 'Mutual support']
    }
  },
  learning: { 
    icon: BookOpen, 
    color: 'indigo', 
    label: 'Learning',
    description: 'How we grow and adapt',
    position: { x: 75, y: 75 },
    details: {
      construct: 'Growth and adaptation',
      mechanism: 'Enables continuous improvement',
      markers: ['Curiosity', 'Skill development', 'Knowledge sharing']
    }
  },
  action: { 
    icon: Zap, 
    color: 'emerald', 
    label: 'Action',
    description: 'How we get things done',
    position: { x: 25, y: 75 },
    details: {
      construct: 'Execution and momentum',
      mechanism: 'Translates plans into results',
      markers: ['Initiative', 'Consistency', 'Follow-through']
    }
  },
  resilience: { 
    icon: Shield, 
    color: 'amber', 
    label: 'Resilience',
    description: 'How we handle pressure',
    position: { x: 15, y: 35 },
    details: {
      construct: 'Strength and recovery',
      mechanism: 'Maintains stability under stress',
      markers: ['Emotional regulation', 'Adaptability', 'Recovery speed']
    }
  }
};

const connections = [
  { from: 'purpose', to: 'interpersonal', description: 'Shared purpose builds trust' },
  { from: 'purpose', to: 'resilience', description: 'Clear purpose sustains through adversity' },
  { from: 'interpersonal', to: 'learning', description: 'Trust enables knowledge sharing' },
  { from: 'learning', to: 'action', description: 'Learning informs effective action' },
  { from: 'action', to: 'resilience', description: 'Action builds confidence' },
  { from: 'resilience', to: 'purpose', description: 'Resilience maintains focus on purpose' },
  { from: 'interpersonal', to: 'action', description: 'Collaboration drives execution' },
  { from: 'purpose', to: 'learning', description: 'Purpose guides learning priorities' },
];

export default function InteractivePillarGraph({ userProfile, onPillarSelect, selectedPillar }) {
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const userScores = userProfile?.pillar_scores || {};

  return (
    <div className="relative">
      {/* Graph Container */}
      <div className="relative w-full aspect-[4/3] max-w-3xl mx-auto mb-6">
        {/* SVG for connections */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
              <stop offset="100%" stopColor="rgba(236, 72, 153, 0.3)" />
            </linearGradient>
          </defs>
          {connections.map((conn, i) => {
            const from = pillarConfig[conn.from].position;
            const to = pillarConfig[conn.to].position;
            const isHovered = hoveredConnection === i;
            return (
              <g key={i}>
                <motion.line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isHovered ? "rgba(139, 92, 246, 0.6)" : "url(#connectionGradient)"}
                  strokeWidth={isHovered ? 0.4 : 0.2}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onMouseEnter={() => setHoveredConnection(i)}
                  onMouseLeave={() => setHoveredConnection(null)}
                  className="cursor-pointer"
                />
              </g>
            );
          })}
        </svg>

        {/* Pillar Nodes */}
        {Object.entries(pillarConfig).map(([key, config], index) => {
          const Icon = config.icon;
          const score = userScores[key];
          const isSelected = selectedPillar === key;
          
          return (
            <motion.button
              key={key}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1, type: 'spring' }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPillarSelect?.(isSelected ? null : key)}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 group`}
              style={{ left: `${config.position.x}%`, top: `${config.position.y}%` }}
            >
              <div className={`relative flex flex-col items-center ${isSelected ? 'z-20' : 'z-10'}`}>
                {/* Glow effect */}
                <motion.div
                  animate={isSelected ? {
                    boxShadow: [`0 0 20px 5px var(--color-pillar-${key})`, `0 0 40px 10px var(--color-pillar-${key})`, `0 0 20px 5px var(--color-pillar-${key})`]
                  } : {}}
                  transition={{ duration: 2, repeat: isSelected ? Infinity : 0 }}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 flex items-center justify-center shadow-lg group-hover:shadow-2xl transition-shadow`}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </motion.div>
                
                {/* Score badge */}
                {score !== undefined && (
                  <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-${config.color}-400 border-2 border-[#0F0F12] flex items-center justify-center`}>
                    <span className="text-white font-bold text-xs">{score}</span>
                  </div>
                )}
                
                {/* Label */}
                <p className={`mt-2 text-xs md:text-sm font-medium ${isSelected ? `text-${config.color}-300` : 'text-white'} whitespace-nowrap`}>
                  {config.label}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Connection tooltip */}
      <AnimatePresence>
        {hoveredConnection !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-center mb-4"
          >
            <p className="text-sm text-violet-300 italic">"{connections[hoveredConnection].description}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detailed Panel */}
      <AnimatePresence>
        {selectedPillar && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              className={`p-6 rounded-2xl bg-gradient-to-br from-${pillarConfig[selectedPillar].color}-900/30 to-${pillarConfig[selectedPillar].color}-950/50 border border-${pillarConfig[selectedPillar].color}-500/30`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-${pillarConfig[selectedPillar].color}-500/20 flex items-center justify-center`}>
                    {React.createElement(pillarConfig[selectedPillar].icon, { className: `w-6 h-6 text-${pillarConfig[selectedPillar].color}-400` })}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{pillarConfig[selectedPillar].label}</h3>
                    <p className="text-sm text-zinc-400">{pillarConfig[selectedPillar].description}</p>
                  </div>
                </div>
                <button
                  onClick={() => onPillarSelect?.(null)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                  <p className="text-xs text-zinc-400 mb-1">Construct</p>
                  <p className="text-sm text-white">{pillarConfig[selectedPillar].details.construct}</p>
                </div>
                <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                  <p className="text-xs text-zinc-400 mb-1">Mechanism</p>
                  <p className="text-sm text-white">{pillarConfig[selectedPillar].details.mechanism}</p>
                </div>
                <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                  <p className="text-xs text-zinc-400 mb-1">Your Score</p>
                  <p className={`text-2xl font-bold text-${pillarConfig[selectedPillar].color}-400`}>
                    {userScores[selectedPillar] || '—'}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-zinc-400 mb-2">Key Markers</p>
                <div className="flex flex-wrap gap-2">
                  {pillarConfig[selectedPillar].details.markers.map((marker, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1 rounded-full bg-${pillarConfig[selectedPillar].color}-500/20 border border-${pillarConfig[selectedPillar].color}-500/30 text-xs text-${pillarConfig[selectedPillar].color}-300`}
                    >
                      {marker}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={createPageUrl(`Pillar?pillar=${selectedPillar}`)}>
                  <Button className={`bg-${pillarConfig[selectedPillar].color}-500/20 hover:bg-${pillarConfig[selectedPillar].color}-500/30 text-${pillarConfig[selectedPillar].color}-300`}>
                    Take Assessment
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}