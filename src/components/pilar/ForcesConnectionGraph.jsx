import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pillarsInfo } from '@/components/pilar/pillarsData';

// Extract all forces from pillars and create force nodes
const generateForceNodes = (mode) => {
  const forces = [];
  const pillars = pillarsInfo[mode] || [];
  
  pillars.forEach((pillar, pillarIdx) => {
    pillar.forces?.forEach((force, forceIdx) => {
      forces.push({
        id: `${pillar.id}-${forceIdx}`,
        name: force.name,
        description: force.description,
        pillarId: pillar.id,
        pillarTitle: pillar.title,
        pillarColor: pillar.color,
        pillarIcon: pillar.icon
      });
    });
  });
  
  return forces;
};

// Position forces in a circular/grid layout
const positionForces = (forces, mode) => {
  const positioned = {};
  const radius = 35;
  const centerX = 50;
  const centerY = 50;
  
  forces.forEach((force, idx) => {
    const angle = (idx / forces.length) * 2 * Math.PI - Math.PI / 2;
    positioned[force.id] = {
      ...force,
      position: {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      }
    };
  });
  
  return positioned;
};

// Generate connections between forces of adjacent pillars
const generateForceConnections = (forces, mode) => {
  const connections = [];
  const colorMap = {
    violet: '#8B5CF6',
    pink: '#EC4899',
    indigo: '#4F46E5',
    emerald: '#10B981',
    amber: '#F59E0B'
  };
  
  // Connect forces from the same pillar
  forces.forEach((force, idx) => {
    forces.forEach((otherForce, otherIdx) => {
      if (idx < otherIdx && force.pillarId === otherForce.pillarId) {
        connections.push({
          from: force.id,
          to: otherForce.id,
          strength: 0.8,
          color: colorMap[force.pillarColor] || '#8B5CF6',
          type: 'internal'
        });
      }
    });
  });
  
  // Connect forces across different pillars (lighter connections)
  forces.forEach((force, idx) => {
    forces.forEach((otherForce, otherIdx) => {
      if (idx < otherIdx && force.pillarId !== otherForce.pillarId && Math.random() > 0.7) {
        connections.push({
          from: force.id,
          to: otherForce.id,
          strength: 0.3,
          color: colorMap[force.pillarColor] || '#8B5CF6',
          type: 'cross'
        });
      }
    });
  });
  
  return connections;
};

