import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Target, ChevronUp, ChevronDown, Award, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { calculateLevel, getRankTitle, getLevelProgress } from './GamificationService';
import { cn } from '@/lib/utils';

export default function GamificationFloatingWidget({ gamification, userProfile }) {
  const [expanded, setExpanded] = useState(false);
  
  const points = gamification?.total_points || 0;
  const level = calculateLevel(points);
  const rankTitle = getRankTitle(level);
  const progress = getLevelProgress(points);
  const badges = gamification?.badges || [];
  const currentStreak = gamification?.streaks?.current_streak || 0;
  const longestStreak = gamification?.streaks?.longest_streak || 0;

  // Calculate PILAR mastery percentage
  const pillarScores = userProfile?.pillar_scores || {};
  const completedPillars = Object.values(pillarScores).filter(s => s > 0).length;
  const avgScore = completedPillars > 0 
    ? Math.round(Object.values(pillarScores).reduce((sum, s) => sum + s, 0) / completedPillars)
    : 0;
  const masteryProgress = Math.round((completedPillars / 5) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-30"
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 w-72 p-4 rounded-2xl bg-gradient-to-br from-violet-900/90 to-pink-900/90 backdrop-blur-xl border border-violet-500/30 shadow-2xl"
          >
            <div className="space-y-3">
              {/* Level & Rank */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-violet-300 text-xs font-medium">Level {level}</p>
                  <p className="text-white font-bold text-lg">{rankTitle}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-xl">{level}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-zinc-300">{points} pts</span>
                  <span className="text-zinc-400">{progress}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                  />
                </div>
              </div>

              {/* PILAR Mastery */}
              <div className="p-3 rounded-lg bg-black/20 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-white">PILAR Mastery</span>
                  <span className="text-sm font-bold text-violet-300">{masteryProgress}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${masteryProgress}%` }}
                    className="h-full bg-gradient-to-r from-violet-400 to-pink-400"
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-1">{completedPillars}/5 pillars • Avg {avgScore}%</p>
              </div>

              {/* Streaks */}
              {currentStreak > 0 && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <div className="text-2xl">🔥</div>
                  <div>
                    <p className="text-xs text-orange-300 font-medium">{currentStreak} Day Streak</p>
                    <p className="text-xs text-orange-400/70">Best: {longestStreak} days</p>
                  </div>
                </div>
              )}

              {/* Recent Badges */}
              {badges.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-400 mb-2">Recent Badges</p>
                  <div className="flex gap-1 flex-wrap">
                    {badges.slice(-4).reverse().map((badge, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-lg"
                        title={badge.name}
                      >
                        {badge.icon}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <Link to={createPageUrl('Achievements')}>
                  <button className="w-full px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-white">
                    <Trophy className="w-3 h-3 mx-auto mb-0.5" />
                    Badges
                  </button>
                </Link>
                <Link to={createPageUrl('GamificationHub')}>
                  <button className="w-full px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-xs text-white">
                    <Target className="w-3 h-3 mx-auto mb-0.5" />
                    Challenges
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setExpanded(!expanded)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30 relative"
      >
        {points > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500 border-2 border-[#0F0F12] flex items-center justify-center"
          >
            <span className="text-white font-bold text-xs">{level}</span>
          </motion.div>
        )}
        {expanded ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <Trophy className="w-6 h-6 text-white" />
        )}
      </motion.button>
    </motion.div>
  );
}