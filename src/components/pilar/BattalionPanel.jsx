import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Shield, Users, Crown, Medal, Plus, Copy, Check, 
  UserPlus, Settings, ChevronRight, Star, Target,
  Briefcase, Award, TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const generateInviteCode = () => {
  return 'BTN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
};

const BATTALION_RANKS = [
  { level: 1, title: 'Provisional Unit', minPoints: 0 },
  { level: 2, title: 'Established Division', minPoints: 500 },
  { level: 3, title: 'Distinguished Corps', minPoints: 1500 },
  { level: 4, title: 'Elite Regiment', minPoints: 3500 },
  { level: 5, title: 'Legendary Command', minPoints: 7000 },
];

const SPECIALIZATIONS = [
  { id: 'purpose', name: 'Strategic Command', icon: '🎯', color: 'violet' },
  { id: 'interpersonal', name: 'Diplomatic Corps', icon: '🤝', color: 'pink' },
  { id: 'learning', name: 'Intelligence Division', icon: '📚', color: 'indigo' },
  { id: 'action', name: 'Operations Unit', icon: '⚡', color: 'emerald' },
  { id: 'resilience', name: 'Fortification Brigade', icon: '🛡️', color: 'amber' },
  { id: 'balanced', name: 'Combined Forces', icon: '⚖️', color: 'zinc' },
];

