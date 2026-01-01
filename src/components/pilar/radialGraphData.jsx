export const radialGraphData = {
  "nodes": [
    {
      "id": "prospects",
      "label": "Prospects",
      "type": "pillar",
      "mode": "neutral",
      "group": "Pillars"
    },
    {
      "id": "prospects_goal_clarity",
      "label": "Goal Clarity",
      "type": "force",
      "mode": "neutral",
      "group": "Prospects"
    },
    {
      "id": "prospects_future_confidence",
      "label": "Future Confidence",
      "type": "force",
      "mode": "neutral",
      "group": "Prospects"
    },
    {
      "id": "prospects_shared_vision",
      "label": "Shared Vision",
      "type": "force",
      "mode": "neutral",
      "group": "Prospects"
    },
    {
      "id": "prospects_incentive_alignment",
      "label": "Incentive Alignment",
      "type": "force",
      "mode": "neutral",
      "group": "Prospects"
    },
    {
      "id": "involved",
      "label": "Involved",
      "type": "pillar",
      "mode": "neutral",
      "group": "Pillars"
    },
    {
      "id": "involved_help_norms",
      "label": "Help Norms",
      "type": "force",
      "mode": "neutral",
      "group": "Involved"
    },
    {
      "id": "involved_transaction_cost",
      "label": "Transaction Cost",
      "type": "force",
      "mode": "neutral",
      "group": "Involved"
    },
    {
      "id": "involved_debt_obligation",
      "label": "Debt & Obligation",
      "type": "force",
      "mode": "neutral",
      "group": "Involved"
    },
    {
      "id": "involved_resource_fairness",
      "label": "Resource Fairness",
      "type": "force",
      "mode": "neutral",
      "group": "Involved"
    },
    {
      "id": "liked",
      "label": "Liked",
      "type": "pillar",
      "mode": "neutral",
      "group": "Pillars"
    },
    {
      "id": "liked_belonging",
      "label": "Belonging",
      "type": "force",
      "mode": "neutral",
      "group": "Liked"
    },
    {
      "id": "liked_influence_channels",
      "label": "Influence Channels",
      "type": "force",
      "mode": "neutral",
      "group": "Liked"
    },
    {
      "id": "liked_social_support",
      "label": "Social Support",
      "type": "force",
      "mode": "neutral",
      "group": "Liked"
    },
    {
      "id": "liked_legitimacy",
      "label": "Legitimacy",
      "type": "force",
      "mode": "neutral",
      "group": "Liked"
    },
    {
      "id": "agency",
      "label": "Agency",
      "type": "pillar",
      "mode": "neutral",
      "group": "Pillars"
    },
    {
      "id": "agency_voice_safety",
      "label": "Voice Safety",
      "type": "force",
      "mode": "neutral",
      "group": "Agency"
    },
    {
      "id": "agency_change_capacity",
      "label": "Change Capacity",
      "type": "force",
      "mode": "neutral",
      "group": "Agency"
    },
    {
      "id": "agency_decision_speed",
      "label": "Decision Speed",
      "type": "force",
      "mode": "neutral",
      "group": "Agency"
    },
    {
      "id": "agency_norm_pressure",
      "label": "Norm Pressure",
      "type": "force",
      "mode": "neutral",
      "group": "Agency"
    },
    {
      "id": "respect",
      "label": "Respect",
      "type": "pillar",
      "mode": "neutral",
      "group": "Pillars"
    },
    {
      "id": "respect_competence_signal",
      "label": "Competence Signals",
      "type": "force",
      "mode": "neutral",
      "group": "Respect"
    },
    {
      "id": "respect_trust_signal",
      "label": "Trust Signals",
      "type": "force",
      "mode": "neutral",
      "group": "Respect"
    },
    {
      "id": "respect_learning_emulation",
      "label": "Learning & Emulation",
      "type": "force",
      "mode": "neutral",
      "group": "Respect"
    },
    {
      "id": "respect_credibility_loop",
      "label": "Credibility Loop",
      "type": "force",
      "mode": "neutral",
      "group": "Respect"
    }
  ],
  "links": [
    { "source": "prospects", "target": "prospects_goal_clarity", "weight": 1 },
    { "source": "prospects", "target": "prospects_future_confidence", "weight": 1 },
    { "source": "prospects", "target": "prospects_shared_vision", "weight": 1 },
    { "source": "prospects", "target": "prospects_incentive_alignment", "weight": 1 },
    { "source": "involved", "target": "involved_help_norms", "weight": 1 },
    { "source": "involved", "target": "involved_transaction_cost", "weight": 1 },
    { "source": "involved", "target": "involved_debt_obligation", "weight": 1 },
    { "source": "involved", "target": "involved_resource_fairness", "weight": 1 },
    { "source": "liked", "target": "liked_belonging", "weight": 1 },
    { "source": "liked", "target": "liked_influence_channels", "weight": 1 },
    { "source": "liked", "target": "liked_social_support", "weight": 1 },
    { "source": "liked", "target": "liked_legitimacy", "weight": 1 },
    { "source": "agency", "target": "agency_voice_safety", "weight": 1 },
    { "source": "agency", "target": "agency_change_capacity", "weight": 1 },
    { "source": "agency", "target": "agency_decision_speed", "weight": 1 },
    { "source": "agency", "target": "agency_norm_pressure", "weight": 1 },
    { "source": "respect", "target": "respect_competence_signal", "weight": 1 },
    { "source": "respect", "target": "respect_trust_signal", "weight": 1 },
    { "source": "respect", "target": "respect_learning_emulation", "weight": 1 },
    { "source": "respect", "target": "respect_credibility_loop", "weight": 1 },
    
    { "source": "agency_voice_safety", "target": "involved_help_norms", "weight": 0.85, "mode": "egalitarian" },
    { "source": "agency_voice_safety", "target": "prospects_goal_clarity", "weight": 0.80, "mode": "egalitarian" },
    { "source": "involved_help_norms", "target": "liked_belonging", "weight": 0.88, "mode": "egalitarian" },
    { "source": "involved_help_norms", "target": "prospects_shared_vision", "weight": 0.90, "mode": "egalitarian" },
    { "source": "liked_belonging", "target": "agency_voice_safety", "weight": 0.82, "mode": "egalitarian" },
    { "source": "prospects_goal_clarity", "target": "respect_competence_signal", "weight": 0.85, "mode": "egalitarian" },
    { "source": "respect_competence_signal", "target": "prospects_shared_vision", "weight": 0.92, "mode": "egalitarian" },
    { "source": "respect_trust_signal", "target": "involved_help_norms", "weight": 0.87, "mode": "egalitarian" },
    
    { "source": "agency_norm_pressure", "target": "involved_debt_obligation", "weight": 0.85, "mode": "hierarchical" },
    { "source": "agency_norm_pressure", "target": "prospects_incentive_alignment", "weight": 0.80, "mode": "hierarchical" },
    { "source": "involved_transaction_cost", "target": "liked_legitimacy", "weight": 0.75, "mode": "hierarchical" },
    { "source": "liked_influence_channels", "target": "prospects_incentive_alignment", "weight": 0.90, "mode": "hierarchical" },
    { "source": "respect_credibility_loop", "target": "prospects_future_confidence", "weight": 0.88, "mode": "hierarchical" }
  ],
  "layoutHints": {
    "pillarLayout": "radialOrbit",
    "forceOrbitRadius": {
      "min": 80,
      "max": 180
    }
  }
};