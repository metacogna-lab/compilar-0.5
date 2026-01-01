import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  Play, RotateCcw, ChevronRight, Sparkles, TrendingUp, TrendingDown, 
  AlertCircle, Users, Target, Zap, Brain, Clock, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const scenarios = {
  crisis: {
    name: 'Production Crisis',
    description: 'Critical system outage affecting customers',
    duration: 5,
    initialScores: { purpose: 65, interpersonal: 70, learning: 60, action: 55, resilience: 50 },
    phases: [
      { time: 0, event: 'Critical outage detected', pressure: 'high' },
      { time: 1, event: 'Root cause investigation', pressure: 'high' },
      { time: 2, event: 'Implementing fix', pressure: 'high' },
      { time: 3, event: 'Testing solution', pressure: 'medium' },
      { time: 4, event: 'Post-mortem analysis', pressure: 'low' }
    ],
    optimalMode: 'hierarchical'
  },
  innovation: {
    name: 'Innovation Sprint',
    description: 'Exploring new product features and experiments',
    duration: 5,
    initialScores: { purpose: 60, interpersonal: 65, learning: 70, action: 60, resilience: 65 },
    phases: [
      { time: 0, event: 'Brainstorming session', pressure: 'low' },
      { time: 1, event: 'Ideation and prototyping', pressure: 'low' },
      { time: 2, event: 'User feedback gathering', pressure: 'medium' },
      { time: 3, event: 'Refining concepts', pressure: 'medium' },
      { time: 4, event: 'Presenting to stakeholders', pressure: 'medium' }
    ],
    optimalMode: 'egalitarian'
  },
  planning: {
    name: 'Strategic Planning',
    description: 'Quarterly planning and goal setting',
    duration: 5,
    initialScores: { purpose: 70, interpersonal: 75, learning: 65, action: 65, resilience: 70 },
    phases: [
      { time: 0, event: 'Reviewing past quarter', pressure: 'low' },
      { time: 1, event: 'Setting objectives', pressure: 'low' },
      { time: 2, event: 'Resource allocation', pressure: 'medium' },
      { time: 3, event: 'Risk assessment', pressure: 'medium' },
      { time: 4, event: 'Finalizing commitments', pressure: 'high' }
    ],
    optimalMode: 'balanced'
  },
  execution: {
    name: 'Sprint Execution',
    description: 'Tight deadline feature delivery',
    duration: 5,
    initialScores: { purpose: 75, interpersonal: 60, learning: 55, action: 70, resilience: 65 },
    phases: [
      { time: 0, event: 'Sprint kickoff', pressure: 'low' },
      { time: 1, event: 'Development in progress', pressure: 'medium' },
      { time: 2, event: 'Blockers emerging', pressure: 'high' },
      { time: 3, event: 'Final push to completion', pressure: 'high' },
      { time: 4, event: 'Demo and retrospective', pressure: 'low' }
    ],
    optimalMode: 'balanced'
  }
};

const modeEffects = {
  egalitarian: {
    purpose: { group: 8, individual: -2 },
    interpersonal: { warmth: 10, authority: -5 },
    learning: { sharing: 12, control: -3 },
    action: { innovation: 10, speed: -5 },
    resilience: { support: 8, efficiency: -4 }
  },
  hierarchical: {
    purpose: { group: -3, individual: 10 },
    interpersonal: { warmth: -6, authority: 12 },
    learning: { sharing: -5, control: 10 },
    action: { innovation: -4, speed: 12 },
    resilience: { support: -3, efficiency: 10 }
  }
};

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber'
};

