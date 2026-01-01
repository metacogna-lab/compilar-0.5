import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Heart, Flame, Star } from 'lucide-react';

const QUEST_STAGES = [
  { id: 'enter', label: 'Deploy', icon: Sword },
  { id: 'challenge', label: 'Engage', icon: Shield },
  { id: 'trial', label: 'Execute', icon: Flame },
  { id: 'victory', label: 'Victory', icon: Star },
];

export default function QuestProgress({ currentStage = 0, pillarColor = 'violet' }) {
  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
      {QUEST_STAGES.map((stage, index) => {
        const Icon = stage.icon;
        const isCompleted = index < currentStage;
        const isCurrent = index === currentStage;
        
        return (
          <React.Fragment key={stage.id}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={isCurrent ? { 
                  scale: [1, 1.1, 1],
                  boxShadow: ['0 0 0 0 rgba(251, 191, 36, 0)', '0 0 20px 4px rgba(251, 191, 36, 0.3)', '0 0 0 0 rgba(251, 191, 36, 0)']
                } : {}}
                transition={{ duration: 2, repeat: isCurrent ? Infinity : 0 }}
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                  ${isCompleted 
                    ? `bg-${pillarColor}-500 border-${pillarColor}-400` 
                    : isCurrent 
                      ? 'bg-amber-500/20 border-amber-400' 
                      : 'bg-white/5 border-white/20'}
                `}
              >
                <Icon className={`w-4 h-4 ${isCompleted || isCurrent ? 'text-white' : 'text-zinc-500'}`} />
              </motion.div>
              <span className={`text-xs mt-1 ${isCurrent ? 'text-amber-400' : isCompleted ? 'text-white' : 'text-zinc-500'}`}>
                {stage.label}
              </span>
            </motion.div>
            
            {index < QUEST_STAGES.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 relative">
                <div className="absolute inset-0 bg-white/10 rounded-full" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className={`absolute inset-y-0 left-0 bg-${pillarColor}-500 rounded-full`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}