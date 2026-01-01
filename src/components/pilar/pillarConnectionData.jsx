// Connection data for PillarConnectionGraph2
// Maps connections between pillars using force_from and force_to fields
// This data structure defines how pillars relate to each other through forces

import { pillarsInfo } from './pillarsData';

export const pillarConnectionData = {
  egalitarian: [
    {
      id: "ECP-01",
      force_from: "Group Prospects",
      force_to: "Indirect Reciprocity",
      name: null,
      description: "Belief in collective success may or may not translate into helping behaviour, depending on context.",
      effect_type: "Discretionary",
      strength: 0.5,
      color: "#8B5CF6"
    },
    {
      id: "ECP-02",
      force_from: "Group Prospects",
      force_to: "Popularity",
      name: "Circle the Wagons",
      description: "Impending group failure draws members closer together, increasing in-group bonding and popularity effects.",
      effect_type: "Inverse",
      strength: 0.78,
      color: "#EC4899"
    },
    {
      id: "ECP-03",
      force_from: "Group Prospects",
      force_to: "Diverse Expression",
      name: "Desperate Times",
      description: "When group success is threatened, openness to diverse ideas often increases.",
      effect_type: "Inverse",
      strength: 0.70,
      color: "#10B981"
    },
    {
      id: "ECP-04",
      force_from: "Group Prospects",
      force_to: "Outgoing Respect",
      name: "Scapegoating",
      description: "Threats to group success can erode trust and respect between members.",
      effect_type: "Reinforce",
      strength: 0.85,
      color: "#4F46E5"
    },
    {
      id: "ECP-05",
      force_from: "Indirect Reciprocity",
      force_to: "Group Prospects",
      name: "Mucking in Together",
      description: "Receiving help reinforces the belief that mutual aid is normal and that the group will succeed.",
      effect_type: "Reinforce",
      strength: 0.85,
      color: "#8B5CF6"
    },
    {
      id: "ECP-06",
      force_from: "Indirect Reciprocity",
      force_to: "Popularity",
      name: "Spread the Love",
      description: "Helping behaviour increases feelings of being liked and socially accepted.",
      effect_type: "Reinforce",
      strength: 0.88,
      color: "#EC4899"
    },
    {
      id: "ECP-07",
      force_from: "Indirect Reciprocity",
      force_to: "Diverse Expression",
      name: "Here to Help",
      description: "A culture of helping makes individuals more willing to share ideas and perspectives.",
      effect_type: "Reinforce",
      strength: 0.80,
      color: "#10B981"
    },
    {
      id: "ECP-08",
      force_from: "Indirect Reciprocity",
      force_to: "Outgoing Respect",
      name: "Watch and Learn",
      description: "Being helped provides insight into others' competence and trustworthiness.",
      effect_type: "Reinforce",
      strength: 0.75,
      color: "#4F46E5"
    },
    {
      id: "ECP-09",
      force_from: "Popularity",
      force_to: "Group Prospects",
      name: "Knowing What's Best",
      description: "Popularity grants informal influence, increasing confidence in the group's direction.",
      effect_type: "Reinforce",
      strength: 0.75,
      color: "#8B5CF6"
    },
    {
      id: "ECP-10",
      force_from: "Popularity",
      force_to: "Indirect Reciprocity",
      name: "Spread Too Thin",
      description: "High popularity can reduce willingness or capacity to reciprocate help broadly.",
      effect_type: "Inverse",
      strength: 0.65,
      color: "#EC4899"
    },
    {
      id: "ECP-11",
      force_from: "Popularity",
      force_to: "Diverse Expression",
      name: "Making Fetch Happen",
      description: "Popular individuals find it easier to have new ideas accepted.",
      effect_type: "Reinforce",
      strength: 0.82,
      color: "#10B981"
    },
    {
      id: "ECP-12",
      force_from: "Popularity",
      force_to: "Outgoing Respect",
      name: "Heavy Lies the Crown",
      description: "Popularity can attract scrutiny, reducing perceived trust or goodwill.",
      effect_type: "Inverse",
      strength: 0.68,
      color: "#4F46E5"
    },
    {
      id: "ECP-13",
      force_from: "Diverse Expression",
      force_to: "Group Prospects",
      name: "Font of Wisdom",
      description: "Open idea-sharing improves collective problem-solving and group confidence.",
      effect_type: "Reinforce",
      strength: 0.90,
      color: "#8B5CF6"
    },
    {
      id: "ECP-14",
      force_from: "Diverse Expression",
      force_to: "Indirect Reciprocity",
      name: "Growth Mindset",
      description: "Diverse ideas encourage learning-oriented helping behaviour.",
      effect_type: "Reinforce",
      strength: 0.78,
      color: "#EC4899"
    },
    {
      id: "ECP-15",
      force_from: "Diverse Expression",
      force_to: "Popularity",
      name: null,
      description: "Expression may or may not translate into popularity, depending on group norms.",
      effect_type: "Discretionary",
      strength: 0.5,
      color: "#10B981"
    },
    {
      id: "ECP-16",
      force_from: "Diverse Expression",
      force_to: "Outgoing Respect",
      name: "Rise to the Occasion",
      description: "Open contribution increases mutual respect among peers.",
      effect_type: "Reinforce",
      strength: 0.82,
      color: "#4F46E5"
    },
    {
      id: "ECP-17",
      force_from: "Outgoing Respect",
      force_to: "Group Prospects",
      name: "Quality Street",
      description: "Mutual respect strengthens confidence in collective success.",
      effect_type: "Reinforce",
      strength: 0.88,
      color: "#8B5CF6"
    },
    {
      id: "ECP-18",
      force_from: "Outgoing Respect",
      force_to: "Indirect Reciprocity",
      name: "I'll Just Do It Myself",
      description: "Respect for others encourages voluntary helping behaviour.",
      effect_type: "Reinforce",
      strength: 0.80,
      color: "#EC4899"
    },
    {
      id: "ECP-19",
      force_from: "Outgoing Respect",
      force_to: "Popularity",
      name: "Don't Dis Me Bro",
      description: "Respect increases informal social standing.",
      effect_type: "Reinforce",
      strength: 0.75,
      color: "#10B981"
    },
    {
      id: "ECP-20",
      force_from: "Outgoing Respect",
      force_to: "Diverse Expression",
      name: "Compensatory Complacency",
      description: "High mutual respect can reduce urgency to challenge ideas.",
      effect_type: "Inverse",
      strength: 0.70,
      color: "#4F46E5"
    }
  ],
  hierarchical: [
    {
      id: "HCP-01",
      force_from: "Own Prospects",
      force_to: "Direct Reciprocity",
      name: null,
      description: "Personal success may or may not create obligations, depending on discretion and power dynamics.",
      effect_type: "Discretionary",
      strength: 0.5,
      color: "#EC4899"
    },
    {
      id: "HCP-02",
      force_from: "Own Prospects",
      force_to: "Status",
      name: "Short Poppies",
      description: "Rising success attracts envy and challenges to status.",
      effect_type: "Inverse",
      strength: 0.70,
      color: "#4F46E5"
    },
    {
      id: "HCP-03",
      force_from: "Own Prospects",
      force_to: "Normative Expression",
      name: "I've Got it Covered",
      description: "Confidence in personal success reduces openness to shared norms.",
      effect_type: "Inverse",
      strength: 0.78,
      color: "#8B5CF6"
    },
    {
      id: "HCP-04",
      force_from: "Own Prospects",
      force_to: "Incoming Respect",
      name: "Winners are Grinners",
      description: "Success increases deference from others.",
      effect_type: "Reinforce",
      strength: 0.82,
      color: "#F59E0B"
    },
    {
      id: "HCP-05",
      force_from: "Direct Reciprocity",
      force_to: "Own Prospects",
      name: "Strength to Your Arm",
      description: "Reciprocal obligations increase chances of personal success.",
      effect_type: "Reinforce",
      strength: 0.85,
      color: "#10B981"
    },
    {
      id: "HCP-06",
      force_from: "Direct Reciprocity",
      force_to: "Status",
      name: "Pick and Stick",
      description: "Debt and obligation reinforce status hierarchies.",
      effect_type: "Reinforce",
      strength: 0.75,
      color: "#4F46E5"
    },
    {
      id: "HCP-07",
      force_from: "Direct Reciprocity",
      force_to: "Normative Expression",
      name: "Left in the Lurch",
      description: "Transactional relationships enforce conformity to norms.",
      effect_type: "Reinforce",
      strength: 0.72,
      color: "#8B5CF6"
    },
    {
      id: "HCP-08",
      force_from: "Direct Reciprocity",
      force_to: "Incoming Respect",
      name: "Tits on a Bull",
      description: "Lack of reciprocal support undermines perceived worthiness of respect.",
      effect_type: "Reinforce",
      strength: 0.68,
      color: "#F59E0B"
    },
    {
      id: "HCP-09",
      force_from: "Status",
      force_to: "Own Prospects",
      name: "Built-in Advantage",
      description: "Higher status provides structural advantages for success.",
      effect_type: "Reinforce",
      strength: 0.90,
      color: "#10B981"
    },
    {
      id: "HCP-10",
      force_from: "Status",
      force_to: "Direct Reciprocity",
      name: "More to Lose, or Gain",
      description: "Status heightens sensitivity to transactional risk.",
      effect_type: "Inverse",
      strength: 0.65,
      color: "#EC4899"
    },
    {
      id: "HCP-11",
      force_from: "Status",
      force_to: "Normative Expression",
      name: "Self Interest Quo",
      description: "Status incentivises preservation of existing norms.",
      effect_type: "Reinforce",
      strength: 0.85,
      color: "#8B5CF6"
    },
    {
      id: "HCP-12",
      force_from: "Status",
      force_to: "Incoming Respect",
      name: "All Praise the Boss",
      description: "High status creates expectations of deference.",
      effect_type: "Inverse",
      strength: 0.75,
      color: "#F59E0B"
    },
    {
      id: "HCP-13",
      force_from: "Normative Expression",
      force_to: "Own Prospects",
      name: "Rewards of Conformity",
      description: "Adhering to norms increases chances of personal success.",
      effect_type: "Reinforce",
      strength: 0.80,
      color: "#10B981"
    },
    {
      id: "HCP-14",
      force_from: "Normative Expression",
      force_to: "Direct Reciprocity",
      name: "Predictability Preferred",
      description: "Norm adherence strengthens transactional reliability.",
      effect_type: "Reinforce",
      strength: 0.85,
      color: "#EC4899"
    },
    {
      id: "HCP-15",
      force_from: "Normative Expression",
      force_to: "Status",
      name: null,
      description: "Norms may or may not reinforce hierarchy, depending on enforcement.",
      effect_type: "Discretionary",
      strength: 0.5,
      color: "#4F46E5"
    },
    {
      id: "HCP-16",
      force_from: "Normative Expression",
      force_to: "Incoming Respect",
      name: "The Right Thing",
      description: "Normative behaviour elicits deference and approval.",
      effect_type: "Reinforce",
      strength: 0.82,
      color: "#F59E0B"
    },
    {
      id: "HCP-17",
      force_from: "Incoming Respect",
      force_to: "Own Prospects",
      name: "External Locus of Control",
      description: "Deference shapes perceptions of personal success.",
      effect_type: "Reinforce",
      strength: 0.78,
      color: "#10B981"
    },
    {
      id: "HCP-18",
      force_from: "Incoming Respect",
      force_to: "Direct Reciprocity",
      name: "Sulking in a Corner",
      description: "Respect dynamics influence transactional engagement.",
      effect_type: "Reinforce",
      strength: 0.75,
      color: "#EC4899"
    },
    {
      id: "HCP-19",
      force_from: "Incoming Respect",
      force_to: "Status",
      name: "Inferred Status",
      description: "Deference reinforces perceived rank.",
      effect_type: "Reinforce",
      strength: 0.88,
      color: "#4F46E5"
    },
    {
      id: "HCP-20",
      force_from: "Incoming Respect",
      force_to: "Normative Expression",
      name: "Comfortable in my Own Skin",
      description: "High deference can reduce pressure to conform.",
      effect_type: "Inverse",
      strength: 0.70,
      color: "#8B5CF6"
    }
  ]
};

