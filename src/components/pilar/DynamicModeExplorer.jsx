import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const modeData = {
  egalitarian: {
    icon: Users,
    color: 'indigo',
    label: 'Egalitarian',
    tagline: 'Shared power, group focus',
    traits: ['Democratic decisions', 'Psychological safety', 'Unconditional help', 'Innovation focus'],
    useCase: 'Planning, brainstorming, complex problem-solving'
  },
  hierarchical: {
    icon: Crown,
    color: 'amber',
    label: 'Hierarchical',
    tagline: 'Clear authority, individual focus',
    traits: ['Fast decisions', 'Clear accountability', 'Efficient execution', 'Crisis management'],
    useCase: 'Emergencies, time-critical execution, coordination at scale'
  }
};

export default function DynamicModeExplorer({ mode = 'egalitarian', onChange, userProfile }) {
  const currentMode = mode;
  const dominantMode = modeData[currentMode];
  const Icon = dominantMode.icon;

  const toggleMode = () => {
    onChange(currentMode === 'egalitarian' ? 'hierarchical' : 'egalitarian');
  };

  return (
    <div className="space-y-6">
      {/* Visual Mode Indicator */}
      <div className="relative h-32 rounded-2xl overflow-hidden border border-white/10">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-transparent"
          animate={{ opacity: currentMode === 'egalitarian' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.div
          className="absolute inset-0 bg-gradient-to-l from-amber-500/20 to-transparent"
          animate={{ opacity: currentMode === 'hierarchical' ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        
        <div className="relative h-full flex items-center justify-center">
          <motion.div
            key={currentMode}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`w-20 h-20 rounded-2xl bg-${dominantMode.color}-500/30 border-2 border-${dominantMode.color}-500/50 flex items-center justify-center`}
          >
            <Icon className={`w-10 h-10 text-${dominantMode.color}-400`} />
          </motion.div>
        </div>

        {/* Mode labels */}
        <div className="absolute top-4 left-4 text-indigo-300 font-medium text-sm">Egalitarian</div>
        <div className="absolute top-4 right-4 text-amber-300 font-medium text-sm">Hierarchical</div>
      </div>

      {/* Binary Toggle */}
      <div className="flex justify-center">
        <Button
          onClick={toggleMode}
          className={`h-12 px-8 rounded-xl font-medium transition-all ${
            currentMode === 'egalitarian'
              ? 'bg-indigo-500 hover:bg-indigo-600 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 mr-2" />
          Switch to {currentMode === 'egalitarian' ? 'Hierarchical' : 'Egalitarian'}
        </Button>
      </div>

      {/* Dynamic Content Display */}
      <motion.div
        key={currentMode}
        initial={{ opacity: 0, x: currentMode === 'egalitarian' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`p-6 rounded-2xl bg-gradient-to-br from-${dominantMode.color}-500/10 to-${dominantMode.color}-500/5 border border-${dominantMode.color}-500/20`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Icon className={`w-6 h-6 text-${dominantMode.color}-400`} />
          <div>
            <h3 className="text-xl font-bold text-white">{dominantMode.label} Mode</h3>
            <p className="text-sm text-zinc-400">{dominantMode.tagline}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-white font-medium mb-2 text-sm">Key Characteristics:</h4>
            <ul className="space-y-1">
              {dominantMode.traits.map((trait, i) => (
                <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                  <span className={`text-${dominantMode.color}-400`}>•</span>
                  {trait}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2 text-sm">Best For:</h4>
            <p className="text-sm text-zinc-300">{dominantMode.useCase}</p>
          </div>
        </div>

        <div className={`p-3 rounded-lg bg-${dominantMode.color}-500/10 border border-${dominantMode.color}-500/20`}>
          <div className="flex items-center gap-2 mb-1">
            <ArrowLeftRight className={`w-4 h-4 text-${dominantMode.color}-400`} />
            <p className="text-xs font-medium text-${dominantMode.color}-300">Mission Command Agility</p>
          </div>
          <p className="text-xs text-zinc-400">
            The best teams shift fluidly between modes based on context. Try moving the slider to see how each mode operates differently.
          </p>
        </div>
      </motion.div>
    </div>
  );
}