import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateLevel } from './GamificationService';

const rankIcons = {
  1: { icon: Crown, color: 'text-amber-400' },
  2: { icon: Medal, color: 'text-zinc-300' },
  3: { icon: Award, color: 'text-amber-600' },
};

export default function Leaderboard({ participants = [], currentUserEmail }) {
  // Sort by points
  const sorted = [...participants].sort((a, b) => (b.points || 0) - (a.points || 0));

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-amber-400" />
        <h3 className="font-semibold text-white">Leaderboard</h3>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">No participants yet</p>
      ) : (
        sorted.map((participant, index) => {
          const rank = index + 1;
          const RankIcon = rankIcons[rank]?.icon;
          const isCurrentUser = participant.email === currentUserEmail;
          
          return (
            <motion.div
              key={participant.email}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl",
                isCurrentUser ? "bg-violet-500/20 border border-violet-500/30" : "bg-white/5",
                rank <= 3 && "border border-amber-500/20"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                rank === 1 ? "bg-amber-500 text-white" :
                rank === 2 ? "bg-zinc-400 text-zinc-900" :
                rank === 3 ? "bg-amber-700 text-white" :
                "bg-white/10 text-zinc-400"
              )}>
                {RankIcon ? <RankIcon className="w-4 h-4" /> : rank}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium truncate",
                  isCurrentUser ? "text-violet-300" : "text-white"
                )}>
                  {participant.name || participant.email?.split('@')[0]}
                  {isCurrentUser && <span className="text-xs text-violet-400 ml-2">(You)</span>}
                </p>
                <p className="text-xs text-zinc-500">Level {calculateLevel(participant.points || 0)}</p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-amber-400">{participant.points || 0}</p>
                <p className="text-xs text-zinc-500">pts</p>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
}