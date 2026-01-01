import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose', desc: 'Why we exist' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal', desc: 'How we connect' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning', desc: 'How we grow' },
  action: { icon: Zap, color: 'emerald', label: 'Action', desc: 'How we execute' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience', desc: 'How we endure' }
};

const positions = [
  { id: 'purpose', x: 50, y: 15 },
  { id: 'interpersonal', x: 82, y: 38 },
  { id: 'action', x: 70, y: 78 },
  { id: 'learning', x: 30, y: 78 },
  { id: 'resilience', x: 18, y: 38 }
];

export default function InteractiveTheoryMap({ userProfile, onPillarSelect, selectedPillar, compact = true }) {
  return (
    <div className="relative w-full" style={{ paddingBottom: compact ? '60%' : '80%' }}>
      {/* SVG Background */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <radialGradient id="centerGlow">
            <stop offset="0%" stopColor="rgba(139, 92, 246, 0.3)" />
            <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
          </radialGradient>
        </defs>

        {/* Center glow */}
        <circle cx="50" cy="50" r="15" fill="url(#centerGlow)" />

        {/* Pentagon */}
        <motion.polygon
          points="50,15 82,38 70,78 30,78 18,38"
          fill="none"
          stroke="rgba(139, 92, 246, 0.2)"
          strokeWidth="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />

        {/* Connection lines */}
        {positions.map((pos, i) => (
          <motion.line
            key={i}
            x1="50"
            y1="50"
            x2={pos.x}
            y2={pos.y}
            stroke={selectedPillar === pos.id ? "rgba(139, 92, 246, 0.5)" : "rgba(139, 92, 246, 0.15)"}
            strokeWidth={selectedPillar === pos.id ? "0.5" : "0.2"}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, delay: i * 0.1 }}
          />
        ))}
      </svg>

      {/* Pillar Nodes */}
      {positions.map((pos, i) => {
        const config = pillarConfig[pos.id];
        const Icon = config.icon;
        const score = userProfile?.pillar_scores?.[pos.id];
        const isSelected = selectedPillar === pos.id;

        return (
          <motion.button
            key={pos.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.15, zIndex: 10 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
            onClick={() => onPillarSelect?.(isSelected ? null : pos.id)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <div 
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center transition-all ${
                isSelected 
                  ? `bg-${config.color}-500/40 border-2 border-${config.color}-400 shadow-lg shadow-${config.color}-500/50` 
                  : `bg-${config.color}-500/10 border-2 border-${config.color}-500/30 hover:bg-${config.color}-500/20`
              }`}
            >
              <Icon className={`w-7 h-7 md:w-9 md:h-9 text-${config.color}-400`} />
              
              {score !== undefined && (
                <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-${config.color}-500/30 border border-${config.color}-500/50`}>
                  <span className={`text-xs font-bold text-${config.color}-300`}>{score}%</span>
                </div>
              )}
            </div>

            {/* Enhanced Tooltip with Connections */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-2 rounded-lg bg-black/90 border border-white/20 pointer-events-none z-50"
              style={{ minWidth: '200px' }}
            >
              <p className="text-white font-medium text-sm">{config.label}</p>
              <p className="text-zinc-400 text-xs mb-2">{config.desc}</p>
              {i > 0 && (
                <p className="text-zinc-500 text-xs italic border-t border-white/10 pt-2">
                  Connected to {pillarConfig[positions[i-1].id].label}
                </p>
              )}
            </motion.div>
          </motion.button>
        );
      })}

      {/* Center indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-3 h-3 rounded-full bg-violet-400"
        />
      </div>
    </div>
  );
}