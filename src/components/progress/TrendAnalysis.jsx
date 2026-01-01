import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Activity, AlertCircle } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

const pillarColors = {
  purpose: '#8b5cf6',
  interpersonal: '#ec4899',
  learning: '#6366f1',
  action: '#10b981',
  resilience: '#f59e0b'
};

export default function TrendAnalysis({ assessments = [], userProfile }) {
  const analysis = useMemo(() => {
    const pillarTrends = {};
    
    ['purpose', 'interpersonal', 'learning', 'action', 'resilience'].forEach(pillar => {
      const pillarAssessments = assessments
        .filter(a => a.pillar === pillar && a.completed)
        .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));

      if (pillarAssessments.length >= 2) {
        const first = pillarAssessments[0].overall_score;
        const last = pillarAssessments[pillarAssessments.length - 1].overall_score;
        const change = last - first;
        const trend = change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable';
        
        pillarTrends[pillar] = {
          trend,
          change,
          attempts: pillarAssessments.length,
          scores: pillarAssessments.map(a => ({
            date: format(new Date(a.completed_at), 'MMM dd'),
            score: a.overall_score
          }))
        };
      }
    });

    return pillarTrends;
  }, [assessments]);

  const hasPlateaus = Object.values(analysis).some(a => a.trend === 'stable' && a.attempts >= 3);
  const hasImprovements = Object.values(analysis).some(a => a.trend === 'improving');

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-violet-400" />
          Trend Analysis
        </h3>
        {hasPlateaus && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400">Plateaus detected</span>
          </div>
        )}
      </div>

      {Object.keys(analysis).length === 0 ? (
        <div className="text-center py-8">
          <p className="text-zinc-500">Complete multiple assessments to see trends</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(analysis).map(([pillar, data]) => {
            const Icon = data.trend === 'improving' ? TrendingUp : data.trend === 'declining' ? TrendingDown : Minus;
            const trendColor = data.trend === 'improving' ? 'emerald' : data.trend === 'declining' ? 'red' : 'zinc';
            
            return (
              <div key={pillar} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium capitalize">{pillar}</p>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full bg-${trendColor}-500/20 text-${trendColor}-400 text-xs`}>
                      <Icon className="w-3 h-3" />
                      {data.trend}
                    </span>
                  </div>
                  <span className={cn(
                    "text-sm font-bold",
                    data.change > 0 ? "text-emerald-400" : data.change < 0 ? "text-red-400" : "text-zinc-400"
                  )}>
                    {data.change > 0 ? '+' : ''}{data.change}%
                  </span>
                </div>

                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.scores}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                      <YAxis domain={[0, 100]} stroke="#71717a" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={pillarColors[pillar]}
                        strokeWidth={2}
                        dot={{ fill: pillarColors[pillar], r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {data.trend === 'stable' && data.attempts >= 3 && (
                  <p className="text-xs text-amber-400 italic">
                    💡 Plateau detected - consider trying new learning strategies
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}