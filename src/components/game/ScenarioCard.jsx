import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '../stores/useGameStore';
import { mechanicalSpring } from '../config/motion';

/**
 * ScenarioCard Component
 * Displays quest scenarios with interactive choices and pillar impact preview
 */
export default function ScenarioCard({ scenarioData }) {
  const { 
    activeScenario, 
    resolveScenario, 
    setPreviewForces, 
    clearPreview, 
    previewImpact,
    pillars 
  } = useGameStore();
  
  const [isResolving, setIsResolving] = useState(false);

  if (!activeScenario) return null;

  const handleChoiceClick = (choiceId) => {
    setIsResolving(true);
    
    // Animate swipe away
    setTimeout(() => {
      resolveScenario(choiceId, scenarioData);
      setIsResolving(false);
    }, 400);
  };

  const getPillarColor = (pillarKey) => {
    const colors = {
      purpose: 'violet',
      interpersonal: 'pink',
      learning: 'indigo',
      action: 'emerald',
      resilience: 'amber',
    };
    return colors[pillarKey] || 'zinc';
  };

  const getPillarName = (pillarKey) => {
    const names = {
      purpose: 'Purpose',
      interpersonal: 'Interpersonal',
      learning: 'Learning',
      action: 'Action',
      resilience: 'Resilience',
    };
    return names[pillarKey] || pillarKey;
  };

  return (
    <AnimatePresence mode="wait">
      {activeScenario && (
        <motion.div
          key={activeScenario.id}
          initial={{ opacity: 0, x: 100, rotateY: -15 }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            rotateY: 0,
            transition: mechanicalSpring 
          }}
          exit={{ 
            opacity: 0, 
            x: isResolving ? -200 : 100, 
            scale: 0.9,
            rotateY: isResolving ? 15 : -15,
            transition: { duration: 0.4, ease: 'easeInOut' }
          }}
          className="relative w-full max-w-2xl mx-auto"
        >
          {/* Card Container */}
          <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl overflow-hidden">
            {/* Glowing Edge Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-pink-500/10 to-violet-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, ...mechanicalSpring }}
                className="flex items-center gap-2 mb-2"
              >
                <Sparkles className="w-5 h-5 text-violet-400" />
                <span className="text-xs text-violet-400 font-semibold uppercase tracking-wider">
                  Scenario Quest
                </span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, ...mechanicalSpring }}
                className="text-2xl font-bold text-white mb-2"
              >
                {activeScenario.title}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-zinc-400 text-sm leading-relaxed"
              >
                {activeScenario.description}
              </motion.p>
            </div>

            {/* Choices */}
            <div className="p-6 space-y-3">
              {activeScenario.choices?.map((choice, idx) => (
                <motion.div
                  key={choice.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.05, ...mechanicalSpring }}
                >
                  <Button
                    onClick={() => handleChoiceClick(choice.id)}
                    onMouseEnter={() => setPreviewForces(choice.id)}
                    onMouseLeave={clearPreview}
                    className="w-full text-left p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 rounded-lg transition-all group relative overflow-hidden"
                    disabled={isResolving}
                  >
                    {/* Hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative z-10">
                      <p className="text-white font-medium mb-1">{choice.text}</p>
                      
                      {/* Impact Preview on Hover */}
                      <AnimatePresence>
                        {previewImpact && choice.id === activeScenario.choices.find(c => choice.impact === previewImpact)?.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-white/10"
                          >
                            {Object.entries(choice.impact || {}).map(([pillarKey, value]) => {
                              const color = getPillarColor(pillarKey);
                              const isPositive = value > 0;
                              
                              return (
                                <span
                                  key={pillarKey}
                                  className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${
                                    isPositive
                                      ? `bg-emerald-500/20 border-emerald-500/30 text-emerald-400`
                                      : `bg-red-500/20 border-red-500/30 text-red-400`
                                  }`}
                                >
                                  {isPositive ? (
                                    <TrendingUp className="w-3 h-3" />
                                  ) : (
                                    <TrendingDown className="w-3 h-3" />
                                  )}
                                  {getPillarName(pillarKey)} {isPositive ? '+' : ''}{value}
                                </span>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Current Pillar Indicators */}
            <div className="p-6 pt-0">
              <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">Current State</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(pillars).map(([key, value]) => {
                  const color = getPillarColor(key);
                  const isPreviewActive = previewImpact && previewImpact[key] !== undefined;
                  const previewValue = isPreviewActive ? value + previewImpact[key] : value;
                  
                  return (
                    <motion.div
                      key={key}
                      layout
                      transition={mechanicalSpring}
                      className={`px-3 py-1.5 rounded-lg border text-xs ${
                        isPreviewActive
                          ? `bg-${color}-500/20 border-${color}-500/40`
                          : `bg-white/5 border-white/10`
                      }`}
                    >
                      <span className="text-zinc-400">{getPillarName(key)}:</span>{' '}
                      <span className={`font-semibold ${isPreviewActive ? `text-${color}-400` : 'text-white'}`}>
                        {Math.round(value)}
                        {isPreviewActive && (
                          <span className={previewImpact[key] > 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {' → '}{Math.round(previewValue)}
                          </span>
                        )}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}