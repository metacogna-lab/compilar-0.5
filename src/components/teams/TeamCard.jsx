import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Users, TrendingUp, BarChart3, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TeamCard({ team, currentUser }) {
  const isOwner = team.owner_email === currentUser?.email;
  const memberCount = team.members?.length || 0;
  const avgScore = team.aggregated_scores 
    ? Math.round(Object.values(team.aggregated_scores).reduce((a, b) => a + b, 0) / 5)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-violet-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-white mb-1">{team.team_name}</h3>
          {team.description && (
            <p className="text-sm text-zinc-400 line-clamp-2">{team.description}</p>
          )}
        </div>
        {isOwner && (
          <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium">
            Owner
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-lg bg-white/5">
          <Users className="w-4 h-4 text-violet-400 mb-1" />
          <p className="text-xs text-zinc-500">Members</p>
          <p className="text-lg font-bold text-white">{memberCount}</p>
        </div>
        {avgScore && (
          <div className="p-3 rounded-lg bg-white/5">
            <TrendingUp className="w-4 h-4 text-emerald-400 mb-1" />
            <p className="text-xs text-zinc-500">Avg Score</p>
            <p className="text-lg font-bold text-white">{avgScore}%</p>
          </div>
        )}
      </div>

      {/* Mode Indicator */}
      {team.mode_analysis?.current_mode && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs text-indigo-400 font-medium">
            Current Mode: <span className="capitalize">{team.mode_analysis.current_mode}</span>
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link to={createPageUrl(`TeamWorkspace?id=${team.id}`)} className="flex-1">
          <Button size="sm" className="w-full bg-violet-500/20 hover:bg-violet-500/30 text-violet-300">
            <MessageSquare className="w-4 h-4 mr-2" />
            Workspace
          </Button>
        </Link>
        <Link to={createPageUrl(`TeamAnalytics?id=${team.id}`)}>
          <Button size="sm" variant="outline" className="border-white/20 text-white">
            <BarChart3 className="w-4 h-4" />
          </Button>
        </Link>
        {isOwner && (
          <Link to={createPageUrl(`TeamSettings?id=${team.id}`)}>
            <Button size="sm" variant="outline" className="border-white/20 text-white">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}