export default function InteractiveModeSimulation() {
  const [selectedScenario, setSelectedScenario] = useState('crisis');
  const [currentPhase, setCurrentPhase] = useState(0);
  const [modeChoices, setModeChoices] = useState([]);
  const [scores, setScores] = useState({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);
  const [aiCommentary, setAiCommentary] = useState('');
  const [loadingCommentary, setLoadingCommentary] = useState(false);

  const scenario = scenarios[selectedScenario];

  useEffect(() => {
    if (scenario) {
      setScores(scenario.initialScores);
      setCurrentPhase(0);
      setModeChoices([]);
      setSimulationComplete(false);
      setAiCommentary('');
    }
  }, [selectedScenario]);

  const calculateScoreChange = (pillar, mode, phase) => {
    const effects = modeEffects[mode];
    const pressure = scenario.phases[phase].pressure;
    
    let baseChange = 0;
    
    // Apply mode-specific effects
    switch (pillar) {
      case 'purpose':
        baseChange = mode === 'egalitarian' ? effects.purpose.group : effects.purpose.individual;
        break;
      case 'interpersonal':
        baseChange = mode === 'egalitarian' ? effects.interpersonal.warmth : effects.interpersonal.authority;
        break;
      case 'learning':
        baseChange = mode === 'egalitarian' ? effects.learning.sharing : effects.learning.control;
        break;
      case 'action':
        baseChange = mode === 'egalitarian' ? effects.action.innovation : effects.action.speed;
        break;
      case 'resilience':
        baseChange = mode === 'egalitarian' ? effects.resilience.support : effects.resilience.efficiency;
        break;
    }

    // Modify based on scenario fit
    const isOptimalChoice = (scenario.optimalMode === mode) || 
      (scenario.optimalMode === 'balanced' && phase % 2 === (mode === 'egalitarian' ? 0 : 1));
    
    const pressureModifier = pressure === 'high' ? 1.3 : pressure === 'medium' ? 1.0 : 0.7;
    const fitModifier = isOptimalChoice ? 1.2 : 0.8;

    return Math.round(baseChange * pressureModifier * fitModifier);
  };

  const applyModeChoice = async (mode) => {
    if (isSimulating) return;

    setIsSimulating(true);
    const newChoices = [...modeChoices, { phase: currentPhase, mode }];
    setModeChoices(newChoices);

    // Calculate new scores
    const newScores = { ...scores };
    Object.keys(newScores).forEach(pillar => {
      const change = calculateScoreChange(pillar, mode, currentPhase);
      newScores[pillar] = Math.max(0, Math.min(100, newScores[pillar] + change));
    });

    // Animate score changes
    await new Promise(resolve => setTimeout(resolve, 800));
    setScores(newScores);
    
    if (currentPhase < scenario.duration - 1) {
      setCurrentPhase(currentPhase + 1);
      setIsSimulating(false);
    } else {
      setSimulationComplete(true);
      setIsSimulating(false);
      generateAICommentary(newChoices, newScores);
    }
  };

  const generateAICommentary = async (choices, finalScores) => {
    setLoadingCommentary(true);
    
    try {
      const choicesSummary = choices.map((c, i) => 
        `Phase ${i + 1} (${scenario.phases[i].event}): ${c.mode} mode`
      ).join('\n');

      const scoreDiff = Object.keys(finalScores).map(pillar => {
        const diff = finalScores[pillar] - scenario.initialScores[pillar];
        return `${pillar}: ${diff > 0 ? '+' : ''}${diff}`;
      }).join(', ');

      const prompt = `As a team dynamics expert analyzing a PILAR framework simulation:

Scenario: ${scenario.name} - ${scenario.description}
Optimal approach: ${scenario.optimalMode} mode

Mode choices made:
${choicesSummary}

Score changes: ${scoreDiff}
Final scores: ${Object.entries(finalScores).map(([p, s]) => `${p}: ${s}%`).join(', ')}

Provide a concise 3-4 sentence analysis:
1. How well did the mode choices fit the scenario?
2. What was the impact on team dynamics and pillar scores?
3. One key insight or lesson learned.

Be specific, actionable, and reference the PILAR framework.`;

      const response = await base44.integrations.Core.InvokeLLM({ 
        prompt,
        add_context_from_internet: false
      });

      setAiCommentary(response);
    } catch (error) {
      setAiCommentary('Unable to generate commentary. The simulation results show the impact of your mode choices on team dynamics.');
    } finally {
      setLoadingCommentary(false);
    }
  };

  const resetSimulation = () => {
    setScores(scenario.initialScores);
    setCurrentPhase(0);
    setModeChoices([]);
    setSimulationComplete(false);
    setAiCommentary('');
  };

  const getScoreTrend = (pillar) => {
    const initial = scenario.initialScores[pillar];
    const current = scores[pillar];
    const diff = current - initial;
    
    if (Math.abs(diff) < 3) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      {!simulationComplete && currentPhase === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-violet-400" />
            Choose Your Scenario
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {Object.entries(scenarios).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setSelectedScenario(key)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all',
                  selectedScenario === key
                    ? 'bg-violet-500/20 border-violet-500/30'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                )}
              >
                <h4 className="text-white font-semibold mb-1">{s.name}</h4>
                <p className="text-sm text-zinc-400">{s.description}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Simulation Area */}
      <div className="rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Progress</span>
            <span className="text-sm text-zinc-400">{currentPhase + 1} / {scenario.duration}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentPhase + 1) / scenario.duration) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Current Phase */}
        {!simulationComplete && (
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-violet-500/20 border border-violet-500/30">
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Phase {currentPhase + 1}</h4>
                <p className="text-sm text-zinc-400">{scenario.phases[currentPhase].event}</p>
              </div>
              <div className={cn(
                'ml-auto px-3 py-1 rounded-full text-xs font-medium',
                scenario.phases[currentPhase].pressure === 'high' && 'bg-red-500/20 text-red-400',
                scenario.phases[currentPhase].pressure === 'medium' && 'bg-amber-500/20 text-amber-400',
                scenario.phases[currentPhase].pressure === 'low' && 'bg-emerald-500/20 text-emerald-400'
              )}>
                {scenario.phases[currentPhase].pressure} pressure
              </div>
            </div>

            {/* Mode Choice */}
            <div className="space-y-3">
              <p className="text-zinc-300 text-sm mb-3">How should the team operate in this phase?</p>
              <div className="grid md:grid-cols-2 gap-3">
                <Button
                  onClick={() => applyModeChoice('egalitarian')}
                  disabled={isSimulating}
                  className="h-auto py-4 px-6 bg-indigo-500/20 hover:bg-indigo-500/30 text-white border border-indigo-500/30 justify-start"
                >
                  <div className="text-left flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Egalitarian Mode
                    </div>
                    <div className="text-xs text-indigo-200/70">Distributed power, group focus, collaboration</div>
                  </div>
                </Button>
                <Button
                  onClick={() => applyModeChoice('hierarchical')}
                  disabled={isSimulating}
                  className="h-auto py-4 px-6 bg-amber-500/20 hover:bg-amber-500/30 text-white border border-amber-500/30 justify-start"
                >
                  <div className="text-left flex-1">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Hierarchical Mode
                    </div>
                    <div className="text-xs text-amber-200/70">Concentrated authority, fast decisions</div>
                  </div>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* PILAR Scores */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-zinc-300 mb-3">Team Dynamics (PILAR Scores)</h4>
          {Object.entries(scores).map(([pillar, score]) => {
            const trend = getScoreTrend(pillar);
            return (
              <motion.div
                key={pillar}
                layout
                className="flex items-center gap-3"
              >
                <span className="text-sm text-zinc-400 capitalize w-28">{pillar}</span>
                <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-${pillarColors[pillar]}-500`}
                    initial={{ width: `${scenario.initialScores[pillar]}%` }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <span className="text-sm text-white font-medium w-12 text-right">{score}%</span>
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                {trend === 'stable' && <div className="w-4" />}
              </motion.div>
            );
          })}
        </div>

        {/* Simulation Complete */}
        {simulationComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <Award className="w-5 h-5" />
                <span className="font-semibold">Simulation Complete!</span>
              </div>
              <Button
                onClick={resetSimulation}
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>

            {/* AI Commentary */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
              <div className="flex items-center gap-2 text-violet-400 mb-3">
                <Brain className="w-5 h-5" />
                <span className="font-medium">AI Analysis</span>
              </div>
              {loadingCommentary ? (
                <div className="flex items-center gap-2 text-zinc-400">
                  <div className="w-4 h-4 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                  Analyzing your decisions...
                </div>
              ) : (
                <p className="text-zinc-300 text-sm leading-relaxed">{aiCommentary}</p>
              )}
            </div>

            {/* Mode Choices Summary */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Your Mode Choices</h4>
              <div className="space-y-2">
                {modeChoices.map((choice, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-zinc-500">Phase {i + 1}:</span>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      choice.mode === 'egalitarian' 
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-amber-500/20 text-amber-400'
                    )}>
                      {choice.mode}
                    </span>
                    <span className="text-zinc-400 text-xs">{scenario.phases[i].event}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}