import React from 'react';
import { motion } from 'framer-motion';
import { Users, Crown, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SimpleModeComparison({ onLearnMore }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Egalitarian */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Egalitarian Mode</h3>
        </div>

        <p className="text-sm text-zinc-400 mb-4">
          Distributed power, group focus, shared decision-making
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">✓</span>
            <span className="text-sm text-zinc-300">Best for planning and innovation</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">✓</span>
            <span className="text-sm text-zinc-300">High psychological safety</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">✓</span>
            <span className="text-sm text-zinc-300">Everyone contributes ideas</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-indigo-400 mt-1">✓</span>
            <span className="text-sm text-zinc-300">Unconditional helping</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <p className="text-xs text-indigo-200 italic">
            "We decide together, we succeed together"
          </p>
        </div>
      </motion.div>

      {/* Hierarchical */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-white">Hierarchical Mode</h3>
        </div>

        <p className="text-sm text-zinc-400 mb-4">
          Concentrated authority, individual focus, clear command
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">✓</span>
            <span className="text-sm text-zinc-300">Best for crisis response</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">✓</span>
            <span className="text-sm text-zinc-300">Fast decision-making</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">✓</span>
            <span className="text-sm text-zinc-300">Clear accountability</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-amber-400 mt-1">✓</span>
            <span className="text-sm text-zinc-300">Efficient execution</span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <p className="text-xs text-amber-200 italic">
            "Leader decides, team executes with discipline"
          </p>
        </div>
      </motion.div>

      {/* The Key Insight */}
      <div className="md:col-span-2 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">The Key: Know When to Shift</h3>
          <Info className="w-5 h-5 text-violet-400" />
        </div>
        <p className="text-sm text-zinc-400 mb-4">
          Neither mode is "better" - they're tools for different contexts. The best teams practice <span className="text-violet-400 font-semibold">Mission Command Agility</span>: 
          deliberately shifting between modes based on the situation.
        </p>
        <div className="flex flex-wrap gap-3">
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-300">Planning → Egalitarian</span>
          <ArrowRight className="w-4 h-4 text-zinc-500" />
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-300">Execution → Hierarchical</span>
          <ArrowRight className="w-4 h-4 text-zinc-500" />
          <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-zinc-300">Debrief → Egalitarian</span>
        </div>
      </div>
    </div>
  );
}