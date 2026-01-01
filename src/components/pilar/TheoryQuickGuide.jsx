import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Zap, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TheoryQuickGuide({ onOpenModal }) {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20"
      >
        <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
          <Target className="w-6 h-6 text-violet-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">5 Pillars</h3>
        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
          Purpose, Interpersonal, Learning, Action, Resilience - the 5 dimensions every team navigates daily.
        </p>
        <button
          onClick={() => onOpenModal?.('pillars')}
          className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-2"
        >
          Learn more <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-amber-500/10 border border-indigo-500/20"
      >
        <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4">
          <Users className="w-6 h-6 text-indigo-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">2 Modes</h3>
        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
          Egalitarian (shared power) and Hierarchical (concentrated authority) - teams need both, used at the right time.
        </p>
        <button
          onClick={() => onOpenModal?.('modes')}
          className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-2"
        >
          Learn more <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20"
      >
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4">
          <Zap className="w-6 h-6 text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-3">20 Forces</h3>
        <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
          The psychological forces driving team behavior - 4 forces per pillar, 2 for each mode.
        </p>
        <button
          onClick={() => onOpenModal?.('forces')}
          className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-2"
        >
          Learn more <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Visual Summary */}
      <div className="md:col-span-3 p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-white font-semibold mb-4 text-center">How It Fits Together</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-violet-400">5</span>
            </div>
            <p className="text-zinc-400">Pillars</p>
          </div>
          <span className="text-zinc-600 text-2xl hidden md:block">×</span>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-indigo-400">2</span>
            </div>
            <p className="text-zinc-400">Modes</p>
          </div>
          <span className="text-zinc-600 text-2xl hidden md:block">=</span>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl font-bold text-amber-400">20</span>
            </div>
            <p className="text-zinc-400">Forces</p>
          </div>
        </div>
        <p className="text-center text-xs text-zinc-500 mt-4">
          Each pillar operates differently in egalitarian vs hierarchical mode, creating 20 distinct psychological forces
        </p>
      </div>
    </div>
  );
}