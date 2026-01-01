import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Heart, BookOpen, Zap, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';

const pillarConfig = {
  purpose: { icon: Compass, color: '#8B5CF6', label: 'Purpose', position: { x: 50, y: 10 } },
  interpersonal: { icon: Heart, color: '#EC4899', label: 'Interpersonal', position: { x: 90, y: 35 } },
  action: { icon: Zap, color: '#10B981', label: 'Action', position: { x: 75, y: 80 } },
  learning: { icon: BookOpen, color: '#4F46E5', label: 'Learning', position: { x: 25, y: 80 } },
  resilience: { icon: Shield, color: '#F59E0B', label: 'Resilience', position: { x: 10, y: 35 } }
};

const connections = [
  // Purpose connections (4)
  { from: 'purpose', to: 'interpersonal', strength: 0.85, modes: ['egalitarian', 'hierarchical'], color: '#8B5CF6', label: 'Purpose shapes relationships', detail: 'When team members share a clear purpose, they form stronger bonds and communicate more authentically.' },
  { from: 'purpose', to: 'learning', strength: 0.75, modes: ['egalitarian', 'hierarchical'], color: '#8B5CF6', label: 'Purpose guides learning', detail: 'A strong sense of purpose directs what skills and knowledge to acquire.' },
  { from: 'purpose', to: 'action', strength: 0.95, modes: ['hierarchical'], color: '#8B5CF6', label: 'Purpose drives action', detail: 'Purpose provides the "why" that fuels sustained effort and decisive action.' },
  { from: 'purpose', to: 'resilience', strength: 0.90, modes: ['egalitarian', 'hierarchical'], color: '#8B5CF6', label: 'Purpose sustains resilience', detail: 'A compelling purpose gives people reasons to persist through setbacks.' },
  
  // Interpersonal connections (4)
  { from: 'interpersonal', to: 'purpose', strength: 0.70, modes: ['egalitarian'], color: '#EC4899', label: 'Relationships clarify purpose', detail: 'Through dialogue and feedback, individuals gain clearer perspective on what matters.' },
  { from: 'interpersonal', to: 'learning', strength: 0.88, modes: ['egalitarian'], color: '#EC4899', label: 'Relationships enable learning', detail: 'Psychological safety creates environments where people can ask questions and experiment.' },
  { from: 'interpersonal', to: 'action', strength: 0.80, modes: ['egalitarian', 'hierarchical'], color: '#EC4899', label: 'Relationships facilitate action', detail: 'Strong relationships provide social capital needed to mobilize resources effectively.' },
  { from: 'interpersonal', to: 'resilience', strength: 0.92, modes: ['egalitarian'], color: '#EC4899', label: 'Relationships build resilience', detail: 'Social support networks buffer against stress and provide emotional resources.' },
  
  // Learning connections (4)
  { from: 'learning', to: 'purpose', strength: 0.78, modes: ['egalitarian'], color: '#4F46E5', label: 'Learning reveals purpose', detail: 'Exposure to new ideas helps people discover what energizes them.' },
  { from: 'learning', to: 'interpersonal', strength: 0.82, modes: ['egalitarian'], color: '#4F46E5', label: 'Learning improves relationships', detail: 'Developing empathy and communication skills enhances connection quality.' },
  { from: 'learning', to: 'action', strength: 0.93, modes: ['egalitarian', 'hierarchical'], color: '#4F46E5', label: 'Learning enhances action', detail: 'Acquiring new skills increases available actions and improves execution quality.' },
  { from: 'learning', to: 'resilience', strength: 0.85, modes: ['egalitarian', 'hierarchical'], color: '#4F46E5', label: 'Learning strengthens resilience', detail: 'Each challenge mastered builds confidence and expands coping strategies.' },
  
  // Action connections (4)
  { from: 'action', to: 'purpose', strength: 0.88, modes: ['hierarchical'], color: '#10B981', label: 'Action manifests purpose', detail: 'Taking concrete steps makes purpose tangible and transforms values into impact.' },
  { from: 'action', to: 'interpersonal', strength: 0.77, modes: ['egalitarian', 'hierarchical'], color: '#10B981', label: 'Action demonstrates character', detail: 'Actions under pressure reveal true priorities and build or erode trust.' },
  { from: 'action', to: 'learning', strength: 0.90, modes: ['egalitarian', 'hierarchical'], color: '#10B981', label: 'Action generates learning', detail: 'Experimentation provides feedback that accelerates skill development.' },
  { from: 'action', to: 'resilience', strength: 0.86, modes: ['hierarchical'], color: '#10B981', label: 'Action builds resilience', detail: 'Pushing through discomfort strengthens capacity for future challenges.' },
  
  // Resilience connections (4)
  { from: 'resilience', to: 'purpose', strength: 0.87, modes: ['egalitarian', 'hierarchical'], color: '#F59E0B', label: 'Resilience protects purpose', detail: 'Recovery ability prevents temporary failures from derailing long-term goals.' },
  { from: 'resilience', to: 'interpersonal', strength: 0.81, modes: ['egalitarian'], color: '#F59E0B', label: 'Resilience repairs relationships', detail: 'Emotional regulation prevents conflicts from escalating and enables repair.' },
  { from: 'resilience', to: 'learning', strength: 0.79, modes: ['egalitarian', 'hierarchical'], color: '#F59E0B', label: 'Resilience enables learning', detail: 'Tolerating frustration is essential for persisting through difficult learning phases.' },
  { from: 'resilience', to: 'action', strength: 0.84, modes: ['hierarchical'], color: '#F59E0B', label: 'Resilience sustains action', detail: 'Maintaining stability under pressure ensures consistent performance.' }
];

