import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function JoinTeamModal({ isOpen, onClose, currentUser }) {
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const joinTeamMutation = useMutation({
    mutationFn: async (code) => {
      const teams = await base44.entities.Team.filter({ invite_code: code.toUpperCase() });
      if (teams.length === 0) {
        throw new Error('Invalid invite code');
      }
      
      const team = teams[0];
      const updatedMembers = [
        ...(team.members || []),
        {
          user_uuid: `user_${currentUser?.email}`,
          email: currentUser?.email,
          name: currentUser?.full_name,
          role: 'member',
          joined_at: new Date().toISOString()
        }
      ];

      return base44.entities.Team.update(team.id, { members: updatedMembers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['teams']);
      setInviteCode('');
      setError('');
      onClose();
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      joinTeamMutation.mutate(inviteCode.trim());
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
                <Search className="w-5 h-5 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Join Team</h2>
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
              <label className="text-sm text-zinc-400 mb-2 block">Invite Code</label>
              <Input
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter 6-character code"
                className="bg-white/5 border-white/10 text-white uppercase"
                maxLength={6}
                required
              />
              {error && (
                <p className="text-sm text-red-400 mt-2">{error}</p>
              )}
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
                disabled={joinTeamMutation.isPending}
                className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white"
              >
                {joinTeamMutation.isPending ? 'Joining...' : 'Join Team'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}