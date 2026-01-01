import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, Lightbulb, ArrowRight, CheckCircle2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { highlightPillarsInText, getPillarColor } from '@/components/utils/pilarUtils';

export default function AICoachingFeedback({ coaching, onContinue }) {
  if (!coaching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-violet-400 animate-pulse mx-auto mb-4" />
          <p className="text-zinc-400">Generating personalized coaching...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-500/20 to-pink-500/10 rounded-2xl p-6 border border-violet-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-violet-500/20">
            <Sparkles className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">Your AI Coach Says:</h3>
            <p 
              className="text-zinc-300 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightPillarsInText(coaching.summary) }}
            />
          </div>
        </div>
      </motion.div>

      {/* Strengths */}
      {coaching.strengths_identified?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-2xl p-6 border border-green-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h4 className="text-base font-bold text-white">Strengths Identified</h4>
          </div>
          <ul className="space-y-2">
            {coaching.strengths_identified.map((strength, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                <span className="text-sm text-zinc-300">{strength}</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Growth Areas */}
      {coaching.growth_areas?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-2xl p-6 border border-amber-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h4 className="text-base font-bold text-white">Growth Opportunities</h4>
          </div>
          <div className="space-y-4">
            {coaching.growth_areas.map((area, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="bg-white/5 rounded-lg p-4 border border-white/10"
              >
                <p className="text-sm font-semibold text-white mb-1">{area.area}</p>
                <p 
                  className="text-xs text-zinc-400 mb-2"
                  dangerouslySetInnerHTML={{ __html: highlightPillarsInText(area.explanation) }}
                />
                {area.focus_force && (
                  <span className="inline-block text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-2">
                    Focus: {area.focus_force}
                  </span>
                )}
                {area.tags && area.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {area.tags.map((tag, tagIdx) => (
                      <span 
                        key={tagIdx}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400 border border-white/10"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actionable Steps */}
      {coaching.actionable_steps?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Target className="w-5 h-5 text-blue-400" />
            <h4 className="text-base font-bold text-white">Your Next Steps</h4>
          </div>
          <div className="space-y-2">
            {coaching.actionable_steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <span className="text-sm text-zinc-300">{step}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recommended Pillars */}
      {coaching.recommended_pillars?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500/20 to-indigo-500/10 rounded-2xl p-6 border border-purple-500/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-5 h-5 text-purple-400" />
            <h4 className="text-base font-bold text-white">Explore Next</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {coaching.recommended_pillars.map((pillar, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.1 }}
                className="px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm border border-purple-500/30"
              >
                {pillar}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational Insight */}
      {coaching.motivational_insight && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-6 border border-white/10"
        >
          <p 
            className="text-sm text-zinc-300 italic leading-relaxed text-center"
            dangerouslySetInnerHTML={{ __html: `"${highlightPillarsInText(coaching.motivational_insight)}"` }}
          />
        </motion.div>
      )}

      {/* Identified Tags */}
      {coaching.identified_tags && coaching.identified_tags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-gradient-to-br from-white/5 to-white/3 rounded-2xl p-6 border border-white/10"
        >
          <div className="flex items-center gap-3 mb-4">
            <Tag className="w-5 h-5 text-zinc-400" />
            <h4 className="text-base font-bold text-white">Related Concepts</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {coaching.identified_tags.map((tag, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + idx * 0.05 }}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-zinc-300 text-xs border border-white/10 hover:bg-white/10 transition-colors"
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="pt-4"
      >
        <Button
          onClick={onContinue}
          className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white py-6 text-lg"
        >
          Continue Learning
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}