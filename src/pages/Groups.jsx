import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Plus, Users, Copy, Check, Clock, 
  PlayCircle, CheckCircle, UserPlus, Send, X,
  Sparkles, TrendingUp, BarChart3, ChevronRight, Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { cn } from '@/lib/utils';
import NotificationBell from '@/components/pilar/NotificationBell';
import GroupProgressChart from '@/components/pilar/GroupProgressChart';
import GroupInsightsPanel from '@/components/pilar/GroupInsightsPanel';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';
import GroupPilarAnalyzer from '@/components/pilar/GroupPilarAnalyzer';

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function Groups() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', focus_pillars: [] });
  const [joinCode, setJoinCode] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [detailGroup, setDetailGroup] = useState(null);

  const queryClient = useQueryClient();

  React.useEffect(() => {
    trackPageView('Groups');
  }, []);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.GroupRound.list('-created_date'),
  });

  const { data: allAssessments = [] } = useQuery({
    queryKey: ['allAssessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
  });

  const myLeaderGroups = groups.filter(g => g.created_by === currentUser?.email);

  // Get assessments for participants in a specific group
  const getGroupAssessments = (group) => {
    const participantEmails = group.participants?.map(p => p.email) || [];
    return allAssessments.filter(a => participantEmails.includes(a.created_by));
  };

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.GroupRound.create({
        ...data,
        invite_code: generateInviteCode(),
        participants: [{
          email: currentUser?.email,
          name: currentUser?.full_name,
          joined_at: new Date().toISOString(),
          status: 'joined'
        }],
        status: 'active',
        start_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      setShowCreateDialog(false);
      setNewGroup({ name: '', description: '', focus_pillars: [] });
    }
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (code) => {
      const matchingGroups = await base44.entities.GroupRound.filter({ invite_code: code.toUpperCase() });
      if (matchingGroups.length === 0) throw new Error('Invalid invite code');
      
      const group = matchingGroups[0];
      const alreadyJoined = group.participants?.some(p => p.email === currentUser?.email);
      if (alreadyJoined) throw new Error('Already joined this group');
      
      const updatedParticipants = [
        ...(group.participants || []),
        {
          email: currentUser?.email,
          name: currentUser?.full_name,
          joined_at: new Date().toISOString(),
          status: 'joined'
        }
      ];
      
      return base44.entities.GroupRound.update(group.id, { participants: updatedParticipants });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      setShowJoinDialog(false);
      setJoinCode('');
    }
  });

  const inviteParticipantMutation = useMutation({
    mutationFn: async ({ groupId, email }) => {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;

      const updatedParticipants = [
        ...(group.participants || []),
        {
          email,
          name: email.split('@')[0],
          joined_at: new Date().toISOString(),
          status: 'invited'
        }
      ];

      await base44.entities.GroupRound.update(groupId, { participants: updatedParticipants });
      
      // Send invite email
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `You're invited to join "${group.name}" on PILAR`,
        body: `You've been invited to join a PILAR group round!\n\nGroup: ${group.name}\nInvite Code: ${group.invite_code}\n\nJoin the group to explore and develop your capabilities together.`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
      setInviteEmail('');
    }
  });

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  const pillarColors = {
    purpose: 'violet',
    interpersonal: 'pink',
    learning: 'indigo',
    action: 'emerald',
    resilience: 'amber'
  };

  const togglePillarFocus = (pillar) => {
    setNewGroup(prev => ({
      ...prev,
      focus_pillars: prev.focus_pillars.includes(pillar)
        ? prev.focus_pillars.filter(p => p !== pillar)
        : [...prev.focus_pillars, pillar]
    }));
  };

  const myGroups = groups.filter(g => 
    g.participants?.some(p => p.email === currentUser?.email)
  );

  const groupsILead = groups.filter(g => g.created_by === currentUser?.email);

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px]" />
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
          <NotificationBell />
          {myLeaderGroups.length > 0 && (
            <Link to={createPageUrl('GroupLeaderDashboard')}>
              <Button
                variant="outline"
                size="sm"
                className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <Crown className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Leader</span>
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJoinDialog(true)}
            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Join
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-violet-500 to-pink-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
          <ProfileAvatar user={currentUser} size="sm" />
        </div>
      </div>

      <div className="relative z-10 px-4 md:px-6 pb-20 max-w-4xl mx-auto">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">Group Rounds</h1>
          <p className="text-base md:text-lg text-zinc-400">
            Collaborate with others on your PILAR journey
          </p>
        </motion.div>

        {/* Groups List */}
        {myGroups.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <Users className="w-10 h-10 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">No groups yet</h3>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Create a new group round or join an existing one with an invite code.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => setShowJoinDialog(true)}
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join with Code
              </Button>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {myGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl p-6 border backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">{group.name}</h3>
                    {group.description && (
                      <p className="text-zinc-400 text-sm">{group.description}</p>
                    )}
                  </div>
                  <div className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    group.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                    group.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-zinc-500/20 text-zinc-400'
                  )}>
                    {group.status}
                  </div>
                </div>

                {/* Focus Pillars */}
                {group.focus_pillars?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {group.focus_pillars.map(pillar => (
                      <span
                        key={pillar}
                        className={`px-2 py-1 rounded-full text-xs bg-${pillarColors[pillar]}-500/20 text-${pillarColors[pillar]}-400 capitalize`}
                      >
                        {pillar}
                      </span>
                    ))}
                  </div>
                )}

                {/* Participants */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Users className="w-4 h-4" />
                    {group.participants?.length || 0} participants
                  </div>
                  <div className="flex -space-x-2">
                    {group.participants?.slice(0, 5).map((p, i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 border-2 border-[#0F0F12] flex items-center justify-center"
                        title={p.name || p.email}
                      >
                        <span className="text-xs text-white font-medium">
                          {(p.name || p.email)[0].toUpperCase()}
                        </span>
                      </div>
                    ))}
                    {(group.participants?.length || 0) > 5 && (
                      <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#0F0F12] flex items-center justify-center">
                        <span className="text-xs text-zinc-400">+{group.participants.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invite Code & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400">Invite code:</span>
                    <code className="px-2 py-1 rounded bg-white/10 text-white font-mono text-sm">
                      {group.invite_code}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyInviteCode(group.invite_code)}
                      className="text-zinc-400 hover:text-white h-8 w-8 p-0"
                    >
                      {copiedCode === group.invite_code ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDetailGroup(group)}
                      className="text-zinc-400 hover:text-white hover:bg-white/10"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Insights
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setSelectedGroup(group)}
                      className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-400 border border-violet-500/30"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Create Group Round</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Group Name</label>
              <Input
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                placeholder="e.g., Team Growth Circle"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Description (optional)</label>
              <Textarea
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                placeholder="What's this group about?"
                className="bg-white/5 border-white/10 text-white resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Focus Pillars (optional)</label>
              <div className="flex flex-wrap gap-2">
                {pillars.map(pillar => (
                  <button
                    key={pillar}
                    onClick={() => togglePillarFocus(pillar)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm capitalize transition-colors',
                      newGroup.focus_pillars.includes(pillar)
                        ? `bg-${pillarColors[pillar]}-500 text-white`
                        : 'bg-white/10 text-zinc-400 hover:bg-white/20'
                    )}
                  >
                    {pillar}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => createGroupMutation.mutate(newGroup)}
              disabled={!newGroup.name || createGroupMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:opacity-90"
            >
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Join Group Round</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Invite Code</label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                className="bg-white/5 border-white/10 text-white font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            <Button
              onClick={() => joinGroupMutation.mutate(joinCode)}
              disabled={joinCode.length !== 6 || joinGroupMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:opacity-90"
            >
              {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
            </Button>
            {joinGroupMutation.isError && (
              <p className="text-red-400 text-sm text-center">{joinGroupMutation.error.message}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Participant Dialog */}
      <Dialog open={!!selectedGroup} onOpenChange={() => setSelectedGroup(null)}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to {selectedGroup?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Email Address</label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <Button
              onClick={() => inviteParticipantMutation.mutate({ groupId: selectedGroup?.id, email: inviteEmail })}
              disabled={!inviteEmail || inviteParticipantMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              {inviteParticipantMutation.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
            <div className="text-center">
              <p className="text-sm text-zinc-400 mb-2">Or share the invite code:</p>
              <div className="flex items-center justify-center gap-2">
                <code className="px-3 py-2 rounded bg-white/10 text-white font-mono">
                  {selectedGroup?.invite_code}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInviteCode(selectedGroup?.invite_code)}
                  className="text-zinc-400 hover:text-white"
                >
                  {copiedCode === selectedGroup?.invite_code ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Details/Insights Dialog */}
      <Dialog open={!!detailGroup} onOpenChange={() => setDetailGroup(null)}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-violet-400" />
              {detailGroup?.name} - Insights
            </DialogTitle>
          </DialogHeader>
          {detailGroup && (
            <div className="space-y-6 pt-4">
              <GroupPilarAnalyzer
                group={detailGroup}
                assessments={getGroupAssessments(detailGroup)}
              />
              <GroupInsightsPanel 
                group={detailGroup} 
                assessments={getGroupAssessments(detailGroup)} 
              />
              <div className="border-t border-white/10 pt-4">
                <h4 className="text-sm font-medium text-zinc-300 mb-4">Progress Overview</h4>
                <GroupProgressChart 
                  participants={detailGroup.participants || []}
                  assessments={getGroupAssessments(detailGroup)}
                  focusPillars={detailGroup.focus_pillars || []}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}