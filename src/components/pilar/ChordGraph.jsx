import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, X } from 'lucide-react';

const pillarIcons = {
  purpose: Compass, normexp: Compass, divsexp: Compass,
  interpersonal: Heart, dirrecip: Heart, indrecip: Heart,
  learning: BookOpen, incresp: BookOpen, outresp: BookOpen,
  action: Zap, ownprosp: Zap, grpprosp: Zap,
  resilience: Shield, status: Shield, popularity: Shield
};

const pillarColors = {
  purpose: '#8B5CF6', normexp: '#8B5CF6', divsexp: '#8B5CF6',
  interpersonal: '#EC4899', dirrecip: '#EC4899', indrecip: '#EC4899',
  learning: '#4F46E5', incresp: '#4F46E5', outresp: '#4F46E5',
  action: '#10B981', ownprosp: '#10B981', grpprosp: '#10B981',
  resilience: '#F59E0B', status: '#F59E0B', popularity: '#F59E0B'
};

export const connections = [
  { from: 'divsexp', to: 'indrecip', label: 'Growth Mindset', strength: 0.85, modes: ['egalitarian'] },
  { from: 'divsexp', to: 'grpprosp', label: 'Font of Wisdom', strength: 0.80, modes: ['egalitarian'] },
  { from: 'divsexp', to: 'outresp', label: 'Safe to Challenge', strength: 0.78, modes: ['egalitarian'] },
  { from: 'indrecip', to: 'popularity', label: 'Spread the Love', strength: 0.88, modes: ['egalitarian'] },
  { from: 'indrecip', to: 'grpprosp', label: 'Mucking in Together', strength: 0.90, modes: ['egalitarian'] },
  { from: 'popularity', to: 'divsexp', label: 'Making Fetch Happen', strength: 0.82, modes: ['egalitarian'] },
  { from: 'popularity', to: 'grpprosp', label: 'Knowing What\'s Best', strength: 0.75, modes: ['egalitarian'] },
  { from: 'grpprosp', to: 'outresp', label: 'Scapegoating', strength: 0.85, modes: ['egalitarian'] },
  { from: 'outresp', to: 'grpprosp', label: 'Quality Street', strength: 0.92, modes: ['egalitarian'] },
  { from: 'outresp', to: 'indrecip', label: 'I\'ll Just Do It Myself', strength: 0.87, modes: ['egalitarian'] },
  { from: 'normexp', to: 'dirrecip', label: 'Predictability Preferred', strength: 0.85, modes: ['hierarchical'] },
  { from: 'normexp', to: 'ownprosp', label: 'Rewards of Conformity', strength: 0.80, modes: ['hierarchical'] },
  { from: 'dirrecip', to: 'status', label: 'Pick and Stick', strength: 0.75, modes: ['hierarchical'] },
  { from: 'status', to: 'ownprosp', label: 'Built-in Advantage', strength: 0.90, modes: ['hierarchical'] },
  { from: 'incresp', to: 'ownprosp', label: 'External Locus of Control', strength: 0.88, modes: ['hierarchical'] }
];

