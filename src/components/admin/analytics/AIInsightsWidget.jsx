import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AIInsightsWidget({ entityName, analysis }) {
  const [insights, setInsights] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateInsights = async () => {
    setIsGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this entity data and provide key insights, opportunities, and recommendations:

Entity: ${entityName}
Total Records: ${analysis?.record_count || 0}

Field Usage Analysis:
${JSON.stringify(analysis?.analysis?.field_usage, null, 2)}

Data Quality Metrics:
${JSON.stringify(analysis?.analysis?.data_quality, null, 2)}

Provide:
1. Top 3 data insights
2. Potential improvement opportunities
3. Machine learning readiness assessment
4. Recommendations for better data utilization`,
        response_json_schema: {
          type: 'object',
          properties: {
            key_insights: {
              type: 'array',
              items: { type: 'string' }
            },
            opportunities: {
              type: 'array',
              items: { type: 'string' }
            },
            ml_readiness: {
              type: 'object',
              properties: {
                score: { type: 'number' },
                notes: { type: 'string' }
              }
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      setInsights(response);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="border border-violet-500/20 rounded-2xl p-6 bg-gradient-to-br from-violet-500/5 to-transparent backdrop-blur-sm lg:col-span-2"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-white">AI Insights</h3>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isGenerating}
          size="sm"
          className="bg-gradient-to-r from-violet-500 to-pink-500"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          Generate Insights
        </Button>
      </div>

      {insights ? (
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-semibold text-emerald-400 mb-2">Key Insights</h4>
            <ul className="space-y-2">
              {insights.key_insights?.map((insight, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex gap-2">
                  <span className="text-violet-400">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-blue-400 mb-2">Opportunities</h4>
            <ul className="space-y-2">
              {insights.opportunities?.map((opp, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex gap-2">
                  <span className="text-violet-400">•</span>
                  {opp}
                </li>
              ))}
            </ul>
          </div>

          {insights.ml_readiness && (
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">ML Readiness Score</span>
                <span className="text-2xl font-bold text-violet-400">
                  {insights.ml_readiness.score}/10
                </span>
              </div>
              <p className="text-xs text-zinc-500">{insights.ml_readiness.notes}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-semibold text-amber-400 mb-2">Recommendations</h4>
            <ul className="space-y-2">
              {insights.recommendations?.map((rec, idx) => (
                <li key={idx} className="text-sm text-zinc-300 flex gap-2">
                  <span className="text-violet-400">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-violet-400/30 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Click "Generate Insights" to analyze entity data with AI</p>
        </div>
      )}
    </motion.div>
  );
}