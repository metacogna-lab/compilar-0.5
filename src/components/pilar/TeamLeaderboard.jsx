import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Crown, Medal, Award, TrendingUp, Target, Zap } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { calculateLevel } from './GamificationService';

const rankIcons = {
  1: { icon: Crown, color: 'text-amber-400', bg: 'bg-amber-500' },
  2: { icon: Medal, color: 'text-zinc-300', bg: 'bg-zinc-400' },
  3: { icon: Award, color: 'text-amber-600', bg: 'bg-amber-700' },
};

export default function TeamLeaderboard({ 
  groups = [], 
  individualData = [], 
  currentUserEmail,
  teamGoals = []
}) {
  const [tab, setTab] = useState('teams');

  // Calculate team scores
  const teamScores = groups.map(group => {
    const totalPoints = group.participants?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;
    const avgScore = group.participants?.length > 0 ? Math.round(totalPoints / group.participants.length) : 0;
    return {
      ...group,
      totalPoints,
      avgScore,
      memberCount: group.participants?.length || 0,
    };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  // Individual leaderboard
  const sortedIndividuals = [...individualData].sort((a, b) => (b.points || 0) - (a.points || 0));

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="p-3 border-b border-white/10">
          <TabsList className="w-full bg-white/5">
            <TabsTrigger value="teams" className="flex-1 text-xs">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              Teams
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex-1 text-xs">
              <Trophy className="w-3.5 h-3.5 mr-1.5" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex-1 text-xs">
              <Target className="w-3.5 h-3.5 mr-1.5" />
              Goals
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="teams" className="p-3 space-y-2 max-h-80 overflow-y-auto">
          {teamScores.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">No teams yet</p>
          ) : (
            teamScores.map((team, index) => {
              const rank = index + 1;
              const RankConfig = rankIcons[rank];
              const isUserTeam = team.participants?.some(p => p.email === currentUserEmail);
              
              return (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "p-3 rounded-xl flex items-center gap-3",
                    isUserTeam ? "bg-violet-500/20 border border-violet-500/30" : "bg-white/5",
                    rank <= 3 && "border border-amber-500/20"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    RankConfig ? RankConfig.bg + " text-white" : "bg-white/10 text-zinc-400"
                  )}>
                    {RankConfig ? <RankConfig.icon className="w-4 h-4" /> : rank}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">
                      {team.name}
                      {isUserTeam && <span className="text-xs text-violet-400 ml-2">(Your team)</span>}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Users className="w-3 h-3" />
                      {team.memberCount} members
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-bold text-amber-400">{team.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-zinc-500">pts</p>
                  </div>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="individual" className="p-3 space-y-2 max-h-80 overflow-y-auto">
          {sortedIndividuals.slice(0, 10).map((person, index) => {
            const rank = index + 1;
            const RankConfig = rankIcons[rank];
            const isCurrentUser = person.email === currentUserEmail;
            
            return (
              <motion.div
                key={person.email}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "p-3 rounded-xl flex items-center gap-3",
                  isCurrentUser ? "bg-violet-500/20 border border-violet-500/30" : "bg-white/5"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  RankConfig ? RankConfig.bg + " text-white" : "bg-white/10 text-zinc-400"
                )}>
                  {RankConfig ? <RankConfig.icon className="w-4 h-4" /> : rank}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium truncate",
                    isCurrentUser ? "text-violet-300" : "text-white"
                  )}>
                    {person.name || person.email?.split('@')[0]}
                    {isCurrentUser && <span className="text-xs text-violet-400 ml-2">(You)</span>}
                  </p>
                  <p className="text-xs text-zinc-500">Level {calculateLevel(person.points || 0)}</p>
                </div>
                
                <div className="text-right">
                  <p className="font-bold text-amber-400">{(person.points || 0).toLocaleString()}</p>
                  <p className="text-xs text-zinc-500">pts</p>
                </div>
              </motion.div>
            );
          })}
        </TabsContent>

        <TabsContent value="goals" className="p-3 space-y-3 max-h-80 overflow-y-auto">
          {teamGoals.length === 0 ? (
            <div className="text-center py-4">
              <Target className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">No team goals yet</p>
            </div>
          ) : (
            teamGoals.map((goal, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white">{goal.title}</p>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Zap className="w-3 h-3" />
                    <span className="text-xs">{goal.reward_points}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Progress value={goal.progress || 0} className="flex-1 h-2" />
                  <span className="text-xs text-zinc-400">{goal.progress || 0}%</span>
                </div>
                <p className="text-xs text-zinc-500">
                  {goal.current_value}/{goal.target_value} {goal.unit}
                </p>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}