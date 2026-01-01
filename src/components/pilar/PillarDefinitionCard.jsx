import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PillarDefinitionCard({ 
  pillar, 
  config, 
  data, 
  mode, 
  blendRatio = 0,
  egalitarianData,
  hierarchicalData,
  isExpanded, 
  onToggle,
  onShowForces,
  userScore 
}) {
  const Icon = config.icon;
  const color = config.color;
  
  // Calculate blend colors and opacity
  const isTransitioning = blendRatio > 0.1 && blendRatio < 0.9;
  const borderOpacity = isTransitioning ? 0.3 : 0.2;

  return (
    <motion.div
      layout
      animate={{
        borderColor: `rgba(${blendRatio < 0.5 ? '99, 102, 241' : '245, 158, 11'}, ${borderOpacity})`,
        backgroundColor: `rgba(${blendRatio < 0.5 ? '99, 102, 241' : '245, 158, 11'}, ${0.05 + blendRatio * 0.05})`
      }}
      transition={{ duration: 0.4 }}
      className={cn(
        'rounded-2xl border backdrop-blur-sm overflow-hidden',
        `bg-${color}-500/5 border-${color}-500/20 hover:border-${color}-500/40`
      )}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-${color}-500/20 flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <button className="text-zinc-400 hover:text-white transition-colors">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <h3 className="text-white font-semibold mb-1 capitalize">{config.label}</h3>
        <motion.p 
          className={`text-${color}-400 text-sm font-medium mb-2`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {data.construct}
        </motion.p>
        <motion.p 
          className="text-zinc-400 text-sm leading-relaxed"
          key={data.definition}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {data.definition}
        </motion.p>

        {userScore !== undefined && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Your Score</span>
              <span className={`font-bold text-${color}-400`}>{userScore}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/10">
              {/* Mechanism */}
              <div className="pt-4">
                <h4 className="text-white text-sm font-semibold mb-2">How It Works</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-zinc-500">Focus:</span>
                    <p className="text-zinc-400 mt-1">{data.mechanism.focus}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Engagement:</span>
                    <p className="text-zinc-400 mt-1">{data.mechanism.engagement}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Failure Pattern:</span>
                    <p className="text-zinc-400 mt-1">{data.mechanism.failure}</p>
                  </div>
                </div>
              </div>

              {/* Behavioral Markers */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-2">Observable Behaviors</h4>
                <ul className="space-y-1.5">
                  {data.markers.map((marker, i) => (
                    <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                      <span className={`text-${color}-400 mt-0.5`}>•</span>
                      <span>{marker}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metaphor */}
              <div className={`p-3 rounded-lg bg-${color}-500/10 border border-${color}-500/20`}>
                <p className={`text-xs text-${color}-200 italic`}>
                  💡 {data.metaphor}
                </p>
              </div>

              {/* Subdomains */}
              <div>
                <h4 className="text-white text-sm font-semibold mb-2">Core Subdomains</h4>
                <div className="grid grid-cols-2 gap-2">
                  {data.subdomains.map((sub, i) => (
                    <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <p className="text-xs font-medium text-white mb-0.5">{sub.name}</p>
                      <p className="text-xs text-zinc-500">{sub.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Counterpart Link */}
              <div className={`p-3 rounded-lg bg-white/5 border border-${color}-500/20`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Opposite Mode</p>
                    <p className={`text-sm font-medium text-${color}-400`}>{data.counterpart}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowForces?.();
                  }}
                  className={`flex-1 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-medium transition-colors`}
                >
                  View Forces
                </button>
                <Link to={createPageUrl(`Pillar?pillar=${pillar}`)} className="flex-1">
                  <button className={`w-full py-2 px-4 rounded-lg bg-${color}-500/20 hover:bg-${color}-500/30 text-${color}-400 text-sm font-medium transition-colors`}>
                    Assess
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}