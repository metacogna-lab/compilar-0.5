import React from 'react';
import { motion } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RevealedPillarCard({ pillarData, mode, onClose, onStartAssessment }) {
  if (!pillarData) return null;
  
  const Icon = pillarData.icon;
  const colorClass = pillarData.color ? `text-${pillarData.color}-400` : 'text-gray-400';
  const bgGradientClass = pillarData.bgGradient || 'from-white/10 to-white/5';
  const borderColorClass = pillarData.borderColor || 'border-white/10';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ 
          scale: 0.3,
          rotateY: -180,
          x: 0,
          y: 200,
        }}
        animate={{ 
          scale: 1,
          rotateY: 0,
          x: 0,
          y: 0,
        }}
        exit={{ 
          scale: 0.8,
          opacity: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 25,
          duration: 0.8,
        }}
        className="relative max-w-3xl w-full my-8 mx-auto"
        style={{ transformStyle: 'preserve-3d' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-3xl border-2 border-white/20 backdrop-blur-xl p-4 sm:p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Mode Badge */}
          <div className="flex justify-center mb-6">
            <div className={`px-4 py-2 rounded-full text-xs font-semibold ${
              mode === 'egalitarian' 
                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              {mode === 'egalitarian' ? 'Egalitarian Coordination Pattern' : 'Hierarchical Coordination Pattern'}
            </div>
          </div>

          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${bgGradientClass} flex items-center justify-center border ${borderColorClass}`}
          >
            {Icon && <Icon className={`w-12 h-12 ${colorClass}`} />}
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold text-white text-center mb-2"
          >
            {pillarData.title || 'Pillar'}
          </motion.h2>

          {/* Abbreviation */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-center text-sm font-semibold ${colorClass} mb-6`}
          >
            {pillarData.abbreviation || ''}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-zinc-300 text-center mb-8 leading-relaxed"
          >
            {pillarData.description}
          </motion.p>

          {/* High/Low Descriptions */}
          {pillarData.highLowDescriptions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-6 space-y-4"
            >
              {pillarData.highLowDescriptions.High?.description && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                    <span className="text-lg">↑</span> High Impact
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{pillarData.highLowDescriptions.High.description}</p>
                </div>
              )}
              {pillarData.highLowDescriptions.Low?.description && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <span className="text-lg">↓</span> Low Impact
                  </h3>
                  <p className="text-xs text-zinc-300 leading-relaxed">{pillarData.highLowDescriptions.Low.description}</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Forces */}
          {pillarData.forces && pillarData.forces.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-8"
            >
              <h3 className="text-sm font-semibold text-white mb-4 text-center">Key Forces ({pillarData.forces.length})</h3>
              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
                {pillarData.forces.map((force, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + idx * 0.1 }}
                    className="bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{force.name}</p>
                        {force.type && (
                          <span className={`text-xs px-2 py-0.5 rounded whitespace-nowrap ${
                            force.type === 'Reinforce' ? 'bg-emerald-500/20 text-emerald-300' :
                            force.type === 'Inverse' ? 'bg-red-500/20 text-red-300' :
                            'bg-zinc-500/20 text-zinc-300'
                          }`}>
                            {force.type}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mb-3 leading-relaxed">{force.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {force.Low && (
                        <div className="bg-red-500/10 rounded p-2 border border-red-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-red-400 font-medium">Low (1-4)</span>
                            {force.effect_low !== null && force.effect_low !== undefined && (
                              <span className="text-sm font-bold text-red-300">{force.effect_low > 0 ? '+' : ''}{force.effect_low}</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{force.Low}</p>
                        </div>
                      )}
                      {force.High && (
                        <div className="bg-emerald-500/10 rounded p-2 border border-emerald-500/20">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-emerald-400 font-medium">High (7-10)</span>
                            {force.effect_high !== null && force.effect_high !== undefined && (
                              <span className="text-sm font-bold text-emerald-300">{force.effect_high > 0 ? '+' : ''}{force.effect_high}</span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{force.High}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={onStartAssessment}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white py-6 text-lg"
            >
              Start Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}