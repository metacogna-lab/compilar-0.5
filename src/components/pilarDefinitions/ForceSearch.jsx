import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

export default function ForceSearch({
  mode,
  allForces = [],
  selectedPillarFilter = null,
  selectedForceIds = [],
  onForceSelect,
  onClearSelection,
  onPillarFilterChange
}) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter forces based on mode, pillar filter, and search query
  const filteredForces = useMemo(() => {
    return allForces.filter(force => {
      // Mode filter
      if (force.modeType !== mode && force.modeType !== 'neutral') return false;
      
      // Pillar filter
      if (selectedPillarFilter && force.group !== selectedPillarFilter) return false;
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          force.label?.toLowerCase().includes(query) ||
          force.group?.toLowerCase().includes(query) ||
          force.description?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [allForces, mode, selectedPillarFilter, searchQuery]);

  // Get unique pillar groups
  const pillarGroups = useMemo(() => {
    const groups = new Set(allForces.map(f => f.group));
    return Array.from(groups).sort();
  }, [allForces]);

  const handleForceClick = (forceId) => {
    if (onForceSelect) {
      onForceSelect(forceId);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forces..."
            className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-zinc-500 text-sm focus:outline-none focus:border-violet-500/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Clear Selection */}
        {selectedForceIds.length > 0 && onClearSelection && (
          <button
            onClick={onClearSelection}
            className="px-4 py-2.5 bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 rounded-lg text-violet-300 text-sm font-medium transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear ({selectedForceIds.length})
          </button>
        )}
      </div>

      {/* Pillar Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onPillarFilterChange?.(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            selectedPillarFilter === null
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'
          }`}
        >
          All Pillars
        </button>
        {pillarGroups.map(group => (
          <button
            key={group}
            onClick={() => onPillarFilterChange?.(group)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedPillarFilter === group
                ? 'bg-violet-500/30 text-violet-200 border border-violet-500/50'
                : 'bg-white/5 text-zinc-400 border border-white/10 hover:bg-white/10'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* Force Results */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
        {filteredForces.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-400">No forces found</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredForces.map(force => (
              <button
                key={force.id}
                onClick={() => handleForceClick(force.id)}
                className={`w-full text-left p-4 transition-all ${
                  selectedForceIds.includes(force.id)
                    ? 'bg-violet-500/20 border-l-2 border-violet-500'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">
                        {force.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-zinc-400">
                        {force.group}
                      </span>
                    </div>
                    {force.description && (
                      <p className="text-xs text-zinc-400 line-clamp-2">
                        {force.description}
                      </p>
                    )}
                  </div>
                  {selectedForceIds.includes(force.id) && (
                    <div className="w-2 h-2 rounded-full bg-violet-400 mt-1.5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}