import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Pin, Book, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PillarShelf({ entities, layout, onFocus, onPin, onOpenGuided, pinnedItems, adaptedData, focusedEntity }) {
  if (entities.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <p>No pillars found</p>
      </div>
    );
  }

  const containerClass = layout === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
    : 'space-y-3';

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Pillars ({entities.length})</h2>
      </div>
      
      <div className={containerClass}>
        {entities.map((entity, idx) => {
          const connections = adaptedData.connectedEntities(entity.id);
          const isPinned = pinnedItems.find(p => p.id === entity.id);
          const isFocused = focusedEntity?.id === entity.id;

          return (
            <motion.div
              key={entity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, type: 'spring', stiffness: 200 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`group bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border p-5 hover:shadow-xl hover:shadow-violet-500/10 transition-all cursor-pointer ${
                isFocused ? 'border-violet-500/50 ring-2 ring-violet-500/30' : 'border-white/10'
              }`}
              onClick={() => onFocus(entity)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white mb-1 group-hover:text-violet-300 transition-colors">
                    {entity.construct} <span className="text-violet-400">({entity.abbreviation})</span>
                  </h3>
                  <p className="text-xs text-zinc-500">{entity.id}</p>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPin(entity);
                  }}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isPinned ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                  }`}
                  aria-label={isPinned ? 'Unpin pillar' : 'Pin pillar'}
                >
                  <Pin className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-zinc-400 line-clamp-2 mb-4">{entity.definition}</p>

              <div className="flex items-center gap-4 text-xs text-zinc-500 mb-4">
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-3 h-3" />
                  <span>{connections.length} connections</span>
                </div>
                {entity.subdomains && (
                  <div className="flex items-center gap-1">
                    <span>{entity.subdomains.length} subdomains</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocus(entity);
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Focus
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenGuided(entity);
                  }}
                  className="flex-1 bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 text-xs"
                >
                  <Book className="w-3 h-3 mr-1" />
                  Guided
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}