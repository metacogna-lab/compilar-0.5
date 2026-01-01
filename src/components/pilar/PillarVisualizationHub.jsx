import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, X, Sparkles, Palette, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import * as THREE from 'three';
import AIPilarCoach from '@/components/pilar/AIPilarCoach';

const pillarConfig = {
  purpose: { icon: Compass, color: '#8B5CF6', label: 'Purpose', egalitarian: 'Group Prospects', hierarchical: 'Own Prospects' },
  interpersonal: { icon: Heart, color: '#EC4899', label: 'Interpersonal', egalitarian: 'Popularity', hierarchical: 'Status' },
  learning: { icon: BookOpen, color: '#6366F1', label: 'Learning', egalitarian: 'Indirect Reciprocity', hierarchical: 'Direct Reciprocity' },
  action: { icon: Zap, color: '#10B981', label: 'Action', egalitarian: 'Diverse Expression', hierarchical: 'Normative Expression' },
  resilience: { icon: Shield, color: '#F59E0B', label: 'Resilience', egalitarian: 'Outgoing Respect', hierarchical: 'Incoming Respect' }
};

// 20 Forces with pillar associations
const forces = [
  // Purpose Forces (4)
  { id: 'collective_goal', label: 'Collective Goal Clarity', pillar: 'purpose', mode: 'egalitarian' },
  { id: 'team_success', label: 'Team Success Belief', pillar: 'purpose', mode: 'egalitarian' },
  { id: 'shared_vision', label: 'Shared Future Vision', pillar: 'purpose', mode: 'egalitarian' },
  { id: 'joint_account', label: 'Joint Accountability', pillar: 'purpose', mode: 'egalitarian' },
  { id: 'personal_advance', label: 'Personal Advancement', pillar: 'purpose', mode: 'hierarchical' },
  { id: 'credit_attrib', label: 'Credit Attribution', pillar: 'purpose', mode: 'hierarchical' },
  { id: 'self_serving', label: 'Self-Serving Goals', pillar: 'purpose', mode: 'hierarchical' },
  { id: 'competitive_pos', label: 'Competitive Positioning', pillar: 'purpose', mode: 'hierarchical' },
  
  // Interpersonal Forces (4)
  { id: 'warmth_accept', label: 'Warmth & Acceptance', pillar: 'interpersonal', mode: 'egalitarian' },
  { id: 'informal_influence', label: 'Informal Influence', pillar: 'interpersonal', mode: 'egalitarian' },
  { id: 'social_support', label: 'Social Support', pillar: 'interpersonal', mode: 'egalitarian' },
  { id: 'relational_safety', label: 'Relational Safety', pillar: 'interpersonal', mode: 'egalitarian' },
  { id: 'formal_authority', label: 'Formal Authority', pillar: 'interpersonal', mode: 'hierarchical' },
  { id: 'command_capacity', label: 'Command Capacity', pillar: 'interpersonal', mode: 'hierarchical' },
  { id: 'decision_rights', label: 'Decision Rights', pillar: 'interpersonal', mode: 'hierarchical' },
  { id: 'hierarchical_control', label: 'Hierarchical Control', pillar: 'interpersonal', mode: 'hierarchical' },
  
  // Learning Forces (4)
  { id: 'unconditional_help', label: 'Unconditional Helping', pillar: 'learning', mode: 'egalitarian' },
  { id: 'resource_fluidity', label: 'Resource Fluidity', pillar: 'learning', mode: 'egalitarian' },
  { id: 'payforward_culture', label: 'Pay-it-Forward Culture', pillar: 'learning', mode: 'egalitarian' },
  { id: 'low_transaction', label: 'Low Transaction Costs', pillar: 'learning', mode: 'egalitarian' },
  { id: 'conditional_help', label: 'Conditional Help', pillar: 'learning', mode: 'hierarchical' },
  { id: 'favor_trading', label: 'Favor Trading', pillar: 'learning', mode: 'hierarchical' },
  { id: 'transactional_norms', label: 'Transactional Norms', pillar: 'learning', mode: 'hierarchical' },
  { id: 'resource_bargain', label: 'Resource Bargaining', pillar: 'learning', mode: 'hierarchical' },
  
  // Action Forces (4)
  { id: 'psych_safety', label: 'Psychological Safety', pillar: 'action', mode: 'egalitarian' },
  { id: 'challenge_welcome', label: 'Challenge Welcome', pillar: 'action', mode: 'egalitarian' },
  { id: 'innovation_space', label: 'Innovation Space', pillar: 'action', mode: 'egalitarian' },
  { id: 'open_dialogue', label: 'Open Dialogue', pillar: 'action', mode: 'egalitarian' },
  { id: 'status_quo', label: 'Status Quo Defense', pillar: 'action', mode: 'hierarchical' },
  { id: 'norm_enforce', label: 'Norm Enforcement', pillar: 'action', mode: 'hierarchical' },
  { id: 'change_suppress', label: 'Change Suppression', pillar: 'action', mode: 'hierarchical' },
  { id: 'stability_pref', label: 'Stability Preference', pillar: 'action', mode: 'hierarchical' },
  
  // Resilience Forces (4)
  { id: 'peer_competence', label: 'Peer Competence', pillar: 'resilience', mode: 'egalitarian' },
  { id: 'trust_intentions', label: 'Trust in Intentions', pillar: 'resilience', mode: 'egalitarian' },
  { id: 'role_model', label: 'Role Model Effect', pillar: 'resilience', mode: 'egalitarian' },
  { id: 'horizontal_deleg', label: 'Horizontal Delegation', pillar: 'resilience', mode: 'egalitarian' },
  { id: 'perceived_comp', label: 'Perceived Competence', pillar: 'resilience', mode: 'hierarchical' },
  { id: 'reputation_mgmt', label: 'Reputation Management', pillar: 'resilience', mode: 'hierarchical' },
  { id: 'approval_seek', label: 'Approval Seeking', pillar: 'resilience', mode: 'hierarchical' },
  { id: 'performance_vis', label: 'Performance Visibility', pillar: 'resilience', mode: 'hierarchical' }
];

