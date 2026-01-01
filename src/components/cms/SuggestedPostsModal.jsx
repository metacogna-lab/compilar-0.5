import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SuggestedPostsModal({ isOpen, suggestions, onClose, onSelect }) {
  if (!isOpen || !suggestions) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-[#0F0F12] border border-white/20 rounded-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Suggested Blog Posts</h3>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)] space-y-4">
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="p-4 bg-white/5 border border-white/10 rounded-lg hover:border-violet-500/30 transition-colors"
              >
                <h4 className="text-lg font-semibold text-white mb-2">{suggestion.title}</h4>
                <p className="text-sm text-zinc-400 mb-3">{suggestion.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {suggestion.tags.split(',').map((tag, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-1 bg-violet-500/20 text-violet-300 rounded"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={() => onSelect(suggestion)}
                    size="sm"
                    className="bg-violet-500 hover:bg-violet-600"
                  >
                    Use This
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}