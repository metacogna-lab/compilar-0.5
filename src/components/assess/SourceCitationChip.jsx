import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SourceCitationChip({ source, onViewSource }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!source) return null;

  const sourceTitle = source.metadata?.source || 'PILAR Framework';
  const chapter = source.metadata?.chapter || '';
  const complexity = source.metadata?.complexity_level || 'intermediate';

  const complexityColors = {
    basic: 'bg-green-500/20 text-green-400 border-green-500/30',
    intermediate: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <>
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs hover:bg-violet-500/20 transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        <span>Reference: {sourceTitle}</span>
      </motion.button>

      {/* Source Detail Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-[#1a1a1f] to-[#0F0F12] border border-white/20 rounded-2xl shadow-2xl p-6 z-[101]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="mb-4">
                <h3 className="text-xl font-bold text-white mb-2">{sourceTitle}</h3>
                {chapter && (
                  <p className="text-sm text-zinc-400 mb-2">{chapter}</p>
                )}
                <span className={`inline-block px-2 py-1 rounded text-xs border ${complexityColors[complexity]}`}>
                  {complexity.charAt(0).toUpperCase() + complexity.slice(1)} Level
                </span>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {source.content}
                </p>
              </div>

              {source.metadata?.keywords && source.metadata.keywords.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-zinc-500 mb-2">Keywords:</p>
                  <div className="flex flex-wrap gap-2">
                    {source.metadata.keywords.map((keyword, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-white/5 text-xs text-zinc-400"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  variant="outline"
                  className="border-violet-500/30 hover:bg-violet-500/10"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}