import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, CheckCircle, Circle, ChevronDown, ChevronUp, 
  BookOpen, Zap, Users, Brain, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const pillarColors = {
  purpose: { bg: 'bg-violet-500/20', text: 'text-violet-400', border: 'border-violet-500/30' },
  interpersonal: { bg: 'bg-pink-500/20', text: 'text-pink-400', border: 'border-pink-500/30' },
  learning: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  action: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  resilience: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
};

const activityIcons = {
  reflection: Brain,
  practice: Zap,
  learning: BookOpen,
  group_activity: Users,
};

export default function DevelopmentPlanCard({ plan, onActivityComplete, onGoalUpdate }) {
  const [expanded, setExpanded] = useState(false);
  
  const completedActivities = plan.activities?.filter(a => a.completed).length || 0;
  const totalActivities = plan.activities?.length || 0;
  const completedGoals = plan.goals?.filter(g => g.status === 'completed').length || 0;
  const totalGoals = plan.goals?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-violet-400" />
              <h3 className="font-semibold text-white">{plan.title}</h3>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs",
                plan.status === 'active' ? "bg-emerald-500/20 text-emerald-400" :
                plan.status === 'completed' ? "bg-violet-500/20 text-violet-400" :
                "bg-zinc-500/20 text-zinc-400"
              )}>
                {plan.status}
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-3">
              {plan.target_pillars?.map(pillar => (
                <span 
                  key={pillar}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs capitalize",
                    pillarColors[pillar]?.bg,
                    pillarColors[pillar]?.text
                  )}
                >
                  {pillar}
                </span>
              ))}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-zinc-400">
              <span>{completedGoals}/{totalGoals} goals</span>
              <span>{completedActivities}/{totalActivities} activities</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{plan.progress_percentage || 0}%</p>
              <p className="text-xs text-zinc-500">complete</p>
            </div>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-zinc-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-zinc-400" />
            )}
          </div>
        </div>
        
        <Progress value={plan.progress_percentage || 0} className="h-1.5 mt-3" />
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            {/* Goals Section */}
            {plan.goals?.length > 0 && (
              <div className="p-4 border-b border-white/5">
                <h4 className="text-sm font-medium text-zinc-300 mb-3">Goals</h4>
                <div className="space-y-2">
                  {plan.goals.map(goal => (
                    <div 
                      key={goal.id}
                      className={cn(
                        "p-3 rounded-xl",
                        pillarColors[goal.pillar]?.bg,
                        "border",
                        pillarColors[goal.pillar]?.border
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{goal.title}</p>
                          <p className="text-xs text-zinc-400 mt-1">{goal.description}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
                            <span>Target: {goal.target_score}%</span>
                            <span>Current: {goal.current_score || 0}%</span>
                          </div>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs",
                          goal.status === 'completed' ? "bg-emerald-500/20 text-emerald-400" :
                          goal.status === 'in_progress' ? "bg-amber-500/20 text-amber-400" :
                          "bg-zinc-500/20 text-zinc-400"
                        )}>
                          {goal.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Activities Section */}
            {plan.activities?.length > 0 && (
              <div className="p-4">
                <h4 className="text-sm font-medium text-zinc-300 mb-3">Activities</h4>
                <div className="space-y-2">
                  {plan.activities.map(activity => {
                    const Icon = activityIcons[activity.type] || Zap;
                    return (
                      <div 
                        key={activity.id}
                        className={cn(
                          "p-3 rounded-xl flex items-start gap-3 transition-colors",
                          activity.completed ? "bg-emerald-500/10" : "bg-white/5 hover:bg-white/10"
                        )}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!activity.completed) onActivityComplete?.(plan.id, activity.id);
                          }}
                          disabled={activity.completed}
                          className="mt-0.5"
                        >
                          {activity.completed ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-zinc-500 hover:text-white transition-colors" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Icon className={cn(
                              "w-4 h-4",
                              pillarColors[activity.pillar]?.text
                            )} />
                            <p className={cn(
                              "text-sm font-medium",
                              activity.completed ? "text-zinc-400 line-through" : "text-white"
                            )}>
                              {activity.title}
                            </p>
                          </div>
                          <p className="text-xs text-zinc-500 mt-1">{activity.description}</p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          <Zap className="w-3 h-3" />
                          <span className="text-xs font-medium">{activity.points}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}