// Force connections representing interdependencies
const forceConnections = [
  { from: 'collective_goal', to: 'team_success', strength: 0.9 },
  { from: 'team_success', to: 'joint_account', strength: 0.85 },
  { from: 'warmth_accept', to: 'social_support', strength: 0.9 },
  { from: 'informal_influence', to: 'relational_safety', strength: 0.8 },
  { from: 'unconditional_help', to: 'payforward_culture', strength: 0.85 },
  { from: 'resource_fluidity', to: 'low_transaction', strength: 0.8 },
  { from: 'psych_safety', to: 'challenge_welcome', strength: 0.9 },
  { from: 'innovation_space', to: 'open_dialogue', strength: 0.85 },
  { from: 'peer_competence', to: 'trust_intentions', strength: 0.9 },
  { from: 'role_model', to: 'horizontal_deleg', strength: 0.8 },
  { from: 'personal_advance', to: 'credit_attrib', strength: 0.85 },
  { from: 'competitive_pos', to: 'self_serving', strength: 0.8 },
  { from: 'formal_authority', to: 'command_capacity', strength: 0.9 },
  { from: 'decision_rights', to: 'hierarchical_control', strength: 0.85 },
  { from: 'conditional_help', to: 'favor_trading', strength: 0.85 },
  { from: 'transactional_norms', to: 'resource_bargain', strength: 0.8 },
  { from: 'status_quo', to: 'norm_enforce', strength: 0.9 },
  { from: 'change_suppress', to: 'stability_pref', strength: 0.85 },
  { from: 'perceived_comp', to: 'reputation_mgmt', strength: 0.9 },
  { from: 'approval_seek', to: 'performance_vis', strength: 0.85 },
  // Cross-pillar connections
  { from: 'collective_goal', to: 'unconditional_help', strength: 0.7 },
  { from: 'psych_safety', to: 'warmth_accept', strength: 0.75 },
  { from: 'peer_competence', to: 'social_support', strength: 0.7 },
  { from: 'formal_authority', to: 'conditional_help', strength: 0.7 },
  { from: 'personal_advance', to: 'competitive_pos', strength: 0.8 }
];

const visualStyles = [
  { id: 'orbital', label: 'Orbital Flow', icon: Sparkles },
  { id: 'wave', label: 'Wave Pattern', icon: Maximize2 },
  { id: 'pulse', label: 'Energy Pulse', icon: Sparkles }
];

