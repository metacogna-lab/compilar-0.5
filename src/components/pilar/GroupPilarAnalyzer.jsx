import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Sparkles, Brain, TrendingUp, Target, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export default function GroupPilarAnalyzer({ group, assessments }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeGroup = async () => {
    setIsAnalyzing(true);
    try {
      // Calculate group pillar scores
      const participantEmails = group.participants?.map(p => p.email) || [];
      const groupAssessments = assessments.filter(a => 
        participantEmails.includes(a.created_by) && a.completed
      );

      const pillarScores = {};
      ['purpose', 'interpersonal', 'learning', 'action', 'resilience'].forEach(pillar => {
        const pillarAssessments = groupAssessments.filter(a => a.pillar === pillar);
        if (pillarAssessments.length > 0) {
          const avgScore = pillarAssessments.reduce((sum, a) => sum + a.overall_score, 0) / pillarAssessments.length;
          pillarScores[pillar] = Math.round(avgScore);
        }
      });

      const focusPillars = group.focus_pillars || [];
      const participantCount = group.participants?.length || 0;
      const completionRate = (groupAssessments.length / (participantCount * 5)) * 100;

      const prompt = `You are an expert organizational psychologist analyzing a collaborative group using the PILAR framework.

**Group Context:**
- Group Name: ${group.name}
- Description: ${group.description || 'No description provided'}
- Members: ${participantCount}
- Assessment Completion: ${Math.round(completionRate)}%
- Focus Pillars: ${focusPillars.length > 0 ? focusPillars.join(', ') : 'None specified'}

**Group PILAR Scores (Average):**
${Object.entries(pillarScores).map(([pillar, score]) => `- ${pillar.toUpperCase()}: ${score}%`).join('\n') || 'No assessments completed yet'}

**PILAR Framework Context:**
- **Purpose**: Direction, values alignment, meaning extraction
- **Interpersonal**: Empathy, communication, conflict resolution
- **Learning**: Curiosity, skill acquisition, reflection
- **Action**: Discipline, momentum, execution
- **Resilience**: Stress response, emotional regulation, recovery

Using the PILAR framework, provide a comprehensive analysis in 4 sections:

## 1. Team Strengths (2-3 sentences)
Identify the team's strongest pillars and what this means for collaboration effectiveness.

## 2. Growth Opportunities (2-3 sentences)
Highlight pillars that need development and specific risks if left unaddressed.

## 3. Optimal Forward Path (3-4 specific recommendations)
Provide actionable recommendations for the team to move forward, considering:
- Which pillars to prioritize
- How to leverage strengths
- Specific collaborative practices to adopt
- Whether to use egalitarian (collaborative) or hierarchical (structured) approaches for different situations

## 4. Mode Recommendation (2 sentences)
Based on the pillar scores, recommend whether this team should currently operate in:
- **Egalitarian Mode** (distributed power, group focus, psychological safety) 
- **Hierarchical Mode** (clear authority, individual accountability, structured execution)
- **Hybrid Approach** (when to shift between modes)

Be specific, actionable, and honest. Total response under 300 words.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setAnalysis(response.response);
    } catch (error) {
      console.error('Analysis Error:', error);
      setAnalysis('Unable to generate analysis. Please ensure group members have completed assessments.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-950/30 to-pink-950/30 border border-violet-500/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI PILAR Analysis</h3>
            <p className="text-xs text-zinc-400">Strategic recommendations for your team</p>
          </div>
        </div>
        <Button
          onClick={analyzeGroup}
          disabled={isAnalyzing}
          size="sm"
          className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 mr-2" />
              Analyze Group
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12"
          >
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-3" />
            <p className="text-sm text-zinc-400">Analyzing pillar scores and team dynamics...</p>
          </motion.div>
        ) : analysis ? (
          <motion.div
            key="analysis"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="prose prose-sm prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-white font-semibold text-base mt-4 mb-2 flex items-center gap-2">
                      {children?.toString().includes('Strengths') && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                      {children?.toString().includes('Growth') && <Target className="w-4 h-4 text-amber-400" />}
                      {children?.toString().includes('Forward Path') && <Lightbulb className="w-4 h-4 text-violet-400" />}
                      {children?.toString().includes('Mode') && <Brain className="w-4 h-4 text-pink-400" />}
                      {children}
                    </h2>
                  ),
                  p: ({ children }) => <p className="text-sm text-zinc-300 leading-relaxed mb-2">{children}</p>,
                  ul: ({ children }) => <ul className="space-y-1 ml-4">{children}</ul>,
                  li: ({ children }) => (
                    <li className="text-sm text-zinc-300 flex items-start gap-2">
                      <span className="text-violet-400 mt-1">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                  em: ({ children }) => <em className="text-violet-300">{children}</em>,
                }}
              >
                {analysis}
              </ReactMarkdown>
            </div>

            <div className="flex gap-2 pt-4 border-t border-white/10">
              <Button
                onClick={analyzeGroup}
                size="sm"
                variant="outline"
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Refresh Analysis
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-8 text-center"
          >
            <AlertTriangle className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 mb-4">
              Click "Analyze Group" to receive AI-powered insights on your team's optimal forward path using the PILAR framework.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}