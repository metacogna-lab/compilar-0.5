import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Loader2 } from 'lucide-react';

export default function EntityUsageWidget({ analysis, isLoading }) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-white/10 rounded-2xl p-6 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      </motion.div>
    );
  }

  const fieldUsage = analysis?.analysis?.field_usage || {};
  const topFields = Object.entries(fieldUsage)
    .sort((a, b) => parseFloat(b[1].population_rate) - parseFloat(a[1].population_rate))
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-white/10 rounded-2xl p-6 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Field Usage</h3>
      </div>

      <div className="space-y-4">
        {topFields.map(([fieldName, stats]) => (
          <div key={fieldName} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-300">{fieldName}</span>
              <span className="text-xs text-emerald-400">{stats.population_rate}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all"
                style={{ width: `${stats.population_rate}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{stats.populated_count} populated</span>
              <span>{stats.unique_count} unique</span>
            </div>
          </div>
        ))}
      </div>

      {topFields.length === 0 && (
        <p className="text-center text-zinc-500 py-8">No field data available</p>
      )}
    </motion.div>
  );
}