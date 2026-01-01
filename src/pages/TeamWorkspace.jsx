import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, MessageSquare, Clipboard, Users, PenTool,
  Plus, Send, ExternalLink, Github, Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModeTransitionPlanner from '@/components/teams/ModeTransitionPlanner';
import TeamMembersList from '@/components/teams/TeamMembersList';
import IntegrationPanel from '@/components/teams/IntegrationPanel';

export default function TeamWorkspace() {
  const urlParams = new URLSearchParams(window.location.search);
  const teamId = urlParams.get('id');
  const [noteContent, setNoteContent] = useState('');
  const queryClient = useQueryClient();

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const teams = await base44.entities.Team.list();
      return teams.find(t => t.id === teamId);
    },
    enabled: !!teamId,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const addNoteMutation = useMutation({
    mutationFn: async (content) => {
      const newNote = {
        note_uuid: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        author_email: currentUser?.email,
        content: content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tags: []
      };

      const existingNotes = team?.shared_workspace?.notes || [];
      const updatedWorkspace = {
        ...team.shared_workspace,
        notes: [...existingNotes, newNote]
      };

      return base44.entities.Team.update(teamId, { shared_workspace: updatedWorkspace });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
      setNoteContent('');
    },
  });

  const handleAddNote = () => {
    if (noteContent.trim()) {
      addNoteMutation.mutate(noteContent);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <p className="text-zinc-400">Team not found</p>
      </div>
    );
  }

  const notes = team.shared_workspace?.notes || [];

  return (
    <div className="min-h-screen bg-[#0F0F12] relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link to={createPageUrl('Teams')}>
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Teams
              </Button>
            </Link>
            <Link to={createPageUrl(`TeamAnalytics?id=${teamId}`)}>
              <Button size="sm" className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
                View Analytics
              </Button>
            </Link>
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{team.team_name}</h1>
            {team.description && (
              <p className="text-zinc-400">{team.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="notes" className="data-[state=active]:bg-violet-500/20">
              <MessageSquare className="w-4 h-4 mr-2" />
              Discussion
            </TabsTrigger>
            <TabsTrigger value="planning" className="data-[state=active]:bg-violet-500/20">
              <Clipboard className="w-4 h-4 mr-2" />
              Mode Planning
            </TabsTrigger>
            <TabsTrigger value="members" className="data-[state=active]:bg-violet-500/20">
              <Users className="w-4 h-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-violet-500/20">
              <Box className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-6">
            {/* Add Note */}
            <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Share insights, findings, or questions with the team..."
                className="bg-white/5 border-white/10 text-white mb-3 min-h-[100px]"
              />
              <Button
                onClick={handleAddNote}
                disabled={!noteContent.trim() || addNoteMutation.isPending}
                className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300"
              >
                <Send className="w-4 h-4 mr-2" />
                Post Note
              </Button>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No discussion yet. Start the conversation!</p>
                </div>
              ) : (
                notes.reverse().map((note) => (
                  <motion.div
                    key={note.note_uuid}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-violet-400">{note.author_email}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(note.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-white whitespace-pre-wrap">{note.content}</p>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="planning" className="mt-6">
            <ModeTransitionPlanner team={team} teamId={teamId} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <TeamMembersList team={team} teamId={teamId} currentUser={currentUser} />
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <IntegrationPanel team={team} teamId={teamId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}