import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { forceConnectionsData } from '@/components/pilar/forceConnectionsData';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function GoalDisplayWithChips({ userProfile }) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  
  if (!userProfile?.goal) return null;

  // Analyze goal on mount
  useEffect(() => {
    const analyzeGoal = async () => {
      setAnalyzing(true);
      try {
        const response = await base44.functions.invoke('analyzeGoal', {
          goal: userProfile.goal,
          position: userProfile.position
        });
        
        if (response.data?.success && response.data?.mapping) {
          setAnalysisData(response.data.mapping);
        }
      } catch (error) {
        console.error('Failed to analyze goal:', error);
      } finally {
        setAnalyzing(false);
      }
    };

    // Only analyze if we don't have analysis data yet
    if (!analysisData) {
      analyzeGoal();
    }
  }, [userProfile.goal, userProfile.position]);

  // Get pillar and force data from analysis or fallback to goal history
  const latestGoalEntry = userProfile.goal_history?.[userProfile.goal_history.length - 1];
  const primaryPillars = analysisData?.mapped_elements?.map(el => el.pillar) || latestGoalEntry?.primary_pillars || [];
  const keyForces = analysisData?.mapped_elements?.map(el => el.force_name).filter(Boolean) || latestGoalEntry?.key_forces || [];
  const goalLens = analysisData?.recommended_mode?.toUpperCase() || latestGoalEntry?.lens || 'BALANCED';

  // Determine mode from lens
  const mode = goalLens === 'HIERARCHICAL' ? 'hierarchical' : 'egalitarian';

  // Fetch ALL ForcePromptCard data for the current mode
  const { data: forcePromptCards = [] } = useQuery({
    queryKey: ['forcePromptCards', mode],
    queryFn: async () => {
      const modeCapitalized = mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical';
      return base44.entities.ForcePromptCard.filter({ mode: modeCapitalized });
    }
  });

  // Get pillar data with forces and their effects from ForcePromptCard
  const pillarData = useMemo(() => {
    if (primaryPillars.length === 0) return [];
    
    const data = pillarsInfo[mode];
    const uniquePillars = [...new Set(primaryPillars)];
    
    return uniquePillars.map(pillarName => {
      const pillar = data.find(p => p.title === pillarName || p.id === pillarName);
      if (!pillar) return null;
      
      // Get relevance score from analysis if available
      const analysisElement = analysisData?.mapped_elements?.find(el => el.pillar === pillarName);
      const relevanceScore = analysisElement?.relevance_score || 0;
      
      // Get forces for this pillar
      const pillarForces = (pillar.forces || []).map(force => {
        const forceCard = forcePromptCards.find(fc => fc.name === force.name);
        if (!forceCard) return null;
        
        // Calculate average effect from prompt card
        const avgEffect = (
          (forceCard.effect_high_9_10 + forceCard.effect_high_7_8 + 
           forceCard.effect_low_3_4 + forceCard.effect_low_1_2) / 4
        );
        
        return {
          name: force.name,
          effectValue: Math.abs(avgEffect),
          effectType: avgEffect > 0 ? 'positive' : avgEffect < 0 ? 'negative' : 'neutral'
        };
      }).filter(Boolean);
      
      return {
        name: pillar.title,
        color: pillar.color || 'violet',
        totalInfluence: relevanceScore,
        forces: pillarForces
      };
    }).filter(Boolean);
  }, [primaryPillars, mode, analysisData, forcePromptCards]);

  // Get force details with effect numbers from ForcePromptCard database
  const forceDetails = useMemo(() => {
    if (keyForces.length === 0 || forcePromptCards.length === 0) return [];
    
    const uniqueForces = [...new Set(keyForces)].filter(Boolean);
    
    return uniqueForces.map(forceName => {
      const forceCard = forcePromptCards.find(fc => fc.name === forceName);
      if (!forceCard) return null;
      
      // Calculate average effect from prompt card
      const avgEffect = (
        (forceCard.effect_high_9_10 + forceCard.effect_high_7_8 + 
         forceCard.effect_low_3_4 + forceCard.effect_low_1_2) / 4
      );
      
      // Get relevance score from analysis if available (for ordering)
      const analysisElement = analysisData?.mapped_elements?.find(el => el.force_name === forceName);
      const relevanceScore = analysisElement?.relevance_score || 0;

      return {
        name: forceName,
        effectValue: Math.abs(avgEffect),
        effectType: avgEffect > 0 ? 'positive' : avgEffect < 0 ? 'negative' : 'neutral',
        relevanceScore: Math.abs(relevanceScore)
      };
    }).filter(Boolean).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [keyForces, forcePromptCards, analysisData]);

  // If analyzing, show loading state
  if (analyzing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Analyzing Your Goal</h3>
            <p className="text-lg text-white leading-relaxed">{userProfile.goal}</p>
            <p className="text-xs text-slate-500 mt-2">Mapping to PILAR framework...</p>
          </div>
        </div>
      </motion.div>
    );
  }
  
  // If no analysis data, show simple goal display
  if (pillarData.length === 0 && forceDetails.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
            <Target className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-slate-400 mb-1">Your Goal</h3>
            <p className="text-lg text-white leading-relaxed">{userProfile.goal}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const getColorClasses = (color) => {
    const colors = {
      violet: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
      pink: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
      indigo: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      amber: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    };
    return colors[color] || colors.violet;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 backdrop-blur-sm"
    >
      {/* Goal Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/30">
          <Target className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Your Goal</h3>
          <p className="text-lg text-white leading-relaxed">{userProfile.goal}</p>
        </div>
      </div>

      {/* All Forces for Selected Mode */}
      {forcePromptCards.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Forces
          </p>
          {forcePromptCards.map((forceCard, idx) => {
            // Check if this force is related to primary pillars
            const isPrimaryForce = primaryPillars.includes(forceCard.force_from) || primaryPillars.includes(forceCard.force_to);
            
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg ${
                  isPrimaryForce 
                    ? 'bg-violet-500/10 border border-violet-500/30' 
                    : 'bg-slate-800/50 border border-slate-700/50'
                }`}
              >
                {/* Force Name with Pillar Relationship */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-white">
                    {forceCard.name || 'Discretionary'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {forceCard.force_from} → {forceCard.force_to}
                  </span>
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded ${
                    forceCard.type === 'Reinforce' 
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : forceCard.type === 'Inverse'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-slate-500/20 text-slate-300'
                  }`}>
                    {forceCard.type}
                  </span>
                </div>

                {/* Effect Ranges */}
                <div className="space-y-2">
                  {/* Low Range */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Low Range</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        1-2: {forceCard.effect_low_1_2 > 0 ? '+' : ''}{forceCard.effect_low_1_2}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        3-4: {forceCard.effect_low_3_4 > 0 ? '+' : ''}{forceCard.effect_low_3_4}
                      </span>
                    </div>
                    {forceCard.description_low && (
                      <p className="text-xs text-slate-400 mt-1">{forceCard.description_low}</p>
                    )}
                  </div>

                  {/* High Range */}
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">High Range</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        7-8: {forceCard.effect_high_7_8 > 0 ? '+' : ''}{forceCard.effect_high_7_8}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        9-10: {forceCard.effect_high_9_10 > 0 ? '+' : ''}{forceCard.effect_high_9_10}
                      </span>
                    </div>
                    {forceCard.description_high && (
                      <p className="text-xs text-slate-400 mt-1">{forceCard.description_high}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}


    </motion.div>
  );
}