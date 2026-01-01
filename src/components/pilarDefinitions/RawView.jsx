import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, AlertTriangle, Database, Link as LinkIcon } from 'lucide-react';

export default function RawView({ data, warnings, searchQuery, mode, onModeChange }) {
  const [expandedSections, setExpandedSections] = useState({
    pillars: true,
    connections: false,
    warnings: warnings.length > 0
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter data based on search
  const filteredPillars = useMemo(() => {
    if (!searchQuery) return data.pillars;
    const query = searchQuery.toLowerCase();
    return data.pillars.filter(p =>
      JSON.stringify(p).toLowerCase().includes(query)
    );
  }, [data.pillars, searchQuery]);

  const filteredConnections = useMemo(() => {
    if (!searchQuery) return data.connections;
    const query = searchQuery.toLowerCase();
    return data.connections.filter(c =>
      JSON.stringify(c).toLowerCase().includes(query)
    );
  }, [data.connections, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Compact Overview Header */}
      <div className="bg-gradient-to-r from-white/5 to-white/[0.02] rounded-xl border border-white/10 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-white">{data.displayName}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span>{data.counts.pillars} Pillars</span>
              <span>{data.counts.connections} Connections</span>
              {warnings.length > 0 && (
                <span className="text-red-400">{warnings.length} Warnings</span>
              )}
            </div>
          </div>
          
          {/* Mode Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onModeChange('egalitarian')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                mode === 'egalitarian'
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              Egalitarian
            </button>
            <button
              onClick={() => onModeChange('hierarchical')}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                mode === 'hierarchical'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-zinc-400 hover:text-white border border-white/10'
              }`}
            >
              Hierarchical
            </button>
          </div>
        </div>
      </div>

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <Section
          title="Warnings"
          icon={AlertTriangle}
          expanded={expandedSections.warnings}
          onToggle={() => toggleSection('warnings')}
          badge={warnings.length}
          badgeColor="text-red-400"
        >
          <div className="space-y-2">
            {warnings.map((warning, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg border ${
                  warning.severity === 'error'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    warning.severity === 'error' ? 'text-red-400' : 'text-yellow-400'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      warning.severity === 'error' ? 'text-red-300' : 'text-yellow-300'
                    }`}>
                      {warning.type.replace('_', ' ').toUpperCase()}
                    </p>
                    <p className="text-sm text-zinc-400 mt-1">{warning.message}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* Pillars Section */}
      <Section
        title="Pillars"
        icon={Database}
        expanded={expandedSections.pillars}
        onToggle={() => toggleSection('pillars')}
        badge={filteredPillars.length}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPillars.map((pillar, idx) => (
            <PillarCard key={pillar.id || idx} pillar={pillar} index={idx} />
          ))}
        </div>
      </Section>

      {/* Connections Section */}
      <Section
        title="Connections"
        icon={LinkIcon}
        expanded={expandedSections.connections}
        onToggle={() => toggleSection('connections')}
        badge={filteredConnections.length}
      >
        <div className="space-y-2">
          {filteredConnections.map((conn, idx) => (
            <ConnectionCard key={idx} connection={conn} index={idx} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, expanded, onToggle, children, badge, badgeColor = 'text-violet-400' }) {
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-2xl border border-white/10 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-violet-400" />
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          {badge !== undefined && (
            <span className={`text-sm font-medium ${badgeColor}`}>({badge})</span>
          )}
        </div>
        {expanded ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
      </button>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PillarCard({ pillar, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-lg border border-white/10 p-4 hover:border-violet-500/30 transition-all"
    >
      <div className="mb-3">
        <h3 className="text-base font-bold text-white mb-1">
          {pillar.construct} <span className="text-violet-400 text-sm">({pillar.abbreviation})</span>
        </h3>
        <p className="text-xs text-zinc-500 mb-2">{pillar.id}</p>
        <p className="text-sm text-zinc-400 leading-relaxed">{pillar.definition}</p>
      </div>

      {pillar.forces && (
        <div className="space-y-2 mb-3">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wide">Forces</p>
          <div className="grid grid-cols-2 gap-2">
            {pillar.forces.map((force, idx) => (
              <div key={idx} className="bg-white/5 rounded p-2 border border-white/5">
                <p className="text-xs font-medium text-white">{force.name}</p>
                <p className="text-xs text-zinc-500 line-clamp-1">{force.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pillar.mechanism && (
        <div className="bg-black/20 rounded p-3 border border-white/5">
          <p className="text-xs font-semibold text-amber-400 mb-2">Mechanism</p>
          <p className="text-xs text-zinc-400 mb-1"><span className="text-zinc-500">Focus:</span> {pillar.mechanism.focus}</p>
          <p className="text-xs text-zinc-400"><span className="text-zinc-500">Engagement:</span> {pillar.mechanism.engagement}</p>
        </div>
      )}
    </motion.div>
  );
}

function ConnectionCard({ connection, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="bg-gradient-to-r from-white/5 to-white/[0.02] rounded-lg border border-white/10 p-3 hover:border-violet-500/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-violet-400">{connection.from}</span>
            <span className="text-zinc-500">→</span>
            <span className="text-xs font-mono text-pink-400">{connection.to}</span>
          </div>
          <p className="text-sm font-medium text-white mb-1 capitalize">{connection.kind}</p>
          <p className="text-xs text-zinc-400">{connection.description}</p>
        </div>
        {connection.weight && (
          <div className="flex flex-col items-end">
            <span className="text-xs text-zinc-500 mb-1">Strength</span>
            <span className="text-sm font-bold text-emerald-400">{(connection.weight * 100).toFixed(0)}%</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}