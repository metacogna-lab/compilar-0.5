import React from 'react';
import { cn } from '@/lib/utils';

export default function ForcePromptCard({ forceData, effectForces = [] }) {
  if (!forceData) return null;

  const getEffectColors = (delta) => {
    if (delta < 0) return 'bg-red-500/10 border-red-500/30 text-red-300';
    if (delta > 0) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    return 'bg-zinc-500/10 border-zinc-500/30 text-zinc-300';
  };

  const getCardBackgroundColor = (mode) => {
    return mode === 'Hierarchical' 
      ? 'from-red-500/5 to-red-600/5' 
      : 'from-emerald-500/5 to-emerald-600/5';
  };

  return (
    <div className={cn(
      "bg-gradient-to-br rounded-2xl border-2 border-white/20 p-6 shadow-xl w-full",
      getCardBackgroundColor(forceData.mode)
    )}>
      {/* Header */}
      <div className="text-center mb-4">
        <p className="text-lg font-bold text-white mb-1">{forceData.mode} Reaction</p>
        <p className="text-sm text-zinc-300 font-semibold">{forceData.force_from} → {forceData.force_to}</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <p className="text-xs text-zinc-400">Type: {forceData.type}</p>
          <span className="text-zinc-600">•</span>
          <p className="text-xs text-zinc-400">Effect Range: {forceData.effect_low_1_2} to {forceData.effect_high_9_10}</p>
        </div>
      </div>

      {/* Force Name */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-white">{forceData.name}</h3>
      </div>

      {/* Effect Forces */}
      {effectForces && effectForces.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-zinc-300 mb-2 text-center">Effect Forces</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {effectForces.map((ef, index) => (
              <span key={index} className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {ef}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Effect Bands */}
      <div className="space-y-3">
        {/* High Effects */}
        <div className={cn("p-4 rounded-lg border", getEffectColors(forceData.effect_high_7_8))}>
          <div className="flex justify-center gap-4 mb-2">
            <span className="text-sm font-semibold">
              6 → {forceData.effect_high_7_8 === 0 ? (forceData.type === 'Inverse' ? '-0' : '+0') : ''}
              {forceData.effect_high_7_8 !== 0 && (forceData.effect_high_7_8 > 0 ? '+' : '')}{forceData.effect_high_7_8 !== 0 ? forceData.effect_high_7_8 : ''}
            </span>
            <span className="text-sm font-semibold">
              7-8 → {forceData.effect_high_7_8 > 0 ? '+' : ''}{forceData.effect_high_7_8}
            </span>
            <span className="text-sm font-semibold">
              9-10 → {forceData.effect_high_9_10 > 0 ? '+' : ''}{forceData.effect_high_9_10}
            </span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">{forceData.description_high}</p>
        </div>

        {/* Low Effects */}
        <div className={cn("p-4 rounded-lg border", getEffectColors(forceData.effect_low_1_2))}>
          <div className="flex justify-center gap-4 mb-2">
            <span className="text-sm font-semibold">
              1-2 → {forceData.effect_low_1_2 > 0 ? '+' : ''}{forceData.effect_low_1_2}
            </span>
            <span className="text-sm font-semibold">
              3-4 → {forceData.effect_low_3_4 > 0 ? '+' : ''}{forceData.effect_low_3_4}
            </span>
            <span className="text-sm font-semibold">
              5 → {forceData.effect_low_3_4 === 0 ? (forceData.type === 'Inverse' ? '+0' : '-0') : ''}
              {forceData.effect_low_3_4 !== 0 && (forceData.effect_low_3_4 > 0 ? '+' : '')}{forceData.effect_low_3_4 !== 0 ? 0 : ''}
            </span>
          </div>
          <p className="text-xs text-zinc-200 leading-relaxed">{forceData.description_low}</p>
        </div>
      </div>
    </div>
  );
}