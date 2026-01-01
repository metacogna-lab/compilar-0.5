import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, Users, Sparkles } from 'lucide-react';
import { BADGES } from '@/components/pilar/GamificationService';
import { cn } from '@/lib/utils';

export default function BadgeRarityChart({ earnedBadges = [], allGamification = [] }) {
  const rarityData = useMemo(() => {
    return BADGES.map(badge => {
      const earnedCount = allGamification.filter(g => 
        g.badges?.some(b => b.id === badge.id)
      ).length;
      const totalUsers = allGamification.length || 1;
      const percentage = Math.round((earnedCount / totalUsers) * 100);
      const hasEarned = earnedBadges.some(b => b.id === badge.id);
      
      let rarity = 'common';
      if (percentage < 5) rarity = 'legendary';
      else if (percentage < 15) rarity = 'epic';
      else if (percentage < 30) rarity = 'rare';
      else if (percentage < 50) rarity = 'uncommon';
      
      return {
        name: badge.name,
        percentage,
        rarity,
        hasEarned,
        earnedCount,
        icon: badge.icon
      };
    }).sort((a, b) => a.percentage - b.percentage);
  }, [earnedBadges, allGamification]);

  const rarityColors = {
    legendary: '#a855f7',
    epic: '#ec4899',
    rare: '#3b82f6',
    uncommon: '#10b981',
    common: '#6b7280'
  };

  const myRareBadges = rarityData.filter(b => b.hasEarned && ['legendary', 'epic', 'rare'].includes(b.rarity));

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-violet-400" />
        Badge Rarity & Collection
      </h3>

      {myRareBadges.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/10 border border-violet-500/30">
          <p className="text-sm font-medium text-violet-300 mb-2">Your Rare Badges</p>
          <div className="flex flex-wrap gap-2">
            {myRareBadges.map((badge, i) => (
              <motion.div
                key={badge.name}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/20 border border-white/20"
              >
                <span className="text-lg">{badge.icon}</span>
                <div>
                  <p className="text-xs text-white">{badge.name}</p>
                  <p className="text-xs capitalize" style={{ color: rarityColors[badge.rarity] }}>
                    {badge.rarity} ({badge.percentage}%)
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rarityData.slice(0, 10)}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              stroke="#71717a"
              fontSize={10}
              angle={-20}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#71717a" fontSize={12} label={{ value: '% of users', angle: -90, position: 'insideLeft', style: { fill: '#71717a', fontSize: 12 } }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
              formatter={(value, name, props) => [
                `${value}% of users (${props.payload.earnedCount})`,
                props.payload.rarity.toUpperCase()
              ]}
            />
            <Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
              {rarityData.slice(0, 10).map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={rarityColors[entry.rarity]}
                  opacity={entry.hasEarned ? 1 : 0.3}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs">
        {Object.entries(rarityColors).map(([rarity, color]) => (
          <div key={rarity} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
            <span className="text-zinc-400 capitalize">{rarity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}