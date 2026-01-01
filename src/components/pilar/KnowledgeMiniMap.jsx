import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

// Pentagon apex positions: Purpose at top, clockwise
const pillars = [
  { id: 'purpose', icon: Compass, color: 'violet', angle: -90 },      // Top
  { id: 'interpersonal', icon: Heart, color: 'pink', angle: -18 },    // Right
  { id: 'action', icon: Zap, color: 'emerald', angle: 54 },           // Bottom-right
  { id: 'learning', icon: BookOpen, color: 'indigo', angle: 126 },    // Bottom-left
  { id: 'resilience', icon: Shield, color: 'amber', angle: 198 },     // Left
];

// Connection strength based on PILAR model
const pillarConnections = {
  purpose: ['interpersonal', 'resilience'],
  interpersonal: ['purpose', 'action'],
  action: ['interpersonal', 'learning'],
  learning: ['action', 'resilience'],
  resilience: ['learning', 'purpose'],
};

export default function KnowledgeMiniMap({ data, selectedPillar, onSelectPillar, showConnections = false }) {
  const getScore = (pillarId) => {
    const item = data.find(d => d.pillar === pillarId);
    return item?.score;
  };

  const avgScore = data.filter(d => d.score).length > 0
    ? Math.round(data.filter(d => d.score).reduce((s, d) => s + d.score, 0) / data.filter(d => d.score).length)
    : 0;

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 h-full">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Overview</h3>
      
      {/* Radar-like visualization */}
      <div className="relative aspect-square max-w-[200px] mx-auto mb-4">
        {/* Background circles */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          {[20, 40, 60, 80].map(r => (
            <circle
              key={r}
              cx="50"
              cy="50"
              r={r * 0.4}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.5"
            />
          ))}
          {/* Pentagon outer edge connections */}
          {pillars.map((p, i) => {
            const nextPillar = pillars[(i + 1) % pillars.length];
            const x1 = 50 + Math.cos((p.angle * Math.PI) / 180) * 40;
            const y1 = 50 + Math.sin((p.angle * Math.PI) / 180) * 40;
            const x2 = 50 + Math.cos((nextPillar.angle * Math.PI) / 180) * 40;
            const y2 = 50 + Math.sin((nextPillar.angle * Math.PI) / 180) * 40;
            
            return (
              <motion.line
                key={`edge-${i}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="0.5"
                strokeDasharray="2 2"
              />
            );
          })}
          {/* Strength-based connection lines between pillars */}
          {showConnections && pillars.map((p, i) => {
            const pScore = getScore(p.id) || 0;
            return pillarConnections[p.id].map(connectedId => {
              const connected = pillars.find(pl => pl.id === connectedId);
              if (!connected) return null;
              const connectedScore = getScore(connectedId) || 0;
              const avgStrength = (pScore + connectedScore) / 2;
              const opacity = avgStrength > 0 ? Math.min(0.6, avgStrength / 100) : 0.05;
              
              const x1 = 50 + Math.cos((p.angle * Math.PI) / 180) * 40;
              const y1 = 50 + Math.sin((p.angle * Math.PI) / 180) * 40;
              const x2 = 50 + Math.cos((connected.angle * Math.PI) / 180) * 40;
              const y2 = 50 + Math.sin((connected.angle * Math.PI) / 180) * 40;
              
              return (
                <motion.line
                  key={`conn-${p.id}-${connectedId}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={`rgba(139, 92, 246, ${opacity})`}
                  strokeWidth={avgStrength > 50 ? 2 : 1}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                />
              );
            });
          })}
          {/* Filled area */}
          <motion.polygon
            points={pillars.map(p => {
              const score = getScore(p.id) || 0;
              const x = 50 + Math.cos((p.angle * Math.PI) / 180) * (score * 0.4);
              const y = 50 + Math.sin((p.angle * Math.PI) / 180) * (score * 0.4);
              return `${x},${y}`;
            }).join(' ')}
            fill="rgba(139, 92, 246, 0.1)"
            stroke="rgba(139, 92, 246, 0.5)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
        </svg>

        {/* Pillar nodes at pentagon apexes */}
        {pillars.map(pillar => {
          const Icon = pillar.icon;
          const score = getScore(pillar.id);
          const radius = 42;
          const x = 50 + Math.cos((pillar.angle * Math.PI) / 180) * radius;
          const y = 50 + Math.sin((pillar.angle * Math.PI) / 180) * radius;
          
          return (
            <Link key={pillar.id} to={createPageUrl(`Pillar?pillar=${pillar.id}`)}>
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: pillars.indexOf(pillar) * 0.1, type: 'spring' }}
                onClick={(e) => {
                  e.preventDefault();
                  onSelectPillar(selectedPillar === pillar.id ? null : pillar.id);
                }}
                onDoubleClick={() => window.location.href = createPageUrl(`Pillar?pillar=${pillar.id}`)}
                className={cn(
                  "absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full",
                  "flex items-center justify-center transition-all",
                  selectedPillar === pillar.id 
                    ? `bg-${pillar.color}-500 ring-2 ring-${pillar.color}-400 ring-offset-2 ring-offset-[#0F0F12]`
                    : `bg-${pillar.color}-500/20 hover:bg-${pillar.color}-500/40`,
                  score >= 70 && "ring-2 ring-emerald-400/50"
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
                title={`${pillar.id}: ${score ? score + '%' : 'Not assessed'}`}
              >
                <Icon className={cn(
                  "w-4 h-4",
                  selectedPillar === pillar.id ? "text-white" : `text-${pillar.color}-400`
                )} />
              </motion.button>
            </Link>
          );
        })}

        {/* Center score */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <span className="text-2xl font-bold text-white">{avgScore}</span>
            <span className="text-xs text-zinc-500 block">avg</span>
          </motion.div>
        </div>
      </div>

      {/* Legend with links to pillar progress */}
      <div className="grid grid-cols-2 gap-1 text-xs">
        {pillars.map(pillar => {
          const score = getScore(pillar.id);
          const Icon = pillar.icon;
          return (
            <Link
              key={pillar.id}
              to={createPageUrl(`Pillar?pillar=${pillar.id}`)}
              className={cn(
                "flex items-center gap-1.5 p-1.5 rounded-lg transition-colors",
                selectedPillar === pillar.id ? "bg-white/10" : "hover:bg-white/5"
              )}
            >
              <Icon className={`w-3 h-3 text-${pillar.color}-400`} />
              <span className="text-zinc-400 capitalize truncate">{pillar.id}</span>
              <span className={cn(
                "ml-auto font-medium",
                score >= 70 ? "text-emerald-400" :
                score >= 50 ? "text-amber-400" :
                score ? "text-red-400" : "text-zinc-600"
              )}>
                {score ? `${Math.round(score)}%` : '—'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}