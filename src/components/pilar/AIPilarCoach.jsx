import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, X, Loader2, TrendingUp, Users, Brain, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

export default function AIPilarCoach({ pillar, mode = 'egalitarian', onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [clickHistory, setClickHistory] = useState([]);

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
  });

  const { data: actions = [] } = useQuery({
    queryKey: ['userActions'],
    queryFn: () => base44.entities.UserAction.list('-timestamp', 50),
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams'],
    queryFn: () => base44.entities.Team.list(),
  });

  useEffect(() => {
    if (pillar && !clickHistory.includes(pillar)) {
      setClickHistory(prev => [...prev, pillar]);
    }
  }, [pillar]);

  useEffect(() => {
    if (pillar) {
      analyzeWithAI();
    }
  }, [pillar, mode]);

  const analyzeWithAI = async () => {
    setIsLoading(true);
    try {
      const pillarScore = userProfile?.pillar_scores?.[pillar] || 0;
      const pillarAssessments = assessments.filter(a => a.pillar === pillar);
      const recentActivity = actions.filter(a => a.pillar === pillar).slice(0, 10);
      
      const userTeams = teams.filter(t => 
        t.members?.some(m => m.email === userProfile?.created_by)
      );

      const forces = getForcesForPillar(pillar, mode);

      const prompt = `You are an expert PILAR framework coach analyzing ${pillar.toUpperCase()} for a user.

**Context:**
- Current Mode: ${mode === 'egalitarian' ? 'Egalitarian (collaborative, distributed power)' : 'Hierarchical (structured, centralized authority)'}
- User Score: ${pillarScore}% ${pillarScore === 0 ? '(not yet assessed)' : ''}
- Assessments Completed: ${pillarAssessments.length}
- Recent Activities: ${recentActivity.length} interactions
- Active Teams: ${userTeams.length}
- Click History: ${clickHistory.join(' → ')}

**${pillar.toUpperCase()} Forces in ${mode} Mode:**
${forces.map(f => `- ${f.name}: ${f.description}`).join('\n')}

**Team Connections:**
${userTeams.length > 0 ? userTeams.map(t => `- ${t.team_name}: ${t.members?.length || 0} members, ${t.current_mode || 'balanced'} mode`).join('\n') : '- No active teams yet'}

Provide a **concise 3-paragraph analysis** covering:
1. **Theory Summary**: Brief overview of ${pillar} in ${mode} mode and its key forces
2. **Personal Insight**: How this pillar manifests in their data (score, activity, journey context from click history)
3. **Action Recommendation**: One specific, actionable next step

Keep it under 150 words total. Be encouraging but honest.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setAnalysis(response.response);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      setAnalysis('Unable to generate analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getForcesForPillar = (pillar, mode) => {
    const forcesMap = {
      purpose: {
        egalitarian: [
          { name: 'Group Prospects', description: 'Collective belief in team success' },
          { name: 'Shared Vision', description: 'Aligned understanding of goals' }
        ],
        hierarchical: [
          { name: 'Own Prospects', description: 'Individual advancement focus' },
          { name: 'Personal Goals', description: 'Self-serving objectives' }
        ]
      },
      interpersonal: {
        egalitarian: [
          { name: 'Popularity', description: 'Informal influence and likability' },
          { name: 'Social Support', description: 'Unconditional backing from peers' }
        ],
        hierarchical: [
          { name: 'Status', description: 'Formal authority and rank' },
          { name: 'Hierarchical Position', description: 'Power from position' }
        ]
      },
      learning: {
        egalitarian: [
          { name: 'Indirect Reciprocity', description: 'Help without expecting return' },
          { name: 'Knowledge Sharing', description: 'Open information flow' }
        ],
        hierarchical: [
          { name: 'Direct Reciprocity', description: 'Transactional help exchange' },
          { name: 'Guarded Expertise', description: 'Strategic information control' }
        ]
      },
      action: {
        egalitarian: [
          { name: 'Diverse Expression', description: 'Psychological safety to challenge' },
          { name: 'Collective Initiative', description: 'Group-driven action' }
        ],
        hierarchical: [
          { name: 'Normative Expression', description: 'Defending status quo' },
          { name: 'Directed Execution', description: 'Top-down action' }
        ]
      },
      resilience: {
        egalitarian: [
          { name: 'Outgoing Respect', description: 'Trust in peers\' competence' },
          { name: 'Peer Support', description: 'Horizontal resilience network' }
        ],
        hierarchical: [
          { name: 'Incoming Respect', description: 'Others\' view of your competence' },
          { name: 'Position Security', description: 'Rank-based stability' }
        ]
      }
    };

    return forcesMap[pillar]?.[mode] || [];
  };

  if (!pillar) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-2xl w-full bg-gradient-to-br from-violet-950/90 to-pink-950/90 rounded-3xl border border-violet-500/30 shadow-2xl backdrop-blur-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI PILAR Coach</h3>
                  <p className="text-xs text-zinc-400 capitalize">Analyzing {pillar} • {mode} mode</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin mb-3" />
                <p className="text-sm text-zinc-400">Analyzing connections and patterns...</p>
              </div>
            ) : analysis ? (
              <div className="space-y-4">
                {/* Journey Context */}
                {clickHistory.length > 1 && (
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs text-zinc-500 mb-2">Your exploration path:</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {clickHistory.map((p, i) => (
                        <React.Fragment key={i}>
                          <span className="px-2 py-1 rounded-lg bg-violet-500/20 text-violet-300 text-xs capitalize">
                            {p}
                          </span>
                          {i < clickHistory.length - 1 && <span className="text-zinc-600">→</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analysis */}
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="text-sm text-zinc-300 leading-relaxed mb-3">{children}</p>,
                      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                      em: ({ children }) => <em className="text-violet-300">{children}</em>,
                    }}
                  >
                    {analysis}
                  </ReactMarkdown>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-3 h-3 text-emerald-400" />
                      <p className="text-lg font-bold text-white">{userProfile?.pillar_scores?.[pillar] || 0}%</p>
                    </div>
                    <p className="text-xs text-zinc-500">Your Score</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Brain className="w-3 h-3 text-blue-400" />
                      <p className="text-lg font-bold text-white">{assessments.filter(a => a.pillar === pillar).length}</p>
                    </div>
                    <p className="text-xs text-zinc-500">Assessments</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-3 h-3 text-pink-400" />
                      <p className="text-lg font-bold text-white">{teams.length}</p>
                    </div>
                    <p className="text-xs text-zinc-500">Teams</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-400 text-center py-12">Click a pillar to receive AI insights</p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-white/10 bg-white/5">
            <div className="flex gap-2">
              <Button
                onClick={analyzeWithAI}
                disabled={isLoading}
                size="sm"
                className="flex-1 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300"
              >
                <Sparkles className="w-3 h-3 mr-2" />
                Refresh Analysis
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="border-white/20 text-zinc-300"
              >
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}