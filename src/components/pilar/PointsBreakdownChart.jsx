import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Zap, Target, Users, TrendingUp, BookOpen } from 'lucide-react';

const categoryConfig = {
  assessment_completed: { label: 'Assessments', color: '#8b5cf6', icon: Target },
  assessment_retake: { label: 'Retakes', color: '#a78bfa', icon: TrendingUp },
  simulation_completed: { label: 'Simulations', color: '#ec4899', icon: Zap },
  group_participation: { label: 'Team Work', color: '#3b82f6', icon: Users },
  activity_completed: { label: 'Activities', color: '#10b981', icon: BookOpen },
  streak_bonus: { label: 'Streak Bonus', color: '#f59e0b', icon: Zap },
  other: { label: 'Other', color: '#6b7280', icon: Zap }
};

export default function PointsBreakdownChart({ pointsHistory = [] }) {
  const breakdown = useMemo(() => {
    const categories = {};
    
    pointsHistory.forEach(entry => {
      const category = categoryConfig[entry.reason] ? entry.reason : 'other';
      if (!categories[category]) {
        categories[category] = 0;
      }
      categories[category] += entry.points;
    });

    return Object.entries(categories).map(([key, value]) => ({
      name: categoryConfig[key]?.label || 'Other',
      points: value,
      color: categoryConfig[key]?.color || '#6b7280',
      icon: categoryConfig[key]?.icon || Zap
    })).sort((a, b) => b.points - a.points);
  }, [pointsHistory]);

  const totalPoints = breakdown.reduce((sum, cat) => sum + cat.points, 0);

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4">Points by Category</h3>
      
      {breakdown.length === 0 ? (
        <div className="text-center py-8">
          <Zap className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-500">No points earned yet</p>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div className="mb-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#71717a"
                  fontSize={12}
                  angle={-15}
                  textAnchor="end"
                  height={60}
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
                <Bar dataKey="points" radius={[8, 8, 0, 0]}>
                  {breakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2">
            {breakdown.map((cat, i) => {
              const Icon = cat.icon;
              const percentage = Math.round((cat.points / totalPoints) * 100);
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                >
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-white">{cat.name}</p>
                      <p className="text-sm font-bold" style={{ color: cat.color }}>
                        {cat.points} pts
                      </p>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-zinc-500">{percentage}%</span>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}