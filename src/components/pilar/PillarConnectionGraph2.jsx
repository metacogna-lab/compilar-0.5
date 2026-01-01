import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, ZoomIn, X, ChevronDown, Users as UsersIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { adaptConnectionData } from './pillarConnectionData';

const pillarConfig = {
  egalitarian: {
    divsexp: { icon: Compass, color: 'violet', label: 'DivsExp', fullName: 'Diverse Expression', position: { x: 50, y: 20 } },
    indrecip: { icon: Heart, color: 'pink', label: 'IndRecip', fullName: 'Indirect Reciprocity', position: { x: 85, y: 40 } },
    grpprosp: { icon: Zap, color: 'emerald', label: 'GrpProsp', fullName: 'Group Prospects', position: { x: 72, y: 85 } },
    outresp: { icon: BookOpen, color: 'amber', label: 'OutResp', fullName: 'Outgoing Respect', position: { x: 28, y: 85 } },
    popularity: { icon: Shield, color: 'indigo', label: 'Popularity', fullName: 'Popularity', position: { x: 15, y: 40 } }
  },
  hierarchical: {
    normexp: { icon: Compass, color: 'violet', label: 'NormExp', fullName: 'Normative Expression', position: { x: 50, y: 20 } },
    dirrecip: { icon: Heart, color: 'pink', label: 'DirRecip', fullName: 'Direct Reciprocity', position: { x: 85, y: 40 } },
    ownprosp: { icon: Zap, color: 'emerald', label: 'OwnProsp', fullName: 'Own Prospects', position: { x: 72, y: 85 } },
    incresp: { icon: BookOpen, color: 'amber', label: 'IncResp', fullName: 'Incoming Respect', position: { x: 28, y: 85 } },
    status: { icon: Shield, color: 'indigo', label: 'Status', fullName: 'Status', position: { x: 15, y: 40 } }
  }
};

