import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, Star, Award, TrendingUp, CheckCircle, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning' },
  action: { icon: Zap, color: 'emerald', label: 'Action' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience' }
};

const masteryTiers = [
  { min: 0, max: 29, label: 'Novice', color: 'zinc', icon: '📘' },
  { min: 30, max: 59, label: 'Apprentice', color: 'blue', icon: '📗' },
  { min: 60, max: 79, label: 'Proficient', color: 'violet', icon: '📙' },
  { min: 80, max: 94, label: 'Expert', color: 'amber', icon: '📕' },
  { min: 95, max: 100, label: 'Master', color: 'emerald', icon: '🏆' }
];

function getMasteryTier(score) {
  return masteryTiers.find(tier => score >= tier.min && score <= tier.max) || masteryTiers[0];
}

export default function PILARMasteryTracker({ userProfile, gamification, compact = false }) {
  const pillarScores = userProfile?.pillar_scores || {};
  const pillars = Object.keys(pillarConfig);
  const completedPillars = pillars.filter(p => pillarScores[p] > 0);
  const totalScore = completedPillars.reduce((sum, p) => sum + pillarScores[p], 0);
  const avgScore = completedPillars.length > 0 ? Math.round(totalScore / completedPillars.length) : 0;
  const overallMastery = Math.round((completedPillars.length / 5) * 100);
  const overallTier = getMasteryTier(avgScore);

  if (compact) {
    return (
      <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-violet-400" />
            <h3 className="text-white font-semibold">PILAR Mastery</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{overallTier.icon}</span>
            <span className="text-sm font-medium text-violet-300">{overallMastery}%</span>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1">
          {pillars.map(pillar => {
            const score = pillarScores[pillar] || 0;
            const config = pillarConfig[pillar];
            const Icon = config.icon;
            return (
              <div key={pillar} className="text-center">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center mb-1",
                  score > 0 ? `bg-${config.color}-500/20` : 'bg-white/5'
                )}>
                  <Icon className={cn("w-4 h-4", score > 0 ? `text-${config.color}-400` : 'text-zinc-600')} />
                </div>
                <p className={cn("text-xs font-medium", score > 0 ? 'text-white' : 'text-zinc-600')}>
                  {score > 0 ? score : '—'}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/30 to-pink-900/30 border border-violet-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-6 h-6 text-violet-400" />
            <h2 className="text-2xl font-bold text-white">PILAR Mastery</h2>
          </div>
          <p className="text-sm text-zinc-400">Track your progress across all 5 pillars</p>
        </div>
        <div className="text-center">
          <div className="text-4xl mb-1">{overallTier.icon}</div>
          <p className="text-xs font-medium text-violet-300">{overallTier.label}</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6 p-4 rounded-xl bg-black/20 border border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-300">Overall Mastery</span>
          <span className="text-lg font-bold text-white">{overallMastery}%</span>
        </div>
        <div className="h-3 bg-white/10 rounded-full overflow-hidden mb-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallMastery}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
          />
        </div>
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{completedPillars}/5 pillars completed</span>
          <span>Avg score: {avgScore}%</span>
        </div>
      </div>

      {/* Individual Pillars */}
      <div className="space-y-2 mb-4">
        {pillars.map((pillar, index) => {
          const config = pillarConfig[pillar];
          const Icon = config.icon;
          const score = pillarScores[pillar] || 0;
          const tier = getMasteryTier(score);
          const completed = score > 0;

          return (
            <motion.div
              key={pillar}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link to={createPageUrl(`Pillar?pillar=${pillar}`)}>
                <div className={cn(
                  "p-3 rounded-lg border transition-all hover:scale-[1.02] cursor-pointer",
                  completed ? `bg-${config.color}-500/10 border-${config.color}-500/20 hover:bg-${config.color}-500/20` : 'bg-white/5 border-white/10 hover:bg-white/10'
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center",
                      completed ? `bg-${config.color}-500/20` : 'bg-white/5'
                    )}>
                      <Icon className={cn("w-5 h-5", completed ? `text-${config.color}-400` : 'text-zinc-600')} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white capitalize">{pillar}</p>
                      <p className="text-xs text-zinc-500">{tier.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {completed && <span className="text-lg">{tier.icon}</span>}
                      <span className={cn(
                        "text-sm font-bold",
                        completed ? `text-${config.color}-300` : 'text-zinc-600'
                      )}>
                        {score > 0 ? `${score}%` : 'Start'}
                      </span>
                    </div>
                  </div>
                  {completed && (
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className={`h-full bg-${config.color}-500`} style={{ width: `${score}%` }} />
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-xs text-zinc-400">{gamification?.badges?.length || 0} badges</p>
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
          <p className="text-xs text-zinc-400">{gamification?.total_points || 0} pts</p>
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <div className="text-lg mx-auto mb-1">🔥</div>
          <p className="text-xs text-zinc-400">{gamification?.streaks?.current_streak || 0} streak</p>
        </div>
      </div>
    </div>
  );
}