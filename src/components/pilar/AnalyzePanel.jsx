import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { X, Brain, Loader2, Sparkles, ChevronRight, Target, TrendingUp, Users, RefreshCw, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getCachedProfileInsights, getRAGResponse, initializeKnowledgeBase, getKnowledgeBaseStatus } from '@/components/pilar/RAGService';

export default function AnalyzePanel({ isOpen, onClose, userProfile, gamification, assessments, groups, currentUser }) {
  const [analysis, setAnalysis] = useState(null);
  const [knowledgeBaseReady, setKnowledgeBaseReady] = useState(false);
  const [fromCache, setFromCache] = useState(false);

  // Initialize knowledge base on first open
  useEffect(() => {
    if (isOpen && !knowledgeBaseReady) {
      getKnowledgeBaseStatus().then(status => {
        if (status.indexed) {
          setKnowledgeBaseReady(true);
        } else {
          initializeKnowledgeBase().then(() => setKnowledgeBaseReady(true));
        }
      }).catch(() => setKnowledgeBaseReady(true));
    }
  }, [isOpen, knowledgeBaseReady]);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const scores = userProfile?.pillar_scores || {};
      const completedPillars = Object.keys(scores).filter(k => scores[k] > 0);
      const avgScore = completedPillars.length > 0
        ? Math.round(completedPillars.reduce((sum, k) => sum + scores[k], 0) / completedPillars.length)
        : 0;

      const sortedPillars = Object.entries(scores)
        .filter(([_, score]) => score > 0)
        .sort(([, a], [, b]) => b - a);

      const strongestPillar = sortedPillars[0]?.[0];
      const weakestPillar = sortedPillars[sortedPillars.length - 1]?.[0];

      const myGroups = groups?.filter(g => g.participants?.some(p => p.email === currentUser?.email)) || [];

      // Use cached profile insights (RAG runs only if cache is stale)
      if (knowledgeBaseReady && currentUser?.email) {
        const { insights, fromCache: cached } = await getCachedProfileInsights(
          currentUser.email, 
          userProfile, 
          false // Don't force refresh
        );
        
        setFromCache(cached);

        return {
          profile_summary: insights.profile_summary,
          next_steps: insights.next_steps || [],
          strength_leverage: insights.strength_leverage,
          team_suggestion: myGroups.length > 0 
            ? insights.team_suggestion
            : `Consider joining a team to enhance your collaborative development journey.`,
          motivational_insight: insights.motivational_insight,
          pillar_insights: insights.pillar_insights
        };
      }

      const prompt = `You are an expert in Ben Heslop's PILAR framework for personal development. Analyze this user's Caterpillar Collaboration profile and provide personalized next steps.

USER PROFILE:
- Name: ${currentUser?.full_name || 'User'}
- Pillars Assessed: ${completedPillars.length}/5
- Pillar Scores: ${JSON.stringify(scores)}
- Strongest Pillar: ${strongestPillar || 'None assessed'}
- Weakest Pillar: ${weakestPillar || 'None assessed'}
- Average Score: ${avgScore}%
- Level: ${gamification?.level || 1}
- Total Points: ${gamification?.total_points || 0}
- Current Streak: ${gamification?.streaks?.current_streak || 0} days
- Teams Joined: ${myGroups.length}
- Assessments Completed: ${assessments?.filter(a => a.completed).length || 0}

BEN HESLOP'S PILAR FRAMEWORK:
- Purpose: Sense of direction, values alignment, meaning extraction
- Interpersonal: Empathy, communication, conflict resolution
- Learning: Curiosity, skill acquisition, reflection
- Action: Discipline, momentum, execution
- Resilience: Stress response, emotional regulation, recovery

Based on this profile, provide:
1. A brief profile summary (2-3 sentences)
2. Top 3 specific actionable next steps based on their scores
3. How their strongest pillar can help them grow
4. One team collaboration suggestion if they're in groups
5. A motivational insight based on PILAR theory`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            profile_summary: { type: "string" },
            next_steps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  pillar: { type: "string" }
                }
              }
            },
            strength_leverage: { type: "string" },
            team_suggestion: { type: "string" },
            motivational_insight: { type: "string" }
          }
        }
      });

      return response;
    },
    onSuccess: (data) => {
      setAnalysis(data);
    }
  });

  const pillarColors = {
    purpose: 'violet',
    interpersonal: 'pink',
    learning: 'indigo',
    action: 'emerald',
    resilience: 'amber'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed left-4 bottom-20 z-50 w-80 md:w-96 max-h-[70vh] bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-pink-500/10">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-violet-400" />
              <h3 className="font-medium text-white">Caterpillar Analysis</h3>
              {knowledgeBaseReady && (
                <span className={cn(
                  "flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]",
                  fromCache ? "bg-blue-500/20 text-blue-400" : "bg-emerald-500/20 text-emerald-400"
                )}>
                  <Database className="w-3 h-3" />
                  {fromCache ? 'Cached' : 'RAG'}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-400">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[55vh] overflow-y-auto">
            {!analysis && !analyzeMutation.isPending && (
              <div className="text-center py-6">
                <Brain className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <p className="text-zinc-400 mb-4">Get AI-powered insights based on Ben Heslop's PILAR framework</p>
                <Button
                  onClick={() => analyzeMutation.mutate()}
                  className="bg-gradient-to-r from-violet-500 to-pink-500 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze My Profile
                </Button>
              </div>
            )}

            {analyzeMutation.isPending && (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-violet-400 mx-auto mb-3 animate-spin" />
                <p className="text-zinc-400">Analyzing your Caterpillar profile...</p>
              </div>
            )}

            {analysis && (
              <div className="space-y-4">
                {/* Profile Summary */}
                <div className="p-3 rounded-xl bg-white/5">
                  <p className="text-sm text-zinc-300">{analysis.profile_summary}</p>
                </div>

                {/* Next Steps */}
                <div>
                  <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-400" />
                    Next Steps
                  </h4>
                  <div className="space-y-2">
                    {analysis.next_steps?.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-3 rounded-lg bg-white/5 border border-white/5"
                      >
                        <div className="flex items-start gap-2">
                          <span className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                            `bg-${pillarColors[step.pillar] || 'violet'}-500/20 text-${pillarColors[step.pillar] || 'violet'}-400`
                          )}>
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-white">{step.title}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{step.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Strength Leverage */}
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-xs font-medium text-emerald-400 mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Leverage Your Strength
                  </h4>
                  <p className="text-sm text-zinc-300">{analysis.strength_leverage}</p>
                </div>

                {/* Team Suggestion */}
                {analysis.team_suggestion && (
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h4 className="text-xs font-medium text-blue-400 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Team Insight
                    </h4>
                    <p className="text-sm text-zinc-300">{analysis.team_suggestion}</p>
                  </div>
                )}

                {/* Motivational Insight */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20">
                  <p className="text-sm text-zinc-300 italic">"{analysis.motivational_insight}"</p>
                </div>

                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAnalysis(null);
                    analyzeMutation.mutate();
                  }}
                  className="w-full border-white/10 text-zinc-400"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}