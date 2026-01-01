import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { Button } from '@/components/ui/button';

const pillarConfig = {
  egalitarian: {
    divsexp: { icon: Compass, color: 'violet', label: 'DivsExp', fullName: 'Diverse Expression', position: { x: 50, y: 10 } },
    indrecip: { icon: Heart, color: 'pink', label: 'IndRecip', fullName: 'Indirect Reciprocity', position: { x: 90, y: 35 } },
    grpprosp: { icon: Zap, color: 'emerald', label: 'GrpProsp', fullName: 'Group Prospects', position: { x: 75, y: 80 } },
    outresp: { icon: BookOpen, color: 'amber', label: 'OutResp', fullName: 'Outgoing Respect', position: { x: 25, y: 80 } },
    popularity: { icon: Shield, color: 'indigo', label: 'Popularity', fullName: 'Popularity', position: { x: 10, y: 35 } }
  },
  hierarchical: {
    normexp: { icon: Compass, color: 'violet', label: 'NormExp', fullName: 'Normative Expression', position: { x: 50, y: 10 } },
    dirrecip: { icon: Heart, color: 'pink', label: 'DirRecip', fullName: 'Direct Reciprocity', position: { x: 80, y: 30 } },
    ownprosp: { icon: Zap, color: 'emerald', label: 'OwnProsp', fullName: 'Own Prospects', position: { x: 70, y: 75 } },
    incresp: { icon: BookOpen, color: 'amber', label: 'IncResp', fullName: 'Incoming Respect', position: { x: 30, y: 75 } },
    status: { icon: Shield, color: 'indigo', label: 'Status', fullName: 'Status', position: { x: 20, y: 30 } }
  }
};

// Generate all connections between all pillars
const generateAllConnections = (mode) => {
  const pillars = mode === 'hierarchical' 
    ? ['normexp', 'dirrecip', 'status', 'ownprosp', 'incresp']
    : ['divsexp', 'indrecip', 'popularity', 'grpprosp', 'outresp'];
  
  const connections = [];
  
  // Create connections between all pillars
  for (let i = 0; i < pillars.length; i++) {
    for (let j = i + 1; j < pillars.length; j++) {
      const from = pillars[i];
      const to = pillars[j];
      
      // Get pillar data from pillarsInfo
      const fromPillar = pillarsInfo[mode]?.find(p => p.id === from);
      const toPillar = pillarsInfo[mode]?.find(p => p.id === to);
      
      if (fromPillar && toPillar) {
        // Use forces from the pillar data
        const forces = fromPillar.forces || [];
        const force = forces[j % forces.length] || forces[0] || { name: 'Connection', description: 'Interconnected force' };
        
        const colorMap = {
          violet: '#8B5CF6',
          pink: '#EC4899',
          indigo: '#4F46E5',
          emerald: '#10B981',
          amber: '#F59E0B'
        };
        
        connections.push({
          from,
          to,
          label: force.name,
          detail: force.description,
          strength: 0.7 + Math.random() * 0.25, // Random strength between 0.7-0.95
          modes: [mode],
          color: colorMap[fromPillar.color] || '#8B5CF6'
        });
      }
    }
  }
  
  return connections;
};

const connections = [
  ...generateAllConnections('hierarchical'),
  ...generateAllConnections('egalitarian')
];

export default function PillarConnectionGraph({ mode: initialMode = 'egalitarian', authorityLevel = 0.5, onPillarClick }) {
  const [mode, setMode] = useState(initialMode);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [hoveredForce, setHoveredForce] = useState(null);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const svgRef = useRef(null);
  
  // Get current pillar info from pillarsInfo
  const currentPillars = pillarsInfo[mode] || [];

  const getConnectionPath = (from, to) => {
    const fromPos = pillarConfig[mode][from].position;
    const toPos = pillarConfig[mode][to].position;
    
    const x1 = fromPos.x;
    const y1 = fromPos.y;
    const x2 = toPos.x;
    const y2 = toPos.y;
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const offsetX = (y2 - y1) * 0.02;
    const offsetY = (x1 - x2) * 0.02;
    
    return `M ${x1} ${y1} Q ${midX + offsetX} ${midY + offsetY} ${x2} ${y2}`;
  };

  const isConnectionHighlighted = (connection) => {
    const isInMode = connection.modes.includes(mode);
    if (!isInMode) return 'translucent';
    
    // Enhanced hover highlighting - show connections when hovering over a pillar
    if (hoveredPillar && (connection.from === hoveredPillar || connection.to === hoveredPillar)) {
      return 'active';
    }
    
    // In hierarchical mode, only animate on hover
    if (mode === 'hierarchical') {
      if (hoveredConnection === connection) return 'active';
      if (hoveredPillar) return 'inactive';
      return 'inactive';
    }
    
    // In egalitarian mode, connections are equal and subtle
    if (hoveredConnection === connection) return 'active';
    if (hoveredPillar) return 'inactive';
    return 'neutral';
  };

  const getConnectionColor = (connection, highlight) => {
    const isInMode = connection.modes.includes(mode);
    
    // Apply authority boost to opacity in hierarchical mode
    const authorityBoost = mode === 'hierarchical' ? (1 + authorityLevel * 0.5) : 1;
    
    if (highlight === 'translucent') return 'rgba(255,255,255,0.08)';
    if (highlight === 'inactive' && isInMode) return `rgba(255,255,255,${0.20 * authorityBoost})`;
    if (highlight === 'inactive' && !isInMode) return 'rgba(255,255,255,0.08)';
    
    if (highlight === 'neutral') {
      return `url(#gradient-${connection.from}-${connection.to})`;
    }
    
    if (highlight === 'active') {
      return `url(#gradient-${connection.from}-${connection.to})`;
    }
    
    if (highlight === 'related') {
      return `url(#gradient-${connection.from}-${connection.to})`;
    }
    
    return 'rgba(255,255,255,0.15)';
  };

  const getConnectionWidth = (connection, highlight) => {
    const strength = connection.strength || 0.5;
    const isInMode = connection.modes.includes(mode);
    
    // Apply authority boost in hierarchical mode only
    const authorityBoost = mode === 'hierarchical' ? (1 + authorityLevel * 0.8) : 1;
    const effectiveStrength = strength * authorityBoost;
    
    if (highlight === 'translucent') return 0.3;
    
    if (highlight === 'active') {
      if (mode === 'egalitarian') return 1.2; // Subtle in egalitarian
      if (effectiveStrength >= 0.9) return 2.5;
      if (effectiveStrength >= 0.8) return 2;
      return 1.5;
    }
    
    if (highlight === 'related') {
      if (mode === 'egalitarian') return 0.9;
      if (effectiveStrength >= 0.9) return 1.5;
      return 1;
    }
    
    if (highlight === 'neutral') return mode === 'egalitarian' ? 0.7 : 0.6; // Equal weight in egalitarian
    
    if (highlight === 'inactive' && !isInMode) return 0.3;
    
    return 0.6;
  };

  const getMidPoint = (from, to) => {
    const fromPos = pillarConfig[mode][from].position;
    const toPos = pillarConfig[mode][to].position;
    
    const x1 = fromPos.x;
    const y1 = fromPos.y;
    const x2 = toPos.x;
    const y2 = toPos.y;
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const offsetX = (y2 - y1) * 0.1;
    const offsetY = (x1 - x2) * 0.1;
    
    return { x: midX + offsetX, y: midY + offsetY };
  };

  const isPillarHighlighted = (pillar) => {
    if (hoveredPillar === pillar || selectedPillar === pillar) return 'active';
    if (hoveredConnection && (hoveredConnection.from === pillar || hoveredConnection.to === pillar)) return 'related';
    if (selectedPillar && (selectedPillar === pillar || connections.some(c => (c.from === selectedPillar && c.to === pillar) || (c.to === selectedPillar && c.from === pillar)))) return 'related';
    if ((hoveredPillar || selectedPillar) && mode === 'hierarchical') return 'inactive';
    return 'neutral';
  };

  // Fisheye effect calculation
  const getFisheyeScale = (pillarId) => {
    if (!selectedPillar) return 1;
    if (pillarId === selectedPillar) return 1.5;
    
    const isConnected = connections.some(
      c => (c.from === selectedPillar && c.to === pillarId) || 
           (c.to === selectedPillar && c.from === pillarId)
    );
    
    return isConnected ? 1.2 : 0.85;
  };

  const getFisheyePosition = (pillarId, basePos) => {
    if (!selectedPillar || pillarId === selectedPillar) return basePos;
    
    const selectedPos = pillarConfig[mode][selectedPillar]?.position;
    if (!selectedPos) return basePos;
    
    const dx = basePos.x - selectedPos.x;
    const dy = basePos.y - selectedPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 30) {
      const pushFactor = 1.3;
      return {
        x: selectedPos.x + dx * pushFactor,
        y: selectedPos.y + dy * pushFactor
      };
    }
    
    return basePos;
  };

  // Animation loop for flow particles
  React.useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationProgress((prev) => (prev + 0.01) % 1);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Mouse tracking for particle effects
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
    {/* Explore Pillars Section */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="mb-8 text-center"
    >
      <h2 className="text-2xl font-semibold text-white mb-2">Explore Pillars</h2>
      <p className="text-zinc-400 text-sm">Click on any pillar below to discover its forces and connections</p>
      
      {/* Mode Toggle */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          onClick={() => setMode('egalitarian')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            mode === 'egalitarian'
              ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
              : 'text-zinc-400 hover:text-white bg-white/5'
          }`}
        >
          Egalitarian
        </button>
        <button
          onClick={() => setMode('hierarchical')}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            mode === 'hierarchical'
              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
              : 'text-zinc-400 hover:text-white bg-white/5'
          }`}
        >
          Hierarchical
        </button>
      </div>
    </motion.div>

    <div className="w-full aspect-[4/3] relative bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Background particles - subtle */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => {
          const baseX = (i * 7.3) % 100;
          const baseY = (i * 11.7) % 100;
          const dx = mousePosition.x - baseX;
          const dy = mousePosition.y - baseY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const influence = Math.max(0, 1 - distance / 60);
          
          return (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-white/15"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
              }}
              animate={{
                x: influence * dx * 0.2,
                y: influence * dy * 0.2,
                scale: 1 + influence * 0.3,
                opacity: 0.15 + influence * 0.2,
              }}
              transition={{
                type: 'spring',
                stiffness: 80,
                damping: 25,
              }}
            />
          );
        })}
      </div>
      
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Unique gradients for each connection */}
          {connections.map((conn, i) => {
            const colorMap = {
              violet: '#8B5CF6',
              pink: '#EC4899',
              indigo: '#4F46E5',
              emerald: '#10B981',
              amber: '#F59E0B'
            };
            const fromPillar = pillarConfig[mode][conn.from];
            const toPillar = pillarConfig[mode][conn.to];
            if (!fromPillar || !toPillar) return null;
            
            return (
              <linearGradient 
                key={i}
                id={`gradient-${conn.from}-${conn.to}`}
                x1="0%" y1="0%" x2="100%" y2="0%"
              >
                <stop offset="0%" stopColor={colorMap[fromPillar.color]} stopOpacity={conn.strength || 0.5} />
                <stop offset="100%" stopColor={colorMap[toPillar.color]} stopOpacity={conn.strength || 0.5} />
              </linearGradient>
            );
          })}
        </defs>



        {/* Connections */}
        {connections.map((conn, i) => {
          if (!pillarConfig[mode][conn.from] || !pillarConfig[mode][conn.to]) return null;

          const highlight = isConnectionHighlighted(conn);
          const strokeColor = getConnectionColor(conn, highlight);
          const strokeWidth = getConnectionWidth(conn, highlight);
          const isStrong = conn.strength >= 0.85;
          const isInMode = conn.modes.includes(mode);

          return (
            <g key={i}>
              {/* Base path - always visible */}
              <motion.path
                d={getConnectionPath(conn.from, conn.to)}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: highlight === 'translucent' ? 0.15 : highlight === 'inactive' ? 0.3 : highlight === 'neutral' ? 0.5 : highlight === 'related' ? 0.7 : 0.8
                }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                onMouseEnter={() => setHoveredConnection(conn)}
                onMouseLeave={() => setHoveredConnection(null)}
                className="cursor-pointer"
              />

              {/* Enhanced glow effect on hover - all active connections */}
              {highlight === 'active' && isInMode && (
                <>
                  <motion.path
                    d={getConnectionPath(conn.from, conn.to)}
                    fill="none"
                    stroke={conn.color}
                    strokeWidth={strokeWidth * 2.5}
                    opacity={0.3}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ 
                      pathLength: 1, 
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                    filter="url(#softGlow)"
                    style={{ pointerEvents: 'none' }}
                  />

                  {/* Flowing particles on active connections */}
                  {[0, 0.25, 0.5, 0.75].map((offset) => {
                    const progress = (animationProgress + offset) % 1;
                    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    pathEl.setAttribute('d', getConnectionPath(conn.from, conn.to));
                    const totalLength = pathEl.getTotalLength();

                    // Direction from hovered pillar
                    const isFromHovered = conn.from === hoveredPillar;
                    const direction = isFromHovered ? progress : (1 - progress);
                    const point = pathEl.getPointAtLength(direction * totalLength);

                    return (
                      <motion.circle
                        key={offset}
                        cx={point?.x || 0}
                        cy={point?.y || 0}
                        r={1.2}
                        fill={conn.color}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 0.9, 0.9, 0],
                          scale: [0.5, 1.5, 1.5, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: offset * 0.5
                        }}
                        filter="url(#softGlow)"
                      />
                    );
                  })}
                </>
              )}

              {/* Subtle pulse for connections - only on hover */}
              {isInMode && (highlight === 'active' || highlight === 'related') && (
                <motion.circle
                  cx={getMidPoint(conn.from, conn.to).x}
                  cy={getMidPoint(conn.from, conn.to).y}
                  r={highlight === 'active' ? 1.2 : 0.8}
                  fill={strokeColor}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: highlight === 'active' ? [0.5, 0.8, 0.5] : 0.6,
                    scale: highlight === 'active' ? [1, 1.15, 1] : 1
                  }}
                  transition={{ 
                    duration: highlight === 'active' ? 3 : 0.3,
                    repeat: highlight === 'active' ? Infinity : 0,
                    ease: 'easeInOut'
                  }}
                  filter={highlight === 'active' && mode === 'hierarchical' ? 'url(#softGlow)' : undefined}
                />
              )}
            </g>
          );
        })}

        {/* Pillar Nodes */}
        {Object.entries(pillarConfig[mode]).map(([id, config]) => {
          const Icon = config.icon;
          const highlight = isPillarHighlighted(id);
          const fisheyeScale = getFisheyeScale(id);
          const fisheyePos = getFisheyePosition(id, config.position);

          // Split title into 2 words
          const titleWords = config.fullName.split(' ');
          const line1 = titleWords[0] || '';
          const line2 = titleWords.slice(1).join(' ') || '';

          return (
            <g 
              key={id}
              onMouseEnter={() => setHoveredPillar(id)}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={() => {
                setSelectedPillar(selectedPillar === id ? null : id);
                onPillarClick?.(id);
              }}
              className="cursor-pointer"
            >
              {/* Label above pillar - always visible */}
              <text
                x={fisheyePos.x}
                y={fisheyePos.y - 10}
                textAnchor="middle"
                className="pointer-events-none"
                style={{ userSelect: 'none' }}
              >
                <tspan 
                  x={fisheyePos.x} 
                  dy="-1"
                  className="text-[3px] font-semibold"
                  fill={highlight === 'active' ? `var(--color-pillar-${id})` : 'rgba(255,255,255,0.9)'}
                >
                  {line1}
                </tspan>
                <tspan 
                  x={fisheyePos.x} 
                  dy="3.5"
                  className="text-[3px] font-semibold"
                  fill={highlight === 'active' ? `var(--color-pillar-${id})` : 'rgba(255,255,255,0.9)'}
                >
                  {line2}
                </tspan>
              </text>
              {/* Outer glow ring on hover - subtle */}
              {highlight === 'active' && (
                <motion.circle
                  cx={fisheyePos.x}
                  cy={fisheyePos.y}
                  r={8 * fisheyeScale}
                  fill="none"
                  stroke={`var(--color-pillar-${id})`}
                  strokeWidth={0.4}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: mode === 'egalitarian' ? [0.3, 0.5, 0.3] : [0.4, 0.7, 0.4],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  filter="url(#softGlow)"
                />
              )}

              {/* Subtle pulse ring */}
              <motion.circle
                cx={fisheyePos.x}
                cy={fisheyePos.y}
                r={(highlight === 'active' ? 7 : 5.5) * fisheyeScale}
                fill="none"
                stroke={`var(--color-pillar-${id})`}
                strokeWidth={0.3}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: highlight === 'inactive' ? 0 : [0.2, 0.5, 0.2],
                  scale: [1, 1.3, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: Object.keys(pillarConfig[mode]).indexOf(id) * 0.3
                }}
              />

              {/* Main pillar circle */}
              <motion.circle
                cx={fisheyePos.x}
                cy={fisheyePos.y}
                r={(highlight === 'active' ? 7 : 5.5) * fisheyeScale}
                fill={highlight === 'inactive' ? 'rgba(100,100,100,0.3)' : `var(--color-pillar-${id})`}
                stroke="white"
                strokeWidth={(highlight === 'active' ? 1.5 : 1) * fisheyeScale}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: highlight === 'active' ? [1, 1.05, 1] : 1,
                  opacity: highlight === 'inactive' ? 0.3 : 1
                }}
                transition={{ 
                  delay: 0.1 * Object.keys(pillarConfig[mode]).indexOf(id),
                  scale: { 
                    type: highlight === 'active' ? 'spring' : 'spring', 
                    stiffness: 200, 
                    damping: 20,
                    repeat: highlight === 'active' ? Infinity : 0,
                    duration: highlight === 'active' ? 2 : undefined
                  }
                }}
                filter={highlight === 'active' ? 'url(#softGlow)' : undefined}
              />

              {/* Icon overlay */}
              {Icon && (
                <foreignObject
                  x={fisheyePos.x - 2.5 * fisheyeScale}
                  y={fisheyePos.y - 2.5 * fisheyeScale}
                  width={5 * fisheyeScale}
                  height={5 * fisheyeScale}
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" style={{ transform: 'scale(0.6)' }} />
                  </div>
                </foreignObject>
              )}

            </g>
          );
        })}
      </svg>



      {/* Interactive Tooltip */}
      <AnimatePresence>
        {hoveredPillar && pillarConfig[mode][hoveredPillar] && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-br from-black/95 to-black/90 backdrop-blur-xl border border-white/20 rounded-xl px-5 py-4 max-w-md pointer-events-none z-20 shadow-2xl shadow-purple-500/10"
          >
            <div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: `var(--color-pillar-${hoveredPillar})` }} />
                <p className="text-white text-sm font-semibold">{pillarConfig[mode][hoveredPillar].fullName}</p>
              </div>
              {currentPillars.find(p => p.id === hoveredPillar)?.forces && (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-500 font-medium mb-2">Forces:</p>
                  {currentPillars.find(p => p.id === hoveredPillar).forces.slice(0, 4).map((force, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: `var(--color-pillar-${hoveredPillar})` }} />
                      <div>
                        <p className="text-xs text-white font-medium">{force.name}</p>
                        <p className="text-xs text-zinc-400 leading-relaxed">{force.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        <p className={cn(
          "text-xs font-medium capitalize",
          mode === 'egalitarian' ? 'text-indigo-400' : 'text-amber-400'
        )}>{mode} Mode</p>
      </div>
    </div>

    {/* CTA Section */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="mt-12 text-center"
    >
      <h3 className="text-3xl font-bold text-white mb-3">Explore Today</h3>
      <motion.p
        className="text-zinc-400 text-sm max-w-md mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {Array.from("Discover how these forces shape your team's dynamics and unlock deeper collaboration").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 + i * 0.02 }}
          >
            {char}
          </motion.span>
        ))}
      </motion.p>
    </motion.div>


    </>
  );
}