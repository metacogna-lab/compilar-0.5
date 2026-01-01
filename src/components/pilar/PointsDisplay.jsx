import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';
import { calculateLevel, getLevelProgress, getPointsToNextLevel } from './GamificationService';

export default function PointsDisplay({ gamification, compact = false }) {
  const points = gamification?.total_points || 0;
  const level = calculateLevel(points);
  const progress = getLevelProgress(points);
  const toNext = getPointsToNextLevel(points);

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30">
        <Zap className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-amber-300">{points}</span>
        <span className="text-xs text-amber-500">Lvl {level}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <span className="text-white font-bold">{level}</span>
          </div>
          <div>
            <p className="text-sm text-zinc-400">Level {level}</p>
            <p className="text-xl font-bold text-white">{points} pts</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-emerald-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm">{toNext} to next</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
          />
        </div>
        <p className="text-xs text-zinc-500 text-right">{progress}% to Level {level + 1}</p>
      </div>
    </motion.div>
  );
}