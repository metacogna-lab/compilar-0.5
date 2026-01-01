import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Trophy, Target, Lightbulb, Sparkles, 
  ArrowRight, Clock, Award, TrendingUp, Zap,
  CheckCircle, Circle, Play, Star, FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PilarRadarChart from '@/components/pilar/PilarRadarChart';
import ProfileSection from '@/components/pilar/ProfileSection';
import PointsDisplay from '@/components/pilar/PointsDisplay';
import BadgeDisplay from '@/components/pilar/BadgeDisplay';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';
import { trackPageView, trackRecommendationClicked, trackActivityStarted } from '@/components/pilar/ActionTracker';
import { determineNextPillar, generateActivityRecommendations } from '@/components/pilar/NavigationHeuristics';

const pillarConfig = {
  purpose: { color: 'violet', label: 'Purpose' },
  interpersonal: { color: 'pink', label: 'Interpersonal' },
  learning: { color: 'indigo', label: 'Learning' },
  action: { color: 'emerald', label: 'Action' },
  resilience: { color: 'amber', label: 'Resilience' },
};

const journeyStageConfig = {
  newcomer: { label: 'Newcomer', icon: Circle, color: 'zinc' },
  explorer: { label: 'Explorer', icon: Sparkles, color: 'blue' },
  practitioner: { label: 'Practitioner', icon: TrendingUp, color: 'purple' },
  master: { label: 'Master', icon: Award, color: 'amber' },
};

