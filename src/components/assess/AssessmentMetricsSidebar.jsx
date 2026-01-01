import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function AssessmentMetricsSidebar({ userProfile }) {
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
    green: 'from-green-500/20 to-emerald-500/10 border-green-500/30',
    amber: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    blue: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30'
  };

  const iconColorMap = {
    violet: 'text-violet-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    blue: 'text-blue-400'
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-3 py-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`bg-gradient-to-br ${colorMap[metric.color]} rounded-xl p-3 border cursor-help hover:scale-105 transition-transform`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon className={`w-5 h-5 ${iconColorMap[metric.color]}`} />
                    <div className="text-center">
                      <p className="text-xs text-zinc-400 mb-0.5">{metric.label}</p>
                      <p className="text-lg font-bold text-white truncate max-w-[80px]">
                        {typeof metric.value === 'string' && metric.value.length > 8
                          ? metric.value.substring(0, 8) + '...'
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
  );
}