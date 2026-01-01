/**
 * Dynamic System Prompt Builder for PILAR Assessment Agent
 * Adapts agent persona based on user experience, confidence, and history
 */

/**
 * Determines user's experience level from profile and assessment history
 * @param {Object} userProfile - User profile data
 * @param {Array} assessmentSessions - Past assessment sessions
 * @returns {string} - 'novice', 'intermediate', or 'expert'
 */
function determineExperienceLevel(userProfile, assessmentSessions = []) {
  const totalAssessments = userProfile?.total_assessments_completed || 0;
  const avgScore = assessmentSessions.length > 0
    ? assessmentSessions.reduce((sum, s) => sum + (s.total_score || 0), 0) / assessmentSessions.length
    : 0;

  if (totalAssessments === 0 || avgScore < 50) return 'novice';
  if (totalAssessments < 3 || avgScore < 70) return 'intermediate';
  return 'expert';
}

/**
 * Determines user's confidence level from recent assessments
 * @param {Array} assessmentSessions - Past assessment sessions
 * @returns {string} - 'low', 'moderate', or 'high'
 */
function determineConfidenceLevel(assessmentSessions = []) {
  if (assessmentSessions.length === 0) return 'low';
  
  const recentSessions = assessmentSessions.slice(-3);
  const avgConfidence = recentSessions.reduce((sum, s) => {
    return sum + (s.engagement_metrics?.confidence_level || 50);
  }, 0) / recentSessions.length;

  if (avgConfidence < 50) return 'low';
  if (avgConfidence < 75) return 'moderate';
  return 'high';
}

/**
 * Identifies weak pillars from assessment history
 * @param {Object} userProfile - User profile data
 * @returns {Array} - Array of weak pillar names
 */
function identifyWeakPillars(userProfile) {
  const pillarScores = userProfile?.pillar_scores_summary || {};
  const scores = Object.entries(pillarScores);
  
  if (scores.length === 0) return [];
  
  const avgScore = scores.reduce((sum, [_, score]) => sum + score, 0) / scores.length;
  return scores
    .filter(([_, score]) => score < avgScore - 10)
    .map(([pillar, _]) => pillar);
}

/**
 * Builds the "Bridge" - references to past performance
 * @param {Object} userProfile - User profile data
 * @param {Array} assessmentSessions - Past assessment sessions
 * @param {string} currentPillar - Current pillar being assessed
 * @returns {string} - Bridge context string
 */
function buildBridgeContext(userProfile, assessmentSessions, currentPillar) {
  const weakPillars = identifyWeakPillars(userProfile);
  const bridges = [];

  // Reference previous weak performance
  if (weakPillars.length > 0 && !weakPillars.includes(currentPillar)) {
    const weakPillarList = weakPillars.join(', ');
    bridges.push(
      `The user previously scored lower on: ${weakPillarList}. ` +
      `If they struggle with ${currentPillar}, explore if these areas are connected in their context.`
    );
  }

  // Reference past sessions on same pillar
  const samePillarSessions = assessmentSessions.filter(s => 
    s.pillar?.toLowerCase().includes(currentPillar?.toLowerCase())
  );
  
  if (samePillarSessions.length > 0) {
    const lastScore = samePillarSessions[samePillarSessions.length - 1]?.total_score || 0;
    const trend = samePillarSessions.length > 1 
      ? samePillarSessions[samePillarSessions.length - 1].total_score - samePillarSessions[0].total_score
      : 0;
    
    if (trend > 10) {
      bridges.push(
        `The user has shown improvement in ${currentPillar} (last score: ${Math.round(lastScore)}%). ` +
        `Acknowledge their growth and push them to the next level.`
      );
    } else if (trend < -10) {
      bridges.push(
        `The user's performance in ${currentPillar} has declined. ` +
        `Be supportive and help them identify what changed.`
      );
    }
  }

  // Reference job role context
  if (userProfile?.position) {
    bridges.push(
      `The user works as: ${userProfile.position}. ` +
      `Connect ${currentPillar} concepts to their specific professional context.`
    );
  }

  return bridges.length > 0 
    ? `\n\nCONTEXTUAL BRIDGES:\n${bridges.join('\n\n')}`
    : '';
}

/**
 * RAG Context Chunk Interface
 */
interface RagContextChunk {
  id: string;
  content: string;
  source: string;
  type?: 'force' | 'pillar' | 'concept' | 'connection';
  relevance_score?: number;
}

