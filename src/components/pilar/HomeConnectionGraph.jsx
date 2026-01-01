import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { Button } from '@/components/ui/button';

const pillarConfig = {
  egalitarian: {
    divsexp: { icon: Compass, color: 'violet', label: 'DivsExp', fullName: 'Action', position: { x: 50, y: 10 } },
    indrecip: { icon: Heart, color: 'pink', label: 'IndRecip', fullName: 'Learning', position: { x: 90, y: 35 } },
    grpprosp: { icon: Zap, color: 'emerald', label: 'GrpProsp', fullName: 'Purpose', position: { x: 75, y: 80 } },
    outresp: { icon: BookOpen, color: 'amber', label: 'OutResp', fullName: 'Resilience', position: { x: 25, y: 80 } },
    popularity: { icon: Shield, color: 'indigo', label: 'Popularity', fullName: 'Interpersonal', position: { x: 10, y: 35 } }
  },
  hierarchical: {
    normexp: { icon: Compass, color: 'violet', label: 'NormExp', fullName: 'Action', position: { x: 50, y: 10 } },
    dirrecip: { icon: Heart, color: 'pink', label: 'DirRecip', fullName: 'Learning', position: { x: 80, y: 30 } },
    ownprosp: { icon: Zap, color: 'emerald', label: 'OwnProsp', fullName: 'Purpose', position: { x: 70, y: 75 } },
    incresp: { icon: BookOpen, color: 'amber', label: 'IncResp', fullName: 'Resilience', position: { x: 30, y: 75 } },
    status: { icon: Shield, color: 'indigo', label: 'Status', fullName: 'Interpersonal', position: { x: 20, y: 30 } }
  }
};

// Generate connections for sequential animation (one pillar to 4 others)
const generateSequentialConnections = (mode) => {
  const pillars = mode === 'hierarchical' 
    ? ['normexp', 'dirrecip', 'status', 'ownprosp', 'incresp']
    : ['divsexp', 'indrecip', 'popularity', 'grpprosp', 'outresp'];
  
  const connections = [];
  
  // Each pillar connects to all others
  pillars.forEach((from, fromIdx) => {
    pillars.forEach((to, toIdx) => {
      if (fromIdx !== toIdx) {
        const fromPillar = pillarsInfo[mode]?.find(p => p.id === from);
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
          strength: 0.7 + Math.random() * 0.25,
          color: colorMap[fromPillar?.color] || '#8B5CF6',
          sourceIndex: fromIdx
        });
      }
    });
  });
  
  return connections;
};

