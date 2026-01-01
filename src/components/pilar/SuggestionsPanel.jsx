import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, Lightbulb, Compass, Heart, BookOpen, Zap, Shield, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', connections: ['interpersonal', 'resilience'] },
  interpersonal: { icon: Heart, color: 'pink', connections: ['purpose', 'action'] },
  learning: { icon: BookOpen, color: 'indigo', connections: ['action', 'resilience'] },
  action: { icon: Zap, color: 'emerald', connections: ['interpersonal', 'learning'] },
  resilience: { icon: Shield, color: 'amber', connections: ['learning', 'purpose'] },
};

const activitySuggestions = {
  purpose: [
    { title: 'Values Reflection', description: 'Journal about your core values and how they guide decisions', time: '15 min' },
    { title: 'Goal Visualization', description: 'Create a vision board for your next 6 months', time: '30 min' },
    { title: 'Meaning Mapping', description: 'Connect daily tasks to your larger purpose', time: '10 min' },
  ],
  interpersonal: [
    { title: 'Active Listening Practice', description: 'Have a conversation focused entirely on understanding', time: '20 min' },
    { title: 'Gratitude Expression', description: 'Write appreciation notes to 3 people', time: '15 min' },
    { title: 'Conflict Resolution', description: 'Practice the "I feel... when..." framework', time: '10 min' },
  ],
  learning: [
    { title: 'Curiosity Quest', description: 'Learn one new thing outside your expertise', time: '30 min' },
    { title: 'Reflection Journal', description: 'Document 3 lessons from recent experiences', time: '15 min' },
    { title: 'Skill Sprint', description: 'Practice a specific skill deliberately', time: '25 min' },
  ],
  action: [
    { title: 'Task Breakdown', description: 'Break one big goal into actionable steps', time: '15 min' },
    { title: 'Momentum Builder', description: 'Complete 3 small tasks to build flow', time: '20 min' },
    { title: 'Progress Review', description: 'Celebrate recent wins and plan next moves', time: '10 min' },
  ],
  resilience: [
    { title: 'Stress Response Check', description: 'Practice box breathing for 5 minutes', time: '5 min' },
    { title: 'Reframe Exercise', description: 'Turn a recent setback into a growth opportunity', time: '15 min' },
    { title: 'Support Network', description: 'Reach out to someone in your support system', time: '10 min' },
  ],
};