export default function PillarConnectionModal({ isOpen, onClose, connection, mode }) {
  if (!connection) return null;

  const getConnectionPath = (from, to) => {
    const fromPos = pillarConfig[from].position;
    const toPos = pillarConfig[to].position;
    
    const x1 = fromPos.x;
    const y1 = fromPos.y;
    const x2 = toPos.x;
    const y2 = toPos.y;
    
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    
    const offsetX = (y2 - y1) * 0.1;
    const offsetY = (x1 - x2) * 0.1;
    
    return `M ${x1} ${y1} Q ${midX + offsetX} ${midY + offsetY} ${x2} ${y2}`;
  };

  const FromIcon = pillarConfig[connection.from]?.icon;
  const ToIcon = pillarConfig[connection.to]?.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          {/* Sparkles Background */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <SparklesCore
              id="connection-modal-sparkles"
              background="transparent"
              minSize={0.3}
              maxSize={1}
              particleDensity={60}
              className="w-full h-full"
              particleColor="#EC4899"
              speed={0.3}
            />
          </div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0F0F12] border border-white/20 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {FromIcon && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${pillarConfig[connection.from].color}20` }}
                    >
                      <FromIcon className="w-4 h-4" style={{ color: pillarConfig[connection.from].color }} />
                    </div>
                  )}
                  <ArrowRight className="w-5 h-5 text-zinc-500" />
                  {ToIcon && (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${pillarConfig[connection.to].color}20` }}
                    >
                      <ToIcon className="w-4 h-4" style={{ color: pillarConfig[connection.to].color }} />
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{connection.label}</h2>
                  <p className="text-sm text-zinc-400">
                    {pillarConfig[connection.from]?.label} → {pillarConfig[connection.to]?.label}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mini 2D Graph */}
            <div className="mb-8 bg-black/40 rounded-2xl p-6 border border-white/10 relative">
              <svg className="w-full aspect-[4/3]" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter id="glow-conn">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Pentagon outline */}
                <polygon
                  points="50,10 90,35 75,80 25,80 10,35"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="0.5"
                  strokeDasharray="2 2"
                />

                {/* Highlighted connection */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: connection.strength }}
                  transition={{ duration: 0.8 }}
                  d={getConnectionPath(connection.from, connection.to)}
                  fill="none"
                  stroke={connection.color}
                  strokeWidth="2.5"
                  filter="url(#glow-conn)"
                />

                {/* All pillar nodes */}
                {Object.entries(pillarConfig).map(([id, config]) => {
                  const PillarIcon = config.icon;
                  const isConnected = id === connection.from || id === connection.to;
                  
                  return (
                    <g key={id}>
                      <circle
                        cx={config.position.x}
                        cy={config.position.y}
                        r={isConnected ? 6 : 4}
                        fill={isConnected ? config.color : 'rgba(255,255,255,0.1)'}
                        stroke="white"
                        strokeWidth={isConnected ? 2 : 1}
                        opacity={isConnected ? 1 : 0.3}
                        filter={isConnected ? 'url(#glow-conn)' : undefined}
                      />
                      {isConnected && (
                        <foreignObject
                          x={config.position.x - 3}
                          y={config.position.y - 3}
                          width={6}
                          height={6}
                        >
                          <div className="w-full h-full flex items-center justify-center">
                            <PillarIcon className="w-3 h-3 text-white" style={{ transform: 'scale(0.5)' }} />
                          </div>
                        </foreignObject>
                      )}
                    </g>
                  );
                })}
              </svg>
              
              {/* Strength indicator */}
              <div className="absolute bottom-2 right-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                <p className="text-xs text-zinc-300 font-medium">
                  Strength: {Math.round(connection.strength * 100)}%
                </p>
              </div>
            </div>

            {/* Connection Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Connection Details</h3>
              
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {connection.detail}
                </p>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <span className="text-xs text-zinc-400 font-medium">Strength:</span>
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: connection.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${connection.strength * 100}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {Math.round(connection.strength * 100)}%
                  </span>
                </div>
              </motion.div>

              <div className="p-4 rounded-xl border" style={{
                backgroundColor: mode === 'egalitarian' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: mode === 'egalitarian' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(245, 158, 11, 0.3)'
              }}>
                <p className="text-sm text-zinc-300">
                  This connection is active in <span className="font-semibold">{mode}</span> mode. 
                  Toggle mode to see how relationships change in different organizational structures.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}