import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Info, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { radialGraphData } from './radialGraphData';
import { forcesData } from './forcesData';
import PillarForces from './pillarForces';
import PillarsDropdown from './PillarsDropdown';

export default function ForceInterconnectionGraph({ mode = 'all' }) {
  const [selectedForce, setSelectedForce] = useState(null);
  const [hoveredForce, setHoveredForce] = useState(null);
  const [selectedPillarFilter, setSelectedPillarFilter] = useState('all');
  const [autoShowForce, setAutoShowForce] = useState(null);
  const [animatingLinkIndex, setAnimatingLinkIndex] = useState(0);
  const svgRef = useRef(null);
  const cycleTimerRef = useRef(null);
  const displayTimerRef = useRef(null);
  const navigate = useNavigate();



  const pillarColors = {
    prospects: '#10B981',
    involved: '#EC4899',
    liked: '#4F46E5',
    agency: '#8B5CF6',
    respect: '#F59E0B'
  };

  const graphLinks = radialGraphData.links;

  const combinedForces = React.useMemo(() => {
    const centerX = 50;
    const centerY = 50;
    const radius = 35;
    return forcesData.forces.map((force, idx) => {
      const angle = (idx / forcesData.forces.length) * 2 * Math.PI - Math.PI / 2;
      return {
        ...force,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  }, []);

  const filteredForces = React.useMemo(() => {
    return combinedForces.filter(f => {
      const pillarMatch = selectedPillarFilter === 'all' || f.group?.toLowerCase() === selectedPillarFilter;
      const modeMatch = mode === 'all' || f.modeType === 3 || 
                        (mode === 'egalitarian' && f.modeType === 1) ||
                        (mode === 'hierarchical' && f.modeType === 2);
      return pillarMatch && modeMatch;
    });
  }, [combinedForces, selectedPillarFilter, mode]);

  const getForceById = (id) => filteredForces.find(f => f.id === id);

  const getConnections = (forceId) => {
    return graphLinks.filter(link =>
      (link.source === forceId || link.target === forceId) &&
      getForceById(link.source) && getForceById(link.target)
    );
  };

  const isConnected = (forceId, activeForce) => {
    if (!activeForce) return false;
    return getConnections(activeForce).some(link => 
      link.source === forceId || link.target === forceId
    );
  };

  const getHighlightStatus = (forceId) => {
    if (!selectedForce && !hoveredForce) return 'neutral';
    const active = selectedForce || hoveredForce;
    if (forceId === active) return 'active';
    if (isConnected(forceId, active)) return 'related';
    return 'dimmed';
  };

  const getLinkHighlight = (link) => {
    if (!getForceById(link.source) || !getForceById(link.target)) return 'hidden';
    if (!selectedForce && !hoveredForce) return 'neutral';
    const active = selectedForce || hoveredForce;
    if (link.source === active || link.target === active) return 'active';
    if (isConnected(link.source, active) && isConnected(link.target, active)) return 'related';
    return 'dimmed';
  };

  useEffect(() => {
    if (hoveredForce || selectedForce) {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
      return;
    }

    const startCycle = () => {
      cycleTimerRef.current = setTimeout(() => {
        const randomForce = filteredForces[Math.floor(Math.random() * filteredForces.length)];
        if (randomForce) {
          setAutoShowForce(randomForce.id);
          displayTimerRef.current = setTimeout(() => {
            setAutoShowForce(null);
            startCycle();
          }, 5000);
        }
      }, 3000);
    };

    startCycle();
    return () => {
      if (cycleTimerRef.current) clearTimeout(cycleTimerRef.current);
      if (displayTimerRef.current) clearTimeout(displayTimerRef.current);
    };
  }, [hoveredForce, selectedForce, filteredForces]);

  // Animate rotating connection highlight
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatingLinkIndex(prev => (prev + 1) % graphLinks.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [graphLinks.length]);



  return (
    <div className="w-full min-h-screen py-8 px-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
          <Zap className="w-6 h-6 text-violet-400" />
          Forces Intelligence Observatory
        </h2>
        <p className="text-sm text-zinc-400 max-w-2xl mx-auto">
          Explore the interconnections between all 20 psychological forces. 
          Select a force to reveal its direct and indirect relationships.
        </p>
      </motion.div>

      {/* Info Panel */}
      <AnimatePresence>
        {selectedForce && (() => {
          const selectedForceData = getForceById(selectedForce);
          
          return (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto mb-6"
            >
              <div className="bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-lg border border-violet-500/30 p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Zap className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-base font-bold text-white">
                          {selectedForceData?.label}
                        </p>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">
                          {selectedForceData?.group}
                        </span>
                      </div>
                      {selectedForceData?.description && (
                        <p className="text-sm text-zinc-300 leading-relaxed mb-3">
                          {selectedForceData.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedForce(null)}
                    className="p-1 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </button>
                </div>

                {/* Examples */}
                {selectedForceData?.examples && selectedForceData.examples.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-violet-300 mb-2">Examples in Practice</p>
                    <ul className="space-y-1.5">
                      {selectedForceData.examples.map((example, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-2 text-xs text-zinc-400"
                        >
                          <span className="text-violet-400 mt-0.5">•</span>
                          <span>{example}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Connections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs border-t border-white/10 pt-4">
                  <div>
                    <p className="text-violet-300 font-semibold mb-1">Connections</p>
                    <p className="text-zinc-400">
                      {getConnections(selectedForce).length} forces linked
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-300 font-semibold mb-1">Mode Type</p>
                    <p className="text-zinc-400">
                      {selectedForceData?.modeType === 1 ? 'Egalitarian' : selectedForceData?.modeType === 2 ? 'Hierarchical' : 'Neutral'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <div className="bg-white/5 rounded-lg border border-white/10 p-4">
          <p className="text-xs font-semibold text-white mb-3">Connection Types</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-zinc-400">
                <span className="text-violet-300 font-semibold">Direct:</span> Forces explicitly linked in the model
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-pink-500 opacity-60" />
              <span className="text-zinc-400">
                <span className="text-pink-300 font-semibold">Indirect:</span> Forces within the same pillar
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/30" />
              <span className="text-zinc-400">
                <span className="text-white font-semibold">Other:</span> Unrelated forces
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Graph Visualization */}
      <div className="max-w-6xl mx-auto">
        <div className="aspect-square relative bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
          {/* Bottom Left Link */}
          <div className="absolute bottom-4 left-4">
            <Link 
              to={createPageUrl('PilarInfo')}
              className="text-xs font-medium text-zinc-400 hover:text-violet-400 transition-colors underline"
            >
              View Forces Overview
            </Link>
          </div>

          {/* Central Pillar Dropdown with Force Description underneath */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-4">
            <div className="pointer-events-auto">
              <PillarsDropdown 
                mode={mode} 
                selectedPillarFilter={selectedPillarFilter} 
                onSelectPillar={setSelectedPillarFilter} 
              />
            </div>

            {/* Force Description Badge */}
            <AnimatePresence>
              {((hoveredForce && !selectedForce) || (autoShowForce && !hoveredForce && !selectedForce)) && (() => {
                const displayForceId = hoveredForce || autoShowForce;
                const displayForceData = getForceById(displayForceId);

                if (!displayForceData) return null;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="pointer-events-none"
                  >
                    <div className="bg-black/95 backdrop-blur-xl border border-white/20 rounded-lg px-4 py-3 max-w-sm shadow-2xl">
                      <div className="flex items-start gap-2 mb-1">
                        <Zap className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {displayForceData?.label}
                          </p>
                          <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-400">
                            {displayForceData?.group}
                          </span>
                        </div>
                      </div>
                      {displayForceData?.description && (
                        <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                          {displayForceData.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
          
          <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="glow-force">
                <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              <filter id="glow-force-strong">
                <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>

              {/* Gradients for each pillar - ray effect */}
              {Object.entries(pillarColors).map(([pillar, color]) => (
                <linearGradient key={pillar} id={`gradient-${pillar}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                  <stop offset="50%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>

            {/* Links */}
            {graphLinks.map((link, i) => {
              const source = getForceById(link.source);
              const target = getForceById(link.target);
              
              const highlight = getLinkHighlight(link);
              if (highlight === 'hidden') return null;
              if (!source || !target) return null;

              const isAnimatingLink = i === animatingLinkIndex;
              
              let strokeColor, strokeWidth, opacity;

              if (highlight === 'active') {
                strokeColor = pillarColors[source.group?.toLowerCase()] || '#8B5CF6';
                strokeWidth = 1.8;
                opacity = 1;
              } else if (highlight === 'related') {
                strokeColor = pillarColors[source.group?.toLowerCase()] || '#EC4899';
                strokeWidth = 1;
                opacity = 0.6;
              } else {
                strokeColor = 'rgba(255,255,255,0.15)';
                strokeWidth = 0.3;
                opacity = 0.12;
              }

              return (
                <g key={i}>
                  <motion.line
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    animate={{ opacity }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {(highlight === 'active' || highlight === 'related') && (
                    <motion.line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth * 1.8}
                      strokeOpacity={0.15}
                      strokeLinecap="round"
                      animate={{ opacity: [0, 0.4, 0] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeOut'
                      }}
                      filter="url(#glow-force)"
                    />
                  )}

                  {highlight === 'neutral' && isAnimatingLink && (
                    <motion.line
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={pillarColors[source.group?.toLowerCase()] || '#8B5CF6'}
                      strokeWidth={0.5}
                      strokeLinecap="round"
                      animate={{ 
                        pathLength: [0, 1],
                        opacity: [0, 0.3, 0]
                      }}
                      transition={{
                        duration: 1.8,
                        ease: 'easeInOut'
                      }}
                    />
                  )}
                </g>
              );
            })}

            {/* Force Nodes */}
            {filteredForces.map((force, idx) => {
              const status = getHighlightStatus(force.id);
              const isActive = status === 'active';
              const isRelated = status === 'related';
              const isDimmed = status === 'dimmed';
              const isHovered = hoveredForce === force.id;

              const color = pillarColors[force.group?.toLowerCase()] || '#8B5CF6';

              return (
                <g 
                  key={force.id}
                  onMouseEnter={() => setHoveredForce(force.id)}
                  onMouseLeave={() => setHoveredForce(null)}
                  onClick={() => setSelectedForce(force.id === selectedForce ? null : force.id)}
                  className="cursor-pointer"
                >
                  {isActive && (
                    <motion.circle
                      cx={force.x}
                      cy={force.y}
                      r={3.5}
                      fill="none"
                      stroke={color}
                      strokeWidth={0.5}
                      animate={{ 
                        opacity: [0.3, 0.7, 0.3],
                        scale: [1, 1.12, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    />
                  )}

                  <motion.circle
                    cx={force.x}
                    cy={force.y}
                    r={isActive ? 2.6 : isHovered ? 2.3 : 2}
                    fill={color}
                    stroke={isActive || isRelated ? 'white' : color}
                    strokeWidth={isActive ? 0.7 : isRelated ? 0.4 : 0.2}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1,
                      opacity: isDimmed ? 0.2 : 1
                    }}
                    transition={{ 
                      delay: 0.05 * idx,
                      duration: 0.4
                    }}
                    filter={isActive || isRelated ? 'url(#glow-force-strong)' : undefined}
                  />

                  {(isHovered || isActive) && (
                    <motion.text
                      x={force.x}
                      y={force.y - 4}
                      textAnchor="middle"
                      className="text-[2.5px] font-semibold fill-white pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      style={{ userSelect: 'none' }}
                    >
                      {force.label}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}