export default function ChordGraph({ mode, pillarsInfo, onPillarClick, onConnectionClick, searchQuery = '' }) {
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [particles, setParticles] = useState([]);
  const [pulseTime, setPulseTime] = useState(0);
  const [tracingPath, setTracingPath] = useState({ from: null, to: null });
  const svgRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  const currentPillars = pillarsInfo || [];
  const activeConnections = connections.filter(c => c.modes.includes(mode));
  
  // Animation loop for pulse
  useEffect(() => {
    const animate = () => {
      setPulseTime(prev => (prev + 0.02) % (Math.PI * 2));
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);
  
  // Calculate connection stats for each pillar
  const pillarStats = currentPillars.reduce((acc, pillar) => {
    const incoming = activeConnections.filter(c => c.to === pillar.id).length;
    const outgoing = activeConnections.filter(c => c.from === pillar.id).length;
    const avgStrength = activeConnections
      .filter(c => c.from === pillar.id || c.to === pillar.id)
      .reduce((sum, c) => sum + c.strength, 0) / (incoming + outgoing || 1);
    
    acc[pillar.id] = { incoming, outgoing, total: incoming + outgoing, avgStrength };
    return acc;
  }, {});
  
  const centerX = 400;
  const centerY = 400;
  const radius = 280;
  
  const pillarPositions = currentPillars.map((pillar, index) => {
    const angle = (index / currentPillars.length) * 2 * Math.PI - Math.PI / 2;
    return {
      ...pillar,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      angle
    };
  });

  const getPath = (from, to, strength) => {
    const fromPos = pillarPositions.find(p => p.id === from);
    const toPos = pillarPositions.find(p => p.id === to);
    if (!fromPos || !toPos) return '';

    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    
    const controlOffset = dr * 0.3 * strength;
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    const perpX = -dy / dr;
    const perpY = dx / dr;
    const controlX = midX + perpX * controlOffset;
    const controlY = midY + perpY * controlOffset;

    return `M ${fromPos.x} ${fromPos.y} Q ${controlX} ${controlY} ${toPos.x} ${toPos.y}`;
  };
  
  const getPointOnPath = (from, to, strength, t) => {
    const fromPos = pillarPositions.find(p => p.id === from);
    const toPos = pillarPositions.find(p => p.id === to);
    if (!fromPos || !toPos) return { x: 0, y: 0 };
    
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    const controlOffset = dr * 0.3 * strength;
    const midX = (fromPos.x + toPos.x) / 2;
    const midY = (fromPos.y + toPos.y) / 2;
    const perpX = -dy / dr;
    const perpY = dx / dr;
    const controlX = midX + perpX * controlOffset;
    const controlY = midY + perpY * controlOffset;
    
    const x = (1 - t) * (1 - t) * fromPos.x + 2 * (1 - t) * t * controlX + t * t * toPos.x;
    const y = (1 - t) * (1 - t) * fromPos.y + 2 * (1 - t) * t * controlY + t * t * toPos.y;
    return { x, y };
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative">
      <svg ref={svgRef} width="800" height="800" className="max-w-full max-h-full">
        <defs>
          {activeConnections.map((conn, idx) => (
            <linearGradient key={idx} id={`gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={pillarColors[conn.from]} stopOpacity="0.6" />
              <stop offset="100%" stopColor={pillarColors[conn.to]} stopOpacity="0.6" />
            </linearGradient>
          ))}
        </defs>

        {/* Connection Paths */}
        <g>
          {activeConnections.map((conn, idx) => {
            const isActive = hoveredConnection === conn || hoveredPillar === conn.from || hoveredPillar === conn.to;
            const pulseOpacity = isActive ? 0.3 + Math.sin(pulseTime * 2) * 0.2 : 0;
            
            return (
              <g key={idx}>
                {/* Main thicker path */}
                <motion.path
                  d={getPath(conn.from, conn.to, conn.strength)}
                  fill="none"
                  stroke={`url(#gradient-${idx})`}
                  strokeWidth={isActive ? 6 : 4}
                  opacity={isActive ? 0.9 : 0}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredConnection(conn)}
                  onMouseLeave={() => setHoveredConnection(null)}
                  onClick={() => {
                    setSelectedConnection(conn);
                    onConnectionClick?.(conn);
                  }}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: idx * 0.05 }}
                />
                
                {/* Floating label on hover */}
                {isActive && (
                  <g className="pointer-events-none">
                    <motion.text
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {[0.5].map((t) => {
                        const point = getPointOnPath(conn.from, conn.to, conn.strength, t);
                        return (
                          <tspan
                            key={t}
                            x={point.x}
                            y={point.y - 15}
                            textAnchor="middle"
                            className="text-xs font-semibold fill-white"
                            style={{
                              textShadow: '0 0 8px rgba(0,0,0,0.8)',
                              filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))'
                            }}
                          >
                            {conn.label}
                          </tspan>
                        );
                      })}
                    </motion.text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Pillar Nodes */}
        <g>
          {pillarPositions.map((pillar, idx) => {
            const Icon = pillarIcons[pillar.id] || Compass;
            const stats = pillarStats[pillar.id] || { incoming: 0, outgoing: 0, total: 0, avgStrength: 0 };
            const isHovered = hoveredPillar === pillar.id;
            const baseScale = 1 + (stats.total / 10) * 0.3; // 3D depth based on connections
            const breathePulse = 1 + Math.sin(pulseTime + idx) * 0.05;
            const hoverScale = isHovered ? 1.3 : 1;
            
            return (
              <g key={pillar.id}>
                {/* Ripple effect on click */}
                {isHovered && (
                  <motion.circle
                    cx={pillar.x}
                    cy={pillar.y}
                    r={30}
                    fill="none"
                    stroke={pillarColors[pillar.id]}
                    strokeWidth={2}
                    initial={{ r: 30, opacity: 0.6 }}
                    animate={{ r: 80, opacity: 0 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                
                {/* Outer glow with pulse */}
                <motion.circle
                  cx={pillar.x}
                  cy={pillar.y}
                  r={40 * baseScale * breathePulse * hoverScale}
                  fill={pillarColors[pillar.id]}
                  opacity={0.2}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredPillar(pillar.id)}
                  onMouseLeave={() => setHoveredPillar(null)}
                  onClick={() => onPillarClick?.(pillar.id)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }}
                  style={{ filter: 'blur(8px)' }}
                />
                
                {/* Main node with depth */}
                <motion.circle
                  cx={pillar.x}
                  cy={pillar.y}
                  r={30 * baseScale}
                  fill={pillarColors[pillar.id]}
                  opacity={0.9}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPillar(pillar.id)}
                  onMouseLeave={() => setHoveredPillar(null)}
                  onClick={() => onPillarClick?.(pillar.id)}
                  animate={{
                    scale: hoverScale * breathePulse,
                  }}
                  transition={{
                    scale: { duration: 0.3, type: 'spring', stiffness: 300 }
                  }}
                />
                {/* Icon with rotation on hover */}
                <foreignObject
                  x={pillar.x - 15}
                  y={pillar.y - 15}
                  width="30"
                  height="30"
                  className="pointer-events-none"
                >
                  <motion.div 
                    className="flex items-center justify-center w-full h-full"
                    animate={{
                      rotate: isHovered ? 360 : 0,
                      scale: isHovered ? 1.2 : 1
                    }}
                    transition={{
                      rotate: { duration: 0.6, ease: 'easeInOut' },
                      scale: { duration: 0.2 }
                    }}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </motion.div>
                </foreignObject>
                {/* Pillar label - 2 lines above pillar */}
                <g className="pointer-events-none">
                  {/* Title (line 1) */}
                  <motion.text
                    x={pillar.x}
                    y={pillar.y - 55}
                    textAnchor="middle"
                    className="text-sm font-bold fill-white"
                    style={{
                      textShadow: '0 0 8px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8)',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))'
                    }}
                    animate={{
                      scale: isHovered ? 1.15 : 1
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {pillar.title || pillar.id}
                  </motion.text>
                  {/* Abbreviation (line 2) */}
                  <motion.text
                    x={pillar.x}
                    y={pillar.y - 40}
                    textAnchor="middle"
                    className="text-xs font-medium"
                    style={{ fill: pillarColors[pillar.id], opacity: 0.8 }}
                    animate={{
                      opacity: isHovered ? 1 : 0.8
                    }}
                  >
                    {pillar.abbreviation || ''}
                  </motion.text>
                </g>
                
                {/* Enhanced Indicators with animations */}
                <g className="pointer-events-none">
                  {/* Incoming connections indicator with pulse */}
                  <motion.circle
                    cx={pillar.x - 45}
                    cy={pillar.y}
                    r={8}
                    fill="#10B981"
                    opacity={0.9}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: idx * 0.2
                    }}
                  />
                  <motion.text
                    x={pillar.x - 45}
                    y={pillar.y + 1}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-white"
                    dominantBaseline="middle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  >
                    {stats.incoming}
                  </motion.text>
                  
                  {/* Outgoing connections indicator with pulse */}
                  <motion.circle
                    cx={pillar.x + 45}
                    cy={pillar.y}
                    r={8}
                    fill="#F59E0B"
                    opacity={0.9}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: 0.5 + idx * 0.2
                    }}
                  />
                  <motion.text
                    x={pillar.x + 45}
                    y={pillar.y + 1}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-white"
                    dominantBaseline="middle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
                  >
                    {stats.outgoing}
                  </motion.text>
                  
                  {/* Animated strength indicator bar */}
                  <rect
                    x={pillar.x - 20}
                    y={pillar.y - 50}
                    width={40}
                    height={6}
                    rx={3}
                    fill="rgba(255,255,255,0.2)"
                  />
                  <motion.rect
                    x={pillar.x - 20}
                    y={pillar.y - 50}
                    height={6}
                    rx={3}
                    fill={pillarColors[pillar.id]}
                    opacity={0.9}
                    initial={{ width: 0 }}
                    animate={{ width: 40 * stats.avgStrength }}
                    transition={{ duration: 1, delay: 0.5 + idx * 0.1, type: 'spring' }}
                  />
                  
                  {/* Strength percentage on hover */}
                  {isHovered && (
                    <motion.text
                      x={pillar.x}
                      y={pillar.y - 60}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-white"
                      initial={{ opacity: 0, y: pillar.y - 50 }}
                      animate={{ opacity: 1, y: pillar.y - 60 }}
                      transition={{ duration: 0.3 }}
                    >
                      {Math.round(stats.avgStrength * 100)}% avg
                    </motion.text>
                  )}
                </g>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Connection Info Modal */}
      <AnimatePresence>
        {selectedConnection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 max-w-md shadow-2xl"
          >
            <button
              onClick={() => setSelectedConnection(null)}
              className="absolute top-3 right-3 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="mb-2">
              <span className="text-sm font-medium" style={{ color: pillarColors[selectedConnection.from] }}>
                {currentPillars.find(p => p.id === selectedConnection.from)?.abbreviation || selectedConnection.from}
              </span>
              <span className="text-zinc-400 mx-2">→</span>
              <span className="text-sm font-medium" style={{ color: pillarColors[selectedConnection.to] }}>
                {currentPillars.find(p => p.id === selectedConnection.to)?.abbreviation || selectedConnection.to}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{selectedConnection.label}</h3>
            <p className="text-sm text-zinc-300 mb-3">{selectedConnection.detail || 'Connection strength: ' + (selectedConnection.strength * 100) + '%'}</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedConnection.strength * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-xs text-zinc-400">{Math.round(selectedConnection.strength * 100)}%</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
}