export default function SuggestionsPanel({ isOpen, onClose, userProfile }) {
  const scores = userProfile?.pillar_scores || {};
  
  // Dynamic suggestions based on profile
  const suggestions = useMemo(() => {
    const sortedPillars = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort(([, a], [, b]) => a - b);
    
    const weakestPillar = sortedPillars[0]?.[0];
    const strongestPillar = sortedPillars[sortedPillars.length - 1]?.[0];
    
    const results = [];
    
    // Priority: weakest pillar needs attention
    if (weakestPillar) {
      const activities = activitySuggestions[weakestPillar] || [];
      results.push({
        pillar: weakestPillar,
        type: 'growth',
        label: 'Growth Focus',
        activities: activities.slice(0, 2),
      });
    }
    
    // Leverage: strongest pillar
    if (strongestPillar && strongestPillar !== weakestPillar) {
      const activities = activitySuggestions[strongestPillar] || [];
      results.push({
        pillar: strongestPillar,
        type: 'strength',
        label: 'Leverage Strength',
        activities: activities.slice(0, 1),
      });
    }
    
    // Connected pillars
    if (weakestPillar) {
      const connections = pillarConfig[weakestPillar]?.connections || [];
      connections.forEach(conn => {
        if (scores[conn] > 0) {
          const activities = activitySuggestions[conn] || [];
          results.push({
            pillar: conn,
            type: 'connection',
            label: `Supports ${weakestPillar}`,
            activities: activities.slice(0, 1),
          });
        }
      });
    }
    
    return results.slice(0, 4);
  }, [scores]);

  // Pillars not yet assessed
  const unassessedPillars = Object.keys(pillarConfig).filter(p => !scores[p] || scores[p] === 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed left-4 bottom-20 z-50 w-80 md:w-96 max-h-[70vh] bg-[#1a1a1f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="font-medium text-white">Suggestions</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 text-zinc-400">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-[55vh] overflow-y-auto space-y-4">
            {/* Mini Knowledge Graph */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-medium text-zinc-400 mb-3">Your PILAR Connections</h4>
              <div className="relative h-32">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  {/* Draw connections */}
                  {Object.entries(pillarConfig).map(([pillar, config]) => {
                    const score = scores[pillar] || 0;
                    return config.connections.map(conn => {
                      const connScore = scores[conn] || 0;
                      const avgStrength = (score + connScore) / 2;
                      if (avgStrength === 0) return null;
                      
                      const positions = {
                        purpose: { x: 50, y: 10 },
                        interpersonal: { x: 90, y: 40 },
                        action: { x: 75, y: 85 },
                        learning: { x: 25, y: 85 },
                        resilience: { x: 10, y: 40 },
                      };
                      
                      return (
                        <motion.line
                          key={`${pillar}-${conn}`}
                          x1={positions[pillar].x}
                          y1={positions[pillar].y}
                          x2={positions[conn].x}
                          y2={positions[conn].y}
                          stroke={`rgba(139, 92, 246, ${Math.min(0.8, avgStrength / 100)})`}
                          strokeWidth={avgStrength > 50 ? 2 : 1}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                        />
                      );
                    });
                  })}
                  
                  {/* Draw nodes */}
                  {Object.entries(pillarConfig).map(([pillar, config]) => {
                    const score = scores[pillar] || 0;
                    const positions = {
                      purpose: { x: 50, y: 10 },
                      interpersonal: { x: 90, y: 40 },
                      action: { x: 75, y: 85 },
                      learning: { x: 25, y: 85 },
                      resilience: { x: 10, y: 40 },
                    };
                    const radius = score > 0 ? 6 + (score / 100) * 4 : 5;
                    
                    return (
                      <motion.circle
                        key={pillar}
                        cx={positions[pillar].x}
                        cy={positions[pillar].y}
                        r={radius}
                        fill={score > 0 ? `var(--color-${config.color}, #8B5CF6)` : 'rgba(255,255,255,0.1)'}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={score > 0 ? `fill-${config.color}-500` : ''}
                      />
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Dynamic Suggestions */}
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, i) => {
                const config = pillarConfig[suggestion.pillar];
                const Icon = config?.icon || Sparkles;
                
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-lg bg-${config?.color || 'violet'}-500/20 flex items-center justify-center`}>
                        <Icon className={`w-3.5 h-3.5 text-${config?.color || 'violet'}-400`} />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white capitalize">{suggestion.pillar}</span>
                        <span className={cn(
                          "ml-2 text-xs px-1.5 py-0.5 rounded",
                          suggestion.type === 'growth' ? "bg-amber-500/20 text-amber-400" :
                          suggestion.type === 'strength' ? "bg-emerald-500/20 text-emerald-400" :
                          "bg-blue-500/20 text-blue-400"
                        )}>
                          {suggestion.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 ml-8">
                      {suggestion.activities.map((activity, j) => (
                        <div key={j} className="p-2 rounded-lg bg-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-white">{activity.title}</span>
                            <span className="text-xs text-zinc-500">{activity.time}</span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5">{activity.description}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-zinc-400">Complete assessments to get personalized suggestions</p>
              </div>
            )}

            {/* Unassessed Pillars */}
            {unassessedPillars.length > 0 && (
              <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <h4 className="text-xs font-medium text-violet-400 mb-2">Explore These Pillars</h4>
                <div className="flex flex-wrap gap-2">
                  {unassessedPillars.map(pillar => {
                    const config = pillarConfig[pillar];
                    const Icon = config?.icon || Sparkles;
                    return (
                      <Link key={pillar} to={createPageUrl(`Pillar?pillar=${pillar}`)}>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-${config?.color || 'violet'}-500/20 text-${config?.color || 'violet'}-400 text-xs hover:bg-${config?.color || 'violet'}-500/30 transition-colors capitalize`}>
                          <Icon className="w-3 h-3" />
                          {pillar}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}