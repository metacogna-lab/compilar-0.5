import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';

const pillars = [
  { id: 'purpose', icon: Compass, color: 'violet', x: 50, y: 10 },
  { id: 'interpersonal', icon: Heart, color: 'pink', x: 85, y: 35 },
  { id: 'action', icon: Zap, color: 'emerald', x: 75, y: 80 },
  { id: 'learning', icon: BookOpen, color: 'indigo', x: 25, y: 80 },
  { id: 'resilience', icon: Shield, color: 'amber', x: 15, y: 35 }
];

export default function SimplePillarMap({ userProfile, onPillarClick }) {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto mb-8">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {/* Pentagon outline */}
        <polygon
          points="50,10 85,35 75,80 25,80 15,35"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="0.5"
        />

        {/* Connecting lines */}
        {pillars.map((pillar, i) => {
          const nextPillar = pillars[(i + 1) % pillars.length];
          return (
            <motion.line
              key={`line-${i}`}
              x1={pillar.x}
              y1={pillar.y}
              x2={nextPillar.x}
              y2={nextPillar.y}
              stroke="rgba(139, 92, 246, 0.2)"
              strokeWidth="0.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          );
        })}

        {/* Center point */}
        <circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.3)" />
      </svg>

      {/* Pillar nodes */}
      {pillars.map((pillar, i) => {
        const Icon = pillar.icon;
        const score = userProfile?.pillar_scores?.[pillar.id];

        return (
          <motion.button
            key={pillar.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1, type: 'spring' }}
            onClick={() => onPillarClick?.(pillar.id)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{ left: `${pillar.x}%`, top: `${pillar.y}%` }}
          >
            <div className={`w-16 h-16 rounded-2xl bg-${pillar.color}-500/20 border-2 border-${pillar.color}-500/40 flex items-center justify-center hover:scale-110 transition-transform shadow-lg`}>
              <Icon className={`w-7 h-7 text-${pillar.color}-400`} />
            </div>
            {score !== undefined && (
              <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold text-${pillar.color}-400 whitespace-nowrap`}>
                {score}%
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}