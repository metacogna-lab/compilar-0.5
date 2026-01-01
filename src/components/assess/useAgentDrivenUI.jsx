import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { parseAgentAnalysis } from './agentSchemas';

/**
 * Custom hook for agent-driven UI control
 * Listens to agent responses and triggers dynamic UI transitions
 */
export function useAgentDrivenUI(user, pillar, mode) {
  const [agentState, setAgentState] = useState({
    comprehension_score: null,
    recommended_view: 'continue',
    key_concepts_missing: [],
    mastery_indicators: [],
    emotional_state: null,
    lastAnalysis: null
  });

  const [activeView, setActiveView] = useState('main');
  const [showRemedial, setShowRemedial] = useState(false);
  const [showBonus, setShowBonus] = useState(false);
  const [remedialConcepts, setRemedialConcepts] = useState([]);

  /**
   * Process agent response and extract structured data
   */
  const processAgentResponse = async (response, messageIndex) => {
    const analysis = parseAgentAnalysis(response);
    
    if (!analysis) {
      console.warn('No structured analysis found in agent response');
      return;
    }

    setAgentState({
      comprehension_score: analysis.comprehension_score,
      recommended_view: analysis.recommended_view,
      key_concepts_missing: analysis.key_concepts_missing || [],
      mastery_indicators: analysis.mastery_indicators || [],
      emotional_state: analysis.emotional_state,
      lastAnalysis: analysis
    });

    // Save interaction data to entity
    if (user?.email) {
      try {
        await base44.entities.UserProgress.create({
          pillar,
          mode,
          message_index: messageIndex,
          comprehension_score: analysis.comprehension_score,
          recommended_view: analysis.recommended_view,
          key_concepts_missing: analysis.key_concepts_missing || [],
          mastery_indicators: analysis.mastery_indicators || [],
          emotional_state: analysis.emotional_state,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    }
  };

  /**
   * Effect: Handle UI transitions based on comprehension score
   */
  useEffect(() => {
    if (agentState.comprehension_score === null) return;

    const score = agentState.comprehension_score;

    // Low comprehension - trigger remedial help
    if (score < 0.5 && agentState.recommended_view === 'deep_dive_module') {
      setRemedialConcepts(agentState.key_concepts_missing);
      setShowRemedial(true);
      setActiveView('remedial');
    }
    // High comprehension - unlock bonus content
    else if (score > 0.9 && agentState.recommended_view === 'bonus_question') {
      setShowBonus(true);
      setActiveView('bonus');
    }
    // Summary card for moderate scores
    else if (score >= 0.5 && score <= 0.7 && agentState.recommended_view === 'summary_card') {
      setActiveView('summary');
    }
    // Continue normally
    else {
      setActiveView('main');
      setShowRemedial(false);
      setShowBonus(false);
    }
  }, [agentState.comprehension_score, agentState.recommended_view, agentState.key_concepts_missing]);

  /**
   * Close remedial panel and return to main
   */
  const closeRemedial = () => {
    setShowRemedial(false);
    setActiveView('main');
  };

  /**
   * Close bonus challenge
   */
  const closeBonus = () => {
    setShowBonus(false);
    setActiveView('main');
  };

  return {
    agentState,
    activeView,
    showRemedial,
    showBonus,
    remedialConcepts,
    processAgentResponse,
    closeRemedial,
    closeBonus,
    setActiveView
  };
}