import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';

export default function PillarDetailModal({ isOpen, onClose, pillar, mode, connections }) {
  const [selectedForce, setSelectedForce] = React.useState(null);
  
  React.useEffect(() => {
    setSelectedForce(null);
  }, [isOpen, pillar?.id]);
  
  if (!isOpen || !pillar) return null;

  const Icon = pillar.icon;
  const relatedConnections = connections.filter(c => 
    (c.from === pillar.id || c.to === pillar.id) && c.modes.includes(mode)
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Sparkles Background */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <SparklesCore
            id="pillar-detail-modal-sparkles"
            background="transparent"
            minSize={0.3}
            maxSize={1}
            particleDensity={60}
            className="w-full h-full"
            particleColor="#8B5CF6"
            speed={0.4}
          />
        </div>
        
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-zinc-900/95 to-black/95 border border-white/10 rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border-b border-white/10 p-6 z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${pillar.bgGradient} border ${pillar.borderColor}`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">{pillar.title}</h2>
                  <p className="text-sm text-zinc-400">{pillar.abbreviation}</p>
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
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">Overview</h3>
              <p className="text-zinc-300 leading-relaxed">{pillar.description}</p>
            </div>

            {/* Full Description if available */}
            {pillar.fullDescription && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-zinc-300 leading-relaxed">{pillar.fullDescription}</p>
              </div>
            )}

            {/* High/Low Descriptions */}
            {pillar.highLowDescriptions && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">High Expression</h3>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20">
                    <p className="text-sm text-zinc-300 leading-relaxed">{pillar.highLowDescriptions.High.description}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider">Low Expression</h3>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20">
                    <p className="text-sm text-zinc-300 leading-relaxed">{pillar.highLowDescriptions.Low.description}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Active Connections */}
            {relatedConnections.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                  Active Connections ({relatedConnections.length})
                </h3>
                <div className="space-y-2">
                  {relatedConnections.map((conn, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-white font-medium">{conn.label}</p>
                        <span className="text-xs text-zinc-500">{Math.round(conn.strength * 100)}%</span>
                      </div>
                      <p className="text-xs text-zinc-400">{conn.detail}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}