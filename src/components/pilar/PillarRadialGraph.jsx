import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pillarConfig = {
  purpose: { icon: Compass, color: '#8B5CF6', label: 'Purpose' },
  interpersonal: { icon: Heart, color: '#EC4899', label: 'Interpersonal' },
  learning: { icon: BookOpen, color: '#6366F1', label: 'Learning' },
  action: { icon: Zap, color: '#10B981', label: 'Action' },
  resilience: { icon: Shield, color: '#F59E0B', label: 'Resilience' }
};

// 20 Forces
const forces = [
  { id: 'collective_goal', label: 'Collective Goal', pillar: 'purpose', mode: 'egalitarian' },
  { id: 'team_success', label: 'Team Success', pillar: 'purpose', mode: 'egalitarian' },
  { id: 'shared_vision', label: 'Shared Vision', pillar: 'purpose', mode: 'egalitarian' },
  { id: 'joint_account', label: 'Joint Account', pillar: 'purpose', mode: 'egalitarian' },
  { id: 'personal_advance', label: 'Personal Advance', pillar: 'purpose', mode: 'hierarchical' },
  { id: 'credit_attrib', label: 'Credit Attrib', pillar: 'purpose', mode: 'hierarchical' },
  { id: 'self_serving', label: 'Self-Serving', pillar: 'purpose', mode: 'hierarchical' },
  { id: 'competitive_pos', label: 'Competitive Pos', pillar: 'purpose', mode: 'hierarchical' },
  { id: 'warmth_accept', label: 'Warmth Accept', pillar: 'interpersonal', mode: 'egalitarian' },
  { id: 'informal_influence', label: 'Informal Influence', pillar: 'interpersonal', mode: 'egalitarian' },
  { id: 'social_support', label: 'Social Support', pillar: 'interpersonal', mode: 'egalitarian' },
  { id: 'relational_safety', label: 'Relational Safety', pillar: 'interpersonal', mode: 'egalitarian' },
  { id: 'formal_authority', label: 'Formal Authority', pillar: 'interpersonal', mode: 'hierarchical' },
  { id: 'command_capacity', label: 'Command Capacity', pillar: 'interpersonal', mode: 'hierarchical' },
  { id: 'decision_rights', label: 'Decision Rights', pillar: 'interpersonal', mode: 'hierarchical' },
  { id: 'hierarchical_control', label: 'Hierarchical Control', pillar: 'interpersonal', mode: 'hierarchical' },
  { id: 'unconditional_help', label: 'Unconditional Help', pillar: 'learning', mode: 'egalitarian' },
  { id: 'resource_fluidity', label: 'Resource Fluidity', pillar: 'learning', mode: 'egalitarian' },
  { id: 'payforward_culture', label: 'Pay-Forward', pillar: 'learning', mode: 'egalitarian' },
  { id: 'low_transaction', label: 'Low Transaction', pillar: 'learning', mode: 'egalitarian' },
  { id: 'conditional_help', label: 'Conditional Help', pillar: 'learning', mode: 'hierarchical' },
  { id: 'favor_trading', label: 'Favor Trading', pillar: 'learning', mode: 'hierarchical' },
  { id: 'transactional_norms', label: 'Transactional', pillar: 'learning', mode: 'hierarchical' },
  { id: 'resource_bargain', label: 'Resource Bargain', pillar: 'learning', mode: 'hierarchical' },
  { id: 'psych_safety', label: 'Psych Safety', pillar: 'action', mode: 'egalitarian' },
  { id: 'challenge_welcome', label: 'Challenge Welcome', pillar: 'action', mode: 'egalitarian' },
  { id: 'innovation_space', label: 'Innovation Space', pillar: 'action', mode: 'egalitarian' },
  { id: 'open_dialogue', label: 'Open Dialogue', pillar: 'action', mode: 'egalitarian' },
  { id: 'status_quo', label: 'Status Quo', pillar: 'action', mode: 'hierarchical' },
  { id: 'norm_enforce', label: 'Norm Enforce', pillar: 'action', mode: 'hierarchical' },
  { id: 'change_suppress', label: 'Change Suppress', pillar: 'action', mode: 'hierarchical' },
  { id: 'stability_pref', label: 'Stability Pref', pillar: 'action', mode: 'hierarchical' },
  { id: 'peer_competence', label: 'Peer Competence', pillar: 'resilience', mode: 'egalitarian' },
  { id: 'trust_intentions', label: 'Trust Intentions', pillar: 'resilience', mode: 'egalitarian' },
  { id: 'role_model', label: 'Role Model', pillar: 'resilience', mode: 'egalitarian' },
  { id: 'horizontal_deleg', label: 'Horizontal Deleg', pillar: 'resilience', mode: 'egalitarian' },
  { id: 'perceived_comp', label: 'Perceived Comp', pillar: 'resilience', mode: 'hierarchical' },
  { id: 'reputation_mgmt', label: 'Reputation Mgmt', pillar: 'resilience', mode: 'hierarchical' },
  { id: 'approval_seek', label: 'Approval Seek', pillar: 'resilience', mode: 'hierarchical' },
  { id: 'performance_vis', label: 'Performance Vis', pillar: 'resilience', mode: 'hierarchical' }
];

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
  { from: 'collective_goal', to: 'unconditional_help', strength: 0.7 },
  { from: 'psych_safety', to: 'warmth_accept', strength: 0.75 }
];

