import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { 
  TrendingUp, TrendingDown, Users, Target, Sparkles, 
  AlertTriangle, Loader2, RefreshCw, Lightbulb, Heart,
  Zap, Shield, Compass, BookOpen, UserPlus, MessageSquare,
  ChevronDown, ChevronUp, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { trackInsightViewed } from './ActionTracker';

const pillarLabels = {
  purpose: 'Purpose',
  interpersonal: 'Interpersonal',
  learning: 'Learning',
  action: 'Action',
  resilience: 'Resilience'
};

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield
};

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber'
};

// Pillar synergy matrix based on PILAR research
const SYNERGY_MATRIX = {
  purpose: { interpersonal: 0.7, learning: 0.8, action: 0.9, resilience: 0.8 },
  interpersonal: { purpose: 0.7, learning: 0.8, action: 0.6, resilience: 0.9 },
  learning: { purpose: 0.8, interpersonal: 0.8, action: 0.7, resilience: 0.7 },
  action: { purpose: 0.9, interpersonal: 0.6, learning: 0.7, resilience: 0.8 },
  resilience: { purpose: 0.8, interpersonal: 0.9, learning: 0.7, action: 0.8 }
};

// Conflict patterns when pillars are imbalanced
const CONFLICT_PATTERNS = {
  'high_action_low_interpersonal': 'Risk of burnout culture - high achievers may overlook team dynamics',
  'high_purpose_low_action': 'Vision without execution - great ideas may stall without momentum',
  'high_learning_low_resilience': 'Analysis paralysis - constant learning but difficulty with setbacks',
  'high_interpersonal_low_purpose': 'Strong bonds but unclear direction - team may drift',
  'high_resilience_low_learning': 'Endurance without growth - may repeat same patterns'
};

