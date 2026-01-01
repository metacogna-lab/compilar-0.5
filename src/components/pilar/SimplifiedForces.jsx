// Simplified Ben Heslop PILAR Framework: 2 Modes, 5 Pillars, 8 Core Forces

export const coreForces = [
  {
    id: 'goal_orientation',
    name: 'Goal Orientation',
    pillar: 'purpose',
    egalitarian: 'Collective goals emerge through group dialogue and consensus',
    hierarchical: 'Individual goals set by leadership and cascaded down',
    description: 'How teams define and align on objectives'
  },
  {
    id: 'power_structure',
    name: 'Power Structure',
    pillar: 'interpersonal',
    egalitarian: 'Distributed authority based on expertise and context',
    hierarchical: 'Concentrated authority in formal positions and ranks',
    description: 'How decision-making power is distributed'
  },
  {
    id: 'resource_exchange',
    name: 'Resource Exchange',
    pillar: 'learning',
    egalitarian: 'Unconditional help flows freely without expectation',
    hierarchical: 'Conditional help traded as favors and transactions',
    description: 'How knowledge and support are shared'
  },
  {
    id: 'change_approach',
    name: 'Change Approach',
    pillar: 'action',
    egalitarian: 'Innovation welcomed through psychological safety',
    hierarchical: 'Stability preferred through norm enforcement',
    description: 'How teams handle adaptation and execution'
  },
  {
    id: 'trust_basis',
    name: 'Trust Basis',
    pillar: 'resilience',
    egalitarian: 'Peer-based trust through genuine relationships',
    hierarchical: 'Performance-based trust through visible competence',
    description: 'How credibility and respect are established'
  },
  {
    id: 'accountability_flow',
    name: 'Accountability Flow',
    pillar: 'purpose',
    egalitarian: 'Joint accountability shared across the team',
    hierarchical: 'Individual accountability to superiors',
    description: 'How responsibility is assigned and tracked'
  },
  {
    id: 'influence_mechanism',
    name: 'Influence Mechanism',
    pillar: 'interpersonal',
    egalitarian: 'Informal influence through relationships and persuasion',
    hierarchical: 'Formal authority through command capacity',
    description: 'How people shape decisions and outcomes'
  },
  {
    id: 'adaptation_mode',
    name: 'Adaptation Mode',
    pillar: 'action',
    egalitarian: 'Open dialogue enables emergent solutions',
    hierarchical: 'Status quo defense ensures predictability',
    description: 'How teams respond to challenges'
  }
];

export const pillarForceMap = {
  purpose: ['goal_orientation', 'accountability_flow'],
  interpersonal: ['power_structure', 'influence_mechanism'],
  learning: ['resource_exchange'],
  action: ['change_approach', 'adaptation_mode'],
  resilience: ['trust_basis']
};

export const getForcesByPillar = (pillar) => {
  const forceIds = pillarForceMap[pillar] || [];
  return coreForces.filter(f => forceIds.includes(f.id));
};

export const getAllForces = () => coreForces;

export const getForceById = (id) => coreForces.find(f => f.id === id);