/**
 * Main function: Builds dynamic system prompt with RAG integration
 * @param {Object} userProfile - User profile entity
 * @param {Array} assessmentSessions - Past assessment sessions
 * @param {Object} currentContext - Current assessment context (pillar, mode)
 * @param {Array} ragContext - Selective RAG-retrieved chunks (forces, concepts, definitions)
 * @returns {string} - Complete system prompt with adaptive persona and knowledge grounding
 */
export function buildDynamicSystemPrompt(
  userProfile, 
  assessmentSessions = [], 
  currentContext = {},
  ragContext: RagContextChunk[] = []
) {
  const { pillar, mode } = currentContext;
  
  // Determine user characteristics
  const experienceLevel = determineExperienceLevel(userProfile, assessmentSessions);
  const confidenceLevel = determineConfidenceLevel(assessmentSessions);
  const weakPillars = identifyWeakPillars(userProfile);

  // Base prompt
  let systemPrompt = `You are an adaptive PILAR Framework assessment coach. Your persona and approach must dynamically adjust based on the user's profile.\n\n`;

  // === PERSONA INJECTION ===
  if (experienceLevel === 'novice' || confidenceLevel === 'low') {
    systemPrompt += `PERSONA: Supportive Mentor

You are speaking to someone new to these concepts or lacking confidence. Your approach:
- Use clear, simple language and relatable analogies
- Break complex ideas into digestible pieces
- Celebrate small wins and incremental understanding
- Provide frequent encouragement and positive reinforcement
- Use concrete examples from everyday work scenarios
- Ask guiding questions that scaffold their learning
- Be patient and avoid overwhelming them with too much at once

Tone: Warm, encouraging, patient, and nurturing.\n\n`;

  } else if (experienceLevel === 'expert' || confidenceLevel === 'high') {
    systemPrompt += `PERSONA: Peer Reviewer

You are speaking to an experienced professional who understands these concepts well. Your approach:
- Be concise and technical - they don't need hand-holding
- Challenge their assumptions and push deeper analysis
- Ask probing questions that reveal edge cases and nuances
- Expect high-fidelity, well-reasoned answers
- Reference advanced frameworks and interconnections
- Point out subtle distinctions they might have missed
- Engage in intellectual discourse as equals

Tone: Direct, analytical, challenging, and intellectually rigorous.\n\n`;

  } else {
    systemPrompt += `PERSONA: Collaborative Coach

You are speaking to someone with moderate experience. Your approach:
- Balance explanation with exploration
- Use a mix of concrete and abstract examples
- Challenge them to think deeper, but provide support when needed
- Validate their knowledge while identifying gaps
- Connect theory to practical application
- Encourage them to make connections themselves

Tone: Balanced, collaborative, insightful, and growth-oriented.\n\n`;
  }

  // === CURRENT ASSESSMENT CONTEXT ===
  systemPrompt += `CURRENT FOCUS:
- Pillar: ${pillar}
- Mode: ${mode}
- User's Best Pillar: ${userProfile?.best_pillar || 'Unknown'}
- User's Growth Area: ${userProfile?.worst_pillar || 'Unknown'}
- Total Assessments Completed: ${userProfile?.total_assessments_completed || 0}\n\n`;

  // === BRIDGE TECHNIQUE ===
  const bridgeContext = buildBridgeContext(userProfile, assessmentSessions, pillar);
  if (bridgeContext) {
    systemPrompt += bridgeContext + '\n\n';
  }

  // === SPECIFIC GUIDANCE ===
  if (weakPillars.includes(pillar)) {
    systemPrompt += `IMPORTANT: The user has historically struggled with ${pillar}. Be extra supportive and help them build confidence in this area. Identify specific blockers.\n\n`;
  }

  if (userProfile?.best_pillar === pillar) {
    systemPrompt += `IMPORTANT: This is one of the user's strongest areas. Don't just validate - push them to articulate WHY they excel here and how they can leverage this strength.\n\n`;
  }

  // === RAG KNOWLEDGE INTEGRATION ===
  if (ragContext && ragContext.length > 0) {
    // Organize RAG chunks by type for efficient LLM parsing
    const forces = ragContext.filter(c => c.type === 'force');
    const pillars = ragContext.filter(c => c.type === 'pillar');
    const concepts = ragContext.filter(c => c.type === 'concept' || !c.type);

    systemPrompt += `\n--- RETRIEVED KNOWLEDGE CONTEXT (USE THIS FOR ACCURACY) ---\n`;

    // Forces section (most critical for detailed assessment)
    if (forces.length > 0) {
      systemPrompt += `\nRELEVANT FORCES (Mode: ${mode}):\n`;
      forces.forEach((chunk, idx) => {
        systemPrompt += `\n${idx + 1}. ${chunk.content}\n`;
      });
    }

    // Pillar definitions
    if (pillars.length > 0) {
      systemPrompt += `\nPILLAR DEFINITIONS:\n`;
      pillars.forEach((chunk, idx) => {
        systemPrompt += `\n${idx + 1}. ${chunk.content}\n`;
      });
    }

    // Supporting concepts
    if (concepts.length > 0) {
      systemPrompt += `\nSUPPORTING CONCEPTS:\n`;
      concepts.forEach((chunk, idx) => {
        systemPrompt += `\n${idx + 1}. Source: ${chunk.source}\n${chunk.content}\n`;
      });
    }

    systemPrompt += `\n--- END RETRIEVED KNOWLEDGE ---\n\n`;

    systemPrompt += `CRITICAL RAG INSTRUCTION:
- ALWAYS reference the "Retrieved Knowledge Context" above when discussing forces, pillars, or concepts
- Use the exact terminology and definitions provided in the retrieved chunks
- If a user asks about a force, use the High/Low impact descriptions from the retrieved data
- Ground all explanations in the provided knowledge - do not hallucinate or deviate
- If information is not in the retrieved context, acknowledge the limitation\n\n`;
  }

  // === CORE INSTRUCTIONS ===
  systemPrompt += `CORE INSTRUCTIONS:
1. Adapt your communication style to match the persona above
2. Reference the user's history (bridges) to create continuity and deeper insights
3. Use the retrieved PILAR framework context (RAG chunks) to ensure accuracy
4. When correcting misconceptions, do so in a way that fits the persona
5. Ask follow-up questions that deepen understanding at the appropriate level
6. Connect concepts across pillars when relevant to the user's profile
7. If discussing forces, always cite the specific force name and its impact range

Remember: Your goal is not just to assess, but to facilitate genuine learning and growth at the user's current level. The retrieved knowledge ensures you stay grounded in the PILAR framework.`;

  return systemPrompt;
}

