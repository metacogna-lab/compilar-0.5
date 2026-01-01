import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Heart, BookOpen, Zap, Shield, 
  ArrowLeftRight, ChevronRight, X, Sparkles,
  Target, Users, Brain, TrendingUp, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose (Prospects)' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal (Liked)' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning (Involved)' },
  action: { icon: Zap, color: 'emerald', label: 'Action (Agency)' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience (Respect)' }
};

export default function InteractiveTheoryExplorer({ isOpen, onClose, frameworkData, userScores = {} }) {
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [explorationMode, setExplorationMode] = useState('overview'); // overview, pillar, forces, mechanism
  const [localBlend, setLocalBlend] = useState(0);
  const [selectedForce, setSelectedForce] = useState(null);
  const [commandModal, setCommandModal] = useState(null);

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setExplorationMode('overview');
      setSelectedPillar(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentMode = localBlend < 50 ? 'egalitarian' : 'hierarchical';
  const blendRatio = localBlend / 100;

  const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];

  const missionCommands = {
    explicit: {
      title: "Make Modes Explicit",
      description: "Clearly communicate which mode the team is operating in and why.",
      practices: [
        "Announce mode shifts at the start of meetings or phases",
        "Explain the reasoning behind choosing egalitarian vs hierarchical",
        "Use clear signals: 'We're in planning mode (egalitarian)' or 'We're executing (hierarchical)'",
        "Document mode decisions in project plans"
      ],
      example: "Before a crisis response: 'We're moving to hierarchical command for the next 2 hours. Sarah has final authority. After the crisis, we'll debrief in egalitarian mode.'"
    },
    transitions: {
      title: "Practice Deliberate Shifts",
      description: "Build muscle memory for moving between modes smoothly.",
      practices: [
        "Schedule regular practice transitions in low-stakes situations",
        "Use rituals to mark mode changes (stand-ups, huddles, debriefs)",
        "Train team members to recognize contextual triggers for shifts",
        "Celebrate successful transitions as a team capability"
      ],
      example: "A daily cycle: Morning planning (egalitarian), mid-day execution (hierarchical), evening retrospective (egalitarian)."
    },
    debrief: {
      title: "Debrief Balance",
      description: "Regularly reflect on how well the team is balancing modes.",
      practices: [
        "Review mode usage in retrospectives: too much of either?",
        "Ask: Did we use the right mode at the right time?",
        "Gather feedback on psychological safety across modes",
        "Adjust team norms based on debrief insights"
      ],
      example: "Weekly review: 'Did we suppress good ideas during execution? Did planning take too long? How can we improve our mode agility?'"
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">Explore the PILAR Framework</h3>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          An interactive journey through the 5 pillars, 20 forces, and their dynamic relationships across egalitarian and hierarchical modes.
        </p>
      </div>

      {/* Mode Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <motion.span 
            className="text-sm font-medium text-indigo-400"
            animate={{ opacity: localBlend < 50 ? 1 : 0.4 }}
          >
            Egalitarian Mode
          </motion.span>
          <span className="text-xs text-zinc-500">{localBlend}%</span>
          <motion.span 
            className="text-sm font-medium text-amber-400"
            animate={{ opacity: localBlend >= 50 ? 1 : 0.4 }}
          >
            Hierarchical Mode
          </motion.span>
        </div>
        <Slider
          value={[localBlend]}
          onValueChange={(v) => setLocalBlend(v[0])}
          max={100}
          step={1}
          className="mb-4"
        />
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <p className="text-sm text-zinc-400 leading-relaxed">
            {frameworkData[currentMode].summary}
          </p>
        </div>
      </div>

      {/* Pillar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {pillars.map((pillar, i) => {
          const config = pillarConfig[pillar];
          const Icon = config.icon;
          const score = userScores[pillar];
          
          return (
            <motion.button
              key={pillar}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => {
                setSelectedPillar(pillar);
                setExplorationMode('pillar');
              }}
              className={`p-4 rounded-xl bg-${config.color}-500/10 border border-${config.color}-500/30 hover:bg-${config.color}-500/20 transition-all group`}
            >
              <Icon className={`w-8 h-8 text-${config.color}-400 mx-auto mb-2 group-hover:scale-110 transition-transform`} />
              <p className="text-white text-xs font-medium mb-1 capitalize">{pillar}</p>
              {score !== undefined && (
                <p className={`text-${config.color}-400 text-xs font-bold`}>{score}%</p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-indigo-400" />
            <h4 className="text-white font-semibold">Egalitarian Strengths</h4>
          </div>
          <ul className="space-y-1">
            {frameworkData.egalitarian.strengths.map((s, i) => (
              <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h4 className="text-white font-semibold">Hierarchical Strengths</h4>
          </div>
          <ul className="space-y-1">
            {frameworkData.hierarchical.strengths.map((s, i) => (
              <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Mission Command Agility */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-violet-400" />
          <h4 className="text-white font-bold text-lg">Mission Command Agility</h4>
        </div>
        <p className="text-zinc-400 text-sm mb-4">
          The ability to shift fluidly between modes based on context – collaborating openly during planning, 
          tightening hierarchy during execution, then reopening for debrief.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCommandModal('explicit')}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs transition-colors"
          >
            Make modes explicit
          </button>
          <button
            onClick={() => setCommandModal('transitions')}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs transition-colors"
          >
            Practice transitions
          </button>
          <button
            onClick={() => setCommandModal('debrief')}
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white text-xs transition-colors"
          >
            Debrief balance
          </button>
        </div>
      </div>
    </div>
  );

  const renderPillarDetail = () => {
    if (!selectedPillar) return null;

    const config = pillarConfig[selectedPillar];
    const Icon = config.icon;
    const egalData = frameworkData.egalitarian.pillars[selectedPillar];
    const hierData = frameworkData.hierarchical.pillars[selectedPillar];
    const currentData = frameworkData[currentMode].pillars[selectedPillar];
    const score = userScores[selectedPillar];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-${config.color}-500/20 flex items-center justify-center`}>
            <Icon className={`w-8 h-8 text-${config.color}-400`} />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white capitalize">{selectedPillar}</h3>
            <p className={`text-${config.color}-400 font-medium`}>{currentData.construct}</p>
          </div>
          {score !== undefined && (
            <div className={`px-4 py-2 rounded-xl bg-${config.color}-500/20 border border-${config.color}-500/30`}>
              <p className="text-xs text-zinc-400">Your Score</p>
              <p className={`text-2xl font-bold text-${config.color}-400`}>{score}%</p>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            size="sm"
            onClick={() => setLocalBlend(0)}
            variant={localBlend < 50 ? 'default' : 'outline'}
            className={localBlend < 50 ? 'bg-indigo-500 hover:bg-indigo-600' : ''}
          >
            Egalitarian
          </Button>
          <Button
            size="sm"
            onClick={() => setLocalBlend(100)}
            variant={localBlend >= 50 ? 'default' : 'outline'}
            className={localBlend >= 50 ? 'bg-amber-500 hover:bg-amber-600' : ''}
          >
            Hierarchical
          </Button>
        </div>

        {/* Definition */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-white font-semibold mb-2">Definition</h4>
          <p className="text-zinc-400 text-sm leading-relaxed">{currentData.definition}</p>
        </div>

        {/* Mechanism */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Brain className={`w-5 h-5 text-${config.color}-400`} />
            <h4 className="text-white font-semibold">How It Works</h4>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-zinc-500">Focus:</span>
              <p className="text-zinc-400 mt-1">{currentData.mechanism.focus}</p>
            </div>
            <div>
              <span className="text-zinc-500">Engagement:</span>
              <p className="text-zinc-400 mt-1">{currentData.mechanism.engagement}</p>
            </div>
            <div>
              <span className="text-zinc-500">Failure:</span>
              <p className="text-zinc-400 mt-1">{currentData.mechanism.failure}</p>
            </div>
          </div>
        </div>

        {/* Observable Markers */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <h4 className="text-white font-semibold mb-3">Observable Behaviors</h4>
          <ul className="space-y-2">
            {currentData.markers.map((marker, i) => (
              <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                <span className={`text-${config.color}-400 mt-1`}>•</span>
                <span>{marker}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Metaphor */}
        <div className={`p-4 rounded-xl bg-${config.color}-500/10 border border-${config.color}-500/20`}>
          <p className={`text-sm text-${config.color}-200 italic`}>
            💡 {currentData.metaphor}
          </p>
        </div>

        {/* Subdomains */}
        <div>
          <h4 className="text-white font-semibold mb-3">Core Subdomains</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {currentData.subdomains.map((sub, i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-sm font-medium text-white mb-1">{sub.name}</p>
                <p className="text-xs text-zinc-500">{sub.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Counterpart */}
        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Opposite Force</p>
              <p className={`text-lg font-semibold text-${config.color}-400`}>{currentData.counterpart}</p>
            </div>
            <ArrowLeftRight className="w-5 h-5 text-zinc-500" />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button onClick={() => setExplorationMode('overview')} variant="outline">
            Back to Overview
          </Button>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="min-h-screen p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="max-w-6xl mx-auto bg-[#0F0F12] rounded-2xl border border-white/10 overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Interactive Theory Explorer</h2>
              <p className="text-sm text-zinc-400">Courtesy of COMPILAR</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              {explorationMode === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {renderOverview()}
                </motion.div>
              )}
              {explorationMode === 'pillar' && (
                <motion.div
                  key="pillar"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {renderPillarDetail()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Command Modal */}
      <AnimatePresence>
        {commandModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center p-4"
            onClick={() => setCommandModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#1a1a1f] rounded-2xl border border-violet-500/30 p-6 max-w-md w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white mb-1">
                    {missionCommands[commandModal].title}
                  </h4>
                  <p className="text-sm text-zinc-400">
                    {missionCommands[commandModal].description}
                  </p>
                </div>
                <button
                  onClick={() => setCommandModal(null)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
              </div>

              <div className="mb-4">
                <h5 className="text-sm font-semibold text-white mb-2">Key Practices:</h5>
                <ul className="space-y-2">
                  {missionCommands[commandModal].practices.map((practice, i) => (
                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                      <span className="text-violet-400 mt-0.5">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                <p className="text-xs font-medium text-violet-300 mb-1">Example:</p>
                <p className="text-xs text-violet-200/80 italic">
                  {missionCommands[commandModal].example}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}