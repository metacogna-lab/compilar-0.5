import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, Grid3x3, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { radialGraphData } from "./radialGraphData";
import ForcePillarMatrix from "./ForcePillarMatrix";

export function PilarOrbitGraph({ mode = 'egalitarian', onForceClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [forcePositions, setForcePositions] = useState({});
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  const svgRef = useRef(null);
  const navigate = useNavigate();
  
  const graphData = radialGraphData;

  // Layout calculation
  const pillarNodes = graphData.nodes.filter(n => n.type === "pillar");
  const forceNodes = graphData.nodes.filter(n => n.type === "force");
  
  const centerX = 50;
  const centerY = 50;
  const pillarRadius = 28;
  const forceOrbitRadius = 12;
  const forceSize = 2.5;

  // Position pillars in a circle (static)
  const positionedNodes = {};
  pillarNodes.forEach((pillar, idx) => {
    const angle = (idx / pillarNodes.length) * 2 * Math.PI - Math.PI / 2;
    positionedNodes[pillar.id] = {
      ...pillar,
      x: centerX + pillarRadius * Math.cos(angle),
      y: centerY + pillarRadius * Math.sin(angle)
    };
  });

  // Initialize force physics
  React.useEffect(() => {
    const initialPositions = {};
    forceNodes.forEach((force) => {
      const pillarId = force.group;
      const pillar = positionedNodes[pillarId.toLowerCase()];
      if (pillar) {
        const pillarForces = forceNodes.filter(f => f.group === force.group);
        const forceIdx = pillarForces.indexOf(force);
        const baseAngle = (forceIdx / pillarForces.length) * 2 * Math.PI + Math.random() * 0.5;
        const randomRadius = forceOrbitRadius * (0.7 + Math.random() * 0.6);
        
        initialPositions[force.id] = {
          x: pillar.x + randomRadius * Math.cos(baseAngle),
          y: pillar.y + randomRadius * Math.sin(baseAngle),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          pillarX: pillar.x,
          pillarY: pillar.y
        };
      }
    });
    setForcePositions(initialPositions);
  }, []);

  // Physics simulation
  React.useEffect(() => {
    let animationFrame;
    let lastTime = Date.now();
    
    const animate = () => {
      const now = Date.now();
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      
      setForcePositions(prev => {
        const updated = { ...prev };
        
        // Update each force
        Object.keys(updated).forEach(forceId => {
          const force = updated[forceId];
          if (!force) return;
          
          // Apply asymmetric movement with randomness
          const jitterX = (Math.random() - 0.5) * 0.05;
          const jitterY = (Math.random() - 0.5) * 0.05;
          
          let newX = force.x + force.vx * delta * 10 + jitterX;
          let newY = force.y + force.vy * delta * 10 + jitterY;
          let newVx = force.vx;
          let newVy = force.vy;
          
          // Collision with other forces
          Object.keys(updated).forEach(otherId => {
            if (otherId === forceId) return;
            const other = updated[otherId];
            if (!other) return;
            
            const dx = other.x - newX;
            const dy = other.y - newY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = forceSize * 2.5;
            
            if (dist < minDist && dist > 0) {
              // Bounce off each other
              const angle = Math.atan2(dy, dx);
              const targetX = other.x - Math.cos(angle) * minDist;
              const targetY = other.y - Math.sin(angle) * minDist;
              
              // Elastic collision
              const overlap = minDist - dist;
              newX -= Math.cos(angle) * overlap * 0.5;
              newY -= Math.sin(angle) * overlap * 0.5;
              
              // Bounce velocity
              newVx = -Math.cos(angle) * Math.abs(force.vx) * 0.8;
              newVy = -Math.sin(angle) * Math.abs(force.vy) * 0.8;
            }
          });
          
          // Gravity toward pillar (asymmetric)
          const toPillarX = force.pillarX - newX;
          const toPillarY = force.pillarY - newY;
          const distToPillar = Math.sqrt(toPillarX * toPillarX + toPillarY * toPillarY);
          
          if (distToPillar > forceOrbitRadius * 1.5) {
            newVx += toPillarX * 0.01;
            newVy += toPillarY * 0.01;
          } else if (distToPillar < forceOrbitRadius * 0.5) {
            newVx -= toPillarX * 0.02;
            newVy -= toPillarY * 0.02;
          }
          
          // Add orbital velocity (asymmetric)
          const orbitAngle = Math.atan2(newY - force.pillarY, newX - force.pillarX);
          newVx += Math.cos(orbitAngle + Math.PI / 2) * 0.15;
          newVy += Math.sin(orbitAngle + Math.PI / 2) * 0.15;
          
          // Damping (asymmetric)
          newVx *= 0.98;
          newVy *= 0.97;
          
          // Velocity limits
          const speed = Math.sqrt(newVx * newVx + newVy * newVy);
          if (speed > 0.5) {
            newVx = (newVx / speed) * 0.5;
            newVy = (newVy / speed) * 0.5;
          }
          
          updated[forceId] = {
            ...force,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy
          };
        });
        
        return updated;
      });
      
      animationFrame = requestAnimationFrame(animate);
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [forcePositions]);

  // Merge force positions with positioned nodes
  forceNodes.forEach((force) => {
    if (forcePositions[force.id]) {
      positionedNodes[force.id] = {
        ...force,
        ...forcePositions[force.id]
      };
    }
  });

  const pillarColors = {
    prospects: '#10B981',
    involved: '#EC4899',
    liked: '#4F46E5',
    agency: '#8B5CF6',
    respect: '#F59E0B'
  };

  const handleForceClick = () => {
    if (onForceClick) {
      onForceClick();
    } else {
      navigate(createPageUrl('PilarDefinitions'));
    }
  };

  return (
    <div className="w-full aspect-[4/3] relative bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white/10"
            style={{
              left: `${(i * 7.3) % 100}%`,
              top: `${(i * 11.7) % 100}%`,
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

      {/* Toggle Button for views */}
      <div className="absolute bottom-4 left-4 z-20">
        <motion.button
          onClick={() => setShowMatrixModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-zinc-300 hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-colors shadow-lg"
        >
          <Grid3x3 className="w-4 h-4" />
          Show Force Matrix
        </motion.button>
      </div>

      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-radial">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          {/* Gradients for links */}
          {Object.entries(pillarColors).map(([key, color]) => (
            <linearGradient key={key} id={`gradient-${key}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0.2} />
            </linearGradient>
          ))}
        </defs>

        {/* Links - from pillars to forces */}
        {graphData.links.map((link, i) => {
          const source = positionedNodes[link.source];
          const target = positionedNodes[link.target];
          if (!source || !target) return null;

          const isHighlighted = hoveredNode === link.source || hoveredNode === link.target || 
                                selectedNode === link.source || selectedNode === link.target;

          return (
            <motion.line
              key={i}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke={`url(#gradient-${link.source})`}
              strokeWidth={isHighlighted ? 0.6 : 0.3}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: isHighlighted ? 0.8 : 0.25
              }}
              transition={{ duration: 0.5, delay: i * 0.01 }}
            />
          );
        })}

        {/* Nodes */}
        {Object.values(positionedNodes).map((node, idx) => {
          const isPillar = node.type === "pillar";
          const isHovered = hoveredNode === node.id;
          const isSelected = selectedNode === node.id;
          const color = pillarColors[node.id] || pillarColors[node.group?.toLowerCase()] || '#8B5CF6';

          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => {
                if (!isPillar) {
                  handleForceClick();
                } else {
                  setSelectedNode(node.id === selectedNode ? null : node.id);
                }
              }}
            >
              {/* Glow ring on hover */}
              {(isHovered || isSelected) && (
                <motion.circle
                  cx={node.x}
                  cy={node.y}
                  r={isPillar ? 5 : 3}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.3}
                  animate={{ 
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}

              {/* Main node circle */}
              <motion.circle
                cx={node.x}
                cy={node.y}
                r={isPillar ? 3.5 : 1.8}
                fill={color}
                stroke="white"
                strokeWidth={isPillar ? 0.6 : 0.4}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: isHovered || isSelected ? 1 : 0.85
                }}
                transition={{ 
                  delay: 0.05 * idx,
                  duration: 0.4
                }}
                style={{ pointerEvents: 'all' }}
              />

              {/* Icon for force nodes */}
              {!isPillar && (
                <foreignObject
                  x={node.x - 1.2}
                  y={node.y - 1.2}
                  width={2.4}
                  height={2.4}
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Zap className="text-white" style={{ width: '6px', height: '6px' }} />
                  </div>
                </foreignObject>
              )}

              {/* Label for pillar nodes */}
              {isPillar && (
                <text
                  x={node.x}
                  y={node.y - 5}
                  textAnchor="middle"
                  className="text-[3px] font-semibold fill-white pointer-events-none"
                  style={{ userSelect: 'none' }}
                >
                  {node.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Force Matrix Modal */}
      <AnimatePresence>
      {showMatrixModal && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setShowMatrixModal(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-[#0F0F12] border border-white/20 rounded-2xl z-50 overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Grid3x3 className="w-5 h-5 text-violet-400" />
                Force-Pillar Matrix
              </h3>
              <button
                onClick={() => setShowMatrixModal(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <ForcePillarMatrix mode={mode} graphData={graphData} />
            </div>
          </motion.div>
        </>
      )}
      </AnimatePresence>

      {/* Info tooltip */}
      {hoveredNode && positionedNodes[hoveredNode] && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute bg-black/90 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pointer-events-none max-w-xs"
          style={{
            left: `${positionedNodes[hoveredNode].x}%`,
            top: `${positionedNodes[hoveredNode].y - 8}%`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="flex items-start gap-2">
            <Zap className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ 
              color: pillarColors[positionedNodes[hoveredNode].id] || 
                     pillarColors[positionedNodes[hoveredNode].group?.toLowerCase()] || '#8B5CF6' 
            }} />
            <div>
              <p className="text-xs font-semibold text-white">{positionedNodes[hoveredNode].label}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5 capitalize">{positionedNodes[hoveredNode].type}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Forces Intelligence button */}
      <Link to={createPageUrl('PilarDefinitions')} className="absolute top-4 left-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-violet-500/20 hover:bg-violet-500/30 backdrop-blur-sm border border-violet-500/30 rounded-lg px-3 py-2 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
          <p className="text-xs font-medium text-violet-300">Forces Intelligence</p>
        </motion.button>
      </Link>

      {/* Mode indicator */}
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        <p className="text-xs font-medium text-indigo-400 capitalize">Radial View</p>
      </div>
    </div>
  );
}