/**
 * Utility: Get user's journey stage based on total assessments
 * @param {number} totalAssessments 
 * @returns {string}
 */
export function getUserJourneyStage(totalAssessments) {
  if (totalAssessments === 0) return 'newcomer';
  if (totalAssessments < 3) return 'explorer';
  if (totalAssessments < 10) return 'practitioner';
  return 'master';
}

/**
 * Format force data for RAG context (efficiency helper)
 * Converts raw ForcePromptCard data into structured RagContextChunk
 * @param {Object} forceData - Force data from ForcePromptCard entity
 * @returns {RagContextChunk}
 */
export function formatForceForRAG(forceData): RagContextChunk {
  const content = `Force Name: ${forceData.name} (Mode: ${forceData.mode}, Type: ${forceData.type})
Description: ${forceData.description_low || forceData.description_high || ''}
High Impact (7-10): ${forceData.description_high || 'N/A'} [Effect: ${forceData.effect_high_9_10 || forceData.effect_high_7_8}]
Low Impact (1-4): ${forceData.description_low || 'N/A'} [Effect: ${forceData.effect_low_1_2 || forceData.effect_low_3_4}]
From: ${forceData.force_from} → To: ${forceData.force_to}`;

  return {
    id: `force_${forceData.name?.replace(/\s+/g, '_')}`,
    content,
    source: `ForcePromptCard:${forceData.name}`,
    type: 'force',
    relevance_score: 1.0
  };
}

/**
 * Format pillar data for RAG context
 * @param {Object} pillarData - Pillar data from pillarsInfo
 * @returns {RagContextChunk}
 */
export function formatPillarForRAG(pillarData): RagContextChunk {
  const content = `Pillar: ${pillarData.title} (${pillarData.abbreviation})
Description: ${pillarData.description}
Full Description: ${pillarData.fullDescription || pillarData.description}`;

  return {
    id: `pillar_${pillarData.id}`,
    content,
    source: `PillarDefinition:${pillarData.id}`,
    type: 'pillar',
    relevance_score: 1.0
  };
}