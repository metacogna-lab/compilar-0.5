import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function CreateTeamModal({ isOpen, onClose, currentUser }) {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createTeamMutation = useMutation({
    mutationFn: async (data) => {
      const inviteCode = `${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const teamUuid = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return base44.entities.Team.create({
        team_uuid: teamUuid,
        team_name: data.teamName,
        description: data.description,
        invite_code: inviteCode,
        owner_email: currentUser?.email,
        members: [{
          user_uuid: `user_${currentUser?.email}`,
          email: currentUser?.email,
          name: currentUser?.full_name,
          role: 'owner',
          joined_at: new Date().toISOString()
        }],
        status: 'active'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      setTeamName('');
      setDescription('');
      onClose();
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (teamName.trim()) {
      createTeamMutation.mutate({ teamName, description });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#1a1a1f] rounded-2xl border border-violet-500/30 p-6 max-w-md w-full"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Create Team</h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Team Name *</label>
              <Input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g., Product Team Alpha"
                className="bg-white/5 border-white/10 text-white"
                required
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Description</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this team about?"
                className="bg-white/5 border-white/10 text-white min-h-[100px]"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-white/20 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTeamMutation.isPending}
                className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              >
                {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}