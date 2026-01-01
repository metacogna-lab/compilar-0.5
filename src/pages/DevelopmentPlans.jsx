import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Plus, Target, Sparkles, Calendar,
  TrendingUp, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import DevelopmentPlanCard from '@/components/pilar/DevelopmentPlanCard';
import PointsDisplay from '@/components/pilar/PointsDisplay';
import BadgeDisplay from '@/components/pilar/BadgeDisplay';
import { generatePlanActivities, POINTS_CONFIG, checkBadgeEligibility, BADGES } from '@/components/pilar/GamificationService';
import { trackPageView } from '@/components/pilar/ActionTracker';

const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];

export default function DevelopmentPlans() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPlan, setNewPlan] = useState({ title: '', target_pillars: [] });
  const queryClient = useQueryClient();

  React.useEffect(() => {
    trackPageView('DevelopmentPlans');
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['developmentPlans'],
    queryFn: () => base44.entities.DevelopmentPlan.list('-created_date'),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const records = await base44.entities.UserGamification.list();
      return records[0];
    },
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.GroupRound.list(),
  });

  const myPlans = plans.filter(p => p.created_by === currentUser?.email);

  const createPlanMutation = useMutation({
    mutationFn: async (planData) => {
      const activities = planData.target_pillars.flatMap(pillar => 
        generatePlanActivities(pillar, userProfile?.pillar_scores?.[pillar] || 50)
      );
      
      const goals = planData.target_pillars.map(pillar => ({
        id: `goal_${pillar}_${Date.now()}`,
        pillar,
        title: `Improve ${pillar.charAt(0).toUpperCase() + pillar.slice(1)}`,
        description: `Increase your ${pillar} score through targeted activities`,
        target_score: Math.min(100, (userProfile?.pillar_scores?.[pillar] || 50) + 20),
        current_score: userProfile?.pillar_scores?.[pillar] || 0,
        status: 'not_started',
      }));

      return base44.entities.DevelopmentPlan.create({
        ...planData,
        activities,
        goals,
        status: 'active',
        progress_percentage: 0,
        start_date: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['developmentPlans']);
      setShowCreateDialog(false);
      setNewPlan({ title: '', target_pillars: [] });
    },
  });

  const updateGamificationMutation = useMutation({
    mutationFn: async (data) => {
      if (gamification) {
        return base44.entities.UserGamification.update(gamification.id, data);
      }
      return base44.entities.UserGamification.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['gamification']);
    },
  });

  const completeActivityMutation = useMutation({
    mutationFn: async ({ planId, activityId }) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const activity = plan.activities.find(a => a.id === activityId);
      const updatedActivities = plan.activities.map(a => 
        a.id === activityId ? { ...a, completed: true, completed_at: new Date().toISOString() } : a
      );

      const completedCount = updatedActivities.filter(a => a.completed).length;
      const progress = Math.round((completedCount / updatedActivities.length) * 100);

      // Update plan
      await base44.entities.DevelopmentPlan.update(planId, {
        activities: updatedActivities,
        progress_percentage: progress,
        status: progress === 100 ? 'completed' : 'active',
      });

      // Award points
      const points = activity?.points || POINTS_CONFIG.activity_completed;
      const newTotal = (gamification?.total_points || 0) + points;
      const newHistory = [
        ...(gamification?.points_history || []),
        { points, reason: `Completed: ${activity?.title}`, pillar: activity?.pillar, earned_at: new Date().toISOString() }
      ];

      // Check for new badges
      const newBadges = checkBadgeEligibility(
        { ...gamification, total_points: newTotal },
        userProfile,
        assessments,
        groups
      );

      await updateGamificationMutation.mutateAsync({
        total_points: newTotal,
        points_history: newHistory,
        badges: [...(gamification?.badges || []), ...newBadges],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['developmentPlans']);
    },
  });

  const togglePillar = (pillar) => {
    setNewPlan(prev => ({
      ...prev,
      target_pillars: prev.target_pillars.includes(pillar)
        ? prev.target_pillars.filter(p => p !== pillar)
        : [...prev.target_pillars, pillar]
    }));
  };

  // Suggest pillars based on scores
  const suggestedPillars = useMemo(() => {
    if (!userProfile?.pillar_scores) return pillars.slice(0, 2);
    const sorted = Object.entries(userProfile.pillar_scores)
      .sort(([,a], [,b]) => a - b)
      .map(([p]) => p);
    return sorted.slice(0, 2);
  }, [userProfile]);

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <Link to={createPageUrl('Profile')}>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Profile
          </Button>
        </Link>
        <Button
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-violet-500 to-emerald-500 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Plan
        </Button>
      </div>

      <div className="relative z-10 px-4 md:px-6 pb-20 max-w-4xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Development Plans</h1>
          <p className="text-zinc-400">Track your growth journey across the PILAR framework</p>
        </motion.div>

        {/* Gamification Overview */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <PointsDisplay gamification={gamification} />
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-sm font-medium text-zinc-300 mb-3">Recent Badges</h3>
            {gamification?.badges?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {gamification.badges.slice(-4).map(badge => (
                  <BadgeDisplay key={badge.id} badge={badge} size="sm" showDetails={false} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500">Complete activities to earn badges!</p>
            )}
          </div>
        </div>

        {/* Plans */}
        <div className="space-y-4">
          {myPlans.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No plans yet</h3>
              <p className="text-zinc-400 mb-4">Create a development plan to start tracking your growth</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-violet-500 hover:bg-violet-600">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          ) : (
            myPlans.map(plan => (
              <DevelopmentPlanCard
                key={plan.id}
                plan={plan}
                onActivityComplete={(planId, activityId) => 
                  completeActivityMutation.mutate({ planId, activityId })
                }
              />
            ))
          )}
        </div>
      </div>

      {/* Create Plan Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-400" />
              Create Development Plan
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Plan Name</label>
              <Input
                value={newPlan.title}
                onChange={(e) => setNewPlan({ ...newPlan, title: e.target.value })}
                placeholder="My Growth Journey"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Focus Pillars</label>
              {suggestedPillars.length > 0 && (
                <p className="text-xs text-amber-400 mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Suggested based on your scores: {suggestedPillars.join(', ')}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {pillars.map(pillar => (
                  <label
                    key={pillar}
                    className={`flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-colors ${
                      newPlan.target_pillars.includes(pillar)
                        ? 'bg-violet-500/20 border border-violet-500/30'
                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                    }`}
                  >
                    <Checkbox
                      checked={newPlan.target_pillars.includes(pillar)}
                      onCheckedChange={() => togglePillar(pillar)}
                    />
                    <span className="text-sm capitalize">{pillar}</span>
                  </label>
                ))}
              </div>
            </div>

            <Button
              onClick={() => createPlanMutation.mutate(newPlan)}
              disabled={!newPlan.title || newPlan.target_pillars.length === 0 || createPlanMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-emerald-500 text-white"
            >
              {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}