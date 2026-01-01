import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, Lock, CheckCircle, Target, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning' },
  action: { icon: Zap, color: 'emerald', label: 'Action' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience' }
};

const skillNodes = {
  purpose: [
    { id: 'p1', label: 'Direction', tier: 1, requires: 30 },
    { id: 'p2', label: 'Values', tier: 2, requires: 60 },
    { id: 'p3', label: 'Meaning', tier: 3, requires: 85 }
  ],
  interpersonal: [
    { id: 'i1', label: 'Empathy', tier: 1, requires: 30 },
    { id: 'i2', label: 'Communication', tier: 2, requires: 60 },
    { id: 'i3', label: 'Conflict Resolution', tier: 3, requires: 85 }
  ],
  learning: [
    { id: 'l1', label: 'Curiosity', tier: 1, requires: 30 },
    { id: 'l2', label: 'Acquisition', tier: 2, requires: 60 },
    { id: 'l3', label: 'Mastery', tier: 3, requires: 85 }
  ],
  action: [
    { id: 'a1', label: 'Discipline', tier: 1, requires: 30 },
    { id: 'a2', label: 'Momentum', tier: 2, requires: 60 },
    { id: 'a3', label: 'Execution', tier: 3, requires: 85 }
  ],
  resilience: [
    { id: 'r1', label: 'Stress Response', tier: 1, requires: 30 },
    { id: 'r2', label: 'Regulation', tier: 2, requires: 60 },
    { id: 'r3', label: 'Recovery', tier: 3, requires: 85 }
  ]
};

export default function SkillTree({ userProfile }) {
  const pillarScores = userProfile?.pillar_scores || {};
  const pillars = Object.keys(pillarConfig);

  const isSkillUnlocked = (pillar, skillRequirement) => {
    return (pillarScores[pillar] || 0) >= skillRequirement;
  };

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <Target className="w-6 h-6 text-violet-400" />
        Capability Map
      </h3>

      <div className="space-y-8">
        {pillars.map((pillar, pillarIndex) => {
          const config = pillarConfig[pillar];
          const Icon = config.icon;
          const score = pillarScores[pillar] || 0;
          const skills = skillNodes[pillar];

          return (
            <motion.div
              key={pillar}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: pillarIndex * 0.1 }}
              className="relative"
            >
              {/* Pillar Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-${config.color}-500/20`}>
                  <Icon className={`w-5 h-5 text-${config.color}-400`} />
                </div>
                <div>
                  <h4 className="text-white font-semibold capitalize">{pillar}</h4>
                  <p className="text-xs text-zinc-500">Current: {score}%</p>
                </div>
              </div>

              {/* Skill Path */}
              <div className="flex items-center gap-3 pl-4">
                {skills.map((skill, skillIndex) => {
                  const unlocked = isSkillUnlocked(pillar, skill.requires);
                  const isNext = !unlocked && (skillIndex === 0 || isSkillUnlocked(pillar, skills[skillIndex - 1].requires));

                  return (
                    <React.Fragment key={skill.id}>
                      {/* Connection Line */}
                      {skillIndex > 0 && (
                        <div className={cn(
                          "h-0.5 w-8 transition-colors",
                          isSkillUnlocked(pillar, skills[skillIndex - 1].requires)
                            ? `bg-${config.color}-500`
                            : 'bg-white/10'
                        )} />
                      )}

                      {/* Skill Node */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: pillarIndex * 0.1 + skillIndex * 0.05 }}
                        className={cn(
                          "relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                          unlocked 
                            ? `bg-${config.color}-500/20 border-${config.color}-500/40` 
                            : isNext
                              ? `bg-${config.color}-500/5 border-${config.color}-500/20 border-dashed`
                              : 'bg-white/5 border-white/10'
                        )}
                      >
                        {unlocked ? (
                          <CheckCircle className={`w-6 h-6 text-${config.color}-400`} />
                        ) : isNext ? (
                          <TrendingUp className={`w-6 h-6 text-${config.color}-400/50`} />
                        ) : (
                          <Lock className="w-6 h-6 text-zinc-600" />
                        )}
                        <p className={cn(
                          "text-xs font-medium text-center",
                          unlocked ? 'text-white' : 'text-zinc-500'
                        )}>
                          {skill.label}
                        </p>
                        <p className="text-xs text-zinc-600">{skill.requires}%</p>
                      </motion.div>
                    </React.Fragment>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}