export default function BattalionPanel({ currentUser, onSelectBattalion }) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [newBattalion, setNewBattalion] = useState({ 
    name: '', 
    description: '', 
    motto: '',
    specialization: 'balanced' 
  });
  const [joinCode, setJoinCode] = useState('');

  const queryClient = useQueryClient();

  const { data: battalions = [], isLoading } = useQuery({
    queryKey: ['battalions'],
    queryFn: () => base44.entities.Battalion.list('-total_points'),
  });

  const myBattalions = battalions.filter(b => 
    b.commander_email === currentUser?.email ||
    b.officers?.some(o => o.email === currentUser?.email)
  );

  const createMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.Battalion.create({
        ...data,
        invite_code: generateInviteCode(),
        commander_email: currentUser?.email,
        officers: [{
          email: currentUser?.email,
          name: currentUser?.full_name,
          rank: 'Commander',
          joined_at: new Date().toISOString(),
          contribution_points: 0,
          missions_completed: 0,
          status: 'active'
        }],
        total_points: 0,
        missions_completed: 0,
        current_rank: 1,
        status: 'recruiting'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['battalions']);
      setShowCreateDialog(false);
      setNewBattalion({ name: '', description: '', motto: '', specialization: 'balanced' });
    }
  });

  const joinMutation = useMutation({
    mutationFn: async (code) => {
      const matching = await base44.entities.Battalion.filter({ invite_code: code.toUpperCase() });
      if (matching.length === 0) throw new Error('Invalid battalion code');
      
      const battalion = matching[0];
      const alreadyMember = battalion.officers?.some(o => o.email === currentUser?.email);
      if (alreadyMember) throw new Error('You are already a member of this battalion');
      
      const updatedOfficers = [
        ...(battalion.officers || []),
        {
          email: currentUser?.email,
          name: currentUser?.full_name,
          rank: 'Officer',
          joined_at: new Date().toISOString(),
          contribution_points: 0,
          missions_completed: 0,
          status: 'active'
        }
      ];
      
      return base44.entities.Battalion.update(battalion.id, { officers: updatedOfficers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['battalions']);
      setShowJoinDialog(false);
      setJoinCode('');
    }
  });

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getBattalionRank = (points) => {
    for (let i = BATTALION_RANKS.length - 1; i >= 0; i--) {
      if (points >= BATTALION_RANKS[i].minPoints) return BATTALION_RANKS[i];
    }
    return BATTALION_RANKS[0];
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-400" />
          Battalion Command
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowJoinDialog(true)}
            className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Enlist
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Form Battalion
          </Button>
        </div>
      </div>

      {/* My Battalions */}
      {myBattalions.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400 uppercase tracking-wider">Your Assignments</p>
          {myBattalions.map((battalion, i) => {
            const rank = getBattalionRank(battalion.total_points);
            const spec = SPECIALIZATIONS.find(s => s.id === battalion.specialization) || SPECIALIZATIONS[5];
            const isCommander = battalion.commander_email === currentUser?.email;
            
            return (
              <motion.div
                key={battalion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onSelectBattalion?.(battalion)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                  `bg-gradient-to-br from-${spec.color}-500/10 to-transparent`,
                  `border-${spec.color}-500/30 hover:border-${spec.color}-500/50`
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-${spec.color}-500/20 flex items-center justify-center text-2xl`}>
                      {battalion.emblem || spec.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-white">{battalion.name}</h4>
                        {isCommander && <Crown className="w-4 h-4 text-amber-400" />}
                      </div>
                      <p className="text-xs text-zinc-400">{rank.title}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-white">{battalion.officers?.length || 1}</p>
                    <p className="text-xs text-zinc-500">Personnel</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-amber-400">{battalion.total_points}</p>
                    <p className="text-xs text-zinc-500">Points</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <p className="text-lg font-bold text-emerald-400">{battalion.missions_completed}</p>
                    <p className="text-xs text-zinc-500">Missions</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 rounded-xl bg-white/5 border border-white/10">
          <Shield className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-white font-medium mb-2">No Battalion Assignment</h4>
          <p className="text-zinc-400 text-sm mb-4">
            Form a new battalion or enlist in an existing unit to participate in cooperative operations.
          </p>
        </div>
      )}

      {/* Create Battalion Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              Form New Battalion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Battalion Designation</label>
              <Input
                value={newBattalion.name}
                onChange={(e) => setNewBattalion({ ...newBattalion, name: e.target.value })}
                placeholder="e.g., Alpha Strategic Division"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Mission Statement</label>
              <Textarea
                value={newBattalion.description}
                onChange={(e) => setNewBattalion({ ...newBattalion, description: e.target.value })}
                placeholder="Define your battalion's purpose and objectives..."
                className="bg-white/5 border-white/10 text-white resize-none"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Battalion Motto</label>
              <Input
                value={newBattalion.motto}
                onChange={(e) => setNewBattalion({ ...newBattalion, motto: e.target.value })}
                placeholder="e.g., Excellence Through Unity"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Specialization</label>
              <div className="grid grid-cols-2 gap-2">
                {SPECIALIZATIONS.map(spec => (
                  <button
                    key={spec.id}
                    onClick={() => setNewBattalion({ ...newBattalion, specialization: spec.id })}
                    className={cn(
                      "p-3 rounded-xl text-left transition-all flex items-center gap-2",
                      newBattalion.specialization === spec.id
                        ? `bg-${spec.color}-500/20 border border-${spec.color}-500/50`
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    )}
                  >
                    <span className="text-lg">{spec.icon}</span>
                    <span className="text-sm text-white">{spec.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => createMutation.mutate(newBattalion)}
              disabled={!newBattalion.name || createMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
            >
              {createMutation.isPending ? 'Establishing...' : 'Establish Battalion'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Join Battalion Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-violet-400" />
              Enlist in Battalion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Battalion Access Code</label>
              <Input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="BTN-XXXXXX"
                className="bg-white/5 border-white/10 text-white font-mono text-center text-lg tracking-widest"
              />
            </div>
            <Button
              onClick={() => joinMutation.mutate(joinCode)}
              disabled={joinCode.length < 6 || joinMutation.isPending}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 text-white"
            >
              {joinMutation.isPending ? 'Processing Enlistment...' : 'Submit Enlistment'}
            </Button>
            {joinMutation.isError && (
              <p className="text-red-400 text-sm text-center">{joinMutation.error.message}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}