import React from 'react';
import { motion } from 'framer-motion';
import { Users, Compass, Heart, BookOpen, Zap, Shield, Calendar, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield
};

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber'
};

export default function StudyGroupCard({ group, currentUser, onJoin }) {
  const Icon = pillarIcons[group.focus_pillar];
  const color = pillarColors[group.focus_pillar];
  const isMember = group.members?.some(m => m.email === currentUser?.email);
  const isFull = (group.members?.length || 0) >= group.max_members;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-5 rounded-2xl border transition-all hover:shadow-lg",
        `bg-gradient-to-br from-${color}-500/10 to-${color}-600/5 border-${color}-500/30`
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-${color}-500/20`}>
            <Icon className={`w-5 h-5 text-${color}-400`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{group.name}</h3>
            <p className="text-sm text-zinc-400 capitalize">{group.focus_pillar} focus</p>
          </div>
        </div>
        {isMember && (
          <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
            Member
          </span>
        )}
      </div>

      <p className="text-sm text-zinc-300 mb-4">{group.description}</p>

      <div className="flex items-center gap-4 mb-4 text-sm text-zinc-400">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>{group.members?.length || 0}/{group.max_members}</span>
        </div>
        {group.meeting_schedule && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{group.meeting_schedule}</span>
          </div>
        )}
        {group.shared_goals && (
          <div className="flex items-center gap-1.5">
            <Target className="w-4 h-4" />
            <span>{group.shared_goals.filter(g => g.completed).length}/{group.shared_goals.length} goals</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isMember ? (
          <Link to={createPageUrl(`StudyGroupWorkspace?groupId=${group.id}`)} className="flex-1">
            <Button className={`w-full bg-${color}-500 hover:bg-${color}-600 text-white`}>
              Open Workspace
            </Button>
          </Link>
        ) : (
          <Button
            onClick={() => onJoin(group)}
            disabled={isFull}
            className={`flex-1 ${isFull ? 'bg-zinc-700 text-zinc-400' : `bg-${color}-500 hover:bg-${color}-600 text-white`}`}
          >
            {isFull ? 'Full' : 'Join Group'}
          </Button>
        )}
      </div>
    </motion.div>
  );
}