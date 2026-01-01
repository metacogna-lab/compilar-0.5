import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Trophy, Medal, Award, Crown, Zap, Target, TrendingUp, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { calculateLevel, getRankTitle } from '@/components/pilar/GamificationService';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';

export default function Leaderboard() {
  const [view, setView] = useState('points');
  const [filterPillar, setFilterPillar] = useState('all');

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: allUsers = [] } = useQuery({
    queryKey: ['allUsers'],
    queryFn: () => base44.entities.User.list(),
    enabled: false
  });

  const { data: gamificationRecords = [] } = useQuery({
    queryKey: ['allGamification'],
    queryFn: () => base44.entities.UserGamification.list(),
  });

  const { data: userProfiles = [] } = useQuery({
    queryKey: ['allUserProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  // Merge data
  const leaderboardData = useMemo(() => {
    return gamificationRecords.map(gam => {
      const profile = userProfiles.find(p => p.created_by === gam.created_by);
      return {
        email: gam.created_by,
        points: gam.total_points || 0,
        level: calculateLevel(gam.total_points || 0),
        rankTitle: getRankTitle(calculateLevel(gam.total_points || 0)),
        badges: gam.badges?.length || 0,
        streak: gam.streaks?.current_streak || 0,
        pillarScores: profile?.pillar_scores || {},
        avgScore: profile?.pillar_scores 
          ? Math.round(Object.values(profile.pillar_scores).reduce((s, v) => s + v, 0) / Object.values(profile.pillar_scores).filter(v => v > 0).length) || 0
          : 0
      };
    }).filter(d => d.points > 0);
  }, [gamificationRecords, userProfiles]);

  // Sort based on view
  const sortedData = useMemo(() => {
    const data = [...leaderboardData];
    if (view === 'points') {
      data.sort((a, b) => b.points - a.points);
    } else if (view === 'mastery') {
      data.sort((a, b) => b.avgScore - a.avgScore);
    } else if (view === 'badges') {
      data.sort((a, b) => b.badges - a.badges);
    }
    return data;
  }, [leaderboardData, view]);

  const currentUserRank = sortedData.findIndex(d => d.email === currentUser?.email) + 1;

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm text-zinc-500">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] relative">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('GlobalMap')}>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
          
          <div className="text-center mb-6">
            <div className="inline-flex p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 mb-3">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Leaderboard</h1>
            <p className="text-zinc-400">Compete with others on your PILAR mastery journey</p>
          </div>

          {/* View Toggle */}
          <Tabs value={view} onValueChange={setView} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto bg-white/5">
              <TabsTrigger value="points">
                <Zap className="w-4 h-4 mr-2" />
                Points
              </TabsTrigger>
              <TabsTrigger value="mastery">
                <Target className="w-4 h-4 mr-2" />
                Mastery
              </TabsTrigger>
              <TabsTrigger value="badges">
                <Award className="w-4 h-4 mr-2" />
                Badges
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Current User Position */}
      {currentUserRank > 0 && (
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-4">
          <div className="p-4 rounded-xl bg-violet-500/20 border border-violet-500/30">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {getRankIcon(currentUserRank)}
                <span className="text-white font-bold">Your Rank: #{currentUserRank}</span>
              </div>
              <div className="ml-auto text-right">
                {view === 'points' && <p className="text-sm text-violet-300">{sortedData[currentUserRank - 1]?.points} pts</p>}
                {view === 'mastery' && <p className="text-sm text-violet-300">{sortedData[currentUserRank - 1]?.avgScore}% avg</p>}
                {view === 'badges' && <p className="text-sm text-violet-300">{sortedData[currentUserRank - 1]?.badges} badges</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 pb-8">
        <div className="space-y-2">
          {sortedData.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.email === currentUser?.email;

            return (
              <motion.div
                key={entry.email}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className={cn(
                  "p-4 rounded-xl border transition-all",
                  isCurrentUser 
                    ? "bg-violet-500/20 border-violet-500/30" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-12 flex justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-3 flex-1">
                    <ProfileAvatar user={{ email: entry.email, full_name: entry.email }} size="sm" />
                    <div>
                      <p className="text-white font-medium">{entry.email.split('@')[0]}</p>
                      <p className="text-xs text-zinc-500">{entry.rankTitle}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    {view === 'points' && (
                      <div className="text-right">
                        <p className="text-xl font-bold text-amber-400">{entry.points}</p>
                        <p className="text-xs text-zinc-500">Level {entry.level}</p>
                      </div>
                    )}
                    {view === 'mastery' && (
                      <div className="text-right">
                        <p className="text-xl font-bold text-violet-400">{entry.avgScore}%</p>
                        <p className="text-xs text-zinc-500">Average</p>
                      </div>
                    )}
                    {view === 'badges' && (
                      <div className="text-right">
                        <p className="text-xl font-bold text-pink-400">{entry.badges}</p>
                        <p className="text-xs text-zinc-500">Badges</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">No leaderboard data yet. Complete assessments to appear!</p>
          </div>
        )}
      </div>
    </div>
  );
}