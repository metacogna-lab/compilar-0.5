import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Users, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';
import StudyGroupCard from '@/components/collaboration/StudyGroupCard';
import CreateStudyGroupModal from '@/components/collaboration/CreateStudyGroupModal';
import { trackPageView } from '@/components/pilar/ActionTracker';

export default function StudyGroups() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  React.useEffect(() => {
    trackPageView('StudyGroups');
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: studyGroups = [] } = useQuery({
    queryKey: ['studyGroups'],
    queryFn: () => base44.entities.StudyGroup.filter({ status: 'active' }),
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (group) => {
      const newMember = {
        email: currentUser.email,
        name: currentUser.full_name,
        joined_at: new Date().toISOString(),
        role: 'member',
        contribution_score: 0
      };
      
      return base44.entities.StudyGroup.update(group.id, {
        members: [...(group.members || []), newMember]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['studyGroups']);
    },
  });

  const filteredGroups = studyGroups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.focus_pillar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myGroups = filteredGroups.filter(g => g.members?.some(m => m.email === currentUser?.email));
  const availableGroups = filteredGroups.filter(g => !g.members?.some(m => m.email === currentUser?.email));

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('GlobalMap')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Study Groups</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-violet-500 hover:bg-violet-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
          <ProfileAvatar user={currentUser} size="sm" showLink />
        </div>
      </div>

      <div className="relative z-10 p-4 max-w-6xl mx-auto">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or pillar..."
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
        </div>

        {/* My Groups */}
        {myGroups.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              My Groups ({myGroups.length})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {myGroups.map((group, i) => (
                <StudyGroupCard 
                  key={group.id} 
                  group={group} 
                  currentUser={currentUser}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Groups */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Search className="w-5 h-5 text-zinc-400" />
            {myGroups.length > 0 ? 'Discover More Groups' : 'Available Groups'} ({availableGroups.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableGroups.map((group, i) => (
              <StudyGroupCard 
                key={group.id} 
                group={group} 
                currentUser={currentUser}
                onJoin={() => joinGroupMutation.mutate(group)}
              />
            ))}
          </div>
          {availableGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-500">No groups found. Create the first one!</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <CreateStudyGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
}