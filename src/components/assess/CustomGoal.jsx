import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Lightbulb, Footprints, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ThinkingLoader from './ThinkingLoader';

export default function CustomGoal({ goal, position, lifeComplications, onSelectGoal, onClose, userProfile }) {
  const [isRefining, setIsRefining] = useState(false);
  const [refinement, setRefinement] = useState(null);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  React.useEffect(() => {
    handleRefine();
  }, []);

  const lensIcons = {
    'EGALITARIAN': Users,
    'HIERARCHICAL': Footprints,
    'BALANCED': Lightbulb
  };

  const handleRefine = async () => {
    if (!goal || goal.trim().length === 0) {
      toast.error('Please enter a goal first');
      return;
    }

    setIsRefining(true);
    setThinkingSteps([
      'Analyzing your goal context...',
      'Identifying coordination patterns...',
      'Generating egalitarian approach...',
      'Generating hierarchical approach...',
      'Creating balanced hybrid...'
    ]);

    try {
      const response = await base44.functions.invoke('refineGoal', {
        goal,
        position,
        life_complications: lifeComplications
      });

      console.log('Refinement response:', response.data);
      
      if (response.data?.success && response.data?.refinement) {
        setRefinement(response.data.refinement);
        toast.success('Goal enhancements generated!');
      } else {
        console.error('Refinement failed:', response.data);
        toast.error('Failed to refine goal');
      }
    } catch (error) {
      console.error('Goal refinement error:', error);
      let errorMessage = 'Failed to refine goal';
      
      if (error?.response?.data?.error) {
        const errorData = error.response.data.error;
        errorMessage = typeof errorData === 'string' ? errorData : (errorData.message || JSON.stringify(errorData));
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsRefining(false);
      setThinkingSteps([]);
    }
  };

  const handleSelectGoal = async (selectedGoal) => {
    if (onSelectGoal) {
      onSelectGoal(selectedGoal);
    }

    // Track goal selection in profile
    try {
      if (userProfile?.id) {
        const goalHistory = userProfile.goal_history || [];
        await base44.entities.UserProfile.update(userProfile.id, {
          goal_history: [...goalHistory, {
            goal: selectedGoal,
            selected_at: new Date().toISOString(),
            position: position
          }]
        });
      }
    } catch (error) {
      console.error('Failed to save goal history:', error);
    }

    toast.success('Goal selected!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-gradient-to-br from-slate-900/95 to-slate-950/95 backdrop-blur-sm z-10 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="p-8 space-y-6"
      >
        <ThinkingLoader
          isVisible={isRefining}
          message="Refining your goal..."
          thinkingSteps={thinkingSteps}
        />

        {!isRefining && refinement?.enhancements && refinement.enhancements.length > 0 && (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/10 flex items-center justify-center border border-violet-500/30">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Choose Your Goal Approach</h3>
              <p className="text-sm text-slate-400">Select a coordination pattern that resonates with you</p>
            </div>

            <div className="grid gap-4 mb-6">
              {refinement.enhancements.map((enhancement, idx) => {
                const Icon = lensIcons[enhancement.lens] || Sparkles;
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    onClick={() => handleSelectGoal(enhancement.enhanced_goal)}
                    className="w-full p-5 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-2 border-violet-500/30 hover:border-violet-400 hover:shadow-lg hover:scale-[1.02] transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                        <Icon className="w-6 h-6 text-violet-400" />
                      </div>
                      <h3 className="text-lg font-bold text-violet-300">{enhancement.lens}</h3>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{enhancement.enhanced_goal}</p>
                  </motion.button>
                );
              })}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => {
                toast.info('Keeping original goal');
                if (onClose) onClose();
              }}
              className="w-full p-4 rounded-xl bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition-all"
            >
              <p className="text-sm text-slate-400 text-center font-medium">Keep my original goal</p>
            </motion.button>

            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong>Note:</strong> This explores group dynamics patterns, not therapy advice.
              </p>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}