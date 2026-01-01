import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Pin, ChevronDown, ChevronUp, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function FocusPanel({ entity, adaptedData, onClose, onSelectConnection, selectedConnection, onPin, isPinned }) {
  const [expandedGroups, setExpandedGroups] = useState({});
  
  const connections = adaptedData.connectedEntities(entity.id);
  const groupedConnections = connections.reduce((acc, conn) => {
    const kind = conn.connection.kind || 'related';
    if (!acc[kind]) acc[kind] = [];
    acc[kind].push(conn);
    return acc;
  }, {});

  const toggleGroup = (kind) => {
    setExpandedGroups(prev => ({ ...prev, [kind]: !prev[kind] }));
  };

  // Get depth-2 connections when a connection is selected
  const depth2Preview = selectedConnection ? adaptedData.depth2Connections(selectedConnection.entity.id) : [];

  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 p-6 min-h-[600px]">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-2">
            {entity.construct} <span className="text-violet-400">({entity.abbreviation})</span>
          </h2>
          <p className="text-sm text-zinc-400">{entity.definition}</p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onPin(entity)}
                  className={`p-2 rounded-lg transition-colors ${
                    isPinned ? 'bg-violet-500/20 text-violet-300' : 'bg-white/5 text-zinc-400 hover:bg-white/10'
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
          
          <button onClick={onClose} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Connection Groups */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">Connected Forces</h3>
        
        {Object.entries(groupedConnections).map(([kind, conns]) => (
          <motion.div
            key={kind}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/20 rounded-lg border border-white/10 overflow-hidden"
          >
            <button
              onClick={() => toggleGroup(kind)}
              className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-violet-400" />
                <span className="text-sm font-medium text-white capitalize">{kind}</span>
                <span className="text-xs text-zinc-500">({conns.length})</span>
              </div>
              {expandedGroups[kind] ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
            </button>

            <AnimatePresence>
              {expandedGroups[kind] && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 space-y-2">
                    {conns.map((conn, idx) => (
                      <TooltipProvider key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <motion.button
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              onClick={() => onSelectConnection(conn)}
                              className={`w-full text-left p-3 rounded-lg transition-all ${
                                selectedConnection?.entity.id === conn.entity.id
                                  ? 'bg-violet-500/20 border border-violet-500/30'
                                  : 'bg-white/5 hover:bg-white/10 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">{conn.entity.construct}</p>
                                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{conn.connection.description}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-2" />
                              </div>
                            </motion.button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-xs">
                            <p className="text-xs">{conn.connection.description}</p>
                            {conn.connection.weight && (
                              <p className="text-xs text-zinc-400 mt-1">Strength: {(conn.connection.weight * 100).toFixed(0)}%</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Connection Trail (Depth-2 Preview) */}
      <AnimatePresence>
        {selectedConnection && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-lg border border-violet-500/30 p-4"
          >
            <div className="flex items-start gap-2 mb-3">
              <Info className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Connection Trail</h4>
                <p className="text-xs text-zinc-400">Second-step connections from {selectedConnection.entity.construct}</p>
              </div>
            </div>

            {depth2Preview.length > 0 ? (
              <div className="space-y-2">
                {depth2Preview.slice(0, 3).map((d2, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-black/20 rounded p-2 border border-white/10"
                  >
                    <p className="text-xs text-white font-medium">{d2.entity.construct}</p>
                    <p className="text-xs text-zinc-500 mt-1">via {d2.via.construct}</p>
                  </motion.div>
                ))}
                {depth2Preview.length > 3 && (
                  <p className="text-xs text-zinc-500 text-center pt-2">
                    +{depth2Preview.length - 3} more connections
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">No second-step connections found</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}