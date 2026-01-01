import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, UserPlus, Users, CheckCircle, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.GroupRound.list('-created_date'),
  });

  // Generate notifications from group data
  const notifications = React.useMemo(() => {
    if (!currentUser?.email) return [];
    
    const notifs = [];
    
    groups.forEach(group => {
      // Check if user has pending invite
      const myParticipation = group.participants?.find(p => p.email === currentUser.email);
      if (myParticipation?.status === 'invited') {
        notifs.push({
          id: `invite-${group.id}`,
          type: 'invite',
          icon: UserPlus,
          title: 'New Group Invite',
          message: `You've been invited to join "${group.name}"`,
          groupId: group.id,
          groupName: group.name,
          inviteCode: group.invite_code,
          timestamp: myParticipation.joined_at,
          read: false
        });
      }

      // Check for new participants (last 24 hours) in groups user is part of
      if (myParticipation?.status === 'joined') {
        const recentJoins = group.participants?.filter(p => 
          p.email !== currentUser.email && 
          p.status === 'joined' &&
          new Date(p.joined_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ) || [];

        recentJoins.forEach(p => {
          notifs.push({
            id: `join-${group.id}-${p.email}`,
            type: 'member_joined',
            icon: Users,
            title: 'New Member',
            message: `${p.name || p.email} joined "${group.name}"`,
            timestamp: p.joined_at,
            read: false
          });
        });

        // Group completion notification
        const allCompleted = group.participants?.every(p => p.status === 'completed');
        if (allCompleted && group.status !== 'completed') {
          notifs.push({
            id: `complete-${group.id}`,
            type: 'group_complete',
            icon: CheckCircle,
            title: 'Round Complete!',
            message: `Everyone in "${group.name}" has completed their assessments`,
            timestamp: new Date().toISOString(),
            read: false
          });
        }
      }
    });

    return notifs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [groups, currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const joinGroupMutation = useMutation({
    mutationFn: async ({ groupId, inviteCode }) => {
      const group = groups.find(g => g.id === groupId);
      if (!group) return;
      
      const updatedParticipants = group.participants.map(p => 
        p.email === currentUser.email 
          ? { ...p, status: 'joined', joined_at: new Date().toISOString() }
          : p
      );
      
      return base44.entities.GroupRound.update(groupId, { participants: updatedParticipants });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['groups']);
    }
  });

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-white/10 transition-colors"
      >
        <Bell className="w-5 h-5 text-zinc-400" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium"
          >
            {unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto z-50 rounded-2xl bg-[#1a1a1f] border border-white/10 shadow-xl"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-semibold text-white">Notifications</h3>
                <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="p-6 text-center text-zinc-500">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map(notif => {
                    const Icon = notif.icon;
                    return (
                      <div
                        key={notif.id}
                        className={cn(
                          "p-4 hover:bg-white/5 transition-colors",
                          !notif.read && "bg-violet-500/5"
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            notif.type === 'invite' ? "bg-emerald-500/20" :
                            notif.type === 'group_complete' ? "bg-amber-500/20" :
                            "bg-violet-500/20"
                          )}>
                            <Icon className={cn(
                              "w-5 h-5",
                              notif.type === 'invite' ? "text-emerald-400" :
                              notif.type === 'group_complete' ? "text-amber-400" :
                              "text-violet-400"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{notif.title}</p>
                            <p className="text-sm text-zinc-400 truncate">{notif.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Clock className="w-3 h-3 text-zinc-500" />
                              <span className="text-xs text-zinc-500">
                                {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            {notif.type === 'invite' && (
                              <button
                                onClick={() => joinGroupMutation.mutate({ groupId: notif.groupId })}
                                disabled={joinGroupMutation.isPending}
                                className="mt-2 px-3 py-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-colors"
                              >
                                {joinGroupMutation.isPending ? 'Joining...' : 'Accept Invite'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}