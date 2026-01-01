import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ModeOverviewPanel({ data, blendRatio = 0, egalitarianData, hierarchicalData }) {
  const isEgalitarian = data.mode === 'egalitarian';
  const isTransitioning = blendRatio > 0.1 && blendRatio < 0.9;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        backgroundColor: isTransitioning 
          ? 'rgba(139, 92, 246, 0.05)' 
          : isEgalitarian 
            ? 'rgba(99, 102, 241, 0.05)' 
            : 'rgba(245, 158, 11, 0.05)',
        borderColor: isTransitioning
          ? 'rgba(139, 92, 246, 0.2)'
          : isEgalitarian 
            ? 'rgba(99, 102, 241, 0.2)' 
            : 'rgba(245, 158, 11, 0.2)'
      }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border backdrop-blur-sm p-6"
    >
      <div className="mb-4">
        <motion.h2 
          className="text-2xl font-bold text-white mb-2"
          key={data.displayName}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {data.displayName}
        </motion.h2>
        <motion.p 
          className="text-zinc-400 leading-relaxed"
          key={data.summary}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          {data.summary}
        </motion.p>
      </div>

      {/* Guiding Questions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className={cn(
            'w-5 h-5',
            isEgalitarian ? 'text-indigo-400' : 'text-amber-400'
          )} />
          <h3 className="text-white font-semibold">Guiding Questions</h3>
        </div>
        <ul className="space-y-2">
          {data.guidingQuestions.map((q, i) => (
            <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
              <span className={cn(
                'mt-0.5',
                isEgalitarian ? 'text-indigo-400' : 'text-amber-400'
              )}>→</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Strengths & Risks */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h4 className="text-white font-semibold">Strengths</h4>
          </div>
          <ul className="space-y-1.5">
            {data.strengths.map((s, i) => (
              <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h4 className="text-white font-semibold">Risks</h4>
          </div>
          <ul className="space-y-1.5">
            {data.risks.map((r, i) => (
              <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                <span className="text-red-400 mt-0.5">!</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}