import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Users, Crown, BarChart3, ChevronRight,
  CheckCircle, Clock, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GroupLeaderAI from '@/components/pilar/GroupLeaderAI';
import GroupProgressChart from '@/components/pilar/GroupProgressChart';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { cn } from '@/lib/utils';

export default function GroupLeaderDashboard() {
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  React.useEffect(() => {
    trackPageView('GroupLeaderDashboard');
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.GroupRound.list('-created_date'),
  });

  const { data: allAssessments = [] } = useQuery({
    queryKey: ['allAssessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list(),
  });

  // Filter groups where current user is creator (leader)
  const myGroups = groups.filter(g => g.created_by === currentUser?.email);
  
  const selectedGroup = selectedGroupId 
    ? myGroups.find(g => g.id === selectedGroupId)
    : myGroups[0];

  // Get assessments for selected group participants
  const groupAssessments = React.useMemo(() => {
    if (!selectedGroup) return [];
    const participantEmails = selectedGroup.participants?.map(p => p.email) || [];
    return allAssessments.filter(a => participantEmails.includes(a.created_by));
  }, [selectedGroup, allAssessments]);

  // Get member details
  const groupMembers = React.useMemo(() => {
    if (!selectedGroup) return [];
    return selectedGroup.participants?.map(p => {
      const user = users.find(u => u.email === p.email);
      return {
        ...p,
        full_name: user?.full_name,
        name: user?.full_name || p.name || p.email?.split('@')[0]
      };
    }) || [];
  }, [selectedGroup, users]);

  // Calculate member stats
  const memberStats = React.useMemo(() => {
    return groupMembers.map(member => {
      const memberAssessments = groupAssessments.filter(a => a.created_by === member.email && a.completed);
      const scores = {};
      memberAssessments.forEach(a => {
        scores[a.pillar] = a.overall_score;
      });
      const avgScore = memberAssessments.length > 0
        ? Math.round(memberAssessments.reduce((sum, a) => sum + a.overall_score, 0) / memberAssessments.length)
        : null;
      
      return {
        ...member,
        assessmentCount: memberAssessments.length,
        scores,
        avgScore
      };
    });
  }, [groupMembers, groupAssessments]);

  if (myGroups.length === 0) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center p-4">
        <div className="text-center">
          <Crown className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Groups to Lead</h2>
          <p className="text-zinc-400 mb-6">Create a group to access the leader dashboard</p>
          <Link to={createPageUrl('Groups')}>
            <Button className="bg-violet-500 hover:bg-violet-600">
              Go to Groups
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <Link to={createPageUrl('Groups')}>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Groups
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-amber-400" />
          <span className="text-white font-medium">Leader Dashboard</span>
        </div>
      </div>

      <div className="relative z-10 px-4 md:px-6 pb-20 max-w-7xl mx-auto">
        {/* Group Selector */}
        <div className="mb-6">
          <Select 
            value={selectedGroup?.id} 
            onValueChange={setSelectedGroupId}
          >
            <SelectTrigger className="w-full md:w-72 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select a group" />
            </SelectTrigger>
            <SelectContent>
              {myGroups.map(group => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedGroup && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - AI Insights */}
            <div className="lg:col-span-2">
              <GroupLeaderAI 
                group={selectedGroup}
                assessments={groupAssessments}
                members={groupMembers}
              />
            </div>

            {/* Right Column - Quick Stats & Members */}
            <div className="space-y-6">
              {/* Group Stats */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-400" />
                  Group Overview
                </h3>
                <GroupProgressChart
                  participants={selectedGroup.participants || []}
                  assessments={groupAssessments}
                  focusPillars={selectedGroup.focus_pillars || []}
                />
              </div>

              {/* Member List */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <h3 className="font-medium text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-violet-400" />
                  Members ({memberStats.length})
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {memberStats.map((member, i) => (
                    <motion.div
                      key={member.email}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            member.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" :
                            member.status === 'joined' ? "bg-violet-500/20 text-violet-400" :
                            "bg-zinc-500/20 text-zinc-400"
                          )}>
                            {member.name?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{member.name}</p>
                            <p className="text-xs text-zinc-500">{member.assessmentCount}/5 pillars</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {member.avgScore !== null && (
                            <span className={cn(
                              "text-sm font-medium",
                              member.avgScore >= 70 ? "text-emerald-400" :
                              member.avgScore >= 50 ? "text-amber-400" : "text-red-400"
                            )}>
                              {member.avgScore}%
                            </span>
                          )}
                          {member.status === 'completed' ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : member.status === 'joined' ? (
                            <Clock className="w-4 h-4 text-amber-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-zinc-500" />
                          )}
                        </div>
                      </div>
                      {Object.keys(member.scores).length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {['purpose', 'interpersonal', 'learning', 'action', 'resilience'].map(pillar => (
                            <div
                              key={pillar}
                              className={cn(
                                "flex-1 h-1 rounded-full",
                                member.scores[pillar] 
                                  ? member.scores[pillar] >= 70 ? "bg-emerald-500" :
                                    member.scores[pillar] >= 50 ? "bg-amber-500" : "bg-red-500"
                                  : "bg-zinc-700"
                              )}
                              title={`${pillar}: ${member.scores[pillar] || 'N/A'}%`}
                            />
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}