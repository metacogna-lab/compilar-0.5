import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Compass, Heart, BookOpen, Zap, Shield,
  TrendingUp, TrendingDown, Minus, Users, Sparkles,
  Target, Brain, Lightbulb, RefreshCw, ChevronRight,
  Star, Flame, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { trackPageView } from '@/components/pilar/ActionTracker';
import PilarRadarChart from '@/components/pilar/PilarRadarChart';
import { calculateLevel } from '@/components/pilar/GamificationService';
import { syncUserAnalytics } from '@/components/pilar/UserIntentAnalytics';

// Ben Heslop's PILAR Framework - Pillar Definitions
const pilarFramework = {
  purpose: {
    icon: Compass,
    color: 'violet',
    title: 'Purpose',
    essence: 'The compass that guides meaningful direction',
    description: 'Purpose provides the foundational "why" behind actions. It encompasses sense of direction, values alignment, and meaning extraction from experiences.',
    subdomains: [
      { name: 'Sense of Direction', description: 'Clarity about life goals and aspirations' },
      { name: 'Values Alignment', description: 'Living in accordance with core beliefs' },
      { name: 'Meaning Extraction', description: 'Finding significance in daily experiences' },
    ],
    teamInsight: 'Teams with aligned purpose show 3x higher engagement and resilience during challenges.',
    developmentFocus: [
      'Reflect on what energizes you most',
      'Identify values that guide your decisions',
      'Connect daily tasks to larger goals',
    ],
  },
  interpersonal: {
    icon: Heart,
    color: 'pink',
    title: 'Interpersonal',
    essence: 'The bridge that connects individuals to collective strength',
    description: 'Interpersonal skills form the social fabric of effective collaboration. This pillar governs empathy, communication, and conflict resolution.',
    subdomains: [
      { name: 'Empathy', description: 'Understanding and sharing feelings of others' },
      { name: 'Communication', description: 'Clear, authentic expression and active listening' },
      { name: 'Conflict Resolution', description: 'Navigating disagreements constructively' },
    ],
    teamInsight: 'High interpersonal awareness reduces team conflicts by 60% and accelerates decision-making.',
    developmentFocus: [
      'Practice active listening without judgment',
      'Express needs clearly and respectfully',
      'Seek to understand before being understood',
    ],
  },
  learning: {
    icon: BookOpen,
    color: 'indigo',
    title: 'Learning',
    essence: 'The engine of continuous growth and adaptation',
    description: 'Learning represents the capacity for growth through curiosity, skill acquisition, and reflective practice.',
    subdomains: [
      { name: 'Curiosity', description: 'Openness to new ideas and experiences' },
      { name: 'Skill Acquisition', description: 'Deliberate practice and competency building' },
      { name: 'Reflection', description: 'Processing experiences for deeper understanding' },
    ],
    teamInsight: 'Learning-oriented teams adapt 40% faster to changing conditions and innovate more effectively.',
    developmentFocus: [
      'Embrace challenges as learning opportunities',
      'Seek feedback actively and apply it',
      'Document insights and review regularly',
    ],
  },
  action: {
    icon: Zap,
    color: 'emerald',
    title: 'Action',
    essence: 'The force that transforms intention into reality',
    description: 'Action translates knowledge and purpose into tangible outcomes through discipline, momentum, and effective execution.',
    subdomains: [
      { name: 'Discipline', description: 'Consistent effort towards goals' },
      { name: 'Momentum', description: 'Building and maintaining productive flow' },
      { name: 'Execution', description: 'Delivering results effectively' },
    ],
    teamInsight: 'Action-oriented teams complete projects 35% faster with higher quality outcomes.',
    developmentFocus: [
      'Break large goals into actionable steps',
      'Establish routines that support progress',
      'Celebrate small wins to build momentum',
    ],
  },
  resilience: {
    icon: Shield,
    color: 'amber',
    title: 'Resilience',
    essence: 'The foundation that sustains through adversity',
    description: 'Resilience enables recovery from setbacks through stress response management, emotional regulation, and adaptive recovery strategies.',
    subdomains: [
      { name: 'Stress Response', description: 'Managing pressure effectively' },
      { name: 'Emotional Regulation', description: 'Processing and directing emotions constructively' },
      { name: 'Recovery', description: 'Bouncing back from setbacks stronger' },
    ],
    teamInsight: 'Resilient teams maintain 50% higher performance during high-pressure periods.',
    developmentFocus: [
      'Develop healthy coping mechanisms',
      'Build support networks before you need them',
      'Reframe setbacks as growth opportunities',
    ],
  },
};

