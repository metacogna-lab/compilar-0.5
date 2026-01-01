import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Plus, Users, Search, Settings, BarChart3,
  MessageSquare, Clipboard, ExternalLink, TrendingUp, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TeamCard from '@/components/teams/TeamCard';
import CreateTeamModal from '@/components/teams/CreateTeamModal';
import JoinTeamModal from '@/components/teams/JoinTeamModal';
import { trackPageView } from '@/components/pilar/ActionTracker';

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    trackPageView('Teams');
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  const { data: invitations = [] } = useQuery({
    queryKey: ['teamInvitations', currentUser?.email],
    queryFn: () => base44.entities.TeamInvitation.filter({ 
      invitee_email: currentUser?.email, 
      status: 'pending' 
    }),
    enabled: !!currentUser?.email,
  });

  const myTeams = teams.filter(team => 
    team.members?.some(m => m.email === currentUser?.email) || 
    team.owner_email === currentUser?.email
  );

  const filteredTeams = myTeams.filter(team =>
    team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F0F12] relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to={createPageUrl('GlobalMap')}>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Team Workspaces</h1>
              <p className="text-zinc-400">Collaborate on PILAR analysis and mode transitions</p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowJoinModal(true)}
                className="bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              >
                <Search className="w-4 h-4 mr-2" />
                Join Team
              </Button>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Team
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Search your teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-400" />
              Pending Invitations ({invitations.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {invitations.map((invitation) => (
                <motion.div
                  key={invitation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                >
                  <h3 className="text-white font-semibold mb-2">{invitation.team_name}</h3>
                  <p className="text-sm text-zinc-400 mb-3">
                    Invited by {invitation.invited_by_email}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300">
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/20 text-white">
                      Decline
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Teams Grid */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            Your Teams ({filteredTeams.length})
          </h2>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No teams yet</h3>
            <p className="text-zinc-400 mb-6">Create or join a team to start collaborating</p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Team
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team) => (
              <TeamCard key={team.id} team={team} currentUser={currentUser} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUser={currentUser}
      />

      <JoinTeamModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
}