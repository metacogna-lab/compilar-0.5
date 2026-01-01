import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { BarChart3, Database, TrendingUp, Brain, MessageSquare, Settings, RefreshCw, Sparkles, Users, Target, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import EntityUsageWidget from '@/components/admin/analytics/EntityUsageWidget';
import DataQualityWidget from '@/components/admin/analytics/DataQualityWidget';
import GrowthTrendsWidget from '@/components/admin/analytics/GrowthTrendsWidget';
import AIInsightsWidget from '@/components/admin/analytics/AIInsightsWidget';
import RecommendationsPanel from '@/components/admin/analytics/RecommendationsPanel';
import { toast } from 'sonner';

const AVAILABLE_ENTITIES = [
  'AssessmentSession', 'UserProfile', 'UserProgress', 'PilarAssessment',
  'UserAnalytics', 'SessionAnalytics', 'GroupAnalytics', 'ForcePromptCard',
  'AssessmentGuidance', 'CmsContent', 'DataEnrichmentRecommendation'
];

export default function AdminAnalytics() {
  const [selectedEntity, setSelectedEntity] = useState('AssessmentSession');
  const [activeWidgets, setActiveWidgets] = useState(['usage', 'quality', 'trends']);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const { data: entityAnalysis, isLoading: isAnalyzing, refetch: refetchAnalysis } = useQuery({
    queryKey: ['entityAnalysis', selectedEntity],
    queryFn: async () => {
      const response = await base44.functions.invoke('analyzeEntityUsage', {
        entity_name: selectedEntity,
        analysis_type: 'comprehensive'
      });
      return response.data;
    },
    enabled: !!user && user.role === 'admin'
  });

  const { data: recommendations, refetch: refetchRecommendations } = useQuery({
    queryKey: ['dataRecommendations'],
    queryFn: () => base44.entities.DataEnrichmentRecommendation.filter({ status: 'pending' }),
    enabled: !!user && user.role === 'admin'
  });

  const { data: mlInsights, isLoading: isLoadingML, refetch: refetchMLInsights } = useQuery({
    queryKey: ['mlInsights'],
    queryFn: async () => {
      const response = await base44.functions.invoke('generateMLInsights');
      return response.data;
    },
    enabled: !!user && user.role === 'admin',
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const handleAskAgent = async () => {
    if (!chatMessage.trim()) return;

    const userMsg = { role: 'user', content: chatMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setChatMessage('');

    try {
      // Create conversation with data enrichment agent
      const conversation = await base44.agents.createConversation({
        agent_name: 'data_enrichment_agent',
        metadata: {
          context: 'admin_analytics',
          selected_entity: selectedEntity
        }
      });

      // Add message
      await base44.agents.addMessage(conversation, {
        role: 'user',
        content: `Context: Analyzing ${selectedEntity} entity.\n\nQuestion: ${chatMessage}`
      });

      // Get response
      const updatedConversation = await base44.agents.getConversation(conversation.id);
      const lastMessage = updatedConversation.messages[updatedConversation.messages.length - 1];

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: lastMessage.content
      }]);

    } catch (error) {
      console.error('Agent query error:', error);
      toast.error('Failed to query agent');
    }
  };

  const toggleWidget = (widgetId) => {
    setActiveWidgets(prev => 
      prev.includes(widgetId) 
        ? prev.filter(w => w !== widgetId)
        : [...prev, widgetId]
    );
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <p className="text-zinc-400">Admin access required</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F12] py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Admin Analytics</h1>
            <p className="text-zinc-400">AI-powered data insights and entity management</p>
          </div>
          <Button
            onClick={() => {
              refetchAnalysis();
              refetchRecommendations();
              refetchMLInsights();
            }}
            variant="outline"
            className="border-violet-500/30 hover:bg-violet-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh All
          </Button>
        </motion.div>

        {/* Entity Selector & Widget Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-white/10 rounded-2xl p-6 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
        >
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-zinc-400">Analyzing:</span>
            </div>
            <Select value={selectedEntity} onValueChange={setSelectedEntity}>
              <SelectTrigger className="w-64 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_ENTITIES.map(entity => (
                  <SelectItem key={entity} value={entity}>{entity}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex gap-2">
              {[
                { id: 'usage', icon: BarChart3, label: 'Usage' },
                { id: 'quality', icon: TrendingUp, label: 'Quality' },
                { id: 'trends', icon: TrendingUp, label: 'Trends' },
                { id: 'ai', icon: Brain, label: 'AI Insights' }
              ].map(widget => (
                <Button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  variant={activeWidgets.includes(widget.id) ? 'default' : 'outline'}
                  size="sm"
                  className={activeWidgets.includes(widget.id) 
                    ? 'bg-violet-500 hover:bg-violet-600' 
                    : 'border-white/10 hover:bg-white/5'}
                >
                  <widget.icon className="w-4 h-4 mr-2" />
                  {widget.label}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ML Insights Dashboard */}
        {mlInsights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MLSummaryCard
                icon={Users}
                label="User Engagement"
                value={`${mlInsights.insights?.engagement?.summary?.avgEngagementScore || 0}%`}
                trend={mlInsights.insights?.engagement?.trend?.direction}
                color="text-blue-400"
              />
              <MLSummaryCard
                icon={Target}
                label="Skill Gap Areas"
                value={mlInsights.insights?.skillGaps?.summary?.pillarsWithGaps || 0}
                subtitle="pillars need focus"
                color="text-amber-400"
              />
              <MLSummaryCard
                icon={TrendingUp}
                label="Team Performance"
                value={`${mlInsights.insights?.teamPerformance?.summary?.avgPerformance || 0}%`}
                subtitle="avg performance"
                color="text-emerald-400"
              />
              <MLSummaryCard
                icon={AlertTriangle}
                label="Churn Risk"
                value={mlInsights.insights?.churnRisk?.summary?.highRisk || 0}
                subtitle="high risk users"
                color="text-red-400"
              />
            </div>

            {/* Detailed Insights Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Insights */}
              <InsightCard
                title="User Engagement Analysis"
                icon={Users}
                data={mlInsights.insights?.engagement}
                isLoading={isLoadingML}
              />

              {/* Skill Gaps */}
              <InsightCard
                title="Skill Gap Analysis"
                icon={Target}
                data={mlInsights.insights?.skillGaps}
                isLoading={isLoadingML}
              />

              {/* Team Performance */}
              <InsightCard
                title="Team Performance Trends"
                icon={TrendingUp}
                data={mlInsights.insights?.teamPerformance}
                isLoading={isLoadingML}
              />

              {/* Churn Risk */}
              <InsightCard
                title="Churn Risk Prediction"
                icon={AlertTriangle}
                data={mlInsights.insights?.churnRisk}
                isLoading={isLoadingML}
              />
            </div>
          </motion.div>
        )}

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeWidgets.includes('usage') && (
            <EntityUsageWidget 
              analysis={entityAnalysis}
              isLoading={isAnalyzing}
            />
          )}
          {activeWidgets.includes('quality') && (
            <DataQualityWidget 
              analysis={entityAnalysis}
              isLoading={isAnalyzing}
            />
          )}
          {activeWidgets.includes('trends') && (
            <GrowthTrendsWidget 
              analysis={entityAnalysis}
              isLoading={isAnalyzing}
            />
          )}
          {activeWidgets.includes('ai') && (
            <AIInsightsWidget 
              entityName={selectedEntity}
              analysis={entityAnalysis}
            />
          )}
        </div>

        {/* Agent Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-violet-500/20 rounded-2xl p-6 bg-gradient-to-br from-violet-500/5 to-transparent backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-violet-400" />
            <h2 className="text-xl font-semibold text-white">Ask the Data Agent</h2>
          </div>

          <div className="space-y-4">
            <div className="max-h-64 overflow-y-auto space-y-3">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.role === 'user' 
                      ? 'bg-violet-500/20 ml-12' 
                      : 'bg-white/5 mr-12'
                  }`}
                >
                  <p className="text-sm text-white whitespace-pre-wrap">{msg.content}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAskAgent()}
                placeholder={`Ask about ${selectedEntity} data patterns, opportunities, or recommendations...`}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50"
              />
              <Button
                onClick={handleAskAgent}
                className="bg-gradient-to-r from-violet-500 to-pink-500"
              >
                <Brain className="w-4 h-4 mr-2" />
                Ask Agent
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Recommendations Panel */}
        <RecommendationsPanel 
          recommendations={recommendations}
          onRefresh={refetchRecommendations}
        />
      </div>
    </div>
  );
}

