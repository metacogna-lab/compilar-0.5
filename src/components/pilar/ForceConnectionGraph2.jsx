import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ZoomIn } from 'lucide-react';
import { adaptForceGraphData, getConnectionPath, getConnectionColor } from './forceGraphAdapter';

export default function ForceConnectionGraph2({ mode, onForceClick, onPillarNodeClick }) {
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHoveringGraph, setIsHoveringGraph] = useState(false);
  const svgRef = useRef(null);

  const graphData = React.useMemo(() => adaptForceGraphData(mode), [mode]);

  const isConnectionHighlighted = (connection) => {
    if (hoveredConnection === connection) return 'active';
    if (selectedPillar && (connection.fromPillarId === selectedPillar || connection.toPillarId === selectedPillar)) return 'active';
    if (selectedPillar) return 'inactive';
    return 'neutral';
  };

  const getConnectionWidth = (highlight) => {
    if (highlight === 'active') return 1.2;
    if (highlight === 'neutral') return 0.6;
    if (highlight === 'inactive') return 0.3;
    return 0.5;
  };

  const getConnectionOpacity = (highlight) => {
    if (highlight === 'active') return 0.9;
    if (highlight === 'neutral') return 0.6;
    if (highlight === 'inactive') return 0.2;
    return 0.4;
  };

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

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSelectedPillar(null);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const renderSVGContent = (isZoomedView = false) => {
    const filterId = isZoomedView ? 'softGlow-zoomed' : 'softGlow';

    const filteredConnections = selectedPillar
      ? graphData.connections.filter(c => c.fromPillarId === selectedPillar || c.toPillarId === selectedPillar)
      : graphData.connections;

    // Group connections by pillar pair
    const connectionGroups = {};
    filteredConnections.forEach(conn => {
      const key = `${conn.fromPillarId}-${conn.toPillarId}`;
      if (!connectionGroups[key]) connectionGroups[key] = [];
      connectionGroups[key].push(conn);
    });

    return (
      <svg 
        ref={!isZoomedView ? svgRef : null} 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id={filterId}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Connections */}
        {Object.entries(connectionGroups).map(([key, conns]) => {
          const [fromId, toId] = key.split('-');
          const fromPos = graphData.pillarPositions[fromId];
          const toPos = graphData.pillarPositions[toId];

          return conns.map((conn, idx) => {
            const highlight = isConnectionHighlighted(conn);
            const path = getConnectionPath(fromPos, toPos, idx, conns.length);
            const color = getConnectionColor(fromId, graphData.pillars);
            const strokeWidth = getConnectionWidth(highlight);
            const opacity = getConnectionOpacity(highlight);

            return (
              <g key={`${conn.id}-${idx}`}>
                <motion.path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  onMouseEnter={() => setHoveredConnection(conn)}
                  onMouseLeave={() => setHoveredConnection(null)}
                  onClick={() => onForceClick?.(conn)}
                  className="cursor-pointer"
                />
              </g>
            );
          });
        })}

        {/* Pillar Nodes */}
        {graphData.pillars.map((pillar, idx) => {
          const pos = graphData.pillarPositions[pillar.id];
          if (!pos) return null;

          const isSelected = selectedPillar === pillar.id;
          const forceCount = graphData.connectionsByPillar[pillar.id]?.length || 0;

          return (
            <g 
              key={pillar.id}
              onClick={() => {
                setSelectedPillar(isSelected ? null : pillar.id);
                onPillarNodeClick?.(pillar);
              }}
              className="cursor-pointer"
            >
              <text
                x={pos.x}
                y={pos.y - 8}
                textAnchor="middle"
                className="pointer-events-none text-[3px] font-semibold"
                fill={isSelected ? `var(--color-pillar-${pillar.id})` : 'rgba(255,255,255,0.9)'}
                style={{ userSelect: 'none' }}
              >
                {pillar.abbreviation}
              </text>

              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 6 : 5}
                fill={`var(--color-pillar-${pillar.id})`}
                stroke="white"
                strokeWidth={isSelected ? 1.2 : 0.8}
                initial={{ scale: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 * idx }}
              />

              {/* Force count badge */}
              {forceCount > 0 && (
                <g>
                  <circle
                    cx={pos.x + 4}
                    cy={pos.y - 4}
                    r={2.5}
                    fill="rgba(0,0,0,0.8)"
                    stroke="white"
                    strokeWidth={0.3}
                  />
                  <text
                    x={pos.x + 4}
                    y={pos.y - 2.8}
                    textAnchor="middle"
                    className="text-[2px] font-bold fill-white pointer-events-none"
                    style={{ userSelect: 'none' }}
                  >
                    {forceCount}
                  </text>
                </g>
              )}
            </g>
            );
            })}

            {/* Force Dots on Connections - Rendered last to appear on top */}
            <AnimatePresence>
              {selectedPillar && graphData.connections
                .filter(conn => conn.fromPillarId === selectedPillar)
                .map((conn, i) => {
                  const fromPos = graphData.pillarPositions[conn.fromPillarId];
                  const toPos = graphData.pillarPositions[conn.toPillarId];

                  if (!fromPos || !toPos) return null;

                  // Get the connection group to determine index
                  const key = `${conn.fromPillarId}-${conn.toPillarId}`;
                  const connsInGroup = graphData.connections.filter(c => 
                    c.fromPillarId === conn.fromPillarId && c.toPillarId === conn.toPillarId
                  );
                  const idx = connsInGroup.indexOf(conn);

                  const path = getConnectionPath(fromPos, toPos, idx, connsInGroup.length);

                  // Calculate dot position using path
                  const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                  tempPath.setAttribute('d', path);
                  const NODE_DOT_OFFSET = 6;
                  const dotPoint = tempPath.getPointAtLength(NODE_DOT_OFFSET);

                  const color = getConnectionColor(conn.fromPillarId, graphData.pillars);

                  return (
                    <motion.circle
                      key={`dot-${conn.id}`}
                      cx={dotPoint.x}
                      cy={dotPoint.y}
                      r={2.5}
                      fill={color}
                      stroke="white"
                      strokeWidth={0.8}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                      className="cursor-pointer"
                      whileHover={{ scale: 1.8, strokeWidth: 1.2 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onForceClick?.(conn);
                      }}
                    />
                  );
                })}
            </AnimatePresence>
            </svg>
    );
  };

  return (
    <>
      {/* Zoomed Modal View */}
      <AnimatePresence>
        {isZoomed && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100]"
              onClick={() => setIsZoomed(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-0 z-[101] bg-[#0F0F12] overflow-hidden"
            >
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="w-full h-full relative bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
                {renderSVGContent(true)}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div 
        className="w-full aspect-[4/3] relative bg-black/20 rounded-2xl border border-white/10 overflow-hidden"
        onMouseEnter={() => setIsHoveringGraph(true)}
        onMouseLeave={() => setIsHoveringGraph(false)}
      >
        {/* Zoom Button */}
        <AnimatePresence>
          {isHoveringGraph && !isZoomed && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsZoomed(true)}
              className="absolute top-4 left-4 z-20 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ZoomIn className="w-4 h-4 text-white" />
            </motion.button>
          )}
        </AnimatePresence>

        {renderSVGContent(false)}

        {/* Mode indicator */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
          <Zap className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-medium text-zinc-300 capitalize">{mode} Forces</span>
        </div>

        {/* Bottom-left label */}
        <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-medium text-zinc-300">
            {selectedPillar ? `${graphData.connectionsByPillar[selectedPillar]?.length || 0} forces` : `${graphData.connections.length} total forces`}
          </span>
        </div>
      </div>
    </>
  );
}