export default function HomeConnectionGraph({ mode = 'egalitarian' }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [hoveredPillar, setHoveredPillar] = useState(null);
  const svgRef = useRef(null);
  
  const connections = generateSequentialConnections(mode);
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

  // Enhanced animation loop - faster speed
  React.useEffect(() => {
    let animationFrame;
    const animate = () => {
      setAnimationProgress((prev) => (prev + 0.02) % 1);
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Determine which pillar is currently "active" (sending particles)
  const activePillarIndex = Math.floor(animationProgress * 5);

  return (
    <div className="w-full">
      <div className="w-full aspect-[4/3] relative bg-black/20 rounded-2xl border border-white/10 overflow-hidden">
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-white/15"
            style={{
              left: `${(i * 7.3) % 100}%`,
              top: `${(i * 11.7) % 100}%`,
            }}
            animate={{
              opacity: [0.15, 0.35, 0.15],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
      
      <svg ref={svgRef} className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow-home">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <filter id="softGlow-home">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Gradients for connections */}
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
                id={`gradient-home-${conn.from}-${conn.to}`}
                x1="0%" y1="0%" x2="100%" y2="0%"
              >
                <stop offset="0%" stopColor={colorMap[fromPillar.color]} stopOpacity={conn.strength || 0.5} />
                <stop offset="100%" stopColor={colorMap[toPillar.color]} stopOpacity={conn.strength || 0.5} />
              </linearGradient>
            );
          })}
        </defs>

        {/* Connections - solid with subtle color emphasis */}
        {connections.map((conn, i) => {
          if (!pillarConfig[mode][conn.from] || !pillarConfig[mode][conn.to]) return null;

          const isFromActivePillar = conn.sourceIndex === activePillarIndex;
          const opacity = isFromActivePillar ? 0.7 : 0.35;

          return (
            <g key={i}>
              {/* Base path - solid and always visible */}
              <motion.path
                d={getConnectionPath(conn.from, conn.to)}
                fill="none"
                stroke={`url(#gradient-home-${conn.from}-${conn.to})`}
                strokeWidth={0.8}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: opacity
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: 'easeOut'
                }}
              />
            </g>
          );
        })}

        {/* Pillar Nodes - no labels */}
        {Object.entries(pillarConfig[mode]).map(([id, config], idx) => {
          const Icon = config.icon;
          const isActive = idx === activePillarIndex;

          return (
            <g key={id}>
              {/* Pulse ring - subtle */}
              <motion.circle
                cx={config.position.x}
                cy={config.position.y}
                r={5.5}
                fill="none"
                stroke={`var(--color-pillar-${id})`}
                strokeWidth={0.2}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: isActive ? [0.2, 0.4, 0.2] : 0.15,
                  scale: isActive ? [1, 1.15, 1] : 1
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: idx * 0.3
                }}
              />

              {/* Active glow ring - subtle */}
              {isActive && (
                <motion.circle
                  cx={config.position.x}
                  cy={config.position.y}
                  r={7}
                  fill="none"
                  stroke={`var(--color-pillar-${id})`}
                  strokeWidth={0.3}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ 
                    opacity: [0.2, 0.4, 0.2],
                    scale: [1, 1.08, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              )}

              {/* Main pillar circle */}
              <motion.circle
                cx={config.position.x}
                cy={config.position.y}
                r={5.5}
                fill={`var(--color-pillar-${id})`}
                stroke="white"
                strokeWidth={1}
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  opacity: isActive ? [1, 0.95, 1] : 1
                }}
                transition={{ 
                  delay: 0.1 * idx,
                  opacity: {
                    duration: 2,
                    repeat: isActive ? Infinity : 0,
                    ease: 'easeInOut'
                  }
                }}
                className="cursor-pointer"
                onMouseEnter={(e) => {
                  const pillarData = currentPillars.find(p => p.id === id);
                  if (pillarData) {
                    const colorMap = {
                      violet: '#8B5CF6',
                      pink: '#EC4899',
                      indigo: '#4F46E5',
                      emerald: '#10B981',
                      amber: '#F59E0B'
                    };
                    setHoveredPillar({
                      ...pillarData,
                      x: config.position.x,
                      y: config.position.y,
                      color: colorMap[pillarData.color]
                    });
                  }
                }}
                onMouseLeave={() => setHoveredPillar(null)}
                style={{ pointerEvents: 'all' }}
              />

              {/* Icon overlay */}
              {Icon && (
                <foreignObject
                  x={config.position.x - 2.5}
                  y={config.position.y - 2.5}
                  width={5}
                  height={5}
                  style={{ pointerEvents: 'none' }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon className="text-white" style={{ width: '12px', height: '12px' }} />
                  </div>
                </foreignObject>
              )}
            </g>
          );
        })}
      </svg>

      {/* Mode Text - Top Right */}
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
        )}>{mode} Mode</p>
      </motion.div>
      
      {/* Animated Pillar Label on Hover */}
      <AnimatePresence>
        {hoveredPillar && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className="absolute bg-black/80 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 pointer-events-none"
            style={{
              left: `${hoveredPillar.x}%`,
              top: `${hoveredPillar.y - 8}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: hoveredPillar.color }}
              />
              <p className="text-xs font-medium text-white whitespace-nowrap">
                {hoveredPillar.title}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
      
      {/* Compilar in Action Button */}
      <div className="flex justify-center mt-6">
        <Link to={createPageUrl('PilarInfo')}>
          <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shadow-lg shadow-violet-500/30">
            Compilar in Action
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </div>
  );
}