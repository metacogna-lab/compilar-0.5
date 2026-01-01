import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const pillarConfig = {
  purpose: { color: '#8B5CF6', label: 'P' },
  interpersonal: { color: '#EC4899', label: 'I' },
  learning: { color: '#4F46E5', label: 'L' },
  action: { color: '#10B981', label: 'A' },
  resilience: { color: '#F59E0B', label: 'R' },
};

export default function CompetencyRing({ scores = {}, size = 280 }) {
  const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 40;
  const strokeWidth = 8;
  const ringRadius = radius - strokeWidth;
  const circumference = 2 * Math.PI * ringRadius;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background rings */}
        {pillars.map((pillar, index) => {
          const ringR = ringRadius - (index * 18);
          const circ = 2 * Math.PI * ringR;
          
          return (
            <circle
              key={`bg-${pillar}`}
              cx={centerX}
              cy={centerY}
              r={ringR}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={strokeWidth}
            />
          );
        })}
        
        {/* Animated score rings */}
        {pillars.map((pillar, index) => {
          const score = scores[pillar] || 0;
          const ringR = ringRadius - (index * 18);
          const circ = 2 * Math.PI * ringR;
          const offset = circ - (score / 100) * circ;
          const config = pillarConfig[pillar];
          
          return (
            <motion.circle
              key={`score-${pillar}`}
              cx={centerX}
              cy={centerY}
              r={ringR}
              fill="none"
              stroke={config.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: offset }}
              transition={{ 
                duration: 1.5, 
                delay: 0.2 + index * 0.15,
                ease: [0.16, 1, 0.3, 1]
              }}
              style={{
                filter: `drop-shadow(0 0 6px ${config.color}50)`
              }}
            />
          );
        })}
      </svg>

      {/* Center labels */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-3xl font-bold text-white mb-1"
          >
            {Object.values(scores).length > 0 
              ? Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length)
              : '—'}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-xs text-zinc-400 uppercase tracking-wider"
          >
            Overall
          </motion.div>
        </div>
      </div>

      {/* Pillar labels around the ring */}
      {pillars.map((pillar, index) => {
        const angle = (index * 72 - 90) * (Math.PI / 180);
        const labelRadius = radius + 20;
        const x = centerX + labelRadius * Math.cos(angle);
        const y = centerY + labelRadius * Math.sin(angle);
        const config = pillarConfig[pillar];
        const score = scores[pillar];
        
        return (
          <motion.div
            key={`label-${pillar}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            className="absolute flex flex-col items-center"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ backgroundColor: config.color }}
            >
              {config.label}
            </div>
            {score !== undefined && (
              <span className="text-xs text-zinc-400 mt-1">{score}%</span>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}