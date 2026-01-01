import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Custom hook for RAG-powered PILAR knowledge retrieval
 * @param {string} pillar - Current PILAR pillar (e.g., 'purpose', 'interpersonal')
 * @param {string} userQuery - User's current message or query
 * @param {boolean} enabled - Whether to trigger retrieval
 * @returns {Object} - Retrieved knowledge chunks, loading state, and metadata
 */
export function usePilarKnowledge(pillar, userQuery, enabled = true) {
  const [knowledge, setKnowledge] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(null);

  useEffect(() => {
    if (!enabled || !pillar || !userQuery || userQuery.trim().length < 3) {
      setKnowledge([]);
      setConfidenceScore(null);
      return;
    }

    const fetchKnowledge = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await base44.functions.invoke('pilarRagQuery', {
          query: userQuery,
          pillar: pillar,
          mode: null, // Can pass mode if needed
          topK: 3,
          minConfidence: 0.5
        });

        if (response.data?.success && response.data?.results) {
          setKnowledge(response.data.results);
          setConfidenceScore(response.data.avgConfidence || null);
        } else {
          setKnowledge([]);
          setConfidenceScore(null);
        }
      } catch (err) {
        console.error('Failed to retrieve PILAR knowledge:', err);
        setError(err.message);
        setKnowledge([]);
        setConfidenceScore(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce to avoid too many API calls
    const timeoutId = setTimeout(fetchKnowledge, 500);

    return () => clearTimeout(timeoutId);
  }, [pillar, userQuery, enabled]);

  return {
    knowledge,
    isLoading,
    error,
    confidenceScore,
    hasHighConfidence: confidenceScore !== null && confidenceScore >= 0.7,
    hasLowConfidence: confidenceScore !== null && confidenceScore < 0.5
  };
}

/**
 * Format retrieved knowledge for LLM context injection
 * @param {Array} knowledgeChunks - Retrieved knowledge chunks
 * @returns {string} - Formatted context string
 */
export function formatKnowledgeContext(knowledgeChunks) {
  if (!knowledgeChunks || knowledgeChunks.length === 0) {
    return '';
  }

  const contextParts = knowledgeChunks.map((chunk, idx) => {
    const source = chunk.metadata?.source || 'PILAR Framework';
    const chapter = chunk.metadata?.chapter ? ` - ${chunk.metadata.chapter}` : '';
    return `[SOURCE ${idx + 1}: ${source}${chapter}]\n${chunk.content}\n`;
  });

  return `CONTEXT FROM BEN HESLOP'S PILAR FRAMEWORK:\n${contextParts.join('\n')}\n\nINSTRUCTION: Use this authoritative context to evaluate the user's understanding. If the user's response aligns with this framework, affirm it. If it diverges, gently correct using these specific definitions. Always cite which source you're referencing.`;
}

/**
 * Extract citations from assistant's response
 * @param {string} message - Assistant's message
 * @returns {Array} - Extracted citations with indices
 */
export function extractCitations(message) {
  const citationRegex = /\[SOURCE (\d+)\]/g;
  const citations = [];
  let match;

  while ((match = citationRegex.exec(message)) !== null) {
    citations.push({
      index: parseInt(match[1]) - 1,
      position: match.index
    });
  }

  return citations;
}