function OrbitalVisualization({ blendRatio, hoveredPillar, selectedPillar, onPillarClick, onPillarHover }) {
  const centerX = 250;
  const centerY = 250;
  
  // Filter forces by mode
  const activeForces = forces.filter(f => 
    (blendRatio < 0.5 && f.mode === 'egalitarian') || 
    (blendRatio >= 0.5 && f.mode === 'hierarchical')
  );
  
  // Group forces by pillar
  const forcesByPillar = activeForces.reduce((acc, force) => {
    if (!acc[force.pillar]) acc[force.pillar] = [];
    acc[force.pillar].push(force);
    return acc;
  }, {});
  
  const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  
  return (
    <svg width="500" height="500" viewBox="0 0 500 500" className="w-full h-auto">
      <defs>
        <radialGradient id="centerGlow">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Center glow */}
      <motion.circle cx={centerX} cy={centerY} r="40" fill="url(#centerGlow)" animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} />

      {/* Force connections */}
      {forceConnections.map((conn, i) => {
        const fromForce = activeForces.find(f => f.id === conn.from);
        const toForce = activeForces.find(f => f.id === conn.to);
        if (!fromForce || !toForce) return null;
        
        const fromIndex = activeForces.indexOf(fromForce);
        const toIndex = activeForces.indexOf(toForce);
        const fromAngle = (fromIndex * 2 * Math.PI) / activeForces.length - Math.PI / 2;
        const toAngle = (toIndex * 2 * Math.PI) / activeForces.length - Math.PI / 2;
        const radius = 180;
        const x1 = centerX + radius * Math.cos(fromAngle);
        const y1 = centerY + radius * Math.sin(fromAngle);
        const x2 = centerX + radius * Math.cos(toAngle);
        const y2 = centerY + radius * Math.sin(toAngle);
        
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" strokeDasharray="2 2" />
        );
      })}

      {/* Forces orbiting */}
      {activeForces.map((force, index) => {
        const angle = (index * 2 * Math.PI) / activeForces.length - Math.PI / 2;
        const radius = 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const config = pillarConfig[force.pillar];

        return (
          <g key={force.id}>
            <motion.line x1={centerX} y1={centerY} x2={x} y2={y} stroke={config.color} strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 3" />
            <circle cx={x} cy={y} r="18" fill={config.color} fillOpacity="0.3" className="cursor-pointer" onMouseEnter={() => onPillarHover(force.pillar)} onMouseLeave={() => onPillarHover(null)} />
            <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[8px] font-medium pointer-events-none" fill="white">{force.label.split(' ')[0]}</text>
          </g>
        );
      })}

      {/* Mode indicator */}
      <text x={centerX} y={centerY} textAnchor="middle" className="text-sm font-bold" fill="white">{Math.round(blendRatio * 100)}%</text>
    </svg>
  );
}

