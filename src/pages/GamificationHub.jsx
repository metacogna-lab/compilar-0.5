import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Trophy, Star, Flame, Zap, Target, Users,
  Crown, Medal, Award, TrendingUp, Clock, ChevronRight,
  Sparkles, Shield, Heart, BookOpen, Compass, Lock, Plus,
  Check, PartyPopper, Gift, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { calculateLevel, getLevelProgress, getPointsToNextLevel, getRankTitle, COMPILAR_PILLARS } from '@/components/pilar/GamificationService';
import { TROPHIES } from '@/components/pilar/TrophyCase';
import confetti from 'canvas-confetti';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';
import PointsBreakdownChart from '@/components/pilar/PointsBreakdownChart';
import ProgressTimeline from '@/components/pilar/ProgressTimeline';
import DetailedBadgeShowcase from '@/components/pilar/DetailedBadgeShowcase';
import PILARMasteryTracker from '@/components/pilar/PILARMasteryTracker';

const levelTitles = [
  'Recruit', 'Team Member', 'Contributor', 'Supporter', 'Collaborator',
  'Coordinator', 'Facilitator', 'Leader', 'Commander', 'Strategist', 'Mission Master'
];

const tierConfig = {
  bronze: { color: 'amber-700', bg: 'from-amber-700/30 to-amber-900/20' },
  silver: { color: 'zinc-300', bg: 'from-zinc-300/30 to-zinc-500/20' },
  gold: { color: 'amber-400', bg: 'from-amber-400/30 to-amber-600/20' },
  platinum: { color: 'cyan-300', bg: 'from-cyan-300/30 to-cyan-500/20' },
  diamond: { color: 'violet-400', bg: 'from-violet-400/30 to-pink-500/20' },
};

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield,
};

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber',
};

