import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, X, Lightbulb, Footprints, Users, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ThinkingLoader from './ThinkingLoader';

export default function GoalRefinementPanel({ goal, position, lifeComplications, onRefinementComplete, userProfile }) {
  const [isRefining, setIsRefining] = useState(false);
  const [refinement, setRefinement] = useState(null);
  const [showEnhancements, setShowEnhancements] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);

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

      if (response.data?.success) {
        setRefinement(response.data.refinement);
        setShowEnhancements(true);
        toast.success('Goal enhancements generated!');
      } else {
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
    if (onRefinementComplete) {
      onRefinementComplete({
        refined_goal: selectedGoal,
        goal_breakdown: []
      });
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
    setShowEnhancements(false);
  };

  return (
    <>
      <ThinkingLoader
        isVisible={isRefining}
        message="Refining your goal..."
        thinkingSteps={thinkingSteps}
      />

      {!showEnhancements && !isRefining && (
        <Button
          onClick={handleRefine}
          disabled={isRefining || !goal}
          className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Get AI Goal Refinement
        </Button>
      )}

      <AnimatePresence>
        {showEnhancements && refinement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-2xl w-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-700 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowEnhancements(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Choose Your Goal Approach</h2>
                <p className="text-sm text-slate-400">Select a coordination pattern that resonates with you</p>
              </div>

              <div className="space-y-3 mb-6">
                {refinement.enhancements?.map((enhancement, idx) => {
                  const Icon = lensIcons[enhancement.lens] || Sparkles;
                  return (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => handleSelectGoal(enhancement.enhanced_goal)}
                      className="w-full p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-2 border-violet-500/30 hover:border-violet-400 hover:shadow-lg transition-all text-left group"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                          <Icon className="w-5 h-5 text-violet-400" />
                        </div>
                        <h3 className="text-base font-bold text-violet-300">{enhancement.lens}</h3>
                      </div>
                      <p className="text-sm text-white leading-relaxed">{enhancement.enhanced_goal}</p>
                    </motion.button>
                  );
                })}

                {/* Ignore Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={() => {
                    toast.info('Keeping original goal');
                    setShowEnhancements(false);
                  }}
                  className="w-full p-4 rounded-xl bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition-all text-left"
                >
                  <p className="text-sm text-slate-400 text-center">Keep my original goal</p>
                </motion.button>
              </div>

              {/* Disclaimer */}
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>Note:</strong> This explores group dynamics patterns, not therapy advice.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}