function WaveVisualization({ blendRatio, hoveredPillar, selectedPillar, onPillarClick, onPillarHover }) {
  const width = 500;
  const height = 500;
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime(t => t + 0.05), 50);
    return () => clearInterval(interval);
  }, []);

  const activeForces = forces.filter(f => 
    (blendRatio < 0.5 && f.mode === 'egalitarian') || 
    (blendRatio >= 0.5 && f.mode === 'hierarchical')
  );

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Wave layers for forces */}
      {activeForces.map((force, index) => {
        const config = pillarConfig[force.pillar];
        const isActive = hoveredPillar === force.pillar;
        const yBase = 50 + (index * (height - 100)) / activeForces.length;
        
        const points = [];
        for (let i = 0; i <= width; i += 10) {
          const frequency = 0.02 + (index * 0.005);
          const amplitude = 15;
          const phase = time + index * 0.3;
          const y = yBase + Math.sin(i * frequency + phase) * amplitude;
          points.push(`${i},${y}`);
        }
        
        const pathD = `M 0,${yBase + 30} L ${points.join(' L ')} L ${width},${yBase + 30} Z`;

        return (
          <g key={force.id}>
            <motion.path d={pathD} fill={config.color} opacity={isActive ? 0.4 : 0.2} className="cursor-pointer" onMouseEnter={() => onPillarHover(force.pillar)} onMouseLeave={() => onPillarHover(null)} />
            <text x={10} y={yBase} className="text-[9px] font-medium pointer-events-none" fill={config.color}>{force.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function PulseVisualization({ blendRatio, hoveredPillar, selectedPillar, onPillarClick, onPillarHover }) {
  const centerX = 250;
  const centerY = 250;
  
  const activeForces = forces.filter(f => 
    (blendRatio < 0.5 && f.mode === 'egalitarian') || 
    (blendRatio >= 0.5 && f.mode === 'hierarchical')
  );

  return (
    <svg width="500" height="500" viewBox="0 0 500 500" className="w-full h-auto">
      {/* Forces with pulses */}
      {activeForces.map((force, index) => {
        const angle = (index * 2 * Math.PI) / activeForces.length - Math.PI / 2;
        const radius = 160;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const config = pillarConfig[force.pillar];
        const isActive = hoveredPillar === force.pillar;

        return (
          <g key={force.id}>
            {/* Pulse rings */}
            <motion.circle
              cx={x}
              cy={y}
              r="15"
              fill="none"
              stroke={config.color}
              strokeWidth="1.5"
              strokeOpacity="0.5"
              animate={{ scale: [1, 2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, delay: index * 0.1, repeat: Infinity, ease: "easeOut" }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />

            {/* Core node */}
            <circle cx={x} cy={y} r={isActive ? 16 : 12} fill={config.color} fillOpacity={isActive ? 0.6 : 0.4} className="cursor-pointer" onMouseEnter={() => onPillarHover(force.pillar)} onMouseLeave={() => onPillarHover(null)} />
            <text x={x} y={y + 25} textAnchor="middle" className="text-[8px] font-medium pointer-events-none" fill={config.color}>{force.label.split(' ')[0]}</text>
          </g>
        );
      })}

      {/* Center mode indicator */}
      <circle cx={centerX} cy={centerY} r="30" fill="rgba(139, 92, 246, 0.2)" />
      <text x={centerX} y={centerY} textAnchor="middle" className="text-sm font-bold" fill="white">{Math.round(blendRatio * 100)}%</text>
    </svg>
  );
}

export default function PillarVisualizationHub({ isOpen, onClose, blendRatio = 0, userScores = {} }) {
  const [visualStyle, setVisualStyle] = useState('orbital');
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [aiCoachPillar, setAiCoachPillar] = useState(null);

  const handlePillarClick = (pillar) => {
    setSelectedPillar(selectedPillar === pillar ? null : pillar);
    setAiCoachPillar(pillar);
  };

  const VisualizationComponent = {
    orbital: OrbitalVisualization,
    wave: WaveVisualization,
    pulse: PulseVisualization
  }[visualStyle];

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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 max-w-5xl w-full relative"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white z-10"
            >
              <X className="w-5 h-5" />
            </Button>

            <h2 className="text-2xl font-bold text-white mb-2">PILAR Visualization</h2>
            <p className="text-zinc-400 text-sm mb-4">Dynamic representation of mode transitions and interconnections</p>

            {/* Style selector */}
            <div className="flex gap-2 mb-6">
              {visualStyles.map((style) => {
                const StyleIcon = style.icon;
                return (
                  <Button
                    key={style.id}
                    size="sm"
                    onClick={() => setVisualStyle(style.id)}
                    className={cn(
                      "transition-all",
                      visualStyle === style.id
                        ? 'bg-violet-500/30 border-violet-500/50 text-violet-300'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                    )}
                    variant="outline"
                  >
                    <StyleIcon className="w-4 h-4 mr-2" />
                    {style.label}
                  </Button>
                );
              })}
            </div>

            <div className="flex gap-6">
              {/* Visualization */}
              <div className="flex-1 bg-black/20 rounded-2xl p-4 border border-white/5">
                <VisualizationComponent
                  blendRatio={blendRatio}
                  hoveredPillar={hoveredPillar}
                  selectedPillar={selectedPillar}
                  onPillarClick={handlePillarClick}
                  onPillarHover={setHoveredPillar}
                />
              </div>

              {/* Info Panel */}
              <div className="w-72 space-y-4">
                {/* Mode indicator */}
                <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-amber-500/10 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-400">Current Mode</span>
                    <span className="text-sm font-bold text-white">{Math.round(blendRatio * 100)}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-amber-500"
                      animate={{ width: `${blendRatio * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs">
                    <span className="text-indigo-400">Egalitarian</span>
                    <span className="text-amber-400">Hierarchical</span>
                  </div>
                </div>

                {/* Selected pillar info */}
                <AnimatePresence mode="wait">
                  {(selectedPillar || hoveredPillar) ? (
                    <motion.div
                      key={selectedPillar || hoveredPillar}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {React.createElement(pillarConfig[selectedPillar || hoveredPillar].icon, {
                          className: 'w-5 h-5',
                          style: { color: pillarConfig[selectedPillar || hoveredPillar].color }
                        })}
                        <span className="text-white font-medium capitalize">
                          {pillarConfig[selectedPillar || hoveredPillar].label}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Egalitarian Mode</p>
                          <p className="text-sm text-indigo-400">
                            {pillarConfig[selectedPillar || hoveredPillar].egalitarian}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-zinc-500 mb-1">Hierarchical Mode</p>
                          <p className="text-sm text-amber-400">
                            {pillarConfig[selectedPillar || hoveredPillar].hierarchical}
                          </p>
                        </div>
                        {userScores[selectedPillar || hoveredPillar] && (
                          <div>
                            <p className="text-xs text-zinc-500 mb-1">Your Score</p>
                            <p className="text-lg font-bold text-white">
                              {userScores[selectedPillar || hoveredPillar]}%
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="default"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <p className="text-zinc-400 text-sm">
                        Hover over or click a pillar to see how it transforms between modes.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Legend */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white text-xs font-medium mb-3">Visual Styles</p>
                  <div className="space-y-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-violet-400" />
                      <span>Orbital: Pillars orbit the center</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Maximize2 className="w-3 h-3 text-indigo-400" />
                      <span>Wave: Flowing wave patterns</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Pulse: Energy pulses from each pillar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Coach Modal */}
          {aiCoachPillar && (
            <AIPilarCoach
              pillar={aiCoachPillar}
              mode={blendRatio < 0.5 ? 'egalitarian' : 'hierarchical'}
              onClose={() => setAiCoachPillar(null)}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}