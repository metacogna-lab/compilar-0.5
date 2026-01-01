import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Lightbulb, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function RemedialPanel({ isOpen, onClose, concepts, pillar, mode }) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && concepts.length > 0) {
      generateRemedialContent();
    }
  }, [isOpen, concepts]);

  const generateRemedialContent = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('pilarRagQuery', {
        query: `Explain these concepts in simple terms: ${concepts.join(', ')}`,
        pillar,
        mode,
        pageContent: `Remedial help for ${pillar}`,
        pageTitle: 'Concept Review'
      });

      if (response.data?.success && response.data?.context) {
        setSummary(response.data.context);
      }
    } catch (error) {
      console.error('Failed to generate remedial content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-l border-amber-500/30 shadow-2xl z-50 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">Let's Review</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-200">
                  It looks like you could use some extra context on these concepts. Let's break them down together.
                </p>
              </div>

              {concepts.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3">Concepts to Review:</h4>
                  <div className="space-y-2">
                    {concepts.map((concept, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                      >
                        <BookOpen className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-white">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                </div>
              ) : summary ? (
                <div className="bg-white/10 rounded-xl p-5 border border-white/10">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Simplified Explanation
                  </h4>
                  <div className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {summary}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={onClose}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Got It, Let's Continue
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}