import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { forceConnectionsData } from '@/components/pilar/forceConnectionsData';
import ForceDetailModal from '@/components/pilar/ForceDetailModal';

export default function PillarForceMatrix({ 
  mode, 
  allForces = [],
  onForceClick,
  selectedPillar,
  setSelectedPillar
}) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [ripplePillars, setRipplePillars] = useState(new Set());
  const [selectedForce, setSelectedForce] = useState(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  const currentPillarConfig = useMemo(() => {
    const config = {};
    if (pillarsInfo[mode]) {
      pillarsInfo[mode].forEach(pillar => {
        config[pillar.id] = { 
          name: pillar.title, 
          color: pillar.color, 
          abbr: pillar.abbreviation, 
          id: pillar.id 
        };
      });
    }
    return config;
  }, [mode]);

  const forceTitleToPillarIdMap = useMemo(() => {
    const map = {};
    if (pillarsInfo[mode]) {
      pillarsInfo[mode].forEach(pillar => {
        map[pillar.title] = pillar.id;
      });
    }
    return map;
  }, [mode]);

  const pillars = Object.keys(currentPillarConfig);

  // Filter connections by current mode
  const connections = useMemo(() => {
    const modeForces = forceConnectionsData.forces.filter(
      f => f.mode.toLowerCase() === mode.toLowerCase()
    );
    
    if (selectedPillar) {
      const pillarTitle = currentPillarConfig[selectedPillar]?.name;
      return modeForces.filter(c => c.force_from === pillarTitle || c.force_to === pillarTitle);
    }
    
    return modeForces;
  }, [mode, selectedPillar, currentPillarConfig]);

  React.useEffect(() => {
    if (!selectedPillar) {
      setRipplePillars(new Set());
      return;
    }

    const affectedPillars = new Set();
    affectedPillars.add(selectedPillar);
    connections.forEach(conn => {
      const fromPillar = forceTitleToPillarIdMap[conn.force_from];
      const toPillar = forceTitleToPillarIdMap[conn.force_to];
      if (fromPillar === selectedPillar && toPillar) {
        affectedPillars.add(toPillar);
      }
      if (toPillar === selectedPillar && fromPillar) {
        affectedPillars.add(fromPillar);
      }
    });
    setRipplePillars(affectedPillars);
  }, [selectedPillar, connections, forceTitleToPillarIdMap]);

  return (
    <div className="relative">
      <div className="mb-6 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 bg-green-400 border-green-300" />
          <span>Originating (Reinforce)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 bg-red-400 border-red-300" />
          <span>Originating (Inverse)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 bg-gray-400 border-gray-300" />
          <span>Originating (Discretionary)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span>Target (Reinforce)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span>Target (Inverse)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span>Target (Discretionary)</span>
        </div>
        {selectedPillar && (
          <div className="flex items-center gap-2 text-violet-400">
            <span>• Showing {currentPillarConfig[selectedPillar]?.name}</span>
            <button 
              onClick={() => setSelectedPillar(null)}
              className="ml-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex">
            <div className="w-32 flex-shrink-0" />
            {pillars.map(pillar => {
              const config = currentPillarConfig[pillar];
              const isRippled = ripplePillars.has(pillar);
              const isSelected = selectedPillar === pillar;
              
              return (
                <motion.div
                  key={pillar}
                  className={cn(
                    "flex-1 min-w-[100px] px-3 py-4 text-center cursor-pointer rounded-lg transition-all",
                    isSelected && `bg-${config.color}-500/20 border border-${config.color}-500/40`
                  )}
                  onClick={() => setSelectedPillar(isSelected ? null : pillar)}
                  animate={isRippled ? {
                    scale: [1, 1.05, 1],
                    opacity: [1, 0.8, 1]
                  } : {}}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? `text-${config.color}-300` : isRippled ? `text-${config.color}-400` : "text-zinc-300"
                  )}>
                    {config.name}
                  </div>
                  <div className={cn(
                    "text-xs mt-1 transition-colors",
                    isSelected ? `text-${config.color}-400` : isRippled ? `text-${config.color}-500` : "text-zinc-500"
                  )}>
                    {config.abbr}
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={cn("w-1 h-1 mx-auto mt-1 rounded-full", `bg-${config.color}-400`)}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {connections.map((conn, rowIdx) => {
            const fromPillarId = forceTitleToPillarIdMap[conn.force_from];
            const toPillarId = forceTitleToPillarIdMap[conn.force_to];
            const configFrom = currentPillarConfig[fromPillarId];
            const configTo = currentPillarConfig[toPillarId];
            const isFromPillarSelected = selectedPillar === fromPillarId;
            const isToPillarSelected = selectedPillar === toPillarId;
            const isRelevantConnection = !selectedPillar || isFromPillarSelected || isToPillarSelected;

            // Determine type colors based on connection type
            const typeColors = {
              Reinforce: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', dot: 'bg-green-400', line: 'bg-green-400/40' },
              Inverse: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.4)', dot: 'bg-red-400', line: 'bg-red-400/40' },
              Discretionary: { bg: 'rgba(107, 114, 128, 0.15)', border: 'rgba(107, 114, 128, 0.4)', dot: 'bg-gray-400', line: 'bg-gray-400/40' }
            };
            const connType = conn.type || 'Discretionary';
            const currentTypeColor = typeColors[connType] || typeColors.Discretionary;

            return (
              <div key={conn.id} className={cn("flex border-t border-white/5", !isRelevantConnection && "opacity-30")}>
                <motion.div
                  className="w-32 flex-shrink-0 px-3 py-3 flex items-center"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setModalPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                    setSelectedForce(conn);
                  }}
                  style={{
                    backgroundColor: currentTypeColor.bg,
                    borderLeft: `3px solid ${currentTypeColor.border}`
                  }}
                >
                  <div className="space-y-1 cursor-pointer">
                    <div className={cn(
                      "text-xs font-medium transition-colors",
                      isRelevantConnection ? "text-white" : "text-zinc-400"
                    )}>
                      {conn.name || 'Discretionary'}
                    </div>
                    <div className="text-[10px] text-zinc-600">
                      {configFrom?.abbr || '—'} → {configTo?.abbr || '—'}
                    </div>
                  </div>
                </motion.div>

                {pillars.map((pillar, colIdx) => {
                  const isFromPillar = fromPillarId === pillar;
                  const isToPillar = toPillarId === pillar;
                  const config = currentPillarConfig[pillar];
                  const isHovered = hoveredCell === `${conn.id}-${pillar}`;
                  const isPillarRippled = ripplePillars.has(pillar);

                  return (
                    <motion.div
                      key={`${conn.id}-${pillar}`}
                      className="flex-1 min-w-[100px] p-2"
                      onHoverStart={() => setHoveredCell(`${conn.id}-${pillar}`)}
                      onHoverEnd={() => setHoveredCell(null)}
                      onClick={() => onForceClick?.(conn)}
                      animate={isPillarRippled && (isFromPillar || isToPillar) ? {
                        scale: [1, 1.08, 1],
                      } : {}}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <div 
                        className={cn(
                          "relative h-12 rounded-lg border transition-all duration-200",
                          isHovered && "scale-105 shadow-lg cursor-pointer"
                        )}
                        style={(isFromPillar || isToPillar) ? {
                          backgroundColor: currentTypeColor.bg,
                          borderColor: currentTypeColor.border
                        } : {
                          backgroundColor: 'rgba(255, 255, 255, 0.02)',
                          borderColor: 'rgba(255, 255, 255, 0.05)'
                        }}
                    >

                      <div className="absolute inset-0 flex items-center justify-center">
                        {isFromPillar ? (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: rowIdx * 0.02 + colIdx * 0.02 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setModalPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                              setSelectedForce(conn);
                            }}
                            className={cn(
                              "w-4 h-4 rounded-full border-2 relative z-10 cursor-pointer hover:scale-125 transition-transform",
                              currentTypeColor.dot,
                              `shadow-lg`
                            )}
                            style={{ borderColor: currentTypeColor.border }}
                          />
                        ) : isToPillar ? (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: rowIdx * 0.02 + colIdx * 0.02 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setModalPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                              setSelectedForce(conn);
                            }}
                            className={cn(
                              "w-2 h-2 rounded-full relative z-10 cursor-pointer hover:scale-150 transition-transform",
                              currentTypeColor.dot
                            )}
                          />
                        ) : (
                          <div className="text-zinc-800 text-xs">—</div>
                        )}
                      </div>

                      <AnimatePresence>
                        {isHovered && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-10 px-2 py-1 bg-black/90 border border-white/20 rounded text-[10px] text-white whitespace-nowrap pointer-events-none"
                          >
                            Click to view: {conn.force_from} → {conn.force_to}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selectedForce && (
        <ForceDetailModal
          isOpen={true}
          onClose={() => setSelectedForce(null)}
          force={{
            id: forceTitleToPillarIdMap[selectedForce.force_from],
            label: selectedForce.force_from,
            description: selectedForce.description || '',
            pillarId: forceTitleToPillarIdMap[selectedForce.force_from],
            group: forceTitleToPillarIdMap[selectedForce.force_from],
            modeType: mode
          }}
          mode={mode}
          connections={[selectedForce]}
          pillarConnectionData={{
            pillars: Object.values(currentPillarConfig).map(p => ({
              id: p.id,
              title: p.name,
              abbreviation: p.abbr
            })),
            connections: [selectedForce],
            allForces: []
          }}
          position={modalPosition}
        />
      )}
    </div>
  );
}