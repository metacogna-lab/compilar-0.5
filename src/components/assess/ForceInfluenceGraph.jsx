import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { forceConnectionsData } from '@/components/pilar/forceConnectionsData';
import { mechanicalSpring } from '../config/motion';

export default function ForceInfluenceGraph({ pillar, mode, forces = [], connections = [], onForceClick }) {
  const [selectedForce, setSelectedForce] = useState(null);
  const [hoveredForce, setHoveredForce] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [difficultyLevel, setDifficultyLevel] = useState('intermediate');

  const activeForce = hoveredForce || selectedForce;

  // Get force connections from the same data source as PilarDefinitions
  const modeConnections = forceConnectionsData.forces.filter(f => 
    f.mode.toLowerCase() === mode?.toLowerCase()
  );

  // Get force prompt cards data for high/low descriptions
  const getForceCardData = (forceName) => {
    return forceConnectionsData.forces.find(f => 
      f.name === forceName && f.mode.toLowerCase() === mode?.toLowerCase()
    );
  };

  const getEffectTypeColor = (effectType) => {
    const type = effectType?.toLowerCase();
    if (type === 'reinforce') return { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' };
    if (type === 'inverse') return { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400' };
    if (type === 'discretionary') return { bg: 'bg-zinc-500/20', border: 'border-zinc-500/30', text: 'text-zinc-400' };
    return { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white' };
  };

  const isConnected = (force) => {
    if (!activeForce) return false;
    return modeConnections.some(
      conn => 
        (conn.force_from === activeForce.name && conn.force_to === force.name) ||
        (conn.force_to === activeForce.name && conn.force_from === force.name)
    );
  };

  const getDensityLevel = () => {
    if (difficultyLevel === 'beginner') return { cols: 2, showEffects: true, showDescriptions: true };
    if (difficultyLevel === 'intermediate') return { cols: 3, showEffects: true, showDescriptions: false };
    return { cols: 4, showEffects: false, showDescriptions: false };
  };

  const density = getDensityLevel();

  return (
    <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl">
      {/* Header with collapse toggle */}
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="ghost"
          className="text-white hover:bg-white/10 p-2"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          <span className="ml-2">{isExpanded ? 'Collapse' : 'Expand'} Network</span>
        </Button>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Difficulty:</span>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() => setDifficultyLevel(level)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                difficultyLevel === level
                  ? 'bg-violet-500/30 text-violet-300 border border-violet-500/50'
                  : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-zinc-400 mb-6">
              Click or hover over a force to see its connections, effects, and impact ranges
            </p>

            {/* Force Grid */}
            <div className={`grid grid-cols-${density.cols} gap-3`}>
              {forces.map((force, idx) => {
                const isActive = activeForce?.name === force.name;
                const isLinked = isConnected(force);
                const forceCard = getForceCardData(force.name);
                const colorScheme = getEffectTypeColor(forceCard?.type);

                return (
                  <motion.button
                    key={idx}
                    layout
                    onClick={() => {
                      setSelectedForce(force);
                      if (onForceClick) {
                        onForceClick(force.name);
                      }
                    }}
                    onMouseEnter={() => setHoveredForce(force)}
                    onMouseLeave={() => setHoveredForce(null)}
                    whileHover={{ scale: 1.05 }}
                    transition={mechanicalSpring}
                    className={`text-left p-4 rounded-lg border transition-all ${
                      isActive 
                        ? colorScheme.border + ' ' + colorScheme.bg 
                        : isLinked 
                        ? 'border-violet-500/30 bg-violet-500/10' 
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <p className="text-sm font-semibold text-white mb-1">{force.name}</p>
                    {density.showDescriptions && (
                      <p className="text-xs text-zinc-400 line-clamp-2">{force.description}</p>
                    )}
                    {density.showEffects && forceCard && (
                      <div className="mt-2 space-y-1 text-xs">
                        <p className="text-zinc-500">Type: <span className="text-zinc-300">{forceCard.type}</span></p>
                        {(forceCard.effect_low_1_2 !== undefined || forceCard.effect_low_3_4 !== undefined) && (
                          <div>
                            <span className="text-red-400">Low: {forceCard.effect_low_1_2 || forceCard.effect_low_3_4}</span>
                          </div>
                        )}
                        {(forceCard.effect_high_7_8 !== undefined || forceCard.effect_high_9_10 !== undefined) && (
                          <div>
                            <span className="text-emerald-400">High: {forceCard.effect_high_7_8 || forceCard.effect_high_9_10}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Force Details */}
            {activeForce && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                {(() => {
                  const forceCard = getForceCardData(activeForce.name);
                  return (
                    <>
                      {forceCard && (
                        <>
                          <div className="mb-3 p-3 bg-white/5 rounded-lg border border-white/10 space-y-3">
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Name:</p>
                                <p className="text-sm text-white font-medium">{activeForce.name}</p>
                              </div>

                              <div>
                                <p className="text-xs text-zinc-500 mb-1">Description:</p>
                                <p className="text-xs text-zinc-300">{activeForce.description}</p>
                              </div>

                              {forceCard && forceCard.type && (
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Type:</p>
                                  <p className="text-sm text-zinc-200 font-medium">{forceCard.type}</p>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">Low Range Effect:</p>
                                  {forceCard && (forceCard.effect_low_1_2 !== undefined || forceCard.effect_low_3_4 !== undefined) && (
                                    <p className="text-xs text-red-400 font-medium mb-1">
                                      {forceCard.effect_low_1_2 !== undefined ? forceCard.effect_low_1_2 : forceCard.effect_low_3_4}
                                    </p>
                                  )}
                                  {forceCard && forceCard.description_low && (
                                    <p className="text-xs text-zinc-300">{forceCard.description_low}</p>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-500 mb-1">High Range Effect:</p>
                                  {forceCard && (forceCard.effect_high_7_8 !== undefined || forceCard.effect_high_9_10 !== undefined) && (
                                    <p className="text-xs text-emerald-400 font-medium mb-1">
                                      {forceCard.effect_high_9_10 !== undefined ? forceCard.effect_high_9_10 : forceCard.effect_high_7_8}
                                    </p>
                                  )}
                                  {forceCard && forceCard.description_high && (
                                    <p className="text-xs text-zinc-300">{forceCard.description_high}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          </>
                          )}
                      
                      {modeConnections.filter(conn => 
                        conn.force_from === activeForce.name || conn.force_to === activeForce.name
                      ).length > 0 && (
                        <div>
                          <p className="text-xs text-zinc-500 mb-2">Connected to:</p>
                          <div className="flex flex-wrap gap-2">
                            {modeConnections
                              .filter(conn => conn.force_from === activeForce.name || conn.force_to === activeForce.name)
                              .map((conn, idx) => {
                                const connectedForce = conn.force_from === activeForce.name ? conn.force_to : conn.force_from;
                                const colorScheme = getEffectTypeColor(conn.effect_type);
                                return (
                                  <span key={idx} className={`text-xs px-2 py-1 ${colorScheme.bg} ${colorScheme.text} rounded`}>
                                    {connectedForce}
                                  </span>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}