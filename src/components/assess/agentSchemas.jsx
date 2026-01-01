/**
 * JSON Schemas and TypeScript interfaces for Agent-Driven UI
 */

/**
 * Schema for structured agent response
 * The LLM must return this alongside conversational text
 */
export const AgentResponseSchema = {
  type: "object",
  properties: {
    agent_response: {
      type: "string",
      description: "The conversational response text to show the user"
    },
    comprehension_score: {
      type: "number",
      minimum: 0,
      maximum: 1,
      description: "User's comprehension level (0-1 scale)"
    },
    recommended_view: {
      type: "string",
      enum: ["deep_dive_module", "summary_card", "next_step", "bonus_question", "continue"],
      description: "Next UI component to show"
    },
    key_concepts_missing: {
      type: "array",
      items: { type: "string" },
      description: "Concepts the user hasn't grasped yet"
    },
    mastery_indicators: {
      type: "array",
      items: { type: "string" },
      description: "Signs of deep understanding displayed by user"
    },
    emotional_state: {
      type: "string",
      enum: ["frustrated", "confused", "engaged", "confident", "bored"],
      description: "Detected emotional state from user's responses"
    }
  },
  required: ["agent_response", "comprehension_score", "recommended_view"]
};

/**
 * System prompt addition for structured output
 */
export const STRUCTURED_OUTPUT_INSTRUCTION = `
CRITICAL: You must return a JSON object at the end of your response wrapped in <AGENT_ANALYSIS> tags.

Format:
<AGENT_ANALYSIS>
{
  "agent_response": "Your conversational response here",
  "comprehension_score": 0.75,
  "recommended_view": "continue",
  "key_concepts_missing": ["concept1", "concept2"],
  "mastery_indicators": ["indicator1"],
  "emotional_state": "engaged"
}
</AGENT_ANALYSIS>

SCORING GUIDELINES:
- 0.0-0.3: Fundamental misunderstanding or no attempt
- 0.3-0.5: Partial understanding with major gaps
- 0.5-0.7: Adequate understanding with minor gaps
- 0.7-0.9: Strong understanding with nuanced grasp
- 0.9-1.0: Mastery level - can teach others

VIEW RECOMMENDATIONS:
- "deep_dive_module": Score < 0.5 - User needs remedial help
- "summary_card": Score 0.5-0.7 - User needs concept reinforcement
- "continue": Score 0.7-0.9 - User is progressing well
- "bonus_question": Score > 0.9 - User is ready for advanced challenge
- "next_step": User completed current topic successfully

EMOTIONAL STATE DETECTION:
- "frustrated": Repeated failed attempts, short responses, negative language
- "confused": Questions about questions, asking for clarification
- "engaged": Thoughtful responses, asking deeper questions
- "confident": Elaborate answers, connecting concepts
- "bored": Minimal responses despite high comprehension
`;

/**
 * Parse structured output from agent response
 * @param {string} response - Raw agent response
 * @returns {Object} - Parsed agent analysis or null
 */
export function parseAgentAnalysis(response) {
  try {
    const match = response.match(/<AGENT_ANALYSIS>([\s\S]*?)<\/AGENT_ANALYSIS>/);
    if (!match) return null;
    
    const jsonStr = match[1].trim();
    const analysis = JSON.parse(jsonStr);
    
    // Validate required fields
    if (!analysis.agent_response || 
        typeof analysis.comprehension_score !== 'number' ||
        !analysis.recommended_view) {
      console.warn('Invalid agent analysis structure:', analysis);
      return null;
    }
    
    return analysis;
  } catch (error) {
    console.error('Failed to parse agent analysis:', error);
    return null;
  }
}

/**
 * Clean agent response by removing analysis tags
 * @param {string} response - Raw agent response
 * @returns {string} - Clean response text
 */
export function cleanAgentResponse(response) {
  return response.replace(/<AGENT_ANALYSIS>[\s\S]*?<\/AGENT_ANALYSIS>/g, '').trim();
}