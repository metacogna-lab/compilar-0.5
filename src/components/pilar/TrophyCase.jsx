import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const tierConfig = {
  bronze: { color: 'amber-700', bg: 'from-amber-700/30 to-amber-900/20', glow: 'shadow-amber-700/30' },
  silver: { color: 'zinc-300', bg: 'from-zinc-300/30 to-zinc-500/20', glow: 'shadow-zinc-300/30' },
  gold: { color: 'amber-400', bg: 'from-amber-400/30 to-amber-600/20', glow: 'shadow-amber-400/30' },
  platinum: { color: 'cyan-300', bg: 'from-cyan-300/30 to-cyan-500/20', glow: 'shadow-cyan-300/30' },
  diamond: { color: 'violet-400', bg: 'from-violet-400/30 to-pink-500/20', glow: 'shadow-violet-400/30' },
};

const categoryLabels = {
  pillar_mastery: 'Pillar Mastery',
  consistency: 'Consistency',
  collaboration: 'Collaboration',
  achievement: 'Achievement',
  special: 'Special',
};

// Trophy definitions
export const TROPHIES = [
  // Pillar Mastery - Bronze to Diamond for each pillar
  ...['purpose', 'interpersonal', 'learning', 'action', 'resilience'].flatMap(pillar => [
    { trophy_id: `${pillar}_bronze`, name: `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Initiate`, tier: 'bronze', category: 'pillar_mastery', pillar, icon: '🥉', requirement: { type: 'pillar_score', value: 50 } },
    { trophy_id: `${pillar}_silver`, name: `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Adept`, tier: 'silver', category: 'pillar_mastery', pillar, icon: '🥈', requirement: { type: 'pillar_score', value: 70 } },
    { trophy_id: `${pillar}_gold`, name: `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Expert`, tier: 'gold', category: 'pillar_mastery', pillar, icon: '🥇', requirement: { type: 'pillar_score', value: 85 } },
    { trophy_id: `${pillar}_platinum`, name: `${pillar.charAt(0).toUpperCase() + pillar.slice(1)} Master`, tier: 'platinum', category: 'pillar_mastery', pillar, icon: '💎', requirement: { type: 'pillar_score', value: 95 } },
  ]),
  // Consistency
  { trophy_id: 'streak_7', name: 'Week Warrior', tier: 'bronze', category: 'consistency', icon: '🔥', requirement: { type: 'streak', value: 7 } },
  { trophy_id: 'streak_30', name: 'Monthly Master', tier: 'silver', category: 'consistency', icon: '🔥', requirement: { type: 'streak', value: 30 } },
  { trophy_id: 'streak_100', name: 'Century Champion', tier: 'gold', category: 'consistency', icon: '🔥', requirement: { type: 'streak', value: 100 } },
  { trophy_id: 'streak_365', name: 'Year Legend', tier: 'diamond', category: 'consistency', icon: '👑', requirement: { type: 'streak', value: 365 } },
  // Collaboration
  { trophy_id: 'group_1', name: 'Team Player', tier: 'bronze', category: 'collaboration', icon: '🤝', requirement: { type: 'groups_joined', value: 1 } },
  { trophy_id: 'group_5', name: 'Community Builder', tier: 'silver', category: 'collaboration', icon: '🏘️', requirement: { type: 'groups_joined', value: 5 } },
  { trophy_id: 'mentor_5', name: 'Guiding Light', tier: 'gold', category: 'collaboration', icon: '🌟', requirement: { type: 'mentoring_sessions', value: 5 } },
  // Achievement
  { trophy_id: 'points_1000', name: 'Rising Star', tier: 'bronze', category: 'achievement', icon: '⭐', requirement: { type: 'total_points', value: 1000 } },
  { trophy_id: 'points_5000', name: 'Shining Beacon', tier: 'silver', category: 'achievement', icon: '✨', requirement: { type: 'total_points', value: 5000 } },
  { trophy_id: 'points_10000', name: 'Luminous Leader', tier: 'gold', category: 'achievement', icon: '💫', requirement: { type: 'total_points', value: 10000 } },
  { trophy_id: 'all_pillars', name: 'PILAR Complete', tier: 'platinum', category: 'achievement', icon: '🏆', requirement: { type: 'all_pillars_assessed', value: 5 } },
  { trophy_id: 'perfect_balance', name: 'Perfect Balance', tier: 'diamond', category: 'special', icon: '☯️', requirement: { type: 'balanced_pillars', value: 80 } },
];

export default function TrophyCase({ earnedTrophies = [], userProfile, gamification, compact = false }) {
  const [expandedCategory, setExpandedCategory] = useState(compact ? null : 'pillar_mastery');
  
  const earnedIds = earnedTrophies.map(t => t.trophy_id);
  
  // Calculate progress for each trophy
  const getTrophyProgress = (trophy) => {
    const req = trophy.requirement;
    let current = 0;
    let target = req.value;
    
    switch (req.type) {
      case 'pillar_score':
        current = userProfile?.pillar_scores?.[trophy.pillar] || 0;
        break;
      case 'streak':
        current = gamification?.streaks?.current_streak || 0;
        break;
      case 'total_points':
        current = gamification?.total_points || 0;
        break;
      case 'all_pillars_assessed':
        current = Object.keys(userProfile?.pillar_scores || {}).filter(k => userProfile.pillar_scores[k] > 0).length;
        break;
      default:
        current = 0;
    }
    
    return { current, target, percent: Math.min(100, Math.round((current / target) * 100)) };
  };

  const groupedTrophies = TROPHIES.reduce((acc, trophy) => {
    if (!acc[trophy.category]) acc[trophy.category] = [];
    acc[trophy.category].push(trophy);
    return acc;
  }, {});

  if (compact) {
    const recentEarned = earnedTrophies.slice(-4);
    return (
      <div className="flex gap-2">
        {recentEarned.map(trophy => {
          const tier = tierConfig[trophy.tier];
          return (
            <motion.div
              key={trophy.trophy_id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-xl",
                `bg-gradient-to-br ${tier.bg} shadow-lg ${tier.glow}`
              )}
            >
              {trophy.icon}
            </motion.div>
          );
        })}
        {recentEarned.length === 0 && (
          <p className="text-sm text-zinc-500">Complete challenges to earn trophies!</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(groupedTrophies).map(([category, trophies]) => (
        <div key={category} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
          <button
            onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
            className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="font-medium text-white">{categoryLabels[category]}</span>
              <span className="text-xs text-zinc-500">
                {trophies.filter(t => earnedIds.includes(t.trophy_id)).length}/{trophies.length}
              </span>
            </div>
            {expandedCategory === category ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>
          
          <AnimatePresence>
            {expandedCategory === category && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {trophies.map(trophy => {
                    const isEarned = earnedIds.includes(trophy.trophy_id);
                    const progress = getTrophyProgress(trophy);
                    const tier = tierConfig[trophy.tier];
                    
                    return (
                      <motion.div
                        key={trophy.trophy_id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={cn(
                          "p-3 rounded-xl text-center relative",
                          isEarned 
                            ? `bg-gradient-to-br ${tier.bg} shadow-lg ${tier.glow}`
                            : "bg-white/5 opacity-60"
                        )}
                      >
                        {!isEarned && (
                          <Lock className="absolute top-2 right-2 w-3 h-3 text-zinc-500" />
                        )}
                        <div className="text-2xl mb-1">{trophy.icon}</div>
                        <p className={cn(
                          "text-xs font-medium truncate",
                          isEarned ? "text-white" : "text-zinc-400"
                        )}>
                          {trophy.name}
                        </p>
                        <span className={`text-xs text-${tier.color} capitalize`}>{trophy.tier}</span>
                        
                        {!isEarned && progress.percent > 0 && (
                          <div className="mt-2">
                            <Progress value={progress.percent} className="h-1" />
                            <p className="text-xs text-zinc-500 mt-0.5">{progress.percent}%</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}