import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Star, Trophy, Flame, TrendingUp, 
  ChevronRight, Sparkles, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { calculateLevel, getLevelProgress, getPointsToNextLevel, LEVEL_THRESHOLDS } from './GamificationService';

const levelTitles = [
  'Newcomer', 'Explorer', 'Seeker', 'Apprentice', 'Practitioner',
  'Adept', 'Expert', 'Master', 'Sage', 'Legend', 'Transcendent'
];

export default function ProgressTrack({ gamification, userProfile, badges = [], trophies = [] }) {
  const points = gamification?.total_points || 0;
  const level = calculateLevel(points);
  const progress = getLevelProgress(points);
  const toNext = getPointsToNextLevel(points);
  const streak = gamification?.streaks?.current_streak || 0;
  
  const pillarScores = userProfile?.pillar_scores || {};
  const avgScore = Object.keys(pillarScores).length > 0
    ? Math.round(Object.values(pillarScores).reduce((a, b) => a + b, 0) / Object.keys(pillarScores).length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Level Progress */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 via-transparent to-pink-500/20 border border-violet-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30"
            >
              <span className="text-2xl font-bold text-white">{level}</span>
            </motion.div>
            <div>
              <p className="text-lg font-bold text-white">{levelTitles[level - 1] || 'Legend'}</p>
              <p className="text-sm text-zinc-400">{points.toLocaleString()} total points</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-5 h-5" />
              <span className="text-xl font-bold">{streak}</span>
            </div>
            <p className="text-xs text-zinc-500">day streak</p>
          </div>
        </div>

        {/* XP Bar */}
        <div className="relative">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Level {level}</span>
            <span>{toNext} pts to Level {level + 1}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full relative"
            >
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-r from-transparent to-white/30 rounded-full"
              />
            </motion.div>
          </div>
          
          {/* Level milestones */}
          <div className="flex justify-between mt-2">
            {LEVEL_THRESHOLDS.slice(level - 1, level + 3).map((threshold, i) => (
              <div 
                key={threshold} 
                className={cn(
                  "text-xs",
                  points >= threshold ? "text-violet-400" : "text-zinc-600"
                )}
              >
                {threshold}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <Star className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{badges.length}</p>
          <p className="text-xs text-zinc-500">Badges</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <Trophy className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{trophies.length}</p>
          <p className="text-xs text-zinc-500">Trophies</p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
          <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <p className="text-lg font-bold text-white">{avgScore}%</p>
          <p className="text-xs text-zinc-500">Avg Score</p>
        </div>
      </div>

      {/* Recent Achievements */}
      {(badges.length > 0 || trophies.length > 0) && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Recent Achievements
            </h4>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[...badges, ...trophies].slice(-6).map((item, i) => (
              <motion.div
                key={item.id || item.trophy_id || i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center text-xl"
                title={item.name}
              >
                {item.icon}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestones */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
        <h4 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4 text-violet-400" />
          Next Milestones
        </h4>
        <div className="space-y-2">
          {[
            { label: `Reach Level ${level + 1}`, progress: progress, target: `${toNext} pts` },
            { label: `${7 - (streak % 7)} days to weekly streak`, progress: ((streak % 7) / 7) * 100, target: '7 days' },
            { label: 'Complete all pillars', progress: (Object.keys(pillarScores).length / 5) * 100, target: '5 pillars' },
          ].map((milestone, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-zinc-400">{milestone.label}</span>
                  <span className="text-zinc-500">{milestone.target}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${milestone.progress}%` }}
                    className="h-full bg-violet-500 rounded-full"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}