import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, Clock, Users, Target, Zap, Trophy,
  CheckCircle, ChevronRight, Sparkles
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const difficultyConfig = {
  easy: { color: 'emerald', label: 'Easy', multiplier: '1x' },
  medium: { color: 'amber', label: 'Medium', multiplier: '1.5x' },
  hard: { color: 'orange', label: 'Hard', multiplier: '2x' },
  epic: { color: 'purple', label: 'Epic', multiplier: '3x' },
};

const typeIcons = {
  daily: Flame,
  weekly: Clock,
  pillar: Target,
  group: Users,
  milestone: Trophy,
};

export default function ChallengesPanel({ challenges = [], userEmail, onJoin, onClaim, compact = false }) {
  const activeChals = challenges.filter(c => c.status === 'active');
  
  if (compact) {
    return (
      <div className="space-y-2">
        {activeChals.slice(0, 3).map(challenge => {
          const userProgress = challenge.participants?.find(p => p.email === userEmail);
          const Icon = typeIcons[challenge.challenge_type] || Target;
          const diff = difficultyConfig[challenge.difficulty];
          
          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg bg-${diff.color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${diff.color}-400`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{challenge.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={userProgress?.progress || 0} className="h-1 flex-1" />
                    <span className="text-xs text-zinc-500">{userProgress?.progress || 0}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-400">
                  <Zap className="w-3 h-3" />
                  <span className="text-xs font-medium">{challenge.reward_points}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Active Challenges */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400" />
          Active Challenges
        </h3>
        <div className="space-y-3">
          {activeChals.map((challenge, i) => {
            const userProgress = challenge.participants?.find(p => p.email === userEmail);
            const isJoined = !!userProgress;
            const isCompleted = userProgress?.completed;
            const Icon = typeIcons[challenge.challenge_type] || Target;
            const diff = difficultyConfig[challenge.difficulty];
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isCompleted 
                    ? "bg-emerald-500/10 border-emerald-500/30" 
                    : "bg-white/5 border-white/10 hover:border-white/20"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      `bg-${diff.color}-500/20`
                    )}>
                      <Icon className={`w-5 h-5 text-${diff.color}-400`} />
                    </div>
                    <div>
                      <p className="font-medium text-white">{challenge.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded bg-${diff.color}-500/20 text-${diff.color}-400`}>
                          {diff.label}
                        </span>
                        <span className="text-xs text-zinc-500">{diff.multiplier} pts</span>
                        {challenge.challenge_type === 'group' && (
                          <span className="text-xs text-violet-400 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            Team
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Zap className="w-4 h-4" />
                      <span className="font-bold">{challenge.reward_points}</span>
                    </div>
                    {challenge.end_date && (
                      <p className="text-xs text-zinc-500 mt-1">
                        {Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24))}d left
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-zinc-400 mb-3">{challenge.description}</p>

                {isJoined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                      <span>Progress</span>
                      <span>{userProgress.progress || 0}%</span>
                    </div>
                    <Progress value={userProgress.progress || 0} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {challenge.participants?.slice(0, 5).map((p, j) => (
                      <div 
                        key={j}
                        className="w-6 h-6 rounded-full bg-violet-500/30 border border-violet-500/50 flex items-center justify-center text-xs text-white"
                      >
                        {p.email?.[0]?.toUpperCase()}
                      </div>
                    ))}
                    {(challenge.participants?.length || 0) > 5 && (
                      <span className="text-xs text-zinc-500">+{challenge.participants.length - 5}</span>
                    )}
                  </div>

                  {isCompleted ? (
                    <button
                      onClick={() => onClaim?.(challenge)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Claim Reward
                    </button>
                  ) : !isJoined ? (
                    <button
                      onClick={() => onJoin?.(challenge)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500 text-white text-sm font-medium hover:bg-violet-600 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      Join
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <ChevronRight className="w-4 h-4" />
                      In Progress
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}