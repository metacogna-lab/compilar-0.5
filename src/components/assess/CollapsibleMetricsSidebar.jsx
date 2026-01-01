import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Trophy, TrendingUp, Target, Award } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function CollapsibleMetricsSidebar({ userProfile }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!userProfile) return null;

  const metrics = [
    {
      icon: Award,
      label: 'Engagements',
      value: userProfile.assessment_engagements || 0,
      color: 'violet',
      tooltip: 'Total times you\'ve used the assessment tool'
    },
    {
      icon: Trophy,
      label: 'Best',
      value: userProfile.best_pillar || 'N/A',
      color: 'green',
      tooltip: `Your strongest pillar: ${userProfile.best_pillar || 'Complete assessments to discover'}`
    },
    {
      icon: TrendingUp,
      label: 'Growth',
      value: userProfile.worst_pillar || 'N/A',
      color: 'amber',
      tooltip: `Area for development: ${userProfile.worst_pillar || 'Complete assessments to identify'}`
    },
    {
      icon: Target,
      label: 'Total',
      value: userProfile.total_assessments_completed || 0,
      color: 'blue',
      tooltip: 'Total assessments completed'
    }
  ];

  const colorMap = {
    violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
    green: 'from-green-500/20 to-emerald-600/10 border-green-500/30',
    amber: 'from-pink-500/20 to-pink-600/10 border-pink-500/30',
    blue: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30'
  };

  const iconColorMap = {
    violet: 'text-violet-400',
    green: 'text-green-400',
    amber: 'text-pink-400',
    blue: 'text-indigo-400'
  };

  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40">
      <div className="flex items-center">
        {/* Collapsed Tab */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30 rounded-r-xl p-2 hover:from-violet-500/30 hover:to-violet-600/20 transition-all shadow-lg"
        >
          <ChevronRight className={`w-5 h-5 text-violet-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-gradient-to-br from-[#1a1a1f]/95 to-[#0F0F12]/95 backdrop-blur-xl border-r border-t border-b border-white/10 rounded-r-2xl shadow-2xl p-4 w-64"
            >
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-violet-400" />
                Your Progress
              </h3>
              <TooltipProvider>
                <div className="space-y-3">
                  {metrics.map((metric, idx) => {
                    const Icon = metric.icon;
                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-gradient-to-br ${colorMap[metric.color]} rounded-lg p-3 border cursor-help hover:scale-105 transition-transform`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-5 h-5 ${iconColorMap[metric.color]}`} />
                              <div className="flex-1">
                                <p className="text-xs text-zinc-400 mb-0.5">{metric.label}</p>
                                <p className="text-lg font-bold text-white truncate">
                                  {typeof metric.value === 'string' && metric.value.length > 12
                                    ? metric.value.substring(0, 12) + '...'
                                    : metric.value}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <p className="text-sm">{metric.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}