function MLSummaryCard({ icon: Icon, label, value, subtitle, trend, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/10 p-4"
    >
      <div className="flex items-start justify-between mb-2">
        <Icon className={`w-5 h-5 ${color}`} />
        {trend && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            trend === 'increasing' ? 'bg-emerald-500/20 text-emerald-400' :
            trend === 'decreasing' ? 'bg-red-500/20 text-red-400' :
            'bg-zinc-500/20 text-zinc-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-zinc-400">{subtitle || label}</p>
    </motion.div>
  );
}

function InsightCard({ title, icon: Icon, data, isLoading }) {
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/10 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-20 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/10 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      
      <div className="space-y-3">
        {/* Summary */}
        {data?.summary && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(data.summary).map(([key, value]) => (
              <div key={key} className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-zinc-500 mb-1">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </p>
                <p className="text-lg font-semibold text-white">
                  {typeof value === 'number' ? value : value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Top items */}
        {data?.topEngagedUsers && data.topEngagedUsers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-medium">Top Engaged Users</p>
            {data.topEngagedUsers.slice(0, 3).map((user, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <span className="text-sm text-zinc-300">{user.email}</span>
                <span className="text-sm font-semibold text-violet-400">{user.engagementScore}</span>
              </div>
            ))}
          </div>
        )}

        {data?.pillarAnalysis && data.pillarAnalysis.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-medium">Pillar Performance</p>
            {data.pillarAnalysis.slice(0, 3).map((pillar, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <span className="text-sm text-zinc-300">{pillar.pillar}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{pillar.avgScore}%</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    pillar.gap === 'minimal' ? 'bg-emerald-500/20 text-emerald-400' :
                    pillar.gap === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {pillar.gap}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data?.topPerformingGroups && data.topPerformingGroups.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-medium">Top Performing Teams</p>
            {data.topPerformingGroups.slice(0, 3).map((group, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <span className="text-sm text-zinc-300">{group.group_name}</span>
                <span className="text-sm font-semibold text-emerald-400">{group.performanceScore}%</span>
              </div>
            ))}
          </div>
        )}

        {data?.highRiskUsers && data.highRiskUsers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400 font-medium">High Risk Users</p>
            {data.highRiskUsers.slice(0, 3).map((user, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                <span className="text-sm text-zinc-300">{user.email}</span>
                <span className="text-sm font-semibold text-red-400">{user.churnRisk}% risk</span>
              </div>
            ))}
          </div>
        )}

        {/* Recommendations */}
        {data?.recommendations && data.recommendations.length > 0 && (
          <div className="mt-4 p-3 bg-violet-500/10 rounded-lg border border-violet-500/30">
            <p className="text-xs text-violet-400 font-medium mb-2">
              <Sparkles className="w-3 h-3 inline mr-1" />
              Recommendations
            </p>
            <ul className="space-y-1">
              {data.recommendations.slice(0, 2).map((rec, idx) => (
                <li key={idx} className="text-xs text-zinc-300">• {rec.suggestion || rec.action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}