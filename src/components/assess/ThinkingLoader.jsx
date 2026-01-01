import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Loader2 } from 'lucide-react';

/**
 * ThinkingLoader - Displays animated thinking steps from LLM analysis
 * Shows the AI's reasoning process with smooth fade animations
 */
export default function ThinkingLoader({ isVisible, message, thinkingSteps = [] }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState([]);

  useEffect(() => {
    if (thinkingSteps.length > 0) {
      setVisibleSteps([thinkingSteps[0]]);
      setCurrentStepIndex(0);
    }
  }, [thinkingSteps]);

  useEffect(() => {
    if (thinkingSteps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        const next = (prev + 1) % thinkingSteps.length;
        setVisibleSteps((steps) => {
          // Keep last 3 steps visible
          const newSteps = [...steps, thinkingSteps[next]];
          return newSteps.slice(-3);
        });
        return next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [thinkingSteps]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative max-w-2xl w-full mx-4 p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-3xl border border-slate-700/50 shadow-2xl"
        >
          {/* Ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 rounded-3xl blur-xl" />
          
          {/* Content */}
          <div className="relative z-10">
            {/* Icon and title */}
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-r from-violet-500/30 to-cyan-500/30 rounded-full blur-xl"
                />
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600">
                  <Brain className="w-10 h-10 text-violet-400" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles className="w-6 h-6 text-cyan-400" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Main message */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {message || 'Analyzing your goal...'}
              </h2>
              <p className="text-slate-400 text-sm">
                Mapping relevant pillars and forces
              </p>
            </div>

            {/* Thinking steps */}
            <div className="space-y-3 min-h-[180px]">
              <AnimatePresence mode="popLayout">
                {visibleSteps.map((step, index) => (
                  <motion.div
                    key={`${step}-${index}`}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ 
                      opacity: index === visibleSteps.length - 1 ? 1 : 0.5,
                      y: 0,
                      filter: "blur(0px)"
                    }}
                    exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className={`p-4 rounded-xl border ${
                      index === visibleSteps.length - 1
                        ? 'bg-gradient-to-r from-violet-500/10 to-cyan-500/10 border-violet-500/30'
                        : 'bg-slate-800/50 border-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${
                        index === visibleSteps.length - 1 ? 'text-violet-400' : 'text-slate-500'
                      }`}>
                        {index === visibleSteps.length - 1 ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-current" />
                        )}
                      </div>
                      <p className={`text-sm leading-relaxed ${
                        index === visibleSteps.length - 1 ? 'text-white' : 'text-slate-400'
                      }`}>
                        {step}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Progress indicator */}
            <div className="mt-8 flex justify-center gap-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className="w-2 h-2 rounded-full bg-violet-400"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}