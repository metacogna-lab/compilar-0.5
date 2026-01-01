import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin, ChevronRight, Book, FileText, Link as LinkIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function GuidedDrawer({ entity, adaptedData, onClose, onPin, isPinned }) {
  const [currentChapter, setCurrentChapter] = useState(0);
  
  const connections = adaptedData.connectedEntities(entity.id);
  const depth2Connections = adaptedData.depth2Connections(entity.id);
  
  const chapters = [
    {
      id: 'definition',
      title: 'Definition',
      icon: Book,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-violet-400 mb-2">Core Concept</h4>
            <p className="text-sm text-zinc-300">{entity.definition}</p>
          </div>
          
          {entity.mechanism && (
            <div>
              <h4 className="text-sm font-semibold text-violet-400 mb-2">Mechanism</h4>
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Focus</p>
                  <p className="text-sm text-zinc-300">{entity.mechanism.focus}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Engagement</p>
                  <p className="text-sm text-zinc-300">{entity.mechanism.engagement}</p>
                </div>
              </div>
            </div>
          )}

          {entity.counterpart && (
            <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
              <p className="text-xs text-amber-400 font-semibold mb-1">Counterpart Mode</p>
              <p className="text-sm text-zinc-300">{entity.counterpart}</p>
            </div>
          )}
        </div>
      )
    },
    {
      id: 'evidence',
      title: 'Evidence & Notes',
      icon: FileText,
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-violet-400 mb-3">
              {entity.forces ? 'Forces' : 'Subdomains'}
            </h4>
            <div className="space-y-2">
              {(entity.forces || entity.subdomains || []).map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10"
                >
                  <p className="text-sm font-medium text-white mb-1">{item.name}</p>
                  <p className="text-xs text-zinc-400">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'connections',
      title: 'Connections',
      icon: LinkIcon,
      content: (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-violet-400 mb-3">
            Direct Connections ({connections.length})
          </h4>
          
          <div className="space-y-2">
            {connections.map((conn, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white/5 rounded-lg p-3 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${
                              conn.direction === 'outgoing' ? 'bg-emerald-400' : 'bg-indigo-400'
                            }`} />
                            <p className="text-sm font-medium text-white">{conn.entity.construct}</p>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2">{conn.connection.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-500 flex-shrink-0 ml-2" />
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="text-xs font-semibold mb-1">{conn.connection.kind}</p>
                    <p className="text-xs">{conn.connection.description}</p>
                    {conn.connection.weight && (
                      <p className="text-xs text-zinc-400 mt-1">Weight: {(conn.connection.weight * 100).toFixed(0)}%</p>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'next-steps',
      title: 'Cooperative Next Steps',
      icon: ArrowRight,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-zinc-400">Based on connections within 2 steps of this pillar:</p>
          
          <div className="space-y-3">
            {depth2Connections.slice(0, 3).map((d2, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-lg p-4 border border-violet-500/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-violet-300">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-white mb-1">
                      Explore {d2.entity.construct}
                    </p>
                    <p className="text-xs text-zinc-400 mb-2">
                      Connected via {d2.via.construct}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Rationale: Understanding this connection can provide insights into how {entity.id} influences broader system dynamics.
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {depth2Connections.length === 0 && (
            <div className="text-center py-8 text-zinc-500">
              <p className="text-sm">No depth-2 connections available for this pillar.</p>
            </div>
          )}
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  const handlePrev = () => {
    if (currentChapter > 0) {
      setCurrentChapter(currentChapter - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-500/20 to-pink-500/20 border-b border-white/10 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {entity.construct} <span className="text-violet-400">({entity.abbreviation})</span>
            </h2>
            <p className="text-sm text-zinc-300">{entity.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onPin(entity)}
                    className={`p-2 rounded-lg transition-colors ${
                      isPinned ? 'bg-violet-500/20 text-violet-300' : 'bg-white/10 text-zinc-400 hover:bg-white/20'
                    }`}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPinned ? 'Unpin' : 'Pin to dock'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <button onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chapter Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {chapters.map((chapter, idx) => {
            const Icon = chapter.icon;
            return (
              <button
                key={chapter.id}
                onClick={() => setCurrentChapter(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  currentChapter === idx
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{chapter.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter Content */}
      <div className="p-6 min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentChapter}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {chapters[currentChapter].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Navigation */}
      <div className="border-t border-white/10 p-4 flex items-center justify-between bg-black/20">
        <Button
          onClick={handlePrev}
          disabled={currentChapter === 0}
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-white disabled:opacity-30"
        >
          Previous
        </Button>
        
        <div className="text-xs text-zinc-500">
          Chapter {currentChapter + 1} of {chapters.length}
        </div>
        
        <Button
          onClick={handleNext}
          disabled={currentChapter === chapters.length - 1}
          variant="ghost"
          size="sm"
          className="text-zinc-400 hover:text-white disabled:opacity-30"
        >
          Next
        </Button>
      </div>
    </motion.div>
  );
}