// Dynamically generate title-to-ID map from pillarsInfo
const generateTitleToIdMap = () => {
  const map = {};
  
  // Process both egalitarian and hierarchical modes
  ['egalitarian', 'hierarchical'].forEach(mode => {
    const pillars = pillarsInfo[mode] || [];
    pillars.forEach(pillar => {
      map[pillar.title] = pillar.id;
    });
  });
  
  return map;
};

const titleToIdMap = generateTitleToIdMap();

// Transform the data to match PillarConnectionGraph format
export const adaptConnectionData = (mode) => {
  const rawData = pillarConnectionData[mode] || [];
  
  return rawData.map(conn => {
    const fromId = titleToIdMap[conn.force_from];
    const toId = titleToIdMap[conn.force_to];
    
    // Log warnings for unmapped pillars
    if (!fromId) {
      console.warn(`[adaptConnectionData] Cannot map force_from: "${conn.force_from}" in mode "${mode}"`);
    }
    if (!toId) {
      console.warn(`[adaptConnectionData] Cannot map force_to: "${conn.force_to}" in mode "${mode}"`);
    }
    
    return {
      from: fromId || conn.force_from,
      to: toId || conn.force_to,
      label: conn.name,
      detail: conn.description,
      strength: conn.strength || 0.7,
      modes: [mode],
      color: conn.color || '#8B5CF6',
      force_from: conn.force_from, // Keep original for reference
      force_to: conn.force_to, // Keep original for reference
      effect_type: conn.effect_type,
      id: conn.id
    };
  });
};