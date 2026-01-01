import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function DataQualityWidget({ analysis, isLoading }) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border border-white/10 rounded-2xl p-6 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      </motion.div>
    );
  }

  const quality = analysis?.analysis?.data_quality || {};
  const totalRecords = quality.total_records || 0;

  const metrics = [
    {
      label: 'Total Records',
      value: totalRecords,
      color: 'violet'
    },
    {
      label: 'With Created Date',
      value: quality.records_with_created_date || 0,
      percentage: totalRecords ? ((quality.records_with_created_date / totalRecords) * 100).toFixed(1) : 0,
      color: 'emerald'
    },
    {
      label: 'With Created By',
      value: quality.records_with_created_by || 0,
      percentage: totalRecords ? ((quality.records_with_created_by / totalRecords) * 100).toFixed(1) : 0,
      color: 'blue'
    },
    {
      label: 'Avg Fields Populated',
      value: quality.avg_fields_populated || 0,
      color: 'amber'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="border border-white/10 rounded-2xl p-6 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm"
    >
      <div className="flex items-center gap-2 mb-6">
        <CheckCircle2 className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Data Quality</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={`p-4 rounded-lg bg-gradient-to-br from-${metric.color}-500/10 to-transparent border border-${metric.color}-500/20`}
          >
            <p className="text-xs text-zinc-400 mb-1">{metric.label}</p>
            <p className="text-2xl font-bold text-white">{metric.value}</p>
            {metric.percentage && (
              <p className="text-xs text-emerald-400 mt-1">{metric.percentage}%</p>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}