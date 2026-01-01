import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Users, Target, MessageSquare, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';
import PeerFeedbackPanel from '@/components/collaboration/PeerFeedbackPanel';
import { trackPageView } from '@/components/pilar/ActionTracker';

export default function StudyGroupWorkspace() {
  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('groupId');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    trackPageView('StudyGroupWorkspace');
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: group } = useQuery({
    queryKey: ['studyGroup', groupId],
    queryFn: () => base44.entities.StudyGroup.filter({ id: groupId }).then(r => r[0]),
    enabled: !!groupId,
  });

  const { data: feedbackRequests = [] } = useQuery({
    queryKey: ['feedbackRequests', groupId],
    queryFn: async () => {
      const memberEmails = group?.members?.map(m => m.email) || [];
      if (memberEmails.length === 0) return [];
      
      const all = await base44.entities.PeerFeedback.list();
      return all.filter(f => 
        memberEmails.includes(f.requester_email) || memberEmails.includes(f.provider_email)
      );
    },
    enabled: !!group,
  });

  const provideFeedbackMutation = useMutation({
    mutationFn: async ({ feedbackId, content }) => {
      return base44.entities.PeerFeedback.update(feedbackId, {
        feedback_content: content,
        status: 'provided',
        provided_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feedbackRequests']);
    },
  });

  const rateFeedbackMutation = useMutation({
    mutationFn: async ({ feedbackId, rating }) => {
      return base44.entities.PeerFeedback.update(feedbackId, {
        rating,
        status: 'acknowledged'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['feedbackRequests']);
    },
  });

  if (!group) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <p className="text-zinc-500">Loading group...</p>
      </div>
    );
  }

  const myFeedbackRequests = feedbackRequests.filter(f => f.provider_email === currentUser?.email);
  const receivedFeedback = feedbackRequests.filter(f => f.requester_email === currentUser?.email && f.status === 'provided');

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('StudyGroups')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-white">{group.name}</h1>
            <p className="text-xs text-zinc-500 capitalize">{group.focus_pillar} focus</p>
          </div>
        </div>
        <ProfileAvatar user={currentUser} size="sm" showLink />
      </div>

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="bg-white/5 p-1">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.members?.map((member, i) => (
                <motion.div
                  key={member.email}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-bold">
                      {member.name?.[0] || member.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">{member.name || member.email.split('@')[0]}</p>
                      <p className="text-xs text-zinc-500 capitalize">{member.role}</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Shared Goals
              </h3>
              {group.shared_goals?.length > 0 ? (
                <div className="space-y-2">
                  {group.shared_goals.map((goal, i) => (
                    <div key={i} className="p-3 rounded-lg bg-white/5 flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded ${goal.completed ? 'bg-emerald-500' : 'bg-white/10'} flex items-center justify-center`}>
                        {goal.completed && <Award className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{goal.goal}</p>
                        <p className="text-xs text-zinc-500">Target: {new Date(goal.target_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No shared goals yet</p>
              )}
            </div>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-4">
            <PeerFeedbackPanel
              feedbackRequests={myFeedbackRequests}
              receivedFeedback={receivedFeedback}
              currentUser={currentUser}
              onProvideFeedback={(id, content) => provideFeedbackMutation.mutate({ feedbackId: id, content })}
              onRateFeedback={(id, rating) => rateFeedbackMutation.mutate({ feedbackId: id, rating })}
            />
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-4">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-center">
              <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500">Group challenges coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}