// PILAR interconnections based on Ben Heslop's research
const pillarConnections = {
  purpose: { connects: ['interpersonal', 'resilience'], insight: 'Purpose fuels interpersonal connection and provides resilience anchor' },
  interpersonal: { connects: ['purpose', 'action'], insight: 'Relationships amplify purpose and enable collaborative action' },
  learning: { connects: ['action', 'resilience'], insight: 'Learning drives effective action and builds adaptive capacity' },
  action: { connects: ['interpersonal', 'learning'], insight: 'Action strengthens bonds through shared achievement and generates learning' },
  resilience: { connects: ['learning', 'purpose'], insight: 'Resilience enables continuous learning and protects purpose' },
};

export default function UserPilarProfile() {
  React.useEffect(() => {
    trackPageView('UserPilarProfile');
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
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

  const { data: actions = [] } = useQuery({
    queryKey: ['userActions'],
    queryFn: () => base44.entities.UserAction.list('-timestamp', 100),
  });

  const { data: pathways = [] } = useQuery({
    queryKey: ['learningPathways', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      return base44.entities.LearningPathway.filter({ user_email: currentUser.email });
    },
    enabled: !!currentUser?.email,
  });

  // Sync all data to master UserAnalytics entity
  React.useEffect(() => {
    if (currentUser?.email && userProfile) {
      syncUserAnalytics(
        currentUser.email,
        userProfile,
        assessments,
        actions,
        gamification,
        groups,
        pathways
      ).catch(console.error);
    }
  }, [currentUser?.email, userProfile, assessments, actions, gamification, groups, pathways]);

  // Computed profile data
  const scores = userProfile?.pillar_scores || {};
  const completedPillars = Object.keys(scores).filter(k => scores[k] > 0);
  const avgScore = completedPillars.length > 0
    ? Math.round(completedPillars.reduce((sum, k) => sum + scores[k], 0) / completedPillars.length)
    : 0;

  // Identify strongest and growth pillars
  const sortedPillars = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);
  
  const strongestPillar = sortedPillars[0]?.[0];
  const growthPillar = sortedPillars[sortedPillars.length - 1]?.[0];

  // Calculate balance index (how evenly distributed scores are)
  const balanceIndex = useMemo(() => {
    if (completedPillars.length < 2) return 0;
    const values = completedPillars.map(k => scores[k]);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
    return Math.max(0, 100 - Math.sqrt(variance));
  }, [scores, completedPillars]);

  // Session insights
  const totalSessions = new Set(actions.map(a => a.session_id)).size;
  const totalInteractions = actions.length;

  // Team participation
  const myGroups = groups.filter(g => g.participants?.some(p => p.email === currentUser?.email));

  // Gamification stats
  const level = calculateLevel(gamification?.total_points || 0);
  const streak = gamification?.streaks?.current_streak || 0;

  const userInitials = currentUser?.full_name
    ? currentUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('GlobalMap')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10 h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Caterpillar Collaboration Profile</h1>
        </div>
        <Link to={createPageUrl('GamificationHub')}>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
            <Star className="w-4 h-4 mr-2" />
            Achievements
          </Button>
        </Link>
      </div>

      <div className="relative z-10 p-4 max-w-6xl mx-auto space-y-6">
        {/* Profile Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-3xl bg-gradient-to-br from-violet-500/20 via-transparent to-pink-500/20 border border-violet-500/30"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-violet-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <span className="text-3xl font-bold text-white">{userInitials}</span>
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-1 rounded-full bg-violet-500 text-white text-xs font-bold">
                Lv.{level}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white">{currentUser?.full_name || 'Explorer'}</h2>
              <p className="text-zinc-400">{currentUser?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-400 text-sm">
                  {completedPillars.length}/5 Pillars Assessed
                </span>
                <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm flex items-center gap-1">
                  <Flame className="w-3 h-3" /> {streak} day streak
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm flex items-center gap-1">
                  <Users className="w-3 h-3" /> {myGroups.length} teams
                </span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{avgScore}%</p>
                <p className="text-xs text-zinc-500">Avg Score</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{totalSessions}</p>
                <p className="text-xs text-zinc-500">Sessions</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{Math.round(balanceIndex)}%</p>
                <p className="text-xs text-zinc-500">Balance</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Radar Chart + Overview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 p-6 rounded-2xl bg-white/5 border border-white/10"
          >
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              PILAR Profile
            </h3>
            <PilarRadarChart scores={scores} />
            
            {strongestPillar && (
              <div className="mt-4 space-y-2">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-xs text-emerald-400 mb-1">Strongest Pillar</p>
                  <p className="text-white font-medium capitalize">{strongestPillar}</p>
                  <p className="text-xs text-zinc-400 mt-1">{pilarFramework[strongestPillar]?.essence}</p>
                </div>
                {growthPillar && growthPillar !== strongestPillar && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <p className="text-xs text-amber-400 mb-1">Growth Opportunity</p>
                    <p className="text-white font-medium capitalize">{growthPillar}</p>
                    <p className="text-xs text-zinc-400 mt-1">{pilarFramework[growthPillar]?.essence}</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>

          {/* Interactive Theory Graph with Rich Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-3"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-400" />
                PILAR Framework Theory
              </h3>
              <span className="text-xs text-zinc-500">Hover to explore • Based on Ben Heslop's research</span>
            </div>
            
            {Object.entries(pilarFramework).map(([key, pillar], i) => {
              const score = scores[key];
              const hasScore = score > 0;
              const Icon = pillar.icon;
              const connections = pillarConnections[key];
              
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="group relative"
                >
                  {/* Compact Default View */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all duration-300 cursor-pointer",
                    "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10",
                    "group-hover:shadow-lg group-hover:shadow-violet-500/10"
                  )}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl bg-${pillar.color}-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-${pillar.color}-500/30 transition-all group-hover:scale-110`}>
                        <Icon className={`w-5 h-5 text-${pillar.color}-400`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-white group-hover:text-${pillar.color}-300 transition-colors">{pillar.title}</h4>
                          {hasScore && (
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full bg-white/5 font-medium transition-all",
                              score >= 70 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"
                            )}>
                              You: {score}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 italic mt-0.5 group-hover:text-zinc-400 transition-colors">{pillar.essence}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rich Hover Expansion */}
                  <div className="absolute inset-x-0 top-full mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
                    <motion.div
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      className={cn(
                        "p-6 rounded-2xl border shadow-2xl backdrop-blur-xl",
                        `bg-${pillar.color}-950/90 border-${pillar.color}-500/30`
                      )}
                    >
                      {/* Theory Description */}
                      <div className="mb-4">
                        <h5 className={`text-sm font-semibold text-${pillar.color}-300 mb-2 flex items-center gap-2`}>
                          <Brain className="w-4 h-4" />
                          Core Theory
                        </h5>
                        <p className="text-sm text-zinc-300 leading-relaxed">{pillar.description}</p>
                      </div>

                      {/* Subdomains */}
                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Three Subdomains</h5>
                        <div className="space-y-2">
                          {pillar.subdomains.map((sub, j) => (
                            <div key={j} className="p-3 rounded-lg bg-white/5 border border-white/10">
                              <p className="text-sm font-medium text-white mb-1">{sub.name}</p>
                              <p className="text-xs text-zinc-400">{sub.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Team Insight */}
                      <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <h5 className="text-xs font-semibold text-blue-300 mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          Research Insight
                        </h5>
                        <p className="text-xs text-blue-200/80">{pillar.teamInsight}</p>
                      </div>

                      {/* Development Focus */}
                      <div className="mb-4">
                        <h5 className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Development Practices</h5>
                        <ul className="space-y-1.5">
                          {pillar.developmentFocus.map((focus, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-zinc-300">
                              <ChevronRight className={`w-3 h-3 text-${pillar.color}-400 flex-shrink-0 mt-0.5`} />
                              {focus}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Interconnections */}
                      <div className="pt-3 border-t border-white/10">
                        <h5 className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          Framework Connections
                        </h5>
                        <p className="text-xs text-zinc-400 mb-2">{connections.insight}</p>
                        <div className="flex gap-2">
                          {connections.connects.map(c => (
                            <span key={c} className={`px-2 py-1 rounded-full bg-${pilarFramework[c].color}-500/20 text-${pilarFramework[c].color}-300 text-xs font-medium capitalize`}>
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Action Button */}
                      {!hasScore && (
                        <Link to={createPageUrl(`Pillar?pillar=${key}`)} className="block mt-4">
                          <Button size="sm" className={`w-full bg-${pillar.color}-500/20 hover:bg-${pillar.color}-500/30 text-${pillar.color}-300 border border-${pillar.color}-500/30`}>
                            Start Assessment
                            <ArrowLeft className="w-3 h-3 ml-2 rotate-180" />
                          </Button>
                        </Link>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Team Cohesion & Suggestions */}
        {myGroups.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
          >
            <h3 className="font-medium text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Team Cohesion Insights
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Your contribution */}
              <div className="p-4 rounded-xl bg-white/5">
                <h4 className="text-sm font-medium text-zinc-300 mb-3">Your Team Contribution</h4>
                {strongestPillar && (
                  <p className="text-sm text-zinc-400 mb-2">
                    Your strength in <span className={`text-${pilarFramework[strongestPillar].color}-400 capitalize font-medium`}>{strongestPillar}</span> can help your team with:
                  </p>
                )}
                <ul className="space-y-1 text-sm text-zinc-400">
                  {strongestPillar && pilarFramework[strongestPillar].developmentFocus.slice(0, 2).map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Team suggestions */}
              <div className="p-4 rounded-xl bg-white/5">
                <h4 className="text-sm font-medium text-zinc-300 mb-3">Caterpillar Collaboration Suggestions</h4>
                {growthPillar && (
                  <p className="text-sm text-zinc-400 mb-2">
                    Seek teammates strong in <span className={`text-${pilarFramework[growthPillar].color}-400 capitalize font-medium`}>{growthPillar}</span> to complement your profile.
                  </p>
                )}
                <p className="text-sm text-zinc-400">
                  {strongestPillar && pilarFramework[strongestPillar].teamInsight}
                </p>
              </div>
            </div>

            {/* Active teams */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-zinc-300 mb-2">Your Teams</h4>
              <div className="flex flex-wrap gap-2">
                {myGroups.map(group => (
                  <Link key={group.id} to={createPageUrl('Groups')}>
                    <span className="px-3 py-1.5 rounded-full bg-white/10 text-white text-sm hover:bg-white/20 transition-colors">
                      {group.name} ({group.participants?.length || 0} members)
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Session Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h3 className="font-medium text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Activity Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold text-white">{assessments.length}</p>
              <p className="text-xs text-zinc-500">Assessments</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold text-white">{totalInteractions}</p>
              <p className="text-xs text-zinc-500">Interactions</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold text-white">{gamification?.badges?.length || 0}</p>
              <p className="text-xs text-zinc-500">Badges</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <p className="text-2xl font-bold text-white">{gamification?.total_points || 0}</p>
              <p className="text-xs text-zinc-500">Total Points</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}