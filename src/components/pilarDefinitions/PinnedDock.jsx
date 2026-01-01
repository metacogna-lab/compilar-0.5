import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pin, X, Eye, Book } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function PinnedDock({ items, onUnpin, onFocus, onOpenGuided, interactiveView }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 shadow-2xl">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4 text-violet-400" />
          <span className="text-xs text-zinc-400 mr-2">Pinned ({items.length})</span>
          
          <div className="flex items-center gap-2">
            <AnimatePresence>
              {items.map((item) => (
                <TooltipProvider key={item.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        className="relative group"
                      >
                        <button
                          onClick={() => interactiveView === 'explore' ? onFocus(item) : onOpenGuided(item)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
                        >
                          <span className="text-xs font-medium text-white">{item.id}</span>
                          {interactiveView === 'explore' ? (
                            <Eye className="w-3 h-3 text-violet-400" />
                          ) : (
                            <Book className="w-3 h-3 text-violet-400" />
                          )}
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUnpin(item);
                          }}
                          className="absolute -top-1 -right-1 p-0.5 rounded-full bg-red-500/80 hover:bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{item.construct}</p>
                      <p className="text-xs text-zinc-400 mt-1">Click to {interactiveView === 'explore' ? 'focus' : 'open in guided'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}