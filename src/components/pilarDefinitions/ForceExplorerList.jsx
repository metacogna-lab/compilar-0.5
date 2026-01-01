import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber'
};

const pillarNames = {
  purpose: 'Purpose',
  interpersonal: 'Interpersonal',
  learning: 'Learning',
  action: 'Action',
  resilience: 'Resilience'
};

export default function ForceExplorerList({ 
  mode, 
  allForces = [], 
  forceConnections = [],
  selectedForceIds = [],
  onForceClick,
  selectedPillarFilter = null
}) {
  const [expandedForces, setExpandedForces] = useState(new Set());

  // Group forces by pillar
  const groupedForces = useMemo(() => {
    const filtered = allForces.filter(f => 
      f.modeType === mode || f.modeType === 'neutral'
    );

    if (selectedPillarFilter) {
      return {
        [selectedPillarFilter]: filtered.filter(f => f.group === selectedPillarFilter)
      };
    }

    const groups = {};
    filtered.forEach(force => {
      const pillar = force.group || 'other';
      if (!groups[pillar]) groups[pillar] = [];
      groups[pillar].push(force);
    });

    return groups;
  }, [allForces, mode, selectedPillarFilter]);

  // Get connections for a specific force
  const getForceConnections = (forceId) => {
    return forceConnections
      .filter(conn => 
        (conn.source === forceId || conn.target === forceId) &&
        conn.modeType === mode
      )
      .map(conn => {
        const connectedForceId = conn.source === forceId ? conn.target : conn.source;
        const connectedForce = allForces.find(f => f.id === connectedForceId);
        return {
          force: connectedForce,
          connection: conn
        };
      })
      .filter(item => item.force);
  };

  const toggleExpanded = (forceId) => {
    const newExpanded = new Set(expandedForces);
    if (newExpanded.has(forceId)) {
      newExpanded.delete(forceId);
    } else {
      newExpanded.add(forceId);
    }
    setExpandedForces(newExpanded);
  };

  const handleForceClick = (forceId) => {
    toggleExpanded(forceId);
    onForceClick?.(forceId);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedForces).map(([pillar, forces]) => {
        const color = pillarColors[pillar] || 'zinc';
        const pillarName = pillarNames[pillar] || pillar;

        return (
          <motion.div
            key={pillar}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Pillar Header */}
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border",
              `bg-${color}-500/10 border-${color}-500/30`
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                `bg-${color}-500`
              )} />
              <h3 className="text-sm font-semibold text-white">{pillarName}</h3>
              <span className="ml-auto text-xs text-zinc-400">{forces.length} forces</span>
            </div>

            {/* Forces List */}
            <div className="space-y-2">
              {forces.map(force => {
                const isExpanded = expandedForces.has(force.id);
                const isSelected = selectedForceIds.includes(force.id);
                const connections = getForceConnections(force.id);

                return (
                  <motion.div
                    key={force.id}
                    layout
                    className={cn(
                      "border rounded-lg overflow-hidden transition-colors",
                      isSelected 
                        ? `border-${color}-500/50 bg-${color}-500/5` 
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    )}
                  >
                    {/* Force Header */}
                    <button
                      onClick={() => handleForceClick(force.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium text-white flex-1">
                        {force.label}
                      </span>
                      {connections.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Zap className="w-3 h-3" />
                          {connections.length}
                        </span>
                      )}
                    </button>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 space-y-3 border-t border-white/5">
                            {/* Description */}
                            <p className="text-xs text-zinc-300 leading-relaxed">
                              {force.description}
                            </p>

                            {/* Connections */}
                            {connections.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                                  Connections to other forces:
                                </h4>
                                <div className="space-y-2">
                                  {connections.map(({ force: connectedForce, connection }, idx) => {
                                    const connectedPillar = connectedForce.group;
                                    const connectedColor = pillarColors[connectedPillar] || 'zinc';

                                    return (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2 text-xs p-2 rounded bg-black/20 border border-white/5"
                                      >
                                        <div className={cn(
                                          "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                                          `bg-${connectedColor}-500`
                                        )} />
                                        <div className="flex-1 space-y-1">
                                          <p className="text-zinc-300">
                                            Connected to <span className="font-semibold text-white">{connectedForce.label}</span> from the{' '}
                                            <span className={cn(
                                              "font-semibold",
                                              `text-${connectedColor}-400`
                                            )}>
                                              {pillarNames[connectedPillar] || connectedPillar}
                                            </span> pillar.
                                          </p>
                                          {connection.description && (
                                            <p className="text-zinc-500 italic">
                                              {connection.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}