export default function GamificationHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPillarLB, setSelectedPillarLB] = useState('all');
  const [celebratingBadge, setCelebratingBadge] = useState(null);
  
  React.useEffect(() => {
    trackPageView('GamificationHub');
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

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: trophies = [] } = useQuery({
    queryKey: ['trophies'],
    queryFn: () => base44.entities.Trophy.list(),
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.Challenge.filter({ status: 'active' }),
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

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
  });

  const { data: allProfiles = [] } = useQuery({
    queryKey: ['allProfiles'],
    queryFn: () => base44.entities.UserProfile.list(),
  });

  // Computed values
  const points = gamification?.total_points || 0;
  const level = calculateLevel(points);
  const progress = getLevelProgress(points);
  const toNext = getPointsToNextLevel(points);
  const streak = gamification?.streaks?.current_streak || 0;
  const longestStreak = gamification?.streaks?.longest_streak || 0;
  const earnedBadges = gamification?.badges || [];
  const myTrophies = trophies.filter(t => t.created_by === currentUser?.email);

  // Leaderboard data
  const leaderboardData = useMemo(() => {
    return allGamification.map(g => {
      const user = users.find(u => u.email === g.created_by);
      return {
        email: g.created_by,
        name: user?.full_name || g.created_by?.split('@')[0],
        points: g.total_points || 0,
        level: calculateLevel(g.total_points || 0),
        streak: g.streaks?.current_streak || 0,
        badges: g.badges?.length || 0,
      };
    }).sort((a, b) => b.points - a.points);
  }, [allGamification, users]);

  const myRank = leaderboardData.findIndex(d => d.email === currentUser?.email) + 1;

  // Pillar-specific leaderboards
  const pillarLeaderboards = useMemo(() => {
    const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
    const leaderboards = {};
    
    pillars.forEach(pillar => {
      leaderboards[pillar] = allProfiles
        .filter(p => p.pillar_scores?.[pillar] > 0)
        .map(p => {
          const user = users.find(u => u.email === p.created_by);
          return {
            email: p.created_by,
            name: user?.full_name || p.created_by?.split('@')[0],
            score: p.pillar_scores[pillar],
          };
        })
        .sort((a, b) => b.score - a.score);
    });
    
    return leaderboards;
  }, [allProfiles, users]);

  // Celebrate badge
  const celebrateBadge = (badge) => {
    setCelebratingBadge(badge);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8b5cf6', '#ec4899', '#f59e0b']
    });
  };

  // Upcoming challenges
  const activeChallenges = challenges.filter(c => {
    const userParticipant = c.participants?.find(p => p.email === currentUser?.email);
    return userParticipant && !userParticipant.completed;
  });

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('GlobalMap')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Gamification Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-bold">{points.toLocaleString()}</span>
          </div>
          <ProfileAvatar user={currentUser} size="sm" />
        </div>
      </div>

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Level & Progress Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-pink-500/20 border border-violet-500/30"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Level Badge */}
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <span className="text-4xl font-bold text-white">{level}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center border-4 border-[#0F0F12]">
                <Flame className="w-5 h-5 text-white" />
              </div>
            </motion.div>

            {/* Level Info */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-2xl font-bold text-white mb-1">{levelTitles[level - 1] || 'Mission Master'}</p>
              <p className="text-zinc-400 mb-4">{points.toLocaleString()} points • {streak} day streak</p>
              
              <div className="max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">Level {level}</span>
                  <span className="text-violet-400">{toNext.toLocaleString()} pts to Level {level + 1}</span>
                </div>
                <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full relative"
                  >
                    <motion.div
                      animate={{ x: [0, 20, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/30 rounded-full"
                    />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Star className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{earnedBadges.length}</p>
                <p className="text-xs text-zinc-500">Badges</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{myTrophies.length}</p>
                <p className="text-xs text-zinc-500">Trophies</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/5">
                <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{longestStreak}</p>
                <p className="text-xs text-zinc-500">Best Streak</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white/5 p-1 flex-wrap">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="progress" className="text-sm">Progress</TabsTrigger>
            <TabsTrigger value="badges" className="text-sm">Badges</TabsTrigger>
            <TabsTrigger value="points" className="text-sm">Points</TabsTrigger>
            <TabsTrigger value="challenges" className="text-sm">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-sm">Rankings</TabsTrigger>
            <TabsTrigger value="social" className="text-sm">Social</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid lg:grid-cols-2 gap-4">
              <PILARMasteryTracker 
                userProfile={userProfile}
                gamification={gamification}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30">
                  <Star className="w-8 h-8 text-violet-400 mb-2" />
                  <p className="text-3xl font-bold text-white">{earnedBadges.length}</p>
                  <p className="text-sm text-zinc-400">Badges Earned</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/30">
                  <Zap className="w-8 h-8 text-amber-400 mb-2" />
                  <p className="text-3xl font-bold text-white">{points.toLocaleString()}</p>
                  <p className="text-sm text-zinc-400">Total Points</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/10 border border-orange-500/30">
                  <div className="text-3xl mb-2">🔥</div>
                  <p className="text-3xl font-bold text-white">{streak}</p>
                  <p className="text-sm text-zinc-400">Current Streak</p>
                </div>
                <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-600/10 border border-emerald-500/30">
                  <Crown className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-3xl font-bold text-white">#{myRank || '—'}</p>
                  <p className="text-sm text-zinc-400">Global Rank</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-4">
            <ProgressTimeline 
              assessments={assessments}
              pointsHistory={gamification?.points_history || []}
            />
          </TabsContent>

          {/* Points Tab */}
          <TabsContent value="points" className="space-y-4">
            <PointsBreakdownChart pointsHistory={gamification?.points_history || []} />
            
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(gamification?.points_history || []).slice(-20).reverse().map((entry, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex-1">
                      <p className="text-sm text-white capitalize">{entry.reason.replace(/_/g, ' ')}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-zinc-500">
                          {new Date(entry.earned_at).toLocaleDateString()}
                        </p>
                        {entry.pillar && (
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-${pillarColors[entry.pillar]}-500/20 text-${pillarColors[entry.pillar]}-400 capitalize`}>
                            {entry.pillar}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-400">+{entry.points}</p>
                    </div>
                  </motion.div>
                ))}
                {(!gamification?.points_history || gamification.points_history.length === 0) && (
                  <p className="text-zinc-500 text-center py-8">No activity yet</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <DetailedBadgeShowcase
              earnedBadges={earnedBadges}
              userProfile={userProfile}
              gamification={gamification}
              assessments={assessments}
              groups={groups}
            />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-400" />
                Active Challenges
              </h3>
              <div className="space-y-2">
                {activeChallenges.slice(0, 5).map((challenge, i) => {
                  const userProgress = challenge.participants?.find(p => p.email === currentUser?.email);
                  const daysLeft = challenge.end_date 
                    ? Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;
                  return (
                    <div key={challenge.id} className="p-3 rounded-lg bg-white/5">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-white">{challenge.title}</span>
                        {daysLeft !== null && (
                          <span className="text-xs text-orange-400">{daysLeft}d left</span>
                        )}
                      </div>
                      <Progress value={userProgress?.progress || 0} className="h-2" />
                    </div>
                  );
                })}
                {activeChallenges.length === 0 && (
                  <p className="text-sm text-zinc-500">No active challenges</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Link to={createPageUrl('StudyGroups')}>
                <div className="p-6 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/30 hover:border-indigo-500/50 transition-all cursor-pointer">
                  <Users className="w-8 h-8 text-indigo-400 mb-3" />
                  <h4 className="text-white font-semibold mb-2">Study Groups</h4>
                  <p className="text-sm text-zinc-400">Collaborate with peers on specific pillars</p>
                </div>
              </Link>
              <Link to={createPageUrl('ProgressDashboard')}>
                <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/30 hover:border-violet-500/50 transition-all cursor-pointer">
                  <Activity className="w-8 h-8 text-violet-400 mb-3" />
                  <h4 className="text-white font-semibold mb-2">Progress Dashboard</h4>
                  <p className="text-sm text-zinc-400">Advanced analytics and skill mapping</p>
                </div>
              </Link>
            </div>
          </TabsContent>

          {/* Rankings Tab */}
          <TabsContent value="leaderboard" className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedPillarLB('all')}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-colors",
                  selectedPillarLB === 'all' 
                    ? "bg-violet-500 text-white" 
                    : "bg-white/10 text-zinc-400 hover:bg-white/20"
                )}
              >
                Overall
              </button>
              {['purpose', 'interpersonal', 'learning', 'action', 'resilience'].map(pillar => {
                const Icon = pillarIcons[pillar];
                return (
                  <button
                    key={pillar}
                    onClick={() => setSelectedPillarLB(pillar)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 transition-colors",
                      selectedPillarLB === pillar
                        ? `bg-${pillarColors[pillar]}-500 text-white` 
                        : "bg-white/10 text-zinc-400 hover:bg-white/20"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="capitalize">{pillar}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                {selectedPillarLB === 'all' ? (
                  <>
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Overall Rankings
                  </>
                ) : (
                  <>
                    {React.createElement(pillarIcons[selectedPillarLB], { 
                      className: `w-4 h-4 text-${pillarColors[selectedPillarLB]}-400` 
                    })}
                    <span className="capitalize">{selectedPillarLB} Rankings</span>
                  </>
                )}
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(selectedPillarLB === 'all' ? leaderboardData : pillarLeaderboards[selectedPillarLB] || []).slice(0, 15).map((person, i) => {
                  const rank = i + 1;
                  const isMe = person.email === currentUser?.email;
                  const RankIcon = rank === 1 ? Crown : rank === 2 ? Medal : rank === 3 ? Award : null;
                  const displayValue = selectedPillarLB === 'all' ? person.points : person.score;
                  
                  return (
                    <motion.div
                      key={person.email}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "p-3 rounded-xl flex items-center gap-3",
                        isMe 
                          ? selectedPillarLB === 'all' 
                            ? "bg-violet-500/20 border border-violet-500/30" 
                            : `bg-${pillarColors[selectedPillarLB]}-500/20 border border-${pillarColors[selectedPillarLB]}-500/30`
                          : "bg-white/5"
                      )}
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                        rank === 1 ? "bg-amber-500 text-white" :
                        rank === 2 ? "bg-zinc-400 text-white" :
                        rank === 3 ? "bg-amber-700 text-white" :
                        "bg-white/10 text-zinc-400"
                      )}>
                        {RankIcon ? <RankIcon className="w-4 h-4" /> : rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {person.name}
                          {isMe && <span className={`ml-2 text-${selectedPillarLB === 'all' ? 'violet' : pillarColors[selectedPillarLB]}-400`}>(You)</span>}
                        </p>
                        {selectedPillarLB === 'all' && person.level && (
                          <p className="text-xs text-zinc-500">{levelTitles[person.level - 1]} • {person.badges} badges</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-${selectedPillarLB === 'all' ? 'amber' : pillarColors[selectedPillarLB]}-400`}>
                          {selectedPillarLB === 'all' ? displayValue.toLocaleString() : `${displayValue}%`}
                        </p>
                        {selectedPillarLB === 'all' && person.streak > 0 && (
                          <div className="flex items-center gap-1 text-xs text-orange-400">
                            <Flame className="w-3 h-3" />
                            {person.streak}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Badge Celebration Dialog */}
      <Dialog open={!!celebratingBadge} onOpenChange={() => setCelebratingBadge(null)}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-sm text-center">
          {celebratingBadge && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="py-6"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="text-7xl mb-4"
              >
                {celebratingBadge.icon || '⭐'}
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-2">{celebratingBadge.name}</h3>
              {celebratingBadge.description && (
                <p className="text-zinc-400 mb-4">{celebratingBadge.description}</p>
              )}
              {celebratingBadge.earned_at && (
                <p className="text-xs text-zinc-500 mt-4">
                  Earned on {new Date(celebratingBadge.earned_at).toLocaleDateString()}
                </p>
              )}
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}