export default function Profile() {
  const navigate = useNavigate();

  useEffect(() => {
    trackPageView('Profile');
  }, []);

  const { data: assessments = [], isLoading: loadingAssessments } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: recentActions = [] } = useQuery({
    queryKey: ['recentActions'],
    queryFn: async () => {
      const actions = await base44.entities.UserAction.list('-timestamp', 10);
      return actions;
    },
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const records = await base44.entities.UserGamification.list();
      return records[0];
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['developmentPlans'],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ status: 'active' }),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const completedAssessments = assessments.filter(a => a.completed);
  
  const scores = userProfile?.pillar_scores || {};
  completedAssessments.forEach(a => {
    if (!scores[a.pillar]) {
      scores[a.pillar] = a.overall_score;
    }
  });

  const sortedPillars = Object.entries(scores)
    .filter(([_, score]) => score !== undefined)
    .sort(([,a], [,b]) => b - a);
  
  const strongestPillar = sortedPillars[0]?.[0];
  const weakestPillar = sortedPillars[sortedPillars.length - 1]?.[0];
  const hasAnyData = sortedPillars.length > 0;

  const recommendation = determineNextPillar(userProfile, assessments);
  const activities = weakestPillar 
    ? generateActivityRecommendations(weakestPillar, scores[weakestPillar])
    : [];

  const journeyStage = userProfile?.journey_stage || 'newcomer';
  const StageIcon = journeyStageConfig[journeyStage]?.icon || Circle;

  const handlePillarClick = (pillar) => {
    trackRecommendationClicked(pillar, 'profile_click');
    navigate(createPageUrl(`Pillar?pillar=${pillar}`));
  };

  const handleActivityClick = (activity, pillar) => {
    trackActivityStarted(pillar, activity);
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <Link to={createPageUrl('GlobalMap')}>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Map
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link to={createPageUrl('DevelopmentPlans')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <FileText className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Plans</span>
            </Button>
          </Link>
          <Link to={createPageUrl('Achievements')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <Star className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Achievements</span>
            </Button>
          </Link>
          {userProfile?.journey_stage && (
            <div className={`px-3 py-1.5 rounded-full bg-${journeyStageConfig[journeyStage].color}-500/20 border border-${journeyStageConfig[journeyStage].color}-500/30 flex items-center gap-2`}>
              <StageIcon className={`w-4 h-4 text-${journeyStageConfig[journeyStage].color}-400`} />
              <span className={`text-${journeyStageConfig[journeyStage].color}-400 font-medium text-sm hidden sm:inline`}>
                {journeyStageConfig[journeyStage].label}
              </span>
            </div>
          )}
          <ProfileAvatar user={currentUser} size="sm" />
        </div>
      </div>

      <div className="relative z-10 px-4 md:px-6 pb-20 max-w-6xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">Your PILAR Profile</h1>
          <p className="text-base md:text-lg text-zinc-400">
            {hasAnyData 
              ? `${completedAssessments.length} pillar${completedAssessments.length !== 1 ? 's' : ''} assessed`
              : 'Complete assessments to see your profile'
            }
          </p>
        </motion.div>

        {!hasAnyData ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-20"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Target className="w-8 h-8 md:w-10 md:h-10 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No assessments yet</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Explore each pillar and complete assessments to build your profile.
            </p>
            <Link to={createPageUrl('GlobalMap')}>
              <Button className="bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-xl px-6 py-5">
                <Play className="w-4 h-4 mr-2" />
                Start Exploring
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Gamification + Quick Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <PointsDisplay gamification={gamification} compact={false} />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 gap-3 md:col-span-2"
              >
                <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                  <div className="text-2xl font-bold text-white">{completedAssessments.length}/5</div>
                </div>
                <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Avg Score
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {sortedPillars.length > 0 
                      ? Math.round(sortedPillars.reduce((sum, [_, s]) => sum + s, 0) / sortedPillars.length)
                      : 0}%
                  </div>
                </div>
                <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Strongest
                  </div>
                  <div className="text-lg font-bold text-white capitalize">{strongestPillar || '—'}</div>
                </div>
                <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    Focus Area
                  </div>
                  <div className="text-lg font-bold text-white capitalize">{weakestPillar || '—'}</div>
                </div>
              </motion.div>
            </div>

            {/* Recent Badges */}
            {gamification?.badges?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400" />
                    Recent Badges
                  </h3>
                  <Link to={createPageUrl('Achievements')} className="text-xs text-violet-400 hover:text-violet-300">
                    View All →
                  </Link>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {gamification.badges.slice(-5).map(badge => (
                    <BadgeDisplay key={badge.id} badge={badge} size="sm" showDetails={false} />
                  ))}
                </div>
              </motion.div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
              {/* Radar Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-[28px] p-6 border backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10"
              >
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-violet-400" />
                  Capability Overview
                </h3>
                <PilarRadarChart scores={scores} />
              </motion.div>

              {/* Insights */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 md:space-y-6"
              >
                {/* Next Recommendation */}
                <div className="rounded-[28px] p-6 border backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
                  <div className="flex items-center gap-2 text-amber-400 mb-3">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Recommended Next</span>
                  </div>
                  <h4 className="text-xl font-semibold text-white capitalize mb-2">{recommendation.pillar}</h4>
                  <p className="text-zinc-400 text-sm mb-4">{recommendation.reason}</p>
                  <Button
                    onClick={() => {
                      trackRecommendationClicked(recommendation.pillar, 'next_recommendation');
                      navigate(createPageUrl(`Pillar?pillar=${recommendation.pillar}`));
                    }}
                    className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl"
                  >
                    Go to {recommendation.pillar}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                {/* Activities */}
                {activities.length > 0 && weakestPillar && (
                  <div className="rounded-[28px] p-6 border backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10">
                    <div className="flex items-center gap-2 text-zinc-300 mb-4">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      <span className="font-medium">Suggested Activities</span>
                    </div>
                    <div className="space-y-2">
                      {activities.map((activity, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          onClick={() => handleActivityClick(activity, weakestPillar)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                        >
                          <div className={`w-2 h-2 rounded-full bg-${pillarConfig[weakestPillar].color}-500`} />
                          <span className="text-sm text-white flex-1">{activity}</span>
                          <Play className="w-4 h-4 text-zinc-500" />
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* All Pillars */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 md:mt-12"
            >
              <h3 className="text-xl font-semibold text-white mb-4 md:mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                All Pillars
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                {['purpose', 'interpersonal', 'learning', 'action', 'resilience'].map((pillar) => {
                  const score = scores[pillar];
                  const hasScore = score !== undefined;
                  const config = pillarConfig[pillar];
                  
                  return (
                    <motion.button
                      key={pillar}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handlePillarClick(pillar)}
                      className={`rounded-2xl p-4 border backdrop-blur-xl transition-all text-left ${
                        hasScore 
                          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-zinc-300 capitalize">{pillar}</span>
                        {hasScore ? (
                          <CheckCircle className={`w-4 h-4 text-${config.color}-400`} />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-600" />
                        )}
                      </div>
                      {hasScore ? (
                        <>
                          <div className="text-2xl font-bold text-white mb-2">{score}%</div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full bg-${config.color}-500`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-zinc-500 text-sm">Not assessed</div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}