import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Copy, Check, Crown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TeamMembersList({ team, teamId, currentUser }) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const isOwner = team.owner_email === currentUser?.email;
  const members = team.members || [];

  const copyInviteCode = () => {
    navigator.clipboard.writeText(team.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-violet-400" />
          Invite Team Members
        </h4>
        <p className="text-sm text-zinc-400 mb-3">
          Share this code with colleagues to invite them to the team
        </p>
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-lg">
            {team.invite_code}
          </div>
          <Button
            onClick={copyInviteCode}
            className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-4">Members ({members.length})</h3>

      <div className="grid gap-3">
        {members.map((member) => (
          <motion.div
            key={member.email}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {member.name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-white font-medium">{member.name || member.email}</p>
                  <p className="text-xs text-zinc-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {member.role === 'owner' && (
                  <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Owner
                  </span>
                )}
                {member.role === 'admin' && (
                  <span className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>
            {member.pillar_scores && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {Object.entries(member.pillar_scores).map(([pillar, score]) => (
                  <span key={pillar} className="text-xs px-2 py-1 rounded bg-white/5 text-zinc-400">
                    {pillar}: {score}%
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}