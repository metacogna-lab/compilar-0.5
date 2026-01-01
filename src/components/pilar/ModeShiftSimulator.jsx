import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, TrendingUp, TrendingDown, Users, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const scenarios = [
  {
    id: 'planning',
    name: 'Sprint Planning',
    description: 'Team needs to brainstorm and decide on priorities',
    optimal: 'egalitarian',
    before: { psych_safety: 40, innovation: 30, speed: 70, clarity: 50 },
    after_egal: { psych_safety: 85, innovation: 90, speed: 50, clarity: 70 },
    after_hier: { psych_safety: 45, innovation: 35, speed: 85, clarity: 80 }
  },
  {
    id: 'crisis',
    name: 'Production Crisis',
    description: 'Critical system failure requires immediate action',
    optimal: 'hierarchical',
    before: { psych_safety: 60, innovation: 50, speed: 40, clarity: 45 },
    after_egal: { psych_safety: 65, innovation: 55, speed: 35, clarity: 40 },
    after_hier: { psych_safety: 50, innovation: 30, speed: 95, clarity: 90 }
  },
  {
    id: 'execution',
    name: 'Feature Execution',
    description: 'Implementing well-defined requirements under deadline',
    optimal: 'hierarchical',
    before: { psych_safety: 55, innovation: 40, speed: 60, clarity: 55 },
    after_egal: { psych_safety: 60, innovation: 65, speed: 50, clarity: 50 },
    after_hier: { psych_safety: 50, innovation: 35, speed: 90, clarity: 85 }
  },
  {
    id: 'retrospective',
    name: 'Team Retrospective',
    description: 'Reflecting on what went well and what to improve',
    optimal: 'egalitarian',
    before: { psych_safety: 50, innovation: 45, speed: 50, clarity: 50 },
    after_egal: { psych_safety: 90, innovation: 85, speed: 55, clarity: 75 },
    after_hier: { psych_safety: 40, innovation: 30, speed: 70, clarity: 65 }
  }
];

const metrics = [
  { key: 'psych_safety', label: 'Psychological Safety', color: 'indigo' },
  { key: 'innovation', label: 'Innovation', color: 'violet' },
  { key: 'speed', label: 'Decision Speed', color: 'emerald' },
  { key: 'clarity', label: 'Role Clarity', color: 'amber' }
];

export default function ModeShiftSimulator() {
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [currentMode, setCurrentMode] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleModeShift = (mode) => {
    setIsAnimating(true);
    setCurrentMode(mode);
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const handleReset = () => {
    setCurrentMode(null);
    setIsAnimating(false);
  };

  const currentMetrics = currentMode 
    ? (currentMode === 'egalitarian' ? selectedScenario.after_egal : selectedScenario.after_hier)
    : selectedScenario.before;

  return (
    <div className="space-y-6">
      {/* Scenario Selector */}
      <div>
        <h4 className="text-white font-semibold mb-3">Select a Scenario:</h4>
        <div className="grid md:grid-cols-2 gap-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => {
                setSelectedScenario(scenario);
                handleReset();
              }}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedScenario.id === scenario.id
                  ? 'bg-violet-500/20 border-violet-500/40'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <h5 className="text-white font-medium mb-1">{scenario.name}</h5>
              <p className="text-xs text-zinc-400">{scenario.description}</p>
              <div className="mt-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  scenario.optimal === 'egalitarian' 
                    ? 'bg-indigo-500/20 text-indigo-300' 
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  Optimal: {scenario.optimal}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Shift Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={() => handleModeShift('egalitarian')}
          disabled={isAnimating || currentMode === 'egalitarian'}
          className="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300"
        >
          <Users className="w-4 h-4 mr-2" />
          Shift to Egalitarian
        </Button>
        <Button
          onClick={handleReset}
          disabled={!currentMode}
          variant="outline"
          className="border-white/20"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          onClick={() => handleModeShift('hierarchical')}
          disabled={isAnimating || currentMode === 'hierarchical'}
          className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300"
        >
          <Crown className="w-4 h-4 mr-2" />
          Shift to Hierarchical
        </Button>
      </div>

      {/* Metrics Visualization */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold">Team Dynamics Impact</h4>
          {currentMode && (
            <span className={`text-sm px-3 py-1 rounded-full ${
              currentMode === 'egalitarian' 
                ? 'bg-indigo-500/20 text-indigo-300' 
                : 'bg-amber-500/20 text-amber-300'
            }`}>
              {currentMode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode Active
            </span>
          )}
        </div>

        <div className="space-y-4">
          {metrics.map((metric) => {
            const before = selectedScenario.before[metric.key];
            const current = currentMetrics[metric.key];
            const change = current - before;

            return (
              <div key={metric.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white font-bold">{current}%</span>
                    {currentMode && change !== 0 && (
                      <span className={`text-xs flex items-center gap-1 ${
                        change > 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(change)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute inset-y-0 left-0 bg-${metric.color}-500`}
                    initial={{ width: `${before}%` }}
                    animate={{ width: `${current}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis */}
      <AnimatePresence>
        {currentMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`p-4 rounded-xl border ${
              currentMode === selectedScenario.optimal
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}
          >
            <p className="text-sm text-white">
              {currentMode === selectedScenario.optimal ? (
                <>✓ <strong>Optimal choice!</strong> {currentMode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} mode is well-suited for {selectedScenario.name.toLowerCase()}.</>
              ) : (
                <>⚠️ <strong>Suboptimal mode.</strong> Consider {selectedScenario.optimal} mode for better results in {selectedScenario.name.toLowerCase()}.</>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}