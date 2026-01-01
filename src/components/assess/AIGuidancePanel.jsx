import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, TrendingUp, BookOpen, Target, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import ThinkingLoader from './ThinkingLoader';

export default function AIGuidancePanel({ 
  stage, 
  userProfile, 
  userProgress,
  currentPillar,
  currentMode,
  assessmentResults,
  onActionClick
}) {
  const [guidance, setGuidance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);

  const fetchGuidance = async () => {
    setIsLoading(true);
    setThinkingSteps([
      'Evaluating pillar strengths...',
      'Analyzing force interactions...',
      'Reviewing quiz performance patterns...',
      'Identifying knowledge gaps...',
      'Mapping optimal learning path...'
    ]);
    
    try {
      const response = await base44.functions.invoke('getAssessmentGuidance', {
        stage,
        userProfile,
        userProgress,
        currentPillar,
        currentMode,
        assessmentResults
      });

      if (response.data?.success) {
        setGuidance(response.data.guidance);
      }
    } catch (error) {
      console.error('Failed to fetch guidance:', error);
      toast.error('Failed to load guidance');
    } finally {
      setIsLoading(false);
      setThinkingSteps([]);
    }
  };

  if (!guidance && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-pink-500/10 border border-cyan-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center border border-cyan-500/30">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">AI Coach Recommendations</h3>
              <p className="text-slate-400 text-sm">Get personalized guidance based on your profile</p>
            </div>
          </div>
          <Button
            onClick={fetchGuidance}
            size="sm"
            className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <ThinkingLoader
        isVisible={isLoading}
        message="Analyzing your PILAR profile..."
        thinkingSteps={thinkingSteps}
      />
      
      {guidance && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-pink-500/10 border border-cyan-500/30 rounded-2xl p-6 space-y-4"
        >
          {/* Header */}
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center border border-cyan-500/30">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">AI Coach Recommendation</h3>
              <p className="text-cyan-300 text-sm leading-relaxed">
                {guidance.primary_recommendation}
              </p>
            </div>
          </div>

          {/* Performance Insights (if assessment results available) */}
          {guidance.performance_insights && (
            <div className="space-y-2 bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <h4 className="text-white font-semibold text-sm flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
                Your Performance Patterns
              </h4>
              <div className="space-y-1">
                {guidance.performance_insights.map((insight, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                    <span className="text-yellow-400 mt-0.5">→</span>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Pillars & Forces - Concise */}
          {guidance.suggested_pillars?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-sm flex items-center">
                <Target className="w-4 h-4 mr-2 text-violet-400" />
                Recommended Focus Areas
              </h4>
              <div className="space-y-2">
                {guidance.suggested_pillars.slice(0, 2).map((suggestion, idx) => (
                  <div key={idx} className="text-sm text-slate-300 flex items-start space-x-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <span><strong>{suggestion.pillar}</strong> - {suggestion.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions - Maximum 2 steps */}
          {guidance.next_steps?.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-sm flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-emerald-400" />
                Quick Actions
              </h4>
              <div className="space-y-2">
                {guidance.next_steps.slice(0, 2).map((step, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-slate-300 text-sm">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </>
  );
}