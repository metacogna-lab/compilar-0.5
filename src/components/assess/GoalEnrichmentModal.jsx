import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Footprints, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ThinkingLoader from './ThinkingLoader';

export default function GoalEnrichmentModal({ goal, position, lifeComplications, onComplete, onSkip, userProfile }) {
  const [isRefining, setIsRefining] = useState(false);
  const [refinement, setRefinement] = useState(null);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  useEffect(() => {
    if (goal && goal.trim().length > 10) {
      handleRefine();
    }
  }, []);

  const lensIcons = {
    'EGALITARIAN': Users,
    'HIERARCHICAL': Footprints,
    'BALANCED': Lightbulb
  };

  const handleRefine = async () => {
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

      if (response.data?.success && response.data?.refinement) {
        setRefinement(response.data.refinement);
        toast.success('Goal enhancements generated!');
      } else {
        toast.error('Failed to refine goal');
        onSkip();
      }
    } catch (error) {
      console.error('Goal refinement error:', error);
      toast.error('Failed to refine goal');
      onSkip();
    } finally {
      setIsRefining(false);
      setThinkingSteps([]);
    }
  };

  const handleSelectGoal = async (selectedGoal, enhancement) => {
    try {
      if (userProfile?.id) {
        const goalHistory = userProfile.goal_history || [];
        await base44.entities.UserProfile.update(userProfile.id, {
          goal: selectedGoal,
          refined_goal: selectedGoal,
          goal_history: [...goalHistory, {
            goal: selectedGoal,
            selected_at: new Date().toISOString(),
            position: position,
            primary_pillars: enhancement.primary_pillars || [],
            key_forces: enhancement.key_forces || [],
            lens: enhancement.lens
          }]
        });
      }
      toast.success('Goal selected!');
      onComplete(selectedGoal);
    } catch (error) {
      console.error('Failed to save goal:', error);
      toast.error('Failed to save goal');
    }
  };

  return (
    <>
      <ThinkingLoader
        isVisible={isRefining}
        message="Refining your goal..."
        thinkingSteps={thinkingSteps}
      />

      {!isRefining && refinement?.enhancements && refinement.enhancements.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative max-w-2xl w-full bg-gradient-to-br from-slate-900/95 to-slate-950/95 rounded-3xl border-2 border-violet-500/30 backdrop-blur-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="text-center mb-8">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/10 flex items-center justify-center border border-violet-500/30">
                <Sparkles className="w-10 h-10 text-violet-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Choose Your Goal Approach</h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                We've analyzed your goal through three coordination patterns. Select the approach that resonates with you.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {refinement.enhancements.map((enhancement, idx) => {
                const Icon = lensIcons[enhancement.lens] || Sparkles;
                return (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.15 }}
                    onClick={() => handleSelectGoal(enhancement.enhanced_goal, enhancement)}
                    className="w-full p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border-2 border-violet-500/30 hover:border-violet-400 hover:shadow-xl hover:scale-[1.02] transition-all text-left group"
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                        <Icon className="w-7 h-7 text-violet-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-violet-300 mb-1">{enhancement.lens}</h3>
                        {enhancement.primary_pillars && (
                          <div className="flex gap-1.5 flex-wrap">
                            {enhancement.primary_pillars.map((pillar, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
                                {pillar}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-base text-white leading-relaxed mb-3">
                      {enhancement.enhanced_goal}
                    </p>
                    {enhancement.key_forces && enhancement.key_forces.length > 0 && (
                      <div className="border-t border-violet-500/20 pt-3 mt-3">
                        <p className="text-xs text-slate-400 mb-2">Key Forces:</p>
                        <div className="flex gap-1.5 flex-wrap mb-2">
                          {enhancement.key_forces.map((force, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-800/50 text-slate-300">
                              {force}
                            </span>
                          ))}
                        </div>
                        {enhancement.guidance && (
                          <p className="text-xs text-slate-400 italic">{enhancement.guidance}</p>
                        )}
                      </div>
                    )}
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
                onComplete(goal);
              }}
              className="w-full p-4 rounded-xl bg-slate-800/50 border-2 border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition-all mb-4"
            >
              <p className="text-sm text-slate-400 text-center font-medium">Keep my original goal</p>
            </motion.button>

            <Button
              onClick={onSkip}
              variant="ghost"
              className="w-full text-slate-500 hover:text-slate-300"
            >
              Skip this step
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 mt-4">
              <p className="text-xs text-slate-400 leading-relaxed text-center">
                <strong>Note:</strong> These approaches explore group dynamics patterns from organizational psychology, not therapy advice.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}