export default function GroupInsightsPanel({ group, assessments = [] }) {
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    synergies: true,
    conflicts: false,
    activities: false,
    goals: false
  });

  // Calculate collective pillar scores
  const pillarScores = {};
  const memberScores = {};
  
  ['purpose', 'interpersonal', 'learning', 'action', 'resilience'].forEach(pillar => {
    const pillarAssessments = assessments.filter(a => a.pillar === pillar && a.completed);
    if (pillarAssessments.length > 0) {
      pillarScores[pillar] = Math.round(
        pillarAssessments.reduce((sum, a) => sum + (a.overall_score || 0), 0) / pillarAssessments.length
      );
      
      // Track individual member scores for synergy analysis
      pillarAssessments.forEach(a => {
        if (!memberScores[a.created_by]) memberScores[a.created_by] = {};
        memberScores[a.created_by][pillar] = a.overall_score;
      });
    }
  });

  const sortedPillars = Object.entries(pillarScores).sort(([,a], [,b]) => b - a);
  const strengths = sortedPillars.slice(0, 2).filter(([,score]) => score >= 60);
  const growthAreas = sortedPillars.slice(-2).filter(([,score]) => score < 70);

  const cohesionScore = sortedPillars.length > 0 
    ? Math.round(100 - (Math.max(...Object.values(pillarScores)) - Math.min(...Object.values(pillarScores))))
    : 0;

  // Calculate synergies between group members
  const calculateSynergies = () => {
    const synergies = [];
    const members = Object.keys(memberScores);
    
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const m1 = members[i];
        const m2 = members[j];
        const m1Scores = memberScores[m1];
        const m2Scores = memberScores[m2];
        
        // Find complementary strengths
        Object.keys(m1Scores).forEach(pillar => {
          const m1Score = m1Scores[pillar] || 0;
          const m2Score = m2Scores[pillar] || 0;
          
          if (m1Score >= 70 && m2Score < 50) {
            synergies.push({
              mentor: m1,
              learner: m2,
              pillar,
              mentorScore: m1Score,
              learnerScore: m2Score,
              type: 'mentoring'
            });
          } else if (m2Score >= 70 && m1Score < 50) {
            synergies.push({
              mentor: m2,
              learner: m1,
              pillar,
              mentorScore: m2Score,
              learnerScore: m1Score,
              type: 'mentoring'
            });
          }
        });
      }
    }
    
    return synergies.slice(0, 5); // Top 5 synergy opportunities
  };

  // Detect potential conflicts
  const detectConflicts = () => {
    const conflicts = [];
    
    if (pillarScores.action >= 70 && pillarScores.interpersonal < 50) {
      conflicts.push({ pattern: 'high_action_low_interpersonal', severity: 'medium' });
    }
    if (pillarScores.purpose >= 70 && pillarScores.action < 50) {
      conflicts.push({ pattern: 'high_purpose_low_action', severity: 'medium' });
    }
    if (pillarScores.learning >= 70 && pillarScores.resilience < 50) {
      conflicts.push({ pattern: 'high_learning_low_resilience', severity: 'low' });
    }
    if (pillarScores.interpersonal >= 70 && pillarScores.purpose < 50) {
      conflicts.push({ pattern: 'high_interpersonal_low_purpose', severity: 'medium' });
    }
    if (pillarScores.resilience >= 70 && pillarScores.learning < 50) {
      conflicts.push({ pattern: 'high_resilience_low_learning', severity: 'low' });
    }
    
    return conflicts;
  };

  const synergies = calculateSynergies();
  const conflicts = detectConflicts();

  // Generate AI insights
  const generateAIInsights = async () => {
    setIsLoadingAI(true);
    trackInsightViewed('group_ai_analysis', null, { group_id: group?.id });
    
    try {
      const prompt = `Analyze this team's PILAR profile and provide strategic insights:

TEAM: "${group?.name}"
MEMBER COUNT: ${group?.participants?.length || 0}
FOCUS PILLARS: ${group?.focus_pillars?.join(', ') || 'None specified'}

COLLECTIVE PILLAR SCORES:
${Object.entries(pillarScores).map(([p, s]) => `- ${p}: ${s}%`).join('\n')}

STRENGTHS: ${strengths.map(([p, s]) => `${p} (${s}%)`).join(', ') || 'None identified'}
GROWTH AREAS: ${growthAreas.map(([p, s]) => `${p} (${s}%)`).join(', ') || 'None identified'}
COHESION SCORE: ${cohesionScore}%

DETECTED SYNERGIES: ${synergies.length} mentoring opportunities
POTENTIAL CONFLICTS: ${conflicts.map(c => CONFLICT_PATTERNS[c.pattern]).join('; ') || 'None detected'}

Based on Ben Heslop's PILAR framework, provide:
1. A brief team profile summary (2-3 sentences)
2. Top 3 synergistic opportunities for the team to leverage
3. Specific strategies to address any conflicts
4. 3 team-building activities tailored to their profile
5. Goal recommendations based on their collective strengths`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            team_summary: { type: "string" },
            synergy_opportunities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  pillars_involved: { type: "array", items: { type: "string" } }
                }
              }
            },
            conflict_strategies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  issue: { type: "string" },
                  strategy: { type: "string" }
                }
              }
            },
            team_activities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  target_pillar: { type: "string" },
                  duration: { type: "string" },
                  participants: { type: "string" }
                }
              }
            },
            goal_recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  goal: { type: "string" },
                  rationale: { type: "string" },
                  success_metric: { type: "string" }
                }
              }
            }
          }
        }
      });

      setAiInsights(response);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const participantCount = group?.participants?.filter(p => p.status === 'joined').length || 0;
  const completedCount = group?.participants?.filter(p => p.status === 'completed').length || 0;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <Users className="w-5 h-5 text-violet-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{participantCount}</div>
          <div className="text-xs text-zinc-500">Members</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <Target className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{Object.keys(pillarScores).length}/5</div>
          <div className="text-xs text-zinc-500">Assessed</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 text-center">
          <Sparkles className="w-5 h-5 text-amber-400 mx-auto mb-1" />
          <div className="text-lg font-bold text-white">{cohesionScore}%</div>
          <div className="text-xs text-zinc-500">Balance</div>
        </div>
      </div>

      {/* Collective Strengths */}
      {strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-medium text-emerald-400">Collective Strengths</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {strengths.map(([pillar, score]) => {
              const Icon = pillarIcons[pillar];
              return (
                <span
                  key={pillar}
                  className="px-3 py-1.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300 flex items-center gap-1.5"
                >
                  <Icon className="w-3 h-3" />
                  {pillarLabels[pillar]} ({score}%)
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Growth Areas */}
      {growthAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-medium text-amber-400">Growth Opportunities</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {growthAreas.map(([pillar, score]) => {
              const Icon = pillarIcons[pillar];
              return (
                <span
                  key={pillar}
                  className="px-3 py-1.5 rounded-full text-xs bg-amber-500/20 text-amber-300 flex items-center gap-1.5"
                >
                  <Icon className="w-3 h-3" />
                  {pillarLabels[pillar]} ({score}%)
                </span>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Detected Conflicts */}
      {conflicts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h4 className="text-sm font-medium text-red-400">Potential Tensions</h4>
          </div>
          <div className="space-y-2">
            {conflicts.map((conflict, i) => (
              <p key={i} className="text-xs text-red-300/80">
                {CONFLICT_PATTERNS[conflict.pattern]}
              </p>
            ))}
          </div>
        </motion.div>
      )}

      {/* Synergy Opportunities */}
      {synergies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20"
        >
          <button
            onClick={() => toggleSection('synergies')}
            className="w-full flex items-center justify-between mb-2"
          >
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-violet-400" />
              <h4 className="text-sm font-medium text-violet-400">Mentoring Opportunities</h4>
            </div>
            {expandedSections.synergies ? <ChevronUp className="w-4 h-4 text-violet-400" /> : <ChevronDown className="w-4 h-4 text-violet-400" />}
          </button>
          <AnimatePresence>
            {expandedSections.synergies && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {synergies.map((syn, i) => {
                  const Icon = pillarIcons[syn.pillar];
                  return (
                    <div key={i} className="p-2 rounded-lg bg-violet-500/10 flex items-center gap-2">
                      <Icon className={`w-4 h-4 text-${pillarColors[syn.pillar]}-400`} />
                      <span className="text-xs text-zinc-300">
                        <span className="text-violet-300">{syn.mentor.split('@')[0]}</span>
                        {' → '}
                        <span className="text-zinc-400">{syn.learner.split('@')[0]}</span>
                        {' on '}
                        <span className={`text-${pillarColors[syn.pillar]}-400 capitalize`}>{syn.pillar}</span>
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* AI Insights Button */}
      <Button
        onClick={generateAIInsights}
        disabled={isLoadingAI || Object.keys(pillarScores).length === 0}
        className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white"
      >
        {isLoadingAI ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Analyzing team...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate AI Team Analysis
          </>
        )}
      </Button>

      {/* AI Generated Insights */}
      {aiInsights && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Team Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-violet-400" />
              <h4 className="text-sm font-medium text-white">Team Profile</h4>
            </div>
            <p className="text-sm text-zinc-300">{aiInsights.team_summary}</p>
          </div>

          {/* Synergy Opportunities */}
          {aiInsights.synergy_opportunities?.length > 0 && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => toggleSection('goals')}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-medium text-white">Leverage Your Synergies</h4>
                </div>
                {expandedSections.goals ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>
              <AnimatePresence>
                {expandedSections.goals && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {aiInsights.synergy_opportunities.map((opp, i) => (
                      <div key={i} className="p-3 rounded-lg bg-amber-500/10">
                        <p className="text-sm font-medium text-amber-300">{opp.title}</p>
                        <p className="text-xs text-zinc-400 mt-1">{opp.description}</p>
                        {opp.pillars_involved?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {opp.pillars_involved.map(p => {
                              const Icon = pillarIcons[p.toLowerCase()] || Sparkles;
                              return (
                                <span key={p} className={`px-2 py-0.5 rounded text-xs bg-${pillarColors[p.toLowerCase()] || 'zinc'}-500/20 text-${pillarColors[p.toLowerCase()] || 'zinc'}-400`}>
                                  {p}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Conflict Strategies */}
          {aiInsights.conflict_strategies?.length > 0 && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => toggleSection('conflicts')}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-400" />
                  <h4 className="text-sm font-medium text-white">Conflict Resolution</h4>
                </div>
                {expandedSections.conflicts ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>
              <AnimatePresence>
                {expandedSections.conflicts && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {aiInsights.conflict_strategies.map((strat, i) => (
                      <div key={i} className="p-3 rounded-lg bg-red-500/10">
                        <p className="text-sm font-medium text-red-300">{strat.issue}</p>
                        <p className="text-xs text-zinc-400 mt-1">{strat.strategy}</p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Team Activities */}
          {aiInsights.team_activities?.length > 0 && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <button
                onClick={() => toggleSection('activities')}
                className="w-full flex items-center justify-between mb-3"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-medium text-white">Recommended Team Activities</h4>
                </div>
                {expandedSections.activities ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
              </button>
              <AnimatePresence>
                {expandedSections.activities && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-3 overflow-hidden"
                  >
                    {aiInsights.team_activities.map((activity, i) => {
                      const pillar = activity.target_pillar?.toLowerCase();
                      const Icon = pillarIcons[pillar] || Award;
                      return (
                        <div key={i} className={`p-3 rounded-lg bg-${pillarColors[pillar] || 'zinc'}-500/10 border border-${pillarColors[pillar] || 'zinc'}-500/20`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className={`w-4 h-4 text-${pillarColors[pillar] || 'zinc'}-400`} />
                            <p className={`text-sm font-medium text-${pillarColors[pillar] || 'zinc'}-300`}>{activity.name}</p>
                          </div>
                          <p className="text-xs text-zinc-400">{activity.description}</p>
                          <div className="flex gap-3 mt-2 text-xs text-zinc-500">
                            {activity.duration && <span>⏱ {activity.duration}</span>}
                            {activity.participants && <span>👥 {activity.participants}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Goal Recommendations */}
          {aiInsights.goal_recommendations?.length > 0 && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-medium text-white">Recommended Team Goals</h4>
              </div>
              <div className="space-y-3">
                {aiInsights.goal_recommendations.map((goal, i) => (
                  <div key={i} className="p-3 rounded-lg bg-indigo-500/10">
                    <p className="text-sm font-medium text-indigo-300">{goal.goal}</p>
                    <p className="text-xs text-zinc-400 mt-1">{goal.rationale}</p>
                    {goal.success_metric && (
                      <p className="text-xs text-indigo-400/70 mt-2">📊 {goal.success_metric}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <Button
            onClick={generateAIInsights}
            variant="outline"
            size="sm"
            className="w-full border-white/10 text-zinc-400 hover:text-white"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Regenerate Analysis
          </Button>
        </motion.div>
      )}

      {/* Empty State Guidance */}
      {Object.keys(pillarScores).length === 0 && (
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center">
          <p className="text-sm text-zinc-400">
            Group members need to complete assessments to unlock team insights and AI analysis.
          </p>
        </div>
      )}
    </div>
  );
}