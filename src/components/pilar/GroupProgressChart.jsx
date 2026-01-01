import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { cn } from '@/lib/utils';

const pillarLabels = {
  purpose: 'Purpose',
  interpersonal: 'Interpersonal',
  learning: 'Learning',
  action: 'Action',
  resilience: 'Resilience'
};

export default function GroupProgressChart({ participants = [], assessments = [], focusPillars = [] }) {
  // Calculate average scores per pillar across all participants
  const pillarAverages = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'].map(pillar => {
    const pillarAssessments = assessments.filter(a => a.pillar === pillar && a.completed);
    const avgScore = pillarAssessments.length > 0
      ? Math.round(pillarAssessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / pillarAssessments.length)
      : 0;
    
    return {
      pillar: pillarLabels[pillar],
      score: avgScore,
      isFocus: focusPillars.includes(pillar)
    };
  });

  // Calculate completion rate per pillar
  const completionRates = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'].map(pillar => {
    const participantCount = participants.filter(p => p.status === 'joined').length || 1;
    const completedCount = new Set(
      assessments.filter(a => a.pillar === pillar && a.completed).map(a => a.created_by)
    ).size;
    return {
      pillar,
      label: pillarLabels[pillar],
      rate: Math.round((completedCount / participantCount) * 100),
      completed: completedCount,
      total: participantCount
    };
  });

  const overallAvg = pillarAverages.reduce((sum, p) => sum + p.score, 0) / 5;

  return (
    <div className="space-y-6">
      {/* Radar Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="h-64"
      >
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={pillarAverages}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis 
              dataKey="pillar" 
              tick={{ fill: '#a1a1aa', fontSize: 11 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fill: '#71717a', fontSize: 10 }}
            />
            <Radar
              name="Group Average"
              dataKey="score"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Overall Score */}
      <div className="text-center">
        <div className="text-3xl font-bold text-white">{Math.round(overallAvg)}%</div>
        <div className="text-sm text-zinc-400">Group Average</div>
      </div>

      {/* Completion Rates */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-zinc-300">Completion Progress</h4>
        {completionRates.map((item, index) => (
          <motion.div
            key={item.pillar}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="space-y-1"
          >
            <div className="flex justify-between text-sm">
              <span className={cn(
                "text-zinc-400",
                focusPillars.includes(item.pillar) && "text-amber-400 font-medium"
              )}>
                {item.label}
              </span>
              <span className="text-zinc-500">{item.completed}/{item.total}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.rate}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={cn(
                  "h-full rounded-full",
                  item.rate === 100 ? "bg-emerald-500" :
                  item.rate >= 50 ? "bg-violet-500" : "bg-zinc-600"
                )}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}