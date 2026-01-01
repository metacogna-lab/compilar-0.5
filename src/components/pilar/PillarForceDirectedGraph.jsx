import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, Maximize2, X, Filter, Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function PillarForceDirectedGraph({ 
  mode = 'egalitarian', 
  authorityLevel = 0.5, 
  pillarsInfo,
  onPillarClick 
}) {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([]);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [filter, setFilter] = useState('all');
  const [showControls, setShowControls] = useState(false);
  const animationRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize nodes with physics properties
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    setDimensions({ width: rect.width, height: rect.height });
    
    const currentPillars = pillarsInfo[mode];
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.3;
    
    const initialNodes = currentPillars.map((pillar, index) => {
      const angle = (index / currentPillars.length) * Math.PI * 2 - Math.PI / 2;
      return {
        id: pillar.id,
        label: pillar.abbreviation,
        fullName: pillar.title,
        color: pillar.color,
        icon: pillarIcons[pillar.id.replace(/(norm|divs)exp/, 'purpose')
          .replace(/(dir|ind)recip/, 'interpersonal')
          .replace(/status|popularity/, 'resilience')
          .replace(/(own|grp)prosp/, 'action')
          .replace(/(inc|out)resp/, 'learning')],
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        targetX: centerX + Math.cos(angle) * radius,
        targetY: centerY + Math.sin(angle) * radius,
        size: 40,
        mass: 1
      };
    });
    
    setNodes(initialNodes);
  }, [mode, pillarsInfo]);

  // Physics simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      setNodes(prevNodes => {
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        
        return prevNodes.map((node, i) => {
          let fx = 0;
          let fy = 0;
          
          // Spring force to target position
          const dx = node.targetX - node.x;
          const dy = node.targetY - node.y;
          fx += dx * 0.05;
          fy += dy * 0.05;
          
          // Repulsion from other nodes
          prevNodes.forEach((other, j) => {
            if (i !== j) {
              const dx = node.x - other.x;
              const dy = node.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              const repulsion = (node.size + other.size) / dist;
              fx += (dx / dist) * repulsion * 2;
              fy += (dy / dist) * repulsion * 2;
            }
          });
          
          // Attraction to center (weak)
          const toCenterX = centerX - node.x;
          const toCenterY = centerY - node.y;
          fx += toCenterX * 0.001;
          fy += toCenterY * 0.001;
          
          // Authority influence (in hierarchical mode)
          if (mode === 'hierarchical') {
            const pullToCenter = authorityLevel * 0.02;
            fx += toCenterX * pullToCenter;
            fy += toCenterY * pullToCenter;
          }
          
          // Update velocity with damping
          const damping = 0.85;
          const vx = (node.vx + fx) * damping;
          const vy = (node.vy + fy) * damping;
          
          return {
            ...node,
            x: node.x + vx,
            y: node.y + vy,
            vx,
            vy
          };
        });
      });
      
      animationRef.current = requestAnimationFrame(simulate);
    };
    
    animationRef.current = requestAnimationFrame(simulate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes.length, mode, authorityLevel, dimensions]);

  // Update target positions based on mode and authority
  useEffect(() => {
    if (nodes.length === 0) return;
    
    const centerX = dimensions.width / 2;
    const centerY = dimensions.height / 2;
    
    setNodes(prevNodes => prevNodes.map((node, index) => {
      let radius = Math.min(dimensions.width, dimensions.height) * 0.3;
      
      if (mode === 'hierarchical') {
        // Hierarchical: nodes closer to center based on authority
        radius *= (1 - authorityLevel * 0.5);
      } else {
        // Egalitarian: more spread out, equal spacing
        radius *= 1.2;
      }
      
      const angle = (index / prevNodes.length) * Math.PI * 2 - Math.PI / 2;
      
      return {
        ...node,
        targetX: centerX + Math.cos(angle) * radius,
        targetY: centerY + Math.sin(angle) * radius,
        size: selectedNode === node.id ? 60 : 40
      };
    }));
  }, [mode, authorityLevel, selectedNode, dimensions]);

  const handleNodeClick = (node) => {
    setSelectedNode(selectedNode === node.id ? null : node.id);
    onPillarClick?.(node.id);
  };

  const getConnectionStrength = (from, to) => {
    // Simplified connection logic - would be better to import actual connections
    return Math.random() * 0.5 + 0.3;
  };

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-black/40 to-black/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          className="bg-white/10 hover:bg-white/20 text-white"
        >
          <Sliders className="w-4 h-4" />
        </Button>
      </div>

      {/* Filter Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 z-10 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 space-y-3 min-w-[200px]"
          >
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h4>
            <div className="space-y-2">
              {['all', 'high-strength', 'low-strength'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-xs transition-colors",
                    filter === f 
                      ? "bg-violet-500 text-white" 
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Canvas */}
      <svg
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: hoveredNode ? 'pointer' : 'default' }}
      >
        <defs>
          <filter id="node-glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <radialGradient id="center-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={mode === 'hierarchical' ? '#F59E0B' : '#8B5CF6'} stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Central authority indicator (hierarchical only) */}
        {mode === 'hierarchical' && (
          <g>
            <circle
              cx={dimensions.width / 2}
              cy={dimensions.height / 2}
              r={80 * authorityLevel}
              fill="url(#center-gradient)"
              opacity={0.5}
            />
            <text
              x={dimensions.width / 2}
              y={dimensions.height / 2}
              textAnchor="middle"
              fill="rgba(245, 158, 11, 0.6)"
              fontSize="12"
              fontWeight="bold"
            >
              Authority Core
            </text>
          </g>
        )}

        {/* Connections */}
        {nodes.map((from, i) => 
          nodes.slice(i + 1).map((to, j) => {
            const strength = getConnectionStrength(from.id, to.id);
            const isHighlighted = selectedNode === from.id || selectedNode === to.id;
            const shouldShow = filter === 'all' || 
              (filter === 'high-strength' && strength > 0.6) ||
              (filter === 'low-strength' && strength <= 0.6);
            
            if (!shouldShow) return null;
            
            return (
              <line
                key={`${from.id}-${to.id}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={isHighlighted ? pillarColors[from.id.replace(/(norm|divs)exp/, 'purpose').replace(/(dir|ind)recip/, 'interpersonal').replace(/status|popularity/, 'resilience').replace(/(own|grp)prosp/, 'action').replace(/(inc|out)resp/, 'learning')] : 'rgba(255,255,255,0.1)'}
                strokeWidth={isHighlighted ? strength * 3 : strength * 1.5}
                strokeOpacity={isHighlighted ? 0.6 : 0.3}
                strokeDasharray={strength < 0.5 ? "4 4" : "0"}
              />
            );
          })
        )}

        {/* Nodes */}
        {nodes.map(node => {
          const Icon = node.icon;
          const isSelected = selectedNode === node.id;
          const isHovered = hoveredNode === node.id;
          const scale = isSelected ? 1.3 : isHovered ? 1.15 : 1;
          
          return (
            <g
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node)}
              style={{ cursor: 'pointer' }}
            >
              {/* Outer glow */}
              {(isSelected || isHovered) && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.size * scale + 10}
                  fill="none"
                  stroke={pillarColors[node.id.replace(/(norm|divs)exp/, 'purpose').replace(/(dir|ind)recip/, 'interpersonal').replace(/status|popularity/, 'resilience').replace(/(own|grp)prosp/, 'action').replace(/(inc|out)resp/, 'learning')]}
                  strokeWidth="2"
                  strokeOpacity="0.4"
                  filter="url(#node-glow)"
                />
              )}
              
              {/* Main node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={node.size * scale}
                fill={pillarColors[node.id.replace(/(norm|divs)exp/, 'purpose').replace(/(dir|ind)recip/, 'interpersonal').replace(/status|popularity/, 'resilience').replace(/(own|grp)prosp/, 'action').replace(/(inc|out)resp/, 'learning')]}
                fillOpacity="0.9"
                stroke="white"
                strokeWidth="3"
                filter={isSelected ? "url(#node-glow)" : undefined}
              />
              
              {/* Icon */}
              <foreignObject
                x={node.x - node.size * scale * 0.4}
                y={node.y - node.size * scale * 0.4}
                width={node.size * scale * 0.8}
                height={node.size * scale * 0.8}
                style={{ pointerEvents: 'none' }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {Icon && <Icon className="text-white" style={{ width: '60%', height: '60%' }} />}
                </div>
              </foreignObject>
              
              {/* Label */}
              <text
                x={node.x}
                y={node.y + node.size * scale + 20}
                textAnchor="middle"
                fill="white"
                fontSize={isSelected ? "14" : "12"}
                fontWeight={isSelected ? "bold" : "normal"}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      <AnimatePresence>
        {hoveredNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-br from-black/95 to-black/90 backdrop-blur-xl border border-white/20 rounded-xl px-5 py-3 max-w-sm pointer-events-none z-20 shadow-2xl"
          >
            {nodes.find(n => n.id === hoveredNode) && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div 
                    className="w-2 h-2 rounded-full animate-pulse" 
                    style={{ backgroundColor: pillarColors[hoveredNode.replace(/(norm|divs)exp/, 'purpose').replace(/(dir|ind)recip/, 'interpersonal').replace(/status|popularity/, 'resilience').replace(/(own|grp)prosp/, 'action').replace(/(inc|out)resp/, 'learning')] }} 
                  />
                  <p className="text-white text-sm font-semibold">
                    {nodes.find(n => n.id === hoveredNode)?.fullName}
                  </p>
                </div>
                <p className="text-xs text-zinc-400 italic">Click to explore connections</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        <p className={cn(
          "text-xs font-medium",
          mode === 'egalitarian' ? 'text-indigo-400' : 'text-amber-400'
        )}>
          {mode === 'hierarchical' ? 'Hierarchical Command' : 'Egalitarian Collaboration'}
        </p>
        {mode === 'hierarchical' && (
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Authority: {Math.round(authorityLevel * 100)}%
          </p>
        )}
      </div>
    </div>
  );
}