import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';
import { format, subDays } from 'date-fns';

const pillarConfig = {
  purpose: { color: '#8b5cf6', icon: Compass },
  interpersonal: { color: '#ec4899', icon: Heart },
  learning: { color: '#6366f1', icon: BookOpen },
  action: { color: '#10b981', icon: Zap },
  resilience: { color: '#f59e0b', icon: Shield }
};

export default function ProgressTimeline({ assessments = [], pointsHistory = [] }) {
  // Build timeline data from assessments
  const timelineData = useMemo(() => {
    if (assessments.length === 0) return [];

    const dataMap = {};
    
    assessments
      .filter(a => a.completed && a.completed_at)
      .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at))
      .forEach(assessment => {
        const date = format(new Date(assessment.completed_at), 'MMM dd');
        if (!dataMap[date]) {
          dataMap[date] = { date };
        }
        dataMap[date][assessment.pillar] = assessment.overall_score;
      });

    return Object.values(dataMap);
  }, [assessments]);

  // Points over time
  const pointsTimeline = useMemo(() => {
    if (pointsHistory.length === 0) return [];

    const dataMap = {};
    let cumulative = 0;

    pointsHistory
      .sort((a, b) => new Date(a.earned_at) - new Date(b.earned_at))
      .forEach(entry => {
        const date = format(new Date(entry.earned_at), 'MMM dd');
        cumulative += entry.points;
        dataMap[date] = { date, points: cumulative };
      });

    return Object.values(dataMap);
  }, [pointsHistory]);

  return (
    <div className="space-y-6">
      {/* PILAR Scores Over Time */}
      {timelineData.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-400" />
            PILAR Scores Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a"
                  fontSize={12}
                />
                <YAxis stroke="#71717a" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#a1a1aa', fontSize: '12px' }}
                  iconType="circle"
                />
                {Object.entries(pillarConfig).map(([key, config]) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={config.color}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name={key.charAt(0).toUpperCase() + key.slice(1)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Points Accumulation */}
      {pointsTimeline.length > 0 && (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Points Accumulation
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pointsTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#71717a"
                  fontSize={12}
                />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="points"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ fill: '#f59e0b', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}