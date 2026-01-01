import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { pillarsInfo } from './pillarsData';

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield
};

const pillarColors = {
  purpose: '#8B5CF6',
  interpersonal: '#EC4899',
  learning: '#4F46E5',
  action: '#10B981',
  resilience: '#F59E0B'
};

// Forces data
const forces = {
  purpose: {
    egalitarian: [
      'Collective Goal Clarity',
      'Team Success Belief',
      'Shared Future Vision',
      'Joint Accountability'
    ],
    hierarchical: [
      'Personal Advancement',
      'Credit Attribution',
      'Self-Serving Goals',
      'Competitive Positioning'
    ]
  },
  interpersonal: {
    egalitarian: [
      'Warmth & Acceptance',
      'Informal Influence',
      'Social Support',
      'Relational Safety'
    ],
    hierarchical: [
      'Formal Authority',
      'Command Capacity',
      'Decision Rights',
      'Hierarchical Control'
    ]
  },
  learning: {
    egalitarian: [
      'Unconditional Helping',
      'Resource Fluidity',
      'Pay-it-Forward Culture',
      'Low Transaction Costs'
    ],
    hierarchical: [
      'Conditional Help',
      'Favor Trading',
      'Transactional Norms',
      'Resource Bargaining'
    ]
  },
  action: {
    egalitarian: [
      'Psychological Safety',
      'Challenge Welcome',
      'Innovation Space',
      'Open Dialogue'
    ],
    hierarchical: [
      'Status Quo Defense',
      'Norm Enforcement',
      'Change Suppression',
      'Stability Preference'
    ]
  },
  resilience: {
    egalitarian: [
      'Peer Competence',
      'Trust in Intentions',
      'Role Model Effect',
      'Horizontal Delegation'
    ],
    hierarchical: [
      'Perceived Competence',
      'Reputation Management',
      'Approval Seeking',
      'Performance Visibility'
    ]
  }
};

// Pillar connections for mini graph
const connections = [
  { from: 'purpose', to: 'interpersonal', egalitarian: true, hierarchical: true },
  { from: 'purpose', to: 'learning', egalitarian: true, hierarchical: true },
  { from: 'purpose', to: 'action', egalitarian: false, hierarchical: true },
  { from: 'purpose', to: 'resilience', egalitarian: true, hierarchical: true },
  { from: 'interpersonal', to: 'learning', egalitarian: true, hierarchical: false },
  { from: 'interpersonal', to: 'action', egalitarian: true, hierarchical: true },
  { from: 'interpersonal', to: 'resilience', egalitarian: true, hierarchical: false },
  { from: 'learning', to: 'action', egalitarian: true, hierarchical: true },
  { from: 'learning', to: 'resilience', egalitarian: true, hierarchical: true },
  { from: 'action', to: 'resilience', egalitarian: false, hierarchical: true }
];

const pillarDescriptions = {
  purpose: 'Purpose provides direction and meaning, defining what matters and why you pursue it.',
  interpersonal: 'Interpersonal skills enable connection, collaboration, and influence through relationships.',
  learning: 'Learning drives growth through curiosity, knowledge acquisition, and continuous improvement.',
  action: 'Action transforms intentions into results through discipline, execution, and momentum.',
  resilience: 'Resilience enables persistence through challenges via stress management and recovery.'
};