export default function PillarConnectionGraph2({ mode, authorityLevel = 0.5, onPillarClick, onViewForces }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const [hoveredConnection, setHoveredConnection] = useState(null);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHoveringGraph, setIsHoveringGraph] = useState(false);
  const [clickedPillar, setClickedPillar] = useState(null);
  const [clickCount, setClickCount] = useState(0);
  const svgRef = useRef(null);
  const zoomedSvgRef = useRef(null);
  
  const NODE_DOT_OFFSET = 9.2;
  
  const connections = adaptConnectionData(mode);

    // Identify bidirectional connections
    const processedConnections = React.useMemo(() => {
      const bidirectionalMap = new Map();
      const processed = [];

      connections.forEach((conn) => {
        const key1 = `${conn.from}-${conn.to}`;
        const key2 = `${conn.to}-${conn.from}`;

        if (bidirectionalMap.has(key2)) {
          // This is the reverse of an already processed connection
          const existing = bidirectionalMap.get(key2);
          existing.reverse = conn;
        } else {
          const newConn = { ...conn, reverse: null };
          bidirectionalMap.set(key1, newConn);
          processed.push(newConn);
        }
      });

      return processed;
    }, [connections, mode]);

    const getConnectionPath = (from, to) => {
    const fromPos = pillarConfig[mode][from]?.position;
    const toPos = pillarConfig[mode][to]?.position;
    
    if (!fromPos || !toPos) return '';
    
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

    // Check if this connection or its reverse is hovered
    if (hoveredConnection === connection || hoveredConnection === connection.reverse) return 'active';

    // Check if reverse connection is hovered
    if (connection.reverse && (hoveredConnection === connection || hoveredConnection === connection.reverse)) return 'active';

    if (hoveredPillar && (connection.from === hoveredPillar || connection.to === hoveredPillar)) {
      return 'active';
    }

    if (hoveredPillar) return 'inactive';
    return 'neutral';
  };

  const getConnectionColor = (connection, highlight) => {
    const isInMode = connection.modes.includes(mode);
    
    if (highlight === 'translucent') return 'rgba(255,255,255,0.12)';
    if (highlight === 'inactive' && isInMode) return 'rgba(255,255,255,0.25)';
    if (highlight === 'inactive' && !isInMode) return 'rgba(255,255,255,0.12)';
    
    if (highlight === 'neutral' || highlight === 'active' || highlight === 'related') {
      return `url(#gradient-${connection.from}-${connection.to})`;
    }
    
    return 'rgba(255,255,255,0.15)';
  };

  const getConnectionWidth = (connection, highlight) => {
    if (highlight === 'translucent') return 0.5;
    if (highlight === 'active') return 1.2;
    if (highlight === 'related') return 0.9;
    if (highlight === 'neutral') return 0.7;
    if (highlight === 'inactive') return 0.5;
    return 0.6;
  };

  const getMidPoint = (from, to) => {
    const fromPos = pillarConfig[mode][from]?.position;
    const toPos = pillarConfig[mode][to]?.position;
    
    if (!fromPos || !toPos) return { x: 50, y: 50 };
    
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
    return 'neutral';
  };

  const getFisheyeScale = (pillarId) => {
    if (!selectedPillar) return 1;
    if (pillarId === selectedPillar) return 1.15;

    const isConnected = connections.some(
      c => (c.from === selectedPillar && c.to === pillarId) || 
           (c.to === selectedPillar && c.from === pillarId)
    );

    return isConnected ? 1.08 : 0.92;
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

  React.useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationProgress((prev) => (prev + 0.01) % 1);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      const ref = isZoomed ? zoomedSvgRef.current : svgRef.current;
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isZoomed]);

  // Handle click outside to reset state
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      const ref = isZoomed ? zoomedSvgRef.current : svgRef.current;
      if (ref && !ref.contains(e.target)) {
        setClickedPillar(null);
        setSelectedPillar(null);
        setClickCount(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isZoomed]);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (isZoomed) {
          setIsZoomed(false);
        }
        setClickedPillar(null);
        setSelectedPillar(null);
        setClickCount(0);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isZoomed]);

  const renderSVGContent = (isZoomedView = false) => {
    const filterId = isZoomedView ? 'softGlow-zoomed' : 'softGlow';
    const gradientPrefix = isZoomedView ? 'gradient-zoomed-' : 'gradient-';

    // Filter connections based on selected pillar
      const filteredConnections = selectedPillar
        ? processedConnections.filter(c => c.from === selectedPillar || c.to === selectedPillar)
        : processedConnections;

    return (
      <svg 
        ref={isZoomedView ? zoomedSvgRef : svgRef} 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="xMidYMid meet"
        onClick={(e) => {
          // If clicking on the SVG background (not a child element), reset selection
          if (e.target.tagName === 'svg') {
            setSelectedPillar(null);
            setClickedPillar(null);
            setClickCount(0);
          }
        }}
      >
        <defs>
          <filter id={isZoomedView ? 'glow-zoomed' : 'glow'}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id={filterId}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id={isZoomedView ? 'violetShadow-zoomed' : 'violetShadow'}>
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8B5CF6" floodOpacity="0.3"/>
          </filter>

          {/* Arrowhead markers for each pillar color */}
          <marker
            id="arrowhead-divsexp"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#8B5CF6" />
          </marker>
          <marker
            id="arrowhead-normexp"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#8B5CF6" />
          </marker>
          <marker
            id="arrowhead-indrecip"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#EC4899" />
          </marker>
          <marker
            id="arrowhead-dirrecip"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#EC4899" />
          </marker>
          <marker
            id="arrowhead-grpprosp"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#10B981" />
          </marker>
          <marker
            id="arrowhead-ownprosp"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#10B981" />
          </marker>
          <marker
            id="arrowhead-outresp"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#F59E0B" />
          </marker>
          <marker
            id="arrowhead-incresp"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#F59E0B" />
          </marker>
          <marker
            id="arrowhead-popularity"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#4F46E5" />
          </marker>
          <marker
            id="arrowhead-status"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#4F46E5" />
          </marker>
          
          {filteredConnections.map((conn, i) => {
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
                id={`${gradientPrefix}${conn.from}-${conn.to}`}
                x1="0%" y1="0%" x2="100%" y2="0%"
              >
                <stop offset="0%" stopColor={colorMap[fromPillar.color]} stopOpacity={0.7} />
                <stop offset="100%" stopColor={colorMap[toPillar.color]} stopOpacity={0.7} />
              </linearGradient>
            );
          })}
          
          {/* Dot patterns for Pillars-view style connections */}
          {filteredConnections.map((conn, i) => {
            if (!pillarConfig[mode][conn.from] || !pillarConfig[mode][conn.to]) return null;
            const fromPillar = pillarConfig[mode][conn.from];
            const toPillar = pillarConfig[mode][conn.to];
            const colorMap = {
              violet: '#8B5CF6',
              pink: '#EC4899',
              indigo: '#4F46E5',
              emerald: '#10B981',
              amber: '#F59E0B'
            };
            const color1 = colorMap[fromPillar.color];
            const color2 = colorMap[toPillar.color];

            return (
              <pattern
                key={`dot-pattern-${conn.from}-${conn.to}`}
                id={`dot-pattern-${gradientPrefix}${conn.from}-${conn.to}`}
                width="8" height="8"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1" fill={color1} opacity="0.8" />
                <circle cx="6" cy="6" r="1" fill={color2} opacity="0.8" />
              </pattern>
            );
          })}
        </defs>

        {/* Connections */}
        {filteredConnections.map((conn, i) => {
          if (!pillarConfig[mode][conn.from] || !pillarConfig[mode][conn.to]) return null;

          const highlight = isConnectionHighlighted(conn);
          const strokeColor = getConnectionColor(conn, highlight).replace('gradient-', gradientPrefix);
          const strokeWidth = getConnectionWidth(conn, highlight);
          const isInMode = conn.modes.includes(mode);
          const path = getConnectionPath(conn.from, conn.to);

          return (
            <g 
              key={i}
              className="cursor-pointer"
            >
              <path
                d={path}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                markerEnd={`url(#arrowhead-${conn.from})`}
                opacity={highlight === 'translucent' ? 0.15 : highlight === 'inactive' ? 0.3 : 0.8}
              />
            </g>
          );
        })}

        {/* Pillar Nodes */}
        {Object.entries(pillarConfig[mode]).map(([id, config]) => {
          const Icon = config.icon;
          const highlight = isPillarHighlighted(id);
          const fisheyeScale = getFisheyeScale(id);
          const fisheyePos = getFisheyePosition(id, config.position);
          const titleWords = config.fullName.split(' ');
          const line1 = titleWords[0] || '';
          const line2 = titleWords.slice(1).join(' ') || '';

          return (
            <g 
              key={id}
              onMouseEnter={() => setHoveredPillar(id)}
              onMouseLeave={() => setHoveredPillar(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedPillar === id) {
                  // Second or more click on same pillar - open modal
                  const newCount = clickCount + 1;
                  setClickCount(newCount);
                  if (newCount >= 2) {
                    onPillarClick?.(id);
                    setClickCount(0);
                  }
                } else {
                  // First click - select pillar and show dots
                  setSelectedPillar(id);
                  setClickedPillar(id);
                  setClickCount(1);
                }
              }}
              className="cursor-pointer"
            >
              <text
                x={fisheyePos.x}
                y={fisheyePos.y - 11}
                textAnchor="middle"
                className="pointer-events-none"
                style={{ userSelect: 'none' }}
              >
                <tspan 
                  x={fisheyePos.x} 
                  dy="-1"
                  className="text-[3.5px] font-bold"
                  fill={selectedPillar && selectedPillar !== id && highlight !== 'related' ? 'rgba(255,255,255,0.5)' : selectedPillar === id ? `var(--color-pillar-${id})` : 'white'}
                  style={{ 
                    filter: 'drop-shadow(0 0 3px rgba(139, 92, 246, 0.9)) drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))',
                    letterSpacing: '0.05em',
                    fontWeight: 900,
                    paintOrder: 'stroke fill'
                  }}
                  stroke="rgba(139, 92, 246, 0.4)"
                  strokeWidth="0.3"
                >
                  {line1}
                </tspan>
                <tspan 
                  x={fisheyePos.x} 
                  dy="4"
                  className="text-[3.5px] font-bold"
                  fill={selectedPillar && selectedPillar !== id && highlight !== 'related' ? 'rgba(255,255,255,0.5)' : selectedPillar === id ? `var(--color-pillar-${id})` : 'white'}
                  style={{ 
                    filter: 'drop-shadow(0 0 3px rgba(139, 92, 246, 0.9)) drop-shadow(0 0 6px rgba(139, 92, 246, 0.5))',
                    letterSpacing: '0.05em',
                    fontWeight: 900,
                    paintOrder: 'stroke fill'
                  }}
                  stroke="rgba(139, 92, 246, 0.4)"
                  strokeWidth="0.3"
                >
                  {line2}
                </tspan>
              </text>


              <motion.circle
                cx={fisheyePos.x}
                cy={fisheyePos.y}
                r={(highlight === 'active' ? 6.2 : 5.5) * fisheyeScale}
                fill={highlight === 'inactive' ? 'rgba(100,100,100,0.3)' : `var(--color-pillar-${id})`}
                stroke="white"
                strokeWidth={(highlight === 'active' ? 1.2 : 1) * fisheyeScale}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: highlight === 'inactive' ? 0.3 : 1
                }}
                transition={{ 
                  delay: 0.1 * Object.keys(pillarConfig[mode]).indexOf(id)
                }}
              />

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

        {/* Interactive dots for selected pillar connections */}
        {selectedPillar && filteredConnections.flatMap((conn, i) => {
          const dotsToRender = [];

          // Check if primary connection originates from selected pillar
          if (conn.from === selectedPillar && pillarConfig[mode][conn.from] && pillarConfig[mode][conn.to]) {
            dotsToRender.push({ conn, key: `dot-primary-${i}` });
          }

          // Check if reverse connection originates from selected pillar
          if (conn.reverse && conn.reverse.from === selectedPillar && pillarConfig[mode][conn.reverse.from] && pillarConfig[mode][conn.reverse.to]) {
            dotsToRender.push({ conn: conn.reverse, key: `dot-reverse-${i}` });
          }

          return dotsToRender;
        }).map(({ conn, key }) => {
          if (!pillarConfig[mode][conn.from] || !pillarConfig[mode][conn.to]) return null;
          
          const path = getConnectionPath(conn.from, conn.to);
          const tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          tempPath.setAttribute('d', path);
          const totalLength = tempPath.getTotalLength();

          // Position dot at fixed distance from the 'from' node
          const dotPoint = tempPath.getPointAtLength(NODE_DOT_OFFSET);
          
          // Color based on the pillar
          const fromPillar = pillarConfig[mode][conn.from];
          const colorMap = {
            violet: '#8B5CF6',
            pink: '#EC4899',
            indigo: '#4F46E5',
            emerald: '#10B981',
            amber: '#F59E0B'
          };
          const dotColor = colorMap[fromPillar?.color] || '#FFFFFF';

          return (
            <g key={key}>
              <motion.circle
                cx={dotPoint.x}
                cy={dotPoint.y}
                r={2}
                fill={dotColor}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={0.5}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="cursor-pointer"
                whileHover={{ scale: 1.5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Pass the specific connection from force_from to force_to
                  onViewForces?.(conn.from, [conn]);
                }}
              />
            </g>
          );
        })}
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
            className="fixed inset-0 z-[101] p-4 md:p-8 flex items-center justify-center"
            >
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="w-full h-full relative bg-[#0F0F12] rounded-2xl border border-white/10 overflow-hidden">
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
              
              {renderSVGContent(true)}

              {/* Mode indicator in zoomed view */}
              <div className="absolute top-4 right-16 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
                {mode === 'egalitarian' ? (
                  <UsersIcon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Shield className="w-4 h-4 text-amber-400" />
                )}
                <span className="text-xs font-medium text-zinc-300 capitalize">{mode}</span>
              </div>

              {/* Bottom-left label in zoomed view */}
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-medium text-zinc-300">Click Pillars</span>
              </div>
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
      
      {renderSVGContent(false)}

      {/* Mode indicator - Top right */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-2">
        {mode === 'egalitarian' ? (
          <UsersIcon className="w-4 h-4 text-indigo-400" />
        ) : (
          <Shield className="w-4 h-4 text-amber-400" />
        )}
        <span className="text-xs font-medium text-zinc-300 capitalize">{mode}</span>
      </div>

    </div>
    </>
  );
}