export default function PillarRadialGraph({ isOpen, onClose, blendRatio = 0, userScores = {} }) {
  const [hoveredForce, setHoveredForce] = useState(null);
  const [selectedForce, setSelectedForce] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const canvasRef = useRef(null);

  const centerX = 250;
  const centerY = 250;
  const radius = 180;
  
  const mode = blendRatio < 0.5 ? 'egalitarian' : 'hierarchical';
  const activeForces = forces.filter(f => f.mode === mode);

  const positions = activeForces.reduce((acc, force, index) => {
    const angle = (index * 2 * Math.PI) / activeForces.length - Math.PI / 2;
    acc[force.id] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      force
    };
    return acc;
  }, {});

  const getRelevantConnections = (forceId) => {
    if (!forceId) return forceConnections;
    return forceConnections.filter(c => c.from === forceId || c.to === forceId);
  };

  const isConnectionActive = (connection) => {
    if (hoveredConnection) return hoveredConnection === connection;
    if (!hoveredForce && !selectedForce) return true;
    const activeForce = selectedForce || hoveredForce;
    return connection.from === activeForce || connection.to === activeForce;
  };

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
            className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 max-w-4xl w-full relative"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>

            <h2 className="text-2xl font-bold text-white mb-2">PILAR Interconnections</h2>
            <p className="text-zinc-400 text-sm mb-6">Explore how the five pillars support and strengthen each other</p>

            <div className="flex gap-6">
              {/* Graph */}
              <div className="flex-1 relative">
                <svg
                  ref={canvasRef}
                  width="500"
                  height="500"
                  viewBox="0 0 500 500"
                  className="w-full h-auto"
                >
                  {/* Connections */}
                  <g>
                    {forceConnections.map((conn, i) => {
                      const from = positions[conn.from];
                      const to = positions[conn.to];
                      if (!from || !to) return null;
                      
                      const isActive = isConnectionActive(conn);
                      const isHovered = hoveredConnection === conn;
                      const fromColor = pillarConfig[from.force.pillar].color;
                      const toColor = pillarConfig[to.force.pillar].color;

                      return (
                        <motion.line
                          key={i}
                          x1={from.x}
                          y1={from.y}
                          x2={to.x}
                          y2={to.y}
                          stroke={fromColor}
                          strokeWidth={isHovered ? 3 : isActive ? 1.5 : 0.5}
                          opacity={isActive ? conn.strength : 0.15}
                          strokeDasharray="3 3"
                          onMouseEnter={() => setHoveredConnection(conn)}
                          onMouseLeave={() => setHoveredConnection(null)}
                          className="cursor-pointer"
                        />
                      );
                    })}
                  </g>

                  {/* Force Nodes */}
                  {Object.entries(positions).map(([forceId, data]) => {
                    const { x, y, force } = data;
                    const config = pillarConfig[force.pillar];
                    const isHovered = hoveredForce === forceId;
                    const isSelected = selectedForce === forceId;

                    return (
                      <g
                        key={forceId}
                        onMouseEnter={() => setHoveredForce(forceId)}
                        onMouseLeave={() => setHoveredForce(null)}
                        onClick={() => setSelectedForce(selectedForce === forceId ? null : forceId)}
                        className="cursor-pointer"
                      >
                        {(isHovered || isSelected) && (
                          <motion.circle cx={x} cy={y} r="25" fill={config.color} opacity="0.15" initial={{ scale: 0 }} animate={{ scale: 1.3 }} transition={{ duration: 0.2 }} />
                        )}

                        <circle cx={x} cy={y} r={isHovered || isSelected ? "18" : "14"} fill={config.color} opacity="0.6" />
                        
                        <text x={x} y={y} textAnchor="middle" dominantBaseline="middle" className="text-[9px] font-bold pointer-events-none" fill="white">{force.label.split(' ')[0]}</text>
                        
                        <text x={x} y={y + 28} textAnchor="middle" className="text-[8px] font-medium pointer-events-none" fill={isHovered || isSelected ? config.color : '#6B7280'}>{force.label}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Info Panel */}
              <div className="w-64 space-y-4">
                <AnimatePresence mode="wait">
                  {(selectedForce || hoveredForce) ? (
                    <motion.div
                      key="force-info"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: pillarConfig[positions[selectedForce || hoveredForce]?.force.pillar]?.color }} />
                        <span className="text-white font-medium text-sm">{positions[selectedForce || hoveredForce]?.force.label}</span>
                      </div>
                      <p className="text-zinc-500 text-xs mb-2">Pillar: <span className="text-zinc-400 capitalize">{positions[selectedForce || hoveredForce]?.force.pillar}</span></p>
                      <p className="text-zinc-400 text-xs mb-3">{selectedForce ? 'Click again to deselect' : 'Click to lock selection'}</p>
                      <div className="space-y-2">
                        <p className="text-zinc-500 text-xs font-medium">Connections:</p>
                        {getRelevantConnections(selectedForce || hoveredForce).map((conn, i) => {
                          const otherId = conn.from === (selectedForce || hoveredForce) ? conn.to : conn.from;
                          const other = positions[otherId];
                          if (!other) return null;
                          return (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: pillarConfig[other.force.pillar].color }} />
                              <span className="text-zinc-400">{other.force.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="default-info" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-zinc-400 text-sm">Explore the 20 forces in {mode} mode.</p>
                      <p className="text-zinc-500 text-xs mt-2">Hover or click forces to see connections.</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Legend */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-white text-xs font-medium mb-2">Legend</p>
                  <div className="space-y-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500 rounded" />
                      <span>Strong connection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-0.5 bg-gradient-to-r from-violet-500/40 to-pink-500/40 rounded" />
                      <span>Moderate connection</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}