export default function Pillar3DDetailModal({ isOpen, onClose, pillar: pillarId, mode }) {
  if (!isOpen || !pillarId) return null;

  const pillar = pillarsInfo[mode]?.find(p => p.id === pillarId);
  if (!pillar) return null;

  const Icon = pillar.icon;
  const color = pillarColors[pillarId];
  const pillarForces = pillar.forces || [];

  // Get connections for this pillar in current mode
  const pillarConnections = connections.filter(conn => {
    const isConnected = conn.from === pillarId || conn.to === pillarId;
    const isActiveInMode = mode === 'egalitarian' ? conn.egalitarian : conn.hierarchical;
    return isConnected && isActiveInMode;
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Sparkles Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <SparklesCore
            id="detail-modal-sparkles"
            background="transparent"
            minSize={0.3}
            maxSize={1}
            particleDensity={60}
            className="w-full h-full"
            particleColor={pillarColors[pillar]}
            speed={0.4}
          />
        </div>
        
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0F0F12] border border-white/10 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0F0F12]/95 backdrop-blur-xl border-b border-white/10 p-6 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white capitalize">{pillar.title}</h2>
                  <p className="text-sm text-zinc-400">
                    {pillar.abbreviation} • {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-zinc-300 leading-relaxed">{pillar.fullDescription || pillar.description}</p>
            </div>

            {/* Mini Force Network Graph */}
            <div>
              <h3 className="text-white font-semibold mb-3">Connection Network</h3>
              <div className="relative h-64 rounded-2xl bg-black/40 border border-white/10 overflow-hidden p-4">
                <svg className="w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <filter id="glow-detail">
                      <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Pentagon outline */}
                  <polygon
                    points="50,15 80,32 70,65 30,65 20,32"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.5"
                  />
                  
                  {/* Connections */}
                  {pillarConnections.map((conn, i) => {
                    const positions = {
                      purpose: { x: 50, y: 15 },
                      interpersonal: { x: 80, y: 32 },
                      action: { x: 70, y: 65 },
                      learning: { x: 30, y: 65 },
                      resilience: { x: 20, y: 32 }
                    };
                    const from = positions[conn.from];
                    const to = positions[conn.to];
                    const midX = (from.x + to.x) / 2;
                    const midY = (from.y + to.y) / 2;
                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const controlX = midX - dy * 0.15;
                    const controlY = midY + dx * 0.15;
                    
                    return (
                      <motion.path
                        key={i}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        d={`M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`}
                        stroke={color}
                        strokeWidth="1"
                        fill="none"
                        filter="url(#glow-detail)"
                      />
                    );
                  })}
                  
                  {/* Pillars */}
                  {Object.entries({ purpose: { x: 50, y: 15 }, interpersonal: { x: 80, y: 32 }, action: { x: 70, y: 65 }, learning: { x: 30, y: 65 }, resilience: { x: 20, y: 32 } }).map(([id, pos]) => (
                    <motion.g key={id}>
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={id === pillarId ? 5 : 3}
                        fill={pillarColors[id]}
                        opacity={id === pillarId ? 1 : 0.4}
                        filter={id === pillarId ? "url(#glow-detail)" : undefined}
                      />
                      {id === pillarId && (
                        <motion.circle
                          cx={pos.x}
                          cy={pos.y}
                          r={7}
                          fill="none"
                          stroke={color}
                          strokeWidth="1"
                          opacity={0.3}
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1.2, opacity: 0 }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                      )}
                    </motion.g>
                  ))}
                </svg>
                
                {/* Connection count */}
                <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                  <p className="text-xs text-zinc-300">
                    {pillarConnections.length} connections in {mode} mode
                  </p>
                </div>
              </div>
            </div>

            {/* Forces */}
            <div>
              <h3 className="text-white font-semibold mb-3">
                Key Forces in {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode
              </h3>
              <div className="grid gap-3">
                {pillarForces.map((force, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                        style={{ backgroundColor: color }}
                      />
                      <div>
                        <p className="text-sm text-white font-medium mb-1">{force.name}</p>
                        <p className="text-xs text-zinc-400">{force.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Mode indicator */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: mode === 'egalitarian' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: mode === 'egalitarian' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(245, 158, 11, 0.3)'
              }}
            >
              <p className="text-sm text-zinc-300">
                Toggle mode in the main view to see how this pillar operates differently in {mode === 'egalitarian' ? 'hierarchical' : 'egalitarian'} settings.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}