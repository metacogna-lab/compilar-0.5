import { Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';

export const pillarsInfo = {
  hierarchical: [
    {
      id: 'normexp',
      abbreviation: 'NormExp',
      title: 'Normative Expression',
      icon: Compass,
      color: 'violet',
      bgGradient: 'from-violet-500/20 to-violet-600/5',
      borderColor: 'border-violet-500/30',
      description: 'Your willingness to defend the status quo by expressing opinions in support of it, and suppressing other members\' suggestions to change it. Similar to Group Think.',
      fullDescription: 'Normative Expression represents the extent to which you actively support and defend existing group norms, processes, and power structures. When high, you act as a guardian of the status quo, ensuring stability and predictability. This can manifest as discouraging dissent, reinforcing established hierarchies, and rewarding conformity. While this creates organizational stability, it can also suppress innovation and adaptability.',
      forces: [
        { name: 'Predictability Preferred', description: 'Supporting the status quo makes you appear reliable and stable, increasing others\' willingness to partner with you in hierarchical exchanges.', increment: 0.1, decrement: -0.1 },
        { name: 'Rewards of Conformity', description: 'Sacrificing individuality for group norms creates expectations of reciprocal benefits from authority figures (the "loyal soldier" dynamic).', increment: 0.1, decrement: -0.1 },
        { name: 'Stability Preference', description: 'Valuing predictability and control over adaptation creates resistance to organizational change.', increment: 0.1, decrement: -0.1 },
        { name: 'Norm Enforcement', description: 'Active correction or suppression of deviation (subtle or explicit), increasing coherence but risking reduced candour and innovation.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Frequently references "how we\'ve always done it"', 'Uncomfortable with process changes', 'Emphasizes rules and procedures', 'Discourages experimental approaches'],
        low: ['Champions innovation and change', 'Questions established practices', 'Encourages diverse viewpoints', 'Adapts quickly to new methods']
      },
      keyQuestions: [
        'Do you support maintaining current processes?',
        'How open are you to others\' change suggestions?',
        'Do you feel responsible for preserving organizational traditions?',
        'How do you react when someone challenges established procedures?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "High expression enables learning, adaptation, innovation, and early error correction."
        },
        "Low": {
          "description": "Low expression suppresses dissent, limits feedback, and slows adaptation."
        }
      }
    },
    {
      id: 'dirrecip',
      abbreviation: 'DirRecip',
      title: 'Direct Reciprocity',
      icon: Heart,
      color: 'pink',
      bgGradient: 'from-pink-500/20 to-pink-600/5',
      borderColor: 'border-pink-500/30',
      description: 'Your willingness to participate in a norm where assistance is only rendered with expectation of repayment. Provision of conditional assistance to others in the group.',
      fullDescription: 'Direct Reciprocity involves conditional helping where assistance is explicitly traded like currency. You help others with clear expectations of return favors or benefits. This creates transactional relationships based on "what\'s in it for me" principles, with support tracked and exchanged bilaterally.',
      forces: [
        { name: 'Conditional Help', description: 'Assistance is given with clear expectations of return favors or benefits.', increment: 0.1, decrement: -0.1 },
        { name: 'Favor Trading', description: 'Help is explicitly tracked and exchanged like currency between individuals.', increment: 0.1, decrement: -0.1 },
        { name: 'Pick and Stick', description: 'Receiving help makes you feel higher status, implying others want you in their debt.', increment: 0.1, decrement: -0.1 },
        { name: 'Debt Leverage', description: 'Accumulated obligations can be used to influence behaviour or secure future concessions, strengthening control but eroding trust.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Keeps mental ledger of favors', 'Explicitly negotiates exchanges', 'Expects quid pro quo', 'Transactional approach to help'],
        low: ['Helps without expectations', 'Doesn\'t track favors', 'Unconditional support', 'Generous with assistance']
      },
      keyQuestions: [
        'Do you expect favors to be returned?',
        'Do you help with expectation of reciprocation?',
        'Do you track who owes you assistance?',
        'Is cooperation explicitly negotiated?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "High reciprocity builds trust, resilience, and cooperation through mutual support."
        },
        "Low": {
          "description": "Low reciprocity leads to isolation, transactional breakdowns, and reduced willingness to help."
        }
      }
    },
    {
      id: 'status',
      abbreviation: 'Status',
      title: 'Status',
      icon: Shield,
      color: 'indigo',
      bgGradient: 'from-indigo-500/20 to-indigo-600/5',
      borderColor: 'border-indigo-500/30',
      description: 'The seniority you have been awarded within the group. The formal power you have to compel others and make decisions on behalf of the group.',
      fullDescription: 'Status represents your formal hierarchical power derived from position, rank, or official role. It grants you the capacity to compel others to act based on organizational authority, make binding decisions that others must follow, and use reporting lines to enforce compliance.',
      forces: [
        { name: 'Formal Authority', description: 'Power derived from your position, rank, or official role in the structure.', increment: 0.1, decrement: -0.1 },
        { name: 'Command Capacity', description: 'The ability to compel others to act based on your hierarchical position.', increment: 0.1, decrement: -0.1 },
        { name: 'Built-in Advantage', description: 'Higher status allows you to control and extract more of the group\'s output.', increment: 0.1, decrement: -0.1 },
        { name: 'Control of Resources', description: 'Access to and allocation of resources (information, budget, roles) strengthens influence and compliance.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Has decision-making power', 'Can override others', 'Controls resources', 'Formal leadership role'],
        low: ['Limited authority', 'Consensus-based influence', 'Peer-level interactions', 'Minimal command power']
      },
      keyQuestions: [
        'What formal authority do you hold?',
        'Can you compel others to act?',
        'Do you make binding decisions?',
        'What is your rank in the hierarchy?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "Clear standing provides influence, predictability, and social ordering."
        },
        "Low": {
          "description": "Unclear or unstable standing increases conflict, uncertainty, and status competition."
        }
      }
    },
    {
      id: 'ownprosp',
      abbreviation: 'OwnProsp',
      title: 'Own Prospects',
      icon: Zap,
      color: 'emerald',
      bgGradient: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30',
      description: 'The likelihood of achieving your personal ambitions within the group. Not that goals have been achieved, but rather the chance that they will be.',
      fullDescription: 'Own Prospects focuses on personal advancement and individual career progression within the hierarchy. It involves credit attribution, self-serving goals, and competitive positioning relative to peers, ensuring your contributions are recognized by those who matter.',
      forces: [
        { name: 'Personal Advancement', description: 'Focus on climbing the ladder and achieving individual career progression.', increment: 0.1, decrement: -0.1 },
        { name: 'Credit Attribution', description: 'Ensuring your contributions are recognized and recorded by those who matter.', increment: 0.1, decrement: -0.1 },
        { name: 'Self-Serving Goals', description: 'Pursuing objectives that primarily benefit your own interests within the group.', increment: 0.1, decrement: -0.1 },
        { name: 'Incentive Alignment', description: 'The degree to which your personal ambitions align with the group\'s mission; misalignment increases politics and disengagement.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Career-focused decisions', 'Seeks personal recognition', 'Competitive with peers', 'Self-interest prioritized'],
        low: ['Team-oriented goals', 'Collective success focus', 'Collaborative approach', 'Shared outcomes valued']
      },
      keyQuestions: [
        'Will you achieve your personal goals here?',
        'Do group outcomes benefit you personally?',
        'Are you prioritizing individual advancement?',
        'How does your success relate to the team?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "Strong confidence in future outcomes increases coordination, long-term investment, and collective risk tolerance."
        },
        "Low": {
          "description": "Low confidence in future outcomes increases defensiveness, short-term thinking, and sensitivity to loss."
        }
      }
    },
    {
      id: 'incresp',
      abbreviation: 'IncResp',
      title: 'Incoming Respect',
      icon: BookOpen,
      color: 'amber',
      bgGradient: 'from-amber-500/20 to-amber-600/5',
      borderColor: 'border-amber-500/30',
      description: 'The extent to which others respect your competence and trust your word and intentions. It is your opinion of that assessment.',
      fullDescription: 'Incoming Respect represents how capable and trustworthy others perceive you to be. It involves reputation management, careful maintenance of your image and standing, approval seeking from superiors, and making your competence visible to those who evaluate you.',
      forces: [
        { name: 'Perceived Competence', description: 'How capable and trustworthy others think you are at your role.', increment: 0.1, decrement: -0.1 },
        { name: 'Reputation Management', description: 'Carefully maintaining your image and standing in others\' eyes.', increment: 0.1, decrement: -0.1 },
        { name: 'External Locus of Control', description: 'Feeling respected increases confidence in your ability to achieve success.', increment: 0.1, decrement: -0.1 },
        { name: 'Visibility of Delivery', description: 'Making outcomes and reliability visible to evaluators increases perceived competence, but can encourage performative behaviour if overdone.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Others seek your expertise', 'Trusted with important tasks', 'Positive reputation', 'Viewed as reliable'],
        low: ['Competence questioned', 'Trust issues', 'Limited responsibility', 'Need to prove yourself']
      },
      keyQuestions: [
        'Do others find you competent?',
        'Do they trust your word and intentions?',
        'Are you sought for advice?',
        'How is your professional reputation?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "High respect strengthens trust, legitimacy, and willingness to cooperate."
        },
        "Low": {
          "description": "Low respect leads to disengagement, resentment, and breakdowns in coordination."
        }
      }
    }
  ],
  egalitarian: [
    {
      id: 'divsexp',
      abbreviation: 'DivsExp',
      title: 'Diverse Expression',
      icon: Compass,
      color: 'violet',
      bgGradient: 'from-violet-500/20 to-violet-600/5',
      borderColor: 'border-violet-500/30',
      description: 'The extent to which your ideas challenging Group Think will be listened to. Your contribution will involve some change to the status quo. Related to Psychological Safety.',
      fullDescription: 'Diverse Expression measures psychological safety and openness to dissenting views. High diverse expression means you can voice concerns, take risks, and challenge ideas without fear. The team actively invites challenges, provides innovation space, and maintains genuine two-way dialogue where all voices contribute meaningfully.',
      forces: [
        { name: 'Psychological Safety', description: 'You can voice concerns, take risks, and challenge ideas without fear.', increment: 0.1, decrement: -0.1 },
        { name: 'Challenge Welcome', description: 'Dissenting views and questions are actively invited and seriously considered.', increment: 0.1, decrement: -0.1 },
        { name: 'Growth Mindset', description: 'Voicing ideas indicates growth mindset and willingness to help or be helped.', increment: 0.1, decrement: -0.1 },
        { name: 'Constructive Dissent', description: 'Disagreement is framed as improvement-seeking, not personal attack—raising learning and reducing defensive conflict.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Open debate encouraged', 'Challenges welcomed', 'Innovation celebrated', 'Safe to disagree'],
        low: ['Conformity pressure', 'Ideas dismissed', 'Risk aversion', 'Fear of speaking up']
      },
      keyQuestions: [
        'Will your suggestions be heard?',
        'Are diverse ideas welcomed?',
        'Can you challenge the status quo safely?',
        'Is innovation encouraged or suppressed?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "High expression enables learning, adaptation, innovation, and early error correction."
        },
        "Low": {
          "description": "Low expression suppresses dissent, limits feedback, and slows adaptation."
        }
      }
    },
    {
      id: 'indrecip',
      abbreviation: 'IndRecip',
      title: 'Indirect Reciprocity',
      icon: Heart,
      color: 'pink',
      bgGradient: 'from-pink-500/20 to-pink-600/5',
      borderColor: 'border-pink-500/30',
      description: 'Your willingness to participate in a norm where assistance is rendered without expectation of repayment. Provision of unconditional assistance to others.',
      fullDescription: 'Indirect Reciprocity involves unconditional helping where assistance flows freely without expecting direct repayment. Resources and support naturally flow to where needed most in a pay-it-forward culture, with minimal transaction costs or deal-making needed for cooperation.',
      forces: [
        { name: 'Unconditional Helping', description: 'Giving assistance freely without expecting direct repayment or favors.', increment: 0.1, decrement: -0.1 },
        { name: 'Resource Fluidity', description: 'Effort and support flow naturally to wherever they are needed most.', increment: 0.1, decrement: -0.1 },
        { name: 'Pay-it-Forward Culture', description: 'Help circulates through the group rather than being traded bilaterally.', increment: 0.1, decrement: -0.1 },
        { name: 'Reciprocity Trust', description: 'Confidence that help will "come back around" through the group over time, reducing the need to keep score.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Helps without strings', 'Generous support', 'Community mindset', 'Trust in reciprocity'],
        low: ['Transactional help', 'Expects direct return', 'Conditional assistance', 'Favor tracking']
      },
      keyQuestions: [
        'Do you help without expecting return?',
        'Is unconditional assistance the norm?',
        'Does support flow freely?',
        'Is there a pay-it-forward culture?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "High reciprocity builds trust, resilience, and cooperation through mutual support."
        },
        "Low": {
          "description": "Low reciprocity leads to isolation, transactional breakdowns, and reduced willingness to help."
        }
      }
    },
    {
      id: 'popularity',
      abbreviation: 'Popularity',
      title: 'Popularity',
      icon: Shield,
      color: 'indigo',
      bgGradient: 'from-indigo-500/20 to-indigo-600/5',
      borderColor: 'border-indigo-500/30',
      description: 'The extent to which you believe other group members like you. Do they have positive regard for and generally enjoy your company?',
      fullDescription: 'Popularity captures warmth, acceptance, and informal influence within the group. When popular, you feel genuinely liked and valued, can shape decisions through relationships rather than authority, receive social support freely, and can disagree or make mistakes without damaging your standing.',
      forces: [
        { name: 'Warmth & Acceptance', description: 'Feeling genuinely liked, welcomed, and valued by others in the group.', increment: 0.1, decrement: -0.1 },
        { name: 'Informal Influence', description: 'Ability to shape decisions through relationships rather than formal authority.', increment: 0.1, decrement: -0.1 },
        { name: 'Social Support', description: 'Others stand by you and help when challenges arise, no strings attached.', increment: 0.1, decrement: -0.1 },
        { name: 'Belonging Signals', description: 'Small inclusive behaviours (invites, acknowledgements, attention) reinforce social safety and reduce isolation.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Sought for social activities', 'Warmly welcomed', 'Trusted confidant', 'Positive relationships'],
        low: ['Isolated or avoided', 'Limited social connection', 'Low warmth from others', 'Social anxiety']
      },
      keyQuestions: [
        'Do group members like you?',
        'Do they seek your company?',
        'Are you included socially?',
        'Do others enjoy working with you?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "Clear standing provides influence, predictability, and social ordering."
        },
        "Low": {
          "description": "Unclear or unstable standing increases conflict, uncertainty, and status competition."
        }
      }
    },
    {
      id: 'grpprosp',
      abbreviation: 'GrpProsp',
      title: 'Group Prospects',
      icon: Zap,
      color: 'emerald',
      bgGradient: 'from-emerald-500/20 to-emerald-600/5',
      borderColor: 'border-emerald-500/30',
      description: 'The extent to which you believe the group will achieve its planned goals. Captures overarching group efficiency and general problem space.',
      fullDescription: 'Group Prospects represents collective goal clarity, team success belief, shared future vision, and joint accountability. Everyone understands what the team is trying to achieve together, feels confident in accomplishing shared goals, and takes ownership of outcomes collectively.',
      forces: [
        { name: 'Collective Goal Clarity', description: 'Everyone understands and agrees on what the team is trying to achieve together.', increment: 0.1, decrement: -0.1 },
        { name: 'Team Success Belief', description: 'Members feel confident the group will accomplish its shared goals.', increment: 0.1, decrement: -0.1 },
        { name: 'Shared Future Vision', description: 'The team has a common picture of where they are heading collectively.', increment: 0.1, decrement: -0.1 },
        { name: 'Joint Accountability', description: 'Shared ownership of outcomes increases follow-through and reduces blame-shifting when challenges appear.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Clear shared vision', 'Confident in success', 'Aligned objectives', 'Optimistic outlook'],
        low: ['Unclear goals', 'Doubt about success', 'Misaligned objectives', 'Pessimistic outlook']
      },
      keyQuestions: [
        'Will the group achieve its goals?',
        'Is collective success likely?',
        'Does everyone understand the vision?',
        'Are team objectives clear?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "Strong confidence in future outcomes increases coordination, long-term investment, and collective risk tolerance."
        },
        "Low": {
          "description": "Low confidence in future outcomes increases defensiveness, short-term thinking, and sensitivity to loss."
        }
      }
    },
    {
      id: 'outresp',
      abbreviation: 'OutResp',
      title: 'Outgoing Respect',
      icon: BookOpen,
      color: 'amber',
      bgGradient: 'from-amber-500/20 to-amber-600/5',
      borderColor: 'border-amber-500/30',
      description: 'The extent to which you believe other group members are competent and trustworthy. Do they have the skills needed for their roles?',
      fullDescription: 'Outgoing Respect involves believing your colleagues have the skills and ability to deliver quality work, trusting their intentions and good faith, wanting to emulate and learn from them, and feeling comfortable sharing work and responsibility directly with peers.',
      forces: [
        { name: 'Peer Competence', description: 'Believing your colleagues have the skills and ability to deliver quality work.', increment: 0.1, decrement: -0.1 },
        { name: 'Trust in Intentions', description: 'Confidence that others act in good faith and have the group\'s interests at heart.', increment: 0.1, decrement: -0.1 },
        { name: 'Quality Street', description: 'When you think colleagues are competent, you believe the group will succeed.', increment: 0.1, decrement: -0.1 },
        { name: 'Delegation Confidence', description: 'Willingness to hand off meaningful responsibility because you trust others\' capability and judgement.', increment: 0.1, decrement: -0.1 }
      ],
      indicators: {
        high: ['Delegates confidently', 'Trusts team skills', 'Admires colleagues', 'Collaborative mindset'],
        low: ['Micromanages', 'Doubts others\' abilities', 'Prefers solo work', 'Trust issues']
      },
      keyQuestions: [
        'Are others competent and trustworthy?',
        'Can they deliver on their roles?',
        'Do you trust your colleagues?',
        'Would you delegate important work?'
      ],
      highLowDescriptions: {
        "High": {
          "description": "High respect strengthens trust, legitimacy, and willingness to cooperate."
        },
        "Low": {
          "description": "Low respect leads to disengagement, resentment, and breakdowns in coordination."
        }
      }
    }
  ]
};