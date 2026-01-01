import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, TrendingUp, Award, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';
import ProgressTimeline from '@/components/pilar/ProgressTimeline';
import TrendAnalysis from '@/components/progress/TrendAnalysis';
import BadgeRarityChart from '@/components/progress/BadgeRarityChart';
import SkillTree from '@/components/progress/SkillTree';
import PILARMasteryTracker from '@/components/pilar/PILARMasteryTracker';
import { trackPageView } from '@/components/pilar/ActionTracker';

export default function ProgressDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    trackPageView('ProgressDashboard');
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

  const { data: allGamification = [] } = useQuery({
    queryKey: ['allGamification'],
    queryFn: () => base44.entities.UserGamification.list(),
  });

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('GlobalMap')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Progress Dashboard</h1>
        </div>
        <ProfileAvatar user={currentUser} size="sm" showLink />
      </div>

      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 p-1">
            <TabsTrigger value="overview" className="text-sm">Overview</TabsTrigger>
            <TabsTrigger value="trends" className="text-sm">Trends</TabsTrigger>
            <TabsTrigger value="achievements" className="text-sm">Achievements</TabsTrigger>
            <TabsTrigger value="skillmap" className="text-sm">Skill Map</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <PILARMasteryTracker 
                userProfile={userProfile}
                gamification={gamification}
              />
              <TrendAnalysis 
                assessments={assessments}
                userProfile={userProfile}
              />
            </div>
            
            <ProgressTimeline 
              assessments={assessments}
              pointsHistory={gamification?.points_history || []}
            />
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-6">
            <TrendAnalysis 
              assessments={assessments}
              userProfile={userProfile}
            />
            
            <ProgressTimeline 
              assessments={assessments}
              pointsHistory={gamification?.points_history || []}
            />
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <BadgeRarityChart 
              earnedBadges={gamification?.badges || []}
              allGamification={allGamification}
            />
          </TabsContent>

          {/* Skill Map Tab */}
          <TabsContent value="skillmap" className="space-y-6">
            <SkillTree userProfile={userProfile} />
            
            <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
              <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-400" />
                Development Path Recommendations
              </h4>
              <div className="space-y-2">
                {userProfile?.recommended_activities?.slice(0, 5).map((activity, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-lg bg-white/5 text-sm text-zinc-300"
                  >
                    {activity}
                  </motion.div>
                ))}
                {(!userProfile?.recommended_activities || userProfile.recommended_activities.length === 0) && (
                  <p className="text-zinc-500 text-sm">Complete assessments to receive personalized recommendations</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}