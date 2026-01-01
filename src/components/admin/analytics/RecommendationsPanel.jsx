import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function RecommendationsPanel({ recommendations = [], onRefresh }) {
  const updateRecommendationMutation = useMutation({
    mutationFn: ({ id, status }) => 
      base44.entities.DataEnrichmentRecommendation.update(id, { 
        status,
        reviewed_at: new Date().toISOString()
      }),
    onSuccess: () => {
      onRefresh();
      toast.success('Recommendation updated');
    }
  });

  const handleApprove = (rec) => {
    updateRecommendationMutation.mutate({ id: rec.id, status: 'approved' });
  };

  const handleReject = (rec) => {
    updateRecommendationMutation.mutate({ id: rec.id, status: 'rejected' });
  };

  const priorityColors = {
    9: 'red',
    10: 'red',
    7: 'amber',
    8: 'amber',
    5: 'blue',
    6: 'blue',
    default: 'zinc'
  };

  const typeIcons = {
    create_entity: '➕',
    modify_entity: '✏️',
    enrich_data: '💎',
    delete_candidate: '🗑️',
    relationship: '🔗',
    optimization: '⚡'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="border border-amber-500/20 rounded-2xl p-6 bg-gradient-to-br from-amber-500/5 to-transparent backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        <h2 className="text-xl font-semibold text-white">Agent Recommendations</h2>
        <span className="ml-auto text-sm text-zinc-400">{recommendations.length} pending</span>
      </div>

      <div className="space-y-4">
        {recommendations.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">No pending recommendations</p>
        ) : (
          recommendations.map((rec, idx) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{typeIcons[rec.recommendation_type]}</span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">
                      {rec.entity_name}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400">
                      {rec.recommendation_type.replace(/_/g, ' ')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full bg-${priorityColors[rec.priority] || priorityColors.default}-500/20 text-${priorityColors[rec.priority] || priorityColors.default}-400`}>
                      Priority: {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300">{rec.rationale}</p>
                  <p className="text-xs text-zinc-500">{rec.business_impact}</p>
                  
                  {rec.recommendation_type === 'delete_candidate' && (
                    <div className="flex items-center gap-2 text-xs text-amber-400 mt-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Admin review required for deletion</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(rec)}
                    size="sm"
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => handleReject(rec)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/30 hover:bg-red-500/10 text-red-400"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}