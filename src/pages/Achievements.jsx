import React from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Trophy, Flame, Star, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BadgeDisplay from '@/components/pilar/BadgeDisplay';
import ProgressTrack from '@/components/pilar/ProgressTrack';
import TeamLeaderboard from '@/components/pilar/TeamLeaderboard';
import ChallengesPanel from '@/components/pilar/ChallengesPanel';
import TrophyCase from '@/components/pilar/TrophyCase';
import { BADGES, calculateLevel } from '@/components/pilar/GamificationService';
import { trackPageView } from '@/components/pilar/ActionTracker';

export default function Achievements() {
  React.useEffect(() => {
    trackPageView('Achievements');
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const records = await base44.entities.UserGamification.list();
      return records[0];
    },
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.GroupRound.list(),
  });

  const { data: allGamification = [] } = useQuery({
    queryKey: ['allGamification'],
    queryFn: () => base44.entities.UserGamification.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ status: 'active' }),
  });

  const { data: trophies = [] } = useQuery({
    queryKey: ['trophies'],
    queryFn: () => base44.entities.Trophy.list(),
  });

  const myTrophies = trophies.filter(t => t.created_by === currentUser?.email);

  // Build leaderboard data
  const leaderboardData = allGamification.map(g => {
    const user = users.find(u => u.email === g.created_by);
    return {
      email: g.created_by,
      name: user?.full_name,
      points: g.total_points || 0,
    };
  }).sort((a, b) => b.points - a.points);

  const earnedBadgeIds = gamification?.badges?.map(b => b.id) || [];
  const streak = gamification?.streaks?.current_streak || 0;

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <Link to={createPageUrl('Profile')}>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </Link>
      </div>

      <div className="relative z-10 px-4 md:px-6 pb-20 max-w-6xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Achievements</h1>
          <p className="text-zinc-400">Track your progress, earn rewards, and compete</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Progress Track */}
          <div className="lg:col-span-1">
            <ProgressTrack 
              gamification={gamification}
              userProfile={userProfile}
              badges={gamification?.badges || []}
              trophies={myTrophies}
            />
          </div>

          {/* Center Column - Challenges & Trophies */}
          <div className="lg:col-span-1 space-y-6">
            {/* Active Challenges */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-orange-400" />
                Active Challenges
              </h3>
              <ChallengesPanel 
                challenges={challenges}
                userEmail={currentUser?.email}
                compact
              />
            </div>

            {/* Trophy Case */}
            <div>
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Trophy Case
              </h3>
              <TrophyCase 
                earnedTrophies={myTrophies}
                userProfile={userProfile}
                gamification={gamification}
              />
            </div>
          </div>

          {/* Right Column - Leaderboards */}
          <div className="lg:col-span-1">
            <h3 className="font-medium text-white mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-violet-400" />
              Leaderboards
            </h3>
            <TeamLeaderboard 
              groups={groups}
              individualData={leaderboardData}
              currentUserEmail={currentUser?.email}
              teamGoals={[]}
            />

            {/* Recent Activity */}
            {gamification?.points_history?.length > 0 && (
              <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-medium text-zinc-300 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Recent Activity
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {gamification.points_history.slice(-5).reverse().map((entry, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                      <div>
                        <p className="text-xs text-white truncate">{entry.reason}</p>
                        <p className="text-xs text-zinc-500">
                          {new Date(entry.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-amber-400 text-sm font-medium">+{entry.points}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}