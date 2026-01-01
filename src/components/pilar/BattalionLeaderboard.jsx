import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Crown, Medal, Award, Shield, TrendingUp, Users, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const RANK_ICONS = {
  1: { icon: Crown, color: 'amber-400', bg: 'amber-500' },
  2: { icon: Medal, color: 'zinc-300', bg: 'zinc-400' },
  3: { icon: Award, color: 'amber-700', bg: 'amber-700' },
};

const SPECIALIZATION_COLORS = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber',
  balanced: 'zinc',
};

export default function BattalionLeaderboard({ currentUser }) {
  const { data: battalions = [] } = useQuery({
    queryKey: ['battalions-leaderboard'],
    queryFn: () => base44.entities.Battalion.list('-total_points', 20),
  });

  const rankedBattalions = battalions.map((b, i) => ({
    ...b,
    rank: i + 1,
    isMine: b.commander_email === currentUser?.email || b.officers?.some(o => o.email === currentUser?.email)
  }));

  const myBattalion = rankedBattalions.find(b => b.isMine);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Battalion Rankings
        </h3>
        {myBattalion && (
          <div className="px-3 py-1.5 rounded-full bg-violet-500/20 border border-violet-500/30">
            <span className="text-violet-400 text-sm">Your Rank: <span className="font-bold">#{myBattalion.rank}</span></span>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {rankedBattalions.slice(0, 10).map((battalion, i) => {
          const rankConfig = RANK_ICONS[battalion.rank];
          const RankIcon = rankConfig?.icon;
          const specColor = SPECIALIZATION_COLORS[battalion.specialization] || 'zinc';

          return (
            <motion.div
              key={battalion.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "p-4 rounded-xl flex items-center gap-4 transition-all",
                battalion.isMine 
                  ? `bg-${specColor}-500/20 border border-${specColor}-500/30`
                  : "bg-white/5 hover:bg-white/10"
              )}
            >
              {/* Rank Badge */}
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                rankConfig 
                  ? `bg-${rankConfig.bg} text-white`
                  : "bg-white/10 text-zinc-400"
              )}>
                {RankIcon ? <RankIcon className="w-5 h-5" /> : battalion.rank}
              </div>

              {/* Battalion Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-white truncate">{battalion.name}</h4>
                  {battalion.isMine && (
                    <span className={`text-xs px-2 py-0.5 rounded bg-${specColor}-500/20 text-${specColor}-400`}>
                      Your Unit
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {battalion.officers?.length || 1}
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {battalion.missions_completed || 0} missions
                  </span>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <p className="text-lg font-bold text-amber-400">{(battalion.total_points || 0).toLocaleString()}</p>
                <p className="text-xs text-zinc-500">points</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {battalions.length === 0 && (
        <div className="text-center py-8 rounded-xl bg-white/5">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No battalions established yet.</p>
          <p className="text-zinc-500 text-sm">Be the first to form a unit.</p>
        </div>
      )}
    </div>
  );
}