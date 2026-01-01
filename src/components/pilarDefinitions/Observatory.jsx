import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Sparkles, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ForceInterconnectionGraph from '@/components/pilar/ForceInterconnectionGraph';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { forceConnectionsData } from '@/components/pilar/forceConnectionsData';

export default function Observatory({ adaptedData, mode, onModeChange, observatoryView, onPillarClick, onForceClick, selectedForce, selectedForceConnections = [] }) {
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [exploringForce, setExploringForce] = useState(null);
  const [activeContext, setActiveContext] = useState([]); // Cumulative force selections
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Use canonical pillar data from pillarsData.jsx
  const canonicalPillars = pillarsInfo[mode] || [];
  
  // Get force connections for this mode
  const modeForceConnections = useMemo(() => {
    return forceConnectionsData.forces.filter(
      f => f.mode.toLowerCase() === mode.toLowerCase()
    );
  }, [mode]);
  
  // Build a map of pillar title to its 4 associated forces (from force connections)
  const pillarForcesMap = useMemo(() => {
    const map = {};
    
    canonicalPillars.forEach(pillar => {
      // Find all forces where this pillar is the source (force_from)
      const forcesFromPillar = modeForceConnections.filter(
        conn => conn.force_from === pillar.title
      );
      
      map[pillar.title] = forcesFromPillar.map(conn => ({
        name: conn.name || 'Discretionary',
        description: conn.description,
        type: conn.type,
        targetPillar: conn.force_to
      }));
    });
    
    return map;
  }, [canonicalPillars, modeForceConnections]);
  
  // Map canonical data to Observatory structure with correct forces
  const pillars = canonicalPillars.map(pillar => ({
    id: pillar.id,
    construct: pillar.title,
    abbreviation: pillar.abbreviation,
    definition: pillar.fullDescription || pillar.description,
    forces: pillarForcesMap[pillar.title] || []
  }));

  // Define key pillars for each mode
  const keyPillars = mode === 'egalitarian' 
    ? ['divsexp', 'indrecip', 'popularity', 'grpprosp', 'outresp']
    : ['normexp', 'dirrecip', 'status', 'ownprosp', 'incresp'];

  // Get related forces when exploring
  const getRelatedForces = (forceId, pillarId) => {
    const connections = adaptedData.connectedEntities(pillarId);
    return connections.map(c => c.entity.id);
  };

  // Generate synthesis for a pillar based on active context
  const generateSynthesis = (pillarId) => {
    const pillar = pillars.find(p => p.id === pillarId);
    const pillarForces = pillar?.forces || [];
    const activeInPillar = activeContext.filter(ctx => 
      pillarForces.some(f => f.name === ctx.forceName)
    );

    if (activeInPillar.length === 0) return null;
    
    const forceNames = activeInPillar.map(c => c.forceName.toLowerCase()).join(' and ');
    return `Currently influenced by ${forceNames} forces`;
  };

  // Toggle force in active context
  const toggleForceContext = (pillarId, forceName) => {
    setActiveContext(prev => {
      const exists = prev.find(c => c.pillarId === pillarId && c.forceName === forceName);
      if (exists) {
        return prev.filter(c => !(c.pillarId === pillarId && c.forceName === forceName));
      } else {
        return [...prev, { pillarId, forceName }];
      }
    });
  };

  const handleDragStart = (e, force, pillarId) => {
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setExploringForce({ force, pillarId });
  };

  const handleDragEnd = (e, force, pillarId) => {
    const dragDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.current.x, 2) + 
      Math.pow(e.clientY - dragStartPos.current.y, 2)
    );
    
    // If dragged less than 5px, treat as click and open modal
    if (dragDistance < 5) {
      onForceClick?.(force.name);
    } else if (dragDistance < 10) {
      // If dragged 5-10px, toggle context
      toggleForceContext(pillarId, force.name);
    }
    
    setExploringForce(null);
  };

  const isForceActive = (pillarId, forceName) => {
    return activeContext.some(c => c.pillarId === pillarId && c.forceName === forceName);
  };

  const isForceRelated = (pillarId) => {
    if (!exploringForce) return false;
    const related = getRelatedForces(exploringForce.pillarId, exploringForce.pillarId);
    return related.includes(pillarId);
  };

  // Check if a pillar is involved in selected force connections
  const isPillarHighlighted = (pillarConstruct) => {
    if (!selectedForce || selectedForceConnections.length === 0) return false;
    return selectedForceConnections.some(conn => 
      conn.force_from === pillarConstruct || conn.force_to === pillarConstruct
    );
  };

  // Check if a specific force is highlighted
  const isForceHighlighted = (forceName) => {
    if (!selectedForce) return false;
    if (forceName === selectedForce.name) return true;
    return selectedForceConnections.some(conn => 
      conn.force_from === forceName || conn.force_to === forceName
    );
  };

  // Get color scheme based on force type (matching PillarForceMatrix)
  const getForceTypeColors = (type) => {
    const typeColors = {
      Reinforce: { 
        bg: 'rgba(16, 185, 129, 0.15)', 
        border: 'rgba(16, 185, 129, 0.4)'
      },
      Inverse: { 
        bg: 'rgba(239, 68, 68, 0.15)', 
        border: 'rgba(239, 68, 68, 0.4)'
      },
      Discretionary: { 
        bg: 'rgba(107, 114, 128, 0.15)', 
        border: 'rgba(107, 114, 128, 0.4)'
      }
    };
    return typeColors[type] || typeColors.Discretionary;
  };

  return (
    <div className="min-h-screen py-8 px-6">
      {/* Conditional View Rendering */}
      {observatoryView === 'forces' ? (
        <>
          {/* Type Legend */}
          <div className="mb-6 max-w-7xl mx-auto flex justify-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-zinc-400">Reinforce</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-zinc-400">Inverse</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-gray-500"></span>
              <span className="text-zinc-400">Discretionary</span>
            </div>
          </div>
          <ForceInterconnectionGraph mode={mode} />
        </>
      ) : (
        <>

      {/* Type Legend */}
      <div className="mb-6 max-w-7xl mx-auto flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-zinc-400">Reinforce</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-zinc-400">Inverse</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-gray-500"></span>
          <span className="text-zinc-400">Discretionary</span>
        </div>
      </div>

      {/* Active Context Summary */}
      <AnimatePresence>
        {activeContext.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-lg border border-violet-500/30 p-4">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white mb-1">Active Observation Context</p>
                  <p className="text-xs text-zinc-400">
                    {activeContext.length} force{activeContext.length !== 1 ? 's' : ''} under observation: {' '}
                    {activeContext.map((c, idx) => (
                      <span key={idx}>
                        <span className="text-violet-300">{c.forceName}</span>
                        {idx < activeContext.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pillar Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-7xl mx-auto">
        {pillars.map((pillar) => {
          const isSelected = selectedPillar === pillar.id;
          const isDimmed = selectedPillar && !isSelected;
          const synthesis = generateSynthesis(pillar.id);
          const isKeyPillar = keyPillars.includes(pillar.id);

          const isPillarInvolved = isPillarHighlighted(pillar.construct);

          return (
            <motion.div
              key={pillar.id}
              animate={{
                opacity: isDimmed ? 0.4 : 1,
                scale: isSelected ? 1.02 : isKeyPillar ? 1.01 : isPillarInvolved ? 1.03 : 1,
              }}
              transition={{ duration: 0.3 }}
              className={`bg-gradient-to-b from-white/5 to-white/[0.02] rounded-xl border overflow-hidden ${
                isPillarInvolved ? 'border-amber-400/50 shadow-lg shadow-amber-400/30' :
                isKeyPillar ? 'border-violet-500/40 shadow-lg shadow-violet-500/20' : 'border-white/10'
              }`}
            >
              {/* Pillar Header */}
              <button
                onClick={() => {
                  if (!isSelected) {
                    setSelectedPillar(pillar.id);
                    if (onPillarClick) {
                      onPillarClick(pillar);
                    }
                  } else {
                    setSelectedPillar(null);
                  }
                }}
                className={`w-full p-4 text-left transition-all ${
                  isSelected 
                    ? 'bg-gradient-to-r from-violet-500/20 to-pink-500/20 border-b-2 border-violet-500/50' 
                    : isKeyPillar
                    ? 'bg-violet-500/5 hover:bg-violet-500/10 border-b border-violet-500/30'
                    : 'hover:bg-white/5 border-b border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-white">
                    {pillar.construct}
                  </h3>
                  {isKeyPillar && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold">
                      Key
                    </span>
                  )}
                </div>
                <p className="text-xs text-violet-400 mb-2">{pillar.abbreviation}</p>
                
                {/* Synthesis Statement */}
                <AnimatePresence>
                  {synthesis && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 pt-2 border-t border-white/10"
                    >
                      <p className="text-xs text-amber-300 italic">{synthesis}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Forces */}
              <div className="p-3 space-y-2">
                {(pillar.forces || []).map((force, idx) => {
                  const isActive = isForceActive(pillar.id, force.name);
                  const isRelated = isForceRelated(pillar.id);
                  const isHighlighted = isForceHighlighted(force.name);

                  // Get color based on force type
                  const currentColor = getForceTypeColors(force.type);

                  return (
                    <TooltipProvider key={idx}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            drag
                            dragElastic={0.1}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragMomentum={false}
                            onDragStart={(e) => handleDragStart(e, force, pillar.id)}
                            onDragEnd={(e) => handleDragEnd(e, force, pillar.id)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onForceClick?.(force.name);
                            }}
                            whileHover={{ scale: 1.02 }}
                            animate={{
                              scale: isActive ? 1.05 : isHighlighted ? 1.04 : 1,
                              backgroundColor: currentColor.bg,
                              borderColor: isActive 
                                ? 'rgba(139, 92, 246, 0.5)' 
                                : isHighlighted
                                ? 'rgba(251, 191, 36, 0.8)'
                                : isRelated 
                                ? 'rgba(236, 72, 153, 0.3)' 
                                : currentColor.border,
                              borderWidth: isActive || isHighlighted ? '2px' : '1px',
                              boxShadow: isHighlighted 
                                ? '0 0 20px rgba(251, 191, 36, 0.4)'
                                : isActive
                                ? '0 0 20px rgba(139, 92, 246, 0.4)'
                                : 'none',
                            }}
                            className="relative p-3 rounded-lg border cursor-pointer transition-all"
                          >
                            {/* Active indicator underline */}
                            {isActive && (
                              <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-pink-500"
                              />
                            )}

                            {/* Pulse effect when exploring */}
                            {exploringForce?.force === force && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ 
                                  opacity: [0.5, 0, 0.5],
                                  scale: [1, 1.2, 1],
                                }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="absolute inset-0 rounded-lg bg-violet-500/20 pointer-events-none"
                              />
                            )}

                            <p className="text-xs font-semibold text-white mb-1 relative z-10">
                              {force.name}
                            </p>
                            <p className="text-xs text-zinc-500 line-clamp-2 relative z-10">
                              {force.description}
                            </p>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-xs font-semibold mb-1">{force.name}</p>
                          <p className="text-xs text-zinc-300">{force.description}</p>
                          <p className="text-xs text-zinc-500 mt-2">
                            Click to add to context. Drag to explore connections.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                })}
              </div>

              {/* Pillar Definition (Expandable) */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10 p-3 bg-black/20"
                  >
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {pillar.definition}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Connection Explanation Overlay */}
      <AnimatePresence>
        {exploringForce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md"
          >
            <div className="bg-gradient-to-r from-violet-500/20 to-pink-500/20 backdrop-blur-xl border border-violet-500/30 rounded-lg p-4 shadow-2xl">
              <p className="text-xs text-white font-semibold mb-1">
                Exploring: {exploringForce.force.name}
              </p>
              <p className="text-xs text-zinc-400">
                Related forces are highlighted across pillars. Release to return.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}