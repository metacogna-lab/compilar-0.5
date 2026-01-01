import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Users, Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const pillarOptions = [
  { value: 'purpose', label: 'Purpose', icon: Compass },
  { value: 'interpersonal', label: 'Interpersonal', icon: Heart },
  { value: 'learning', label: 'Learning', icon: BookOpen },
  { value: 'action', label: 'Action', icon: Zap },
  { value: 'resilience', label: 'Resilience', icon: Shield }
];

export default function CreateStudyGroupModal({ isOpen, onClose, currentUser }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [focusPillar, setFocusPillar] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [meetingSchedule, setMeetingSchedule] = useState('');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.StudyGroup.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyGroups']);
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setFocusPillar('');
    setMaxMembers(10);
    setMeetingSchedule('');
  };

  const handleSubmit = () => {
    if (!name || !focusPillar) return;

    createMutation.mutate({
      group_uuid: `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      focus_pillar: focusPillar,
      creator_email: currentUser.email,
      members: [{
        email: currentUser.email,
        name: currentUser.full_name,
        joined_at: new Date().toISOString(),
        role: 'facilitator',
        contribution_score: 0
      }],
      invite_code: Math.random().toString(36).substr(2, 8).toUpperCase(),
      max_members: maxMembers,
      meeting_schedule: meetingSchedule,
      shared_goals: [],
      group_challenges: [],
      status: 'active'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-violet-400" />
            Create Study Group
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Group Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g., Purpose Explorers"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will your group focus on?"
              className="bg-white/5 border-white/10 text-white min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Focus Pillar</label>
            <Select value={focusPillar} onValueChange={setFocusPillar}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select pillar" />
              </SelectTrigger>
              <SelectContent className="bg-[#18181b] border-white/10">
                {pillarOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Meeting Schedule (optional)</label>
            <Input
              value={meetingSchedule}
              onChange={(e) => setMeetingSchedule(e.target.value)}
              placeholder="E.g., Mondays 7PM"
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Max Members</label>
            <Input
              type="number"
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value))}
              min={2}
              max={20}
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!name || !focusPillar || createMutation.isPending}
              className="flex-1 bg-violet-500 hover:bg-violet-600"
            >
              Create Group
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}