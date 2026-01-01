// Pillar color mapping for consistent styling
export const pillarColors = {
  // Egalitarian Mode
  divsexp: { color: 'violet', name: 'Diverse Expression' },
  indrecip: { color: 'pink', name: 'Indirect Reciprocity' },
  popularity: { color: 'indigo', name: 'Popularity' },
  grpprosp: { color: 'emerald', name: 'Group Prospects' },
  outresp: { color: 'amber', name: 'Outgoing Respect' },
  
  // Hierarchical Mode
  normexp: { color: 'violet', name: 'Normative Expression' },
  dirrecip: { color: 'pink', name: 'Direct Reciprocity' },
  status: { color: 'indigo', name: 'Status' },
  ownprosp: { color: 'emerald', name: 'Own Prospects' },
  incresp: { color: 'amber', name: 'Incoming Respect' },
  
  // General pillars
  purpose: { color: 'violet', name: 'Purpose' },
  interpersonal: { color: 'pink', name: 'Interpersonal' },
  learning: { color: 'blue', name: 'Learning' },
  action: { color: 'emerald', name: 'Action' },
  resilience: { color: 'amber', name: 'Resilience' }
};

// All force and connection terms to match
const pilarTerms = {
  forces: [
    'Psychological Safety', 'Challenge Welcome', 'Growth Mindset', 'Constructive Dissent',
    'Unconditional Helping', 'Resource Fluidity', 'Pay-it-Forward Culture', 'Reciprocity Trust',
    'Warmth & Acceptance', 'Informal Influence', 'Social Support', 'Belonging Signals',
    'Collective Goal Clarity', 'Team Success Belief', 'Shared Future Vision', 'Joint Accountability',
    'Peer Competence', 'Trust in Intentions', 'Quality Street', 'Delegation Confidence',
    'Predictability Preferred', 'Rewards of Conformity', 'Stability Preference', 'Norm Enforcement',
    'Conditional Help', 'Favor Trading', 'Pick and Stick', 'Debt Leverage',
    'Formal Authority', 'Command Capacity', 'Built-in Advantage', 'Control of Resources',
    'Personal Advancement', 'Credit Attribution', 'Self-Serving Goals', 'Incentive Alignment',
    'Perceived Competence', 'Reputation Management', 'External Locus of Control', 'Visibility of Delivery'
  ],
  connections: [
    'Circle the Wagons', 'Scapegoating', 'Desperate Times', 'Mucking in Together',
    'Spread the Love', 'Here to Help', 'Watch and Learn', 'Knowing What\'s Best',
    'Spread Too Thin', 'Making Fetch Happen', 'Heavy Lies the Crown', 'Font of Wisdom',
    'Rise to the Occasion', 'I\'ll Just Do It Myself', 'Don\'t Dis Me Bro', 'Compensatory Complacency',
    'Short Poppies', 'I\'ve Got it Covered', 'Winners are Grinners', 'Strength to Your Arm',
    'Left in the Lurch', 'Tits on a Bull', 'More to Lose, or Gain', 'Self Interest Quo',
    'All Praise the Boss', 'Predictability Preferred', 'The Right Thing', 'External Locus of Control',
    'Sulking in a Corner', 'Inferred Status', 'Comfortable in my Own Skin'
  ],
  pillars: Object.values(pillarColors).map(p => p.name)
};

/**
 * Fuzzy match PILAR entities (forces, connections, pillars) in text
 */
export function fuzzyMatchPilarEntities(text) {
  if (!text) return [];
  
  const matches = new Set();
  const lowerCaseText = text.toLowerCase();

  // Match all terms
  [...pilarTerms.forces, ...pilarTerms.connections, ...pilarTerms.pillars].forEach(term => {
    if (lowerCaseText.includes(term.toLowerCase())) {
      matches.add(term);
    }
  });

  return Array.from(matches);
}

/**
 * Highlight pillar names in text with colored spans, tooltips, and click handlers
 */
export function highlightPillarsInText(text) {
  if (!text) return text;
  
  let result = text;
  
  // Sort by length (longest first) to avoid partial matches
  const sortedTerms = Object.entries(pillarColors).sort((a, b) => 
    b[1].name.length - a[1].name.length
  );
  
  sortedTerms.forEach(([key, { color, name }]) => {
    const regex = new RegExp(`\\b(${name.replace(/\s+/g, '\\s+')})\\b`, 'gi');
    result = result.replace(regex, 
      `<span class="pilar-highlight cursor-pointer hover:scale-105 transition-transform text-${color}-400 font-semibold bg-${color}-500/10 px-1.5 py-0.5 rounded border border-${color}-500/20 hover:bg-${color}-500/20" title="Click to learn more about ${name}" data-pillar-name="${name}">$1</span>`
    );
  });

  // Highlight all force terms comprehensively
  const allForces = pilarTerms.forces;
  const sortedForces = allForces.sort((a, b) => b.length - a.length);
  
  sortedForces.forEach((forceName) => {
    const regex = new RegExp(`\\b(${forceName.replace(/\s+/g, '\\s+').replace(/&/g, '&amp;')})\\b`, 'gi');
    result = result.replace(regex, 
      `<span class="force-highlight cursor-pointer hover:scale-105 transition-transform text-pink-400 font-medium bg-pink-500/10 px-1.5 py-0.5 rounded border border-pink-500/20 hover:bg-pink-500/20" title="Click to explore: ${forceName}" data-force-name="${forceName}">$1</span>`
    );
  });

  // Highlight connection terms
  const allConnections = pilarTerms.connections;
  const sortedConnections = allConnections.sort((a, b) => b.length - a.length);
  
  sortedConnections.forEach((connectionName) => {
    const regex = new RegExp(`\\b(${connectionName.replace(/\s+/g, '\\s+').replace(/'/g, "\\'")})\\b`, 'gi');
    result = result.replace(regex, 
      `<span class="connection-highlight cursor-pointer hover:scale-105 transition-transform text-cyan-400 font-medium bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20 hover:bg-cyan-500/20" title="Click to explore: ${connectionName}" data-connection-name="${connectionName}">$1</span>`
    );
  });

  // Highlight important contextual terms
  const contextualTerms = [
    { term: 'coordination', color: 'violet', label: 'Coordination Pattern' },
    { term: 'egalitarian', color: 'emerald', label: 'Egalitarian Mode' },
    { term: 'hierarchical', color: 'amber', label: 'Hierarchical Mode' },
    { term: 'collective', color: 'blue', label: 'Collective Dynamics' },
    { term: 'individual', color: 'orange', label: 'Individual Dynamics' }
  ];

  contextualTerms.forEach(({ term, color, label }) => {
    const regex = new RegExp(`\\b(${term})\\b`, 'gi');
    result = result.replace(regex, 
      `<span class="context-highlight text-${color}-400 font-medium underline decoration-dotted decoration-${color}-400/40" title="${label}">$1</span>`
    );
  });

  return result;
}

/**
 * Get color class for a pillar ID
 */
export function getPillarColor(pillarId) {
  return pillarColors[pillarId]?.color || 'purple';
}

/**
 * Get full pillar name from ID
 */
export function getPillarName(pillarId) {
  return pillarColors[pillarId]?.name || pillarId;
}