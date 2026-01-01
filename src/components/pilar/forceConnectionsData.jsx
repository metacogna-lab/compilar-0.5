// Force connections data for PILAR framework
export const forceConnectionsData = {
  forces: [
    // EGALITARIAN FORCES
    {
      id: "ECP-01",
      mode: "Egalitarian",
      name: null,
      description: "Belief in collective success may or may not translate into helping behaviour.",
      type: "Discretionary",
      effect_type: "Discretionary",
      force_from: "Group Prospects",
      force_to: "Indirect Reciprocity"
    },
    {
      id: "ECP-02",
      mode: "Egalitarian",
      name: "Circle the Wagons",
      description: "Impending group failure increases in-group bonding and popularity effects.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Group Prospects",
      force_to: "Popularity"
    },
    {
      id: "ECP-03",
      mode: "Egalitarian",
      name: "Desperate Times",
      description: "Threats to group success increase openness to new ideas.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Group Prospects",
      force_to: "Diverse Expression"
    },
    {
      id: "ECP-04",
      mode: "Egalitarian",
      name: "Scapegoating",
      description: "Pressure on group success erodes trust and outward respect.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Group Prospects",
      force_to: "Outgoing Respect"
    },
    {
      id: "ECP-05",
      mode: "Egalitarian",
      name: "Mucking in Together",
      description: "Helping behaviour reinforces confidence in collective success.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Indirect Reciprocity",
      force_to: "Group Prospects"
    },
    {
      id: "ECP-06",
      mode: "Egalitarian",
      name: "Spread the Love",
      description: "Helping behaviour increases feelings of being liked.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Indirect Reciprocity",
      force_to: "Popularity"
    },
    {
      id: "ECP-07",
      mode: "Egalitarian",
      name: "Here to Help",
      description: "Mutual aid encourages expression of ideas.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Indirect Reciprocity",
      force_to: "Diverse Expression"
    },
    {
      id: "ECP-08",
      mode: "Egalitarian",
      name: "Watch and Learn",
      description: "Being helped increases perceived competence and trustworthiness.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Indirect Reciprocity",
      force_to: "Outgoing Respect"
    },
    {
      id: "ECP-09",
      mode: "Egalitarian",
      name: "Knowing What's Best",
      description: "Popularity provides informal influence over group direction.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Popularity",
      force_to: "Group Prospects"
    },
    {
      id: "ECP-10",
      mode: "Egalitarian",
      name: "Spread Too Thin",
      description: "Popularity reduces capacity to reciprocate help broadly.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Popularity",
      force_to: "Indirect Reciprocity"
    },
    {
      id: "ECP-11",
      mode: "Egalitarian",
      name: "Making Fetch Happen",
      description: "Popularity makes new ideas easier to advance.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Popularity",
      force_to: "Diverse Expression"
    },
    {
      id: "ECP-12",
      mode: "Egalitarian",
      name: "Heavy Lies the Crown",
      description: "Popularity attracts scrutiny, reducing outward respect.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Popularity",
      force_to: "Outgoing Respect"
    },
    {
      id: "ECP-13",
      mode: "Egalitarian",
      name: "Font of Wisdom",
      description: "Diverse ideas improve collective problem-solving.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Diverse Expression",
      force_to: "Group Prospects"
    },
    {
      id: "ECP-14",
      mode: "Egalitarian",
      name: "Growth Mindset",
      description: "Idea diversity promotes learning-oriented helping.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Diverse Expression",
      force_to: "Indirect Reciprocity"
    },
    {
      id: "ECP-15",
      mode: "Egalitarian",
      name: null,
      description: "Expression may or may not increase popularity.",
      type: "Discretionary",
      effect_type: "Discretionary",
      force_from: "Diverse Expression",
      force_to: "Popularity"
    },
    {
      id: "ECP-16",
      mode: "Egalitarian",
      name: "Rise to the Occasion",
      description: "Open contribution builds mutual respect.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Diverse Expression",
      force_to: "Outgoing Respect"
    },
    {
      id: "ECP-17",
      mode: "Egalitarian",
      name: "Quality Street",
      description: "Respect strengthens belief in group success.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Outgoing Respect",
      force_to: "Group Prospects"
    },
    {
      id: "ECP-18",
      mode: "Egalitarian",
      name: "I'll Just Do It Myself",
      description: "Respect encourages voluntary helping behaviour.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Outgoing Respect",
      force_to: "Indirect Reciprocity"
    },
    {
      id: "ECP-19",
      mode: "Egalitarian",
      name: "Don't Dis Me Bro",
      description: "Respect increases informal social standing.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Outgoing Respect",
      force_to: "Popularity"
    },
    {
      id: "ECP-20",
      mode: "Egalitarian",
      name: "Compensatory Complacency",
      description: "High respect can reduce pressure to challenge ideas.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Outgoing Respect",
      force_to: "Diverse Expression"
    },
    // HIERARCHICAL FORCES
    {
      id: "HCP-01",
      mode: "Hierarchical",
      name: null,
      description: "Personal success may or may not create obligations.",
      type: "Discretionary",
      effect_type: "Discretionary",
      force_from: "Own Prospects",
      force_to: "Direct Reciprocity"
    },
    {
      id: "HCP-02",
      mode: "Hierarchical",
      name: "Short Poppies",
      description: "Success attracts envy and status challenge.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Own Prospects",
      force_to: "Status"
    },
    {
      id: "HCP-03",
      mode: "Hierarchical",
      name: "I've Got it Covered",
      description: "Confidence reduces openness to shared norms.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Own Prospects",
      force_to: "Normative Expression"
    },
    {
      id: "HCP-04",
      mode: "Hierarchical",
      name: "Winners are Grinners",
      description: "Success increases deference from others.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Own Prospects",
      force_to: "Incoming Respect"
    },
    {
      id: "HCP-05",
      mode: "Hierarchical",
      name: "Strength to Your Arm",
      description: "Obligation improves personal outcomes.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Direct Reciprocity",
      force_to: "Own Prospects"
    },
    {
      id: "HCP-06",
      mode: "Hierarchical",
      name: "Pick and Stick",
      description: "Debt reinforces hierarchy.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Direct Reciprocity",
      force_to: "Status"
    },
    {
      id: "HCP-07",
      mode: "Hierarchical",
      name: "Left in the Lurch",
      description: "Transactional ties enforce conformity.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Direct Reciprocity",
      force_to: "Normative Expression"
    },
    {
      id: "HCP-08",
      mode: "Hierarchical",
      name: "Tits on a Bull",
      description: "Lack of obligation undermines respect.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Direct Reciprocity",
      force_to: "Incoming Respect"
    },
    {
      id: "HCP-09",
      mode: "Hierarchical",
      name: "Built-in Advantage",
      description: "Status creates structural success advantage.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Status",
      force_to: "Own Prospects"
    },
    {
      id: "HCP-10",
      mode: "Hierarchical",
      name: "More to Lose, or Gain",
      description: "Status heightens transactional sensitivity.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Status",
      force_to: "Direct Reciprocity"
    },
    {
      id: "HCP-11",
      mode: "Hierarchical",
      name: "Self Interest Quo",
      description: "Status incentivises preserving norms.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Status",
      force_to: "Normative Expression"
    },
    {
      id: "HCP-12",
      mode: "Hierarchical",
      name: "All Praise the Boss",
      description: "High status creates expectations of deference.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Status",
      force_to: "Incoming Respect"
    },
    {
      id: "HCP-13",
      mode: "Hierarchical",
      name: "Rewards of Conformity",
      description: "Norm compliance improves prospects.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Normative Expression",
      force_to: "Own Prospects"
    },
    {
      id: "HCP-14",
      mode: "Hierarchical",
      name: "Predictability Preferred",
      description: "Norm adherence stabilises obligations.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Normative Expression",
      force_to: "Direct Reciprocity"
    },
    {
      id: "HCP-15",
      mode: "Hierarchical",
      name: null,
      description: "Norms may or may not reinforce hierarchy.",
      type: "Discretionary",
      effect_type: "Discretionary",
      force_from: "Normative Expression",
      force_to: "Status"
    },
    {
      id: "HCP-16",
      mode: "Hierarchical",
      name: "The Right Thing",
      description: "Norm adherence elicits respect.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Normative Expression",
      force_to: "Incoming Respect"
    },
    {
      id: "HCP-17",
      mode: "Hierarchical",
      name: "External Locus of Control",
      description: "Deference shapes perceived success.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Incoming Respect",
      force_to: "Own Prospects"
    },
    {
      id: "HCP-18",
      mode: "Hierarchical",
      name: "Sulking in a Corner",
      description: "Respect dynamics affect transactional engagement.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Incoming Respect",
      force_to: "Direct Reciprocity"
    },
    {
      id: "HCP-19",
      mode: "Hierarchical",
      name: "Inferred Status",
      description: "Deference reinforces perceived rank.",
      type: "Reinforce",
      effect_type: "Reinforce",
      force_from: "Incoming Respect",
      force_to: "Status"
    },
    {
      id: "HCP-20",
      mode: "Hierarchical",
      name: "Comfortable in my Own Skin",
      description: "High deference reduces pressure to conform.",
      type: "Inverse",
      effect_type: "Inverse",
      force_from: "Incoming Respect",
      force_to: "Normative Expression"
    }
  ]
};