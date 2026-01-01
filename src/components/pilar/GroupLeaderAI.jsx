import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Brain, Sparkles, Users, TrendingUp, TrendingDown, 
  Target, Lightbulb, MessageSquare, RefreshCw, ChevronDown,
  ChevronUp, UserCheck, AlertTriangle, Handshake, BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pillarLabels = {
  purpose: 'Purpose',
  interpersonal: 'Interpersonal', 
  learning: 'Learning',
  action: 'Action',
  resilience: 'Resilience'
};

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber'
};

export default function GroupLeaderAI({ group, assessments = [], members = [] }) {
  const [insights, setInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedSection, setExpandedSection] = useState('overview');
  const queryClient = useQueryClient();

  const { data: chatHistory = [] } = useQuery({
    queryKey: ['groupChat', group?.id],
    queryFn: () => base44.entities.ChatMessage.filter({ 
      'context.group_id': group?.id 
    }),
    enabled: !!group?.id,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['groupPlans', group?.id],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ 
      group_id: group?.id 
    }),
    enabled: !!group?.id,
  });

  const analyzeGroup = async () => {
    setIsAnalyzing(true);
    
    // Build comprehensive context for AI analysis
    const memberScores = {};
    const pillarTotals = { purpose: [], interpersonal: [], learning: [], action: [], resilience: [] };
    
    assessments.forEach(a => {
      if (a.completed && a.overall_score) {
        if (!memberScores[a.created_by]) memberScores[a.created_by] = {};
        memberScores[a.created_by][a.pillar] = a.overall_score;
        pillarTotals[a.pillar]?.push(a.overall_score);
      }
    });

    const pillarAverages = {};
    Object.entries(pillarTotals).forEach(([pillar, scores]) => {
      pillarAverages[pillar] = scores.length > 0 
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
    });

    const prompt = `You are an AI coach assistant for group leaders using the PILAR framework (Purpose, Interpersonal, Learning, Action, Resilience).

Analyze this group and provide strategic insights:

GROUP: "${group?.name}"
FOCUS PILLARS: ${group?.focus_pillars?.join(', ') || 'All pillars'}
PARTICIPANTS: ${members.length}
STATUS: ${group?.status}

PILLAR AVERAGES:
${Object.entries(pillarAverages).map(([p, s]) => `- ${pillarLabels[p]}: ${s !== null ? s + '%' : 'No data'}`).join('\n')}

INDIVIDUAL MEMBER SCORES:
${Object.entries(memberScores).map(([email, scores]) => {
  const member = members.find(m => m.email === email);
  return `${member?.name || email}: ${Object.entries(scores).map(([p, s]) => `${p}=${s}%`).join(', ')}`;
}).join('\n')}

RECENT CHAT THEMES: ${chatHistory.slice(-10).map(c => c.content).join(' ').slice(0, 500)}

Provide analysis in this exact JSON structure:
{
  "group_health_score": <0-100>,
  "key_strengths": ["strength1", "strength2"],
  "key_challenges": ["challenge1", "challenge2"],
  "pillar_insights": {
    "<pillar>": {
      "status": "strong|developing|needs_attention",
      "insight": "brief insight"
    }
  },
  "member_highlights": [
    {
      "email": "member email",
      "role": "mentor|learner|catalyst|supporter",
      "strength_pillar": "pillar name",
      "growth_pillar": "pillar name",
      "recommendation": "specific suggestion"
    }
  ],
  "peer_learning_pairs": [
    {
      "mentor_email": "email",
      "learner_email": "email", 
      "pillar": "pillar for mentoring",
      "activity": "suggested activity"
    }
  ],
  "team_interventions": [
    {
      "priority": "high|medium|low",
      "type": "workshop|discussion|exercise|challenge",
      "title": "intervention title",
      "description": "what to do",
      "target_pillar": "pillar",
      "duration": "time estimate"
    }
  ],
  "cohesion_recommendations": ["rec1", "rec2"],
  "weekly_focus": {
    "pillar": "recommended focus pillar",
    "activities": ["activity1", "activity2"],
    "discussion_prompt": "conversation starter for the group"
  }
}`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          group_health_score: { type: "number" },
          key_strengths: { type: "array", items: { type: "string" } },
          key_challenges: { type: "array", items: { type: "string" } },
          pillar_insights: { type: "object" },
          member_highlights: { type: "array", items: { type: "object" } },
          peer_learning_pairs: { type: "array", items: { type: "object" } },
          team_interventions: { type: "array", items: { type: "object" } },
          cohesion_recommendations: { type: "array", items: { type: "string" } },
          weekly_focus: { type: "object" }
        }
      }
    });

    setInsights(response);
    setIsAnalyzing(false);

    // Save insights to group
    if (group?.id) {
      await base44.entities.GroupRound.update(group.id, {
        group_insights: {
          collective_strengths: response.key_strengths,
          collective_growth_areas: response.key_challenges,
          cohesion_score: response.group_health_score,
          last_analyzed: new Date().toISOString()
        }
      });
      queryClient.invalidateQueries(['groups']);
    }
  };

  const Section = ({ id, title, icon: Icon, children }) => (
    <div className="border-b border-white/5 last:border-0">
      <button
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-violet-400" />
          <span className="font-medium text-white">{title}</span>
        </div>
        {expandedSection === id ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10 border border-violet-500/20 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">AI Group Insights</h3>
              <p className="text-xs text-zinc-400">Leader Analytics Dashboard</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={analyzeGroup}
            disabled={isAnalyzing}
            className="bg-violet-500 hover:bg-violet-600"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze Group
              </>
            )}
          </Button>
        </div>
      </div>

      {!insights ? (
        <div className="p-8 text-center">
          <Brain className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <p className="text-zinc-400 mb-4">Click "Analyze Group" to get AI-powered insights</p>
          <p className="text-xs text-zinc-500">Analysis includes member progress, peer learning opportunities, and intervention suggestions</p>
        </div>
      ) : (
        <div>
          {/* Health Score */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Group Health Score</span>
              <span className={cn(
                "text-2xl font-bold",
                insights.group_health_score >= 70 ? "text-emerald-400" :
                insights.group_health_score >= 50 ? "text-amber-400" : "text-red-400"
              )}>
                {insights.group_health_score}%
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${insights.group_health_score}%` }}
                className={cn(
                  "h-full rounded-full",
                  insights.group_health_score >= 70 ? "bg-emerald-500" :
                  insights.group_health_score >= 50 ? "bg-amber-500" : "bg-red-500"
                )}
              />
            </div>
          </div>

          {/* Overview */}
          <Section id="overview" title="Strengths & Challenges" icon={Target}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Key Strengths
                </div>
                <ul className="space-y-1">
                  {insights.key_strengths?.map((s, i) => (
                    <li key={i} className="text-sm text-zinc-300">• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  Challenges
                </div>
                <ul className="space-y-1">
                  {insights.key_challenges?.map((c, i) => (
                    <li key={i} className="text-sm text-zinc-300">• {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          {/* Pillar Insights */}
          <Section id="pillars" title="Pillar Analysis" icon={TrendingUp}>
            <div className="space-y-2">
              {Object.entries(insights.pillar_insights || {}).map(([pillar, data]) => (
                <div key={pillar} className={cn(
                  "p-3 rounded-xl",
                  `bg-${pillarColors[pillar]}-500/10 border border-${pillarColors[pillar]}-500/20`
                )}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white capitalize">{pillar}</span>
                    <span className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      data.status === 'strong' ? "bg-emerald-500/20 text-emerald-400" :
                      data.status === 'developing' ? "bg-amber-500/20 text-amber-400" :
                      "bg-red-500/20 text-red-400"
                    )}>
                      {data.status}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400">{data.insight}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Member Highlights */}
          <Section id="members" title="Member Insights" icon={Users}>
            <div className="space-y-3">
              {insights.member_highlights?.map((member, i) => {
                const memberData = members.find(m => m.email === member.email);
                return (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-violet-400" />
                        </div>
                        <span className="font-medium text-white">
                          {memberData?.name || member.email?.split('@')[0]}
                        </span>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 capitalize">
                        {member.role}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-zinc-400 mb-2">
                      <span>💪 Strong: <span className="text-white capitalize">{member.strength_pillar}</span></span>
                      <span>🎯 Focus: <span className="text-white capitalize">{member.growth_pillar}</span></span>
                    </div>
                    <p className="text-sm text-zinc-300 bg-white/5 rounded-lg p-2">
                      <Lightbulb className="w-3 h-3 inline mr-1 text-amber-400" />
                      {member.recommendation}
                    </p>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* Peer Learning */}
          <Section id="peer" title="Peer Learning Pairs" icon={Handshake}>
            <div className="space-y-3">
              {insights.peer_learning_pairs?.map((pair, i) => (
                <div key={i} className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-white">
                      {members.find(m => m.email === pair.mentor_email)?.name || pair.mentor_email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-zinc-400">→ mentors →</span>
                    <span className="text-sm text-white">
                      {members.find(m => m.email === pair.learner_email)?.name || pair.learner_email?.split('@')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-white/10 text-zinc-300 capitalize">{pair.pillar}</span>
                    <span className="text-zinc-400">{pair.activity}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Interventions */}
          <Section id="interventions" title="Suggested Interventions" icon={Lightbulb}>
            <div className="space-y-3">
              {insights.team_interventions?.map((intervention, i) => (
                <div key={i} className={cn(
                  "p-3 rounded-xl border",
                  intervention.priority === 'high' ? "bg-red-500/10 border-red-500/20" :
                  intervention.priority === 'medium' ? "bg-amber-500/10 border-amber-500/20" :
                  "bg-white/5 border-white/10"
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white">{intervention.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-400">{intervention.duration}</span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full capitalize",
                        intervention.priority === 'high' ? "bg-red-500/20 text-red-400" :
                        intervention.priority === 'medium' ? "bg-amber-500/20 text-amber-400" :
                        "bg-zinc-500/20 text-zinc-400"
                      )}>
                        {intervention.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-2">{intervention.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-300">{intervention.type}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-300 capitalize">{intervention.target_pillar}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Weekly Focus */}
          <Section id="weekly" title="This Week's Focus" icon={BookOpen}>
            {insights.weekly_focus && (
              <div className="space-y-3">
                <div className={cn(
                  "p-4 rounded-xl",
                  `bg-${pillarColors[insights.weekly_focus.pillar]}-500/10 border border-${pillarColors[insights.weekly_focus.pillar]}-500/20`
                )}>
                  <div className="text-sm text-zinc-400 mb-1">Focus Pillar</div>
                  <div className="text-xl font-bold text-white capitalize mb-3">
                    {insights.weekly_focus.pillar}
                  </div>
                  <div className="text-sm text-zinc-400 mb-2">Suggested Activities:</div>
                  <ul className="space-y-1 mb-4">
                    {insights.weekly_focus.activities?.map((a, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                        {a}
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 rounded-lg bg-white/5">
                    <div className="text-xs text-zinc-400 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      Discussion Prompt
                    </div>
                    <p className="text-sm text-white italic">"{insights.weekly_focus.discussion_prompt}"</p>
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* Cohesion Tips */}
          <div className="p-4 bg-gradient-to-r from-violet-500/10 to-pink-500/10">
            <div className="flex items-center gap-2 text-sm font-medium text-white mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Cohesion Tips
            </div>
            <ul className="space-y-1">
              {insights.cohesion_recommendations?.map((rec, i) => (
                <li key={i} className="text-sm text-zinc-300">• {rec}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}