export default function ForcesConnectionGraph({ mode = 'egalitarian', onForceClick }) {
  const [hoveredForce, setHoveredForce] = useState(null);
  const [selectedForce, setSelectedForce] = useState(null);
  const svgRef = useRef(null);
  
  const forces = generateForceNodes(mode);
  const positionedForces = positionForces(forces, mode);
  const connections = generateForceConnections(forces, mode);

  const getConnectionPath = (fromId, toId) => {
    const from = positionedForces[fromId];
    const to = positionedForces[toId];
    if (!from || !to) return '';
    
    const x1 = from.position.x;
    const y1 = from.position.y;
    const x2 = to.position.x;
    const y2 = to.position.y;
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const offsetX = (y2 - y1) * 0.015;
    const offsetY = (x1 - x2) * 0.015;
    
    return `M ${x1} ${y1} Q ${midX + offsetX} ${midY + offsetY} ${x2} ${y2}`;
  };

  return (
    <div className="w-full aspect-[4/3] relative bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white/10"
            style={{
              left: `${(i * 5.3) % 100}%`,
              top: `${(i * 7.7) % 100}%`,
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.15
            }}
          />
        ))}
      </div>
      
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-forces">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Gradients for connections */}
          {connections.map((conn, i) => {
            const from = positionedForces[conn.from];
            const to = positionedForces[conn.to];
            if (!from || !to) return null;
            
            return (
              <linearGradient 
                key={i}
                id={`gradient-force-${i}`}
                x1="0%" y1="0%" x2="100%" y2="0%"
              >
                <stop offset="0%" stopColor={conn.color} stopOpacity={conn.strength * 0.6} />
                <stop offset="100%" stopColor={conn.color} stopOpacity={conn.strength * 0.3} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Connections */}
        {connections.map((conn, i) => {
          const isFromSelected = selectedForce === conn.from;
          const isToSelected = selectedForce === conn.to;
          const isRelated = isFromSelected || isToSelected;
          const opacity = isRelated ? 0.8 : conn.type === 'internal' ? 0.4 : 0.15;

          return (
            <motion.path
              key={i}
              d={getConnectionPath(conn.from, conn.to)}
              fill="none"
              stroke={`url(#gradient-force-${i})`}
              strokeWidth={conn.type === 'internal' ? 0.6 : 0.3}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: opacity
              }}
              transition={{ 
                duration: 1, 
                ease: 'easeOut',
                delay: i * 0.01
              }}
            />
          );
        })}

        {/* Force Nodes */}
        {Object.values(positionedForces).map((force, idx) => {
          const isSelected = selectedForce === force.id;
          const isHovered = hoveredForce === force.id;

          return (
            <g key={force.id}>
              {/* Pulse ring */}
              {isSelected && (
                <motion.circle
                  cx={force.position.x}
                  cy={force.position.y}
                  r={3.5}
                  fill="none"
                  stroke={`var(--color-pillar-${force.pillarId})`}
                  strokeWidth={0.3}
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}

              {/* Main force circle */}
              <motion.circle
                cx={force.position.x}
                cy={force.position.y}
                r={2.5}
                fill={`var(--color-pillar-${force.pillarId})`}
                stroke="white"
                strokeWidth={isSelected ? 0.8 : 0.5}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: isHovered || isSelected ? 1 : 0.8
                }}
                transition={{ 
                  delay: 0.05 * idx,
                  duration: 0.4
                }}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredForce(force.id)}
                onMouseLeave={() => setHoveredForce(null)}
                onClick={() => {
                  setSelectedForce(force.id === selectedForce ? null : force.id);
                  if (onForceClick) onForceClick(force);
                }}
                style={{ pointerEvents: 'all' }}
              />

              {/* Lightning icon for forces */}
              <foreignObject
                x={force.position.x - 1}
                y={force.position.y - 1}
                width={2}
                height={2}
                style={{ pointerEvents: 'none' }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <Zap className="text-white" style={{ width: '6px', height: '6px' }} />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Mode indicator */}
      <motion.div 
        key={mode}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2"
      >
        <p className={cn(
          "text-xs font-medium capitalize",
          mode === 'egalitarian' ? 'text-indigo-400' : 'text-amber-400'
        )}>{mode} Forces</p>
      </motion.div>
      
      {/* Force info on hover */}
      {hoveredForce && positionedForces[hoveredForce] && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
          className="absolute bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pointer-events-none max-w-xs"
          style={{
            left: `${positionedForces[hoveredForce].position.x}%`,
            top: `${positionedForces[hoveredForce].position.y - 8}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="flex items-start gap-2">
            <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: `var(--color-pillar-${positionedForces[hoveredForce].pillarId})` }} />
            <div>
              <p className="text-xs font-semibold text-white">{positionedForces[hoveredForce].name}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{positionedForces[hoveredForce].pillarTitle}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Selected force detail */}
      {selectedForce && positionedForces[selectedForce] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `var(--color-pillar-${positionedForces[selectedForce].pillarId})` + '40' }}
            >
              <Zap className="w-5 h-5" style={{ color: `var(--color-pillar-${positionedForces[selectedForce].pillarId})` }} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white mb-1">{positionedForces[selectedForce].name}</h4>
              <p className="text-xs text-zinc-400 mb-2">{positionedForces[selectedForce].pillarTitle} Pillar</p>
              <p className="text-xs text-zinc-300 leading-relaxed">{positionedForces[selectedForce].description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}