import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';
import { BADGES } from './GamificationService';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield
};

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber'
};

export default function DetailedBadgeShowcase({ 
  earnedBadges = [], 
  userProfile, 
  gamification,
  assessments = [],
  groups = []
}) {
  const earnedBadgeIds = earnedBadges.map(b => b.id);
  
  const getBadgeProgress = (badge) => {
    const req = badge.requirement;
    let current = 0;
    let target = req.value || 1;
    
    switch (req.type) {
      case 'score':
        current = userProfile?.pillar_scores?.[req.pillar] || 0;
        target = req.value;
        break;
      case 'assessments':
        current = assessments.filter(a => a.completed).length;
        break;
      case 'all_pillars':
        current = Object.keys(userProfile?.pillar_scores || {}).filter(k => userProfile.pillar_scores[k] > 0).length;
        target = 5;
        break;
      case 'all_pillars_min':
        const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
        current = pillars.filter(p => (userProfile?.pillar_scores?.[p] || 0) >= req.value).length;
        target = 5;
        break;
      case 'streak':
        current = gamification?.streaks?.current_streak || 0;
        break;
      case 'points':
        current = gamification?.total_points || 0;
        break;
      case 'groups':
        current = groups.filter(g => g.participants?.some(p => p.email === gamification?.created_by)).length;
        break;
      default:
        current = 0;
    }
    
    return {
      current,
      target,
      percent: Math.min(100, Math.round((current / target) * 100))
    };
  };

  const categorizedBadges = {
    earned: BADGES.filter(b => earnedBadgeIds.includes(b.id)),
    inProgress: BADGES.filter(b => {
      if (earnedBadgeIds.includes(b.id)) return false;
      const progress = getBadgeProgress(b);
      return progress.percent > 0 && progress.percent < 100;
    }).map(b => ({ ...b, progress: getBadgeProgress(b) })),
    locked: BADGES.filter(b => {
      if (earnedBadgeIds.includes(b.id)) return false;
      const progress = getBadgeProgress(b);
      return progress.percent === 0;
    })
  };

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            Earned ({categorizedBadges.earned.length})
          </h3>
        </div>
        {categorizedBadges.earned.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No badges earned yet. Complete assessments to get started!</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categorizedBadges.earned.map((badge, i) => {
              const earnedBadge = earnedBadges.find(b => b.id === badge.id);
              return (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.03, type: 'spring' }}
                  className={cn(
                    "p-4 rounded-xl text-center",
                    badge.pillar 
                      ? `bg-gradient-to-br from-${pillarColors[badge.pillar]}-500/20 to-${pillarColors[badge.pillar]}-600/10 border border-${pillarColors[badge.pillar]}-500/30`
                      : "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30"
                  )}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="text-sm font-medium text-white mb-1">{badge.name}</p>
                  <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{badge.description}</p>
                  {earnedBadge?.earned_at && (
                    <p className="text-xs text-zinc-500">
                      {new Date(earnedBadge.earned_at).toLocaleDateString()}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* In Progress */}
      {categorizedBadges.inProgress.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            In Progress ({categorizedBadges.inProgress.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {categorizedBadges.inProgress.map((badge, i) => {
              return (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-3xl">{badge.icon}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white mb-1">{badge.name}</p>
                      <p className="text-xs text-zinc-400">{badge.description}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-zinc-400">Progress</span>
                      <span className="text-amber-400 font-medium">
                        {badge.progress.current}/{badge.progress.target}
                      </span>
                    </div>
                    <Progress value={badge.progress.percent} className="h-2" />
                    <p className="text-xs text-zinc-500 mt-1 text-right">{badge.progress.percent}%</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {categorizedBadges.locked.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-zinc-500" />
            Locked ({categorizedBadges.locked.length})
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {categorizedBadges.locked.slice(0, 12).map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10 text-center opacity-40"
                title={badge.description}
              >
                <div className="text-2xl mb-1 grayscale">{badge.icon}</div>
                <Lock className="w-3 h-3 text-zinc-600 mx-auto" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}