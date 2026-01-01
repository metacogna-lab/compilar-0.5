import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning' },
  action: { icon: Zap, color: 'emerald', label: 'Action' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience' }
};

const forceExplanations = {
  'Collective Goal Clarity': 'Everyone understands and agrees on what the team is trying to achieve together.',
  'Team Success Belief': 'Members feel confident the group will accomplish its shared goals.',
  'Shared Future Vision': 'The team has a common picture of where they are heading collectively.',
  'Joint Accountability': 'All members take ownership of outcomes together, not just individually.',
  'Personal Advancement': 'Focus on climbing the ladder and achieving individual career progression.',
  'Credit Attribution': 'Ensuring your contributions are recognized and recorded by those who matter.',
  'Self-Serving Goals': 'Pursuing objectives that primarily benefit your own interests within the group.',
  'Competitive Positioning': 'Maintaining or improving your standing relative to peers in the hierarchy.',
  'Warmth & Acceptance': 'Feeling genuinely liked, welcomed, and valued by others in the group.',
  'Informal Influence': 'Ability to shape decisions through relationships rather than formal authority.',
  'Social Support': 'Others stand by you and help when challenges arise, no strings attached.',
  'Relational Safety': 'You can disagree or make mistakes without damaging your social standing.',
  'Formal Authority': 'Power derived from your position, rank, or official role in the structure.',
  'Command Capacity': 'The ability to compel others to act based on your hierarchical position.',
  'Decision Rights': 'Holding the mandate to make binding choices that others must follow.',
  'Hierarchical Control': 'Using rank and reporting lines to settle disputes and enforce compliance.',
  'Unconditional Helping': 'Giving assistance freely without expecting direct repayment or favors.',
  'Resource Fluidity': 'Effort and support flow naturally to wherever they are needed most.',
  'Pay-it-Forward Culture': 'Help circulates through the group rather than being traded bilaterally.',
  'Low Transaction Costs': 'Minimal negotiation or deal-making needed to get cooperation.',
  'Conditional Help': 'Assistance is given with clear expectations of return favors or benefits.',
  'Favor Trading': 'Help is explicitly tracked and exchanged like currency between individuals.',
  'Transactional Norms': 'Cooperation operates on "what\'s in it for me" deal-making principles.',
  'Resource Bargaining': 'Support and effort are leveraged as negotiation tools for personal gain.',
  'Psychological Safety': 'You can voice concerns, take risks, and challenge ideas without fear.',
  'Challenge Welcome': 'Dissenting views and questions are actively invited and seriously considered.',
  'Innovation Space': 'Room exists for novel ideas, experiments, and divergent thinking.',
  'Open Dialogue': 'Genuine two-way communication where all voices can contribute meaningfully.',
  'Status Quo Defense': 'Protecting existing arrangements, processes, and power structures from change.',
  'Norm Enforcement': 'Ensuring everyone complies with established rules and cultural expectations.',
  'Change Suppression': 'Actively blocking or dismissing suggestions that deviate from current plans.',
  'Stability Preference': 'Valuing predictability and control over adaptation and innovation.',
  'Peer Competence': 'Believing your colleagues have the skills and ability to deliver quality work.',
  'Trust in Intentions': 'Confidence that others act in good faith and have the group\'s interests at heart.',
  'Role Model Effect': 'Wanting to emulate and learn from colleagues you genuinely admire.',
  'Horizontal Delegation': 'Comfortable sharing work and responsibility directly with peers.',
  'Perceived Competence': 'How capable and trustworthy others think you are at your role.',
  'Reputation Management': 'Carefully maintaining your image and standing in others\' eyes.',
  'Approval Seeking': 'High sensitivity to signals of validation or disapproval from superiors.',
  'Performance Visibility': 'Making your competence and contributions apparent to those who evaluate you.'
};

const leadershipImplications = {
  'Collective Goal Clarity': 'Leaders must articulate vision repeatedly and create forums for collective sense-making so the entire team owns the direction, not just leadership.',
  'Team Success Belief': 'Foster confidence through small wins, transparent progress tracking, and celebrating collective achievements rather than individual heroics.',
  'Shared Future Vision': 'Invest time in collaborative strategic planning where all voices shape the destination, building genuine commitment rather than mere compliance.',
  'Joint Accountability': 'Design systems where outcomes are measured at team level and rewards are distributed collectively to reinforce interdependence.',
  'Personal Advancement': 'Provide clear career paths and recognition systems that reward individual excellence while managing the competitive dynamics they create.',
  'Credit Attribution': 'Establish transparent performance metrics and documentation practices so contributions are visible to evaluators and promotion decisions.',
  'Self-Serving Goals': 'Acknowledge individual ambitions as legitimate and channel them toward organizational objectives through aligned incentive structures.',
  'Competitive Positioning': 'Create healthy internal competition with clear rules while preventing destructive political maneuvering that undermines collaboration.',
  'Warmth & Acceptance': 'Model vulnerability and authenticity, creating space for personal connection beyond professional roles through informal interactions.',
  'Informal Influence': 'Recognize that networks matter and create opportunities for relationship-building while respecting emergent social structures.',
  'Social Support': 'Encourage mutual aid and establish norms of reciprocal help where asking for support is seen as strength, not weakness.',
  'Relational Safety': 'Actively protect people who admit mistakes or voice concerns, demonstrating through action that psychological safety is real.',
  'Formal Authority': 'Exercise positional power judiciously, being explicit about when you are directing versus seeking input to avoid confusion.',
  'Command Capacity': 'Reserve directive leadership for crises or expertise gaps, making clear when orders supersede discussion.',
  'Decision Rights': 'Define decision authority clearly in advance to prevent confusion and power struggles over who makes the final call.',
  'Hierarchical Control': 'Use organizational structure to resolve conflicts efficiently while being aware of the resentment top-down decisions can generate.',
  'Unconditional Helping': 'Personally model giving help without keeping score and publicly praise those who support others without expectation of return.',
  'Resource Fluidity': 'Remove bureaucratic barriers to resource sharing and empower people to redirect effort toward emerging priorities without approval.',
  'Pay-it-Forward Culture': 'Tell stories of how past help led to future contributions, making the indirect reciprocity cycle visible and valued.',
  'Low Transaction Costs': 'Simplify processes for requesting help and normalize asking so cooperation happens fluidly rather than through negotiation.',
  'Conditional Help': 'Make exchange expectations explicit and fair so transactions are transparent rather than manipulative.',
  'Favor Trading': 'Acknowledge that favors matter in hierarchies and ensure the trading system does not disadvantage those with less initial social capital.',
  'Transactional Norms': 'Build reciprocity into formal agreements and ensure both parties benefit from exchanges to maintain trust.',
  'Resource Bargaining': 'Provide clear negotiation frameworks so resource allocation is predictable rather than dependent on backroom deals.',
  'Psychological Safety': 'Consistently respond to challenges with curiosity rather than defensiveness, demonstrating that dissent improves rather than threatens outcomes.',
  'Challenge Welcome': 'Explicitly invite criticism of your own ideas and visibly incorporate feedback to signal that questioning is genuinely wanted.',
  'Innovation Space': 'Allocate time and resources specifically for experimentation, protecting it from being consumed by operational demands.',
  'Open Dialogue': 'Create structured forums where all levels can speak candidly and ensure quieter voices are drawn out, not just dominant personalities.',
  'Status Quo Defense': 'Recognize when stability serves the mission versus when it protects comfort, and be willing to disrupt the latter.',
  'Norm Enforcement': 'Clarify which standards are non-negotiable for coordination and which are unnecessary constraints on autonomy.',
  'Change Suppression': 'Investigate why proposals are being blocked - sometimes resistance reveals legitimate risks, sometimes just threat to power.',
  'Stability Preference': 'Balance the need for predictability with adaptation by creating clear zones for stability versus experimentation.',
  'Peer Competence': 'Build skills openly and demonstrate your own learning to make competence development a shared journey rather than competitive sorting.',
  'Trust in Intentions': 'Give people benefit of the doubt initially and address breaches of trust quickly so cynicism does not become default.',
  'Role Model Effect': 'Be conscious that people watch and imitate you, so embody the behaviors and values you want to see multiplied.',
  'Horizontal Delegation': 'Empower peer-to-peer delegation rather than routing all task assignment through formal authority to increase agility.',
  'Perceived Competence': 'Manage how competence is evaluated by making criteria explicit and ensuring diverse contributions are valued, not just visible heroics.',
  'Reputation Management': 'Acknowledge that image matters in hierarchies and help people build reputations authentically rather than through manipulation.',
  'Approval Seeking': 'Be aware that your signals carry weight - use praise strategically and avoid creating dependency on your validation.',
  'Performance Visibility': 'Ensure quieter contributors are recognized and visible rather than only those who self-promote effectively.'
};

const modeManifestation = {
  'Collective Goal Clarity': {
    egalitarian: 'Goals emerge through dialogue and consensus, with everyone contributing to defining what success means collectively.',
    hierarchical: 'Goals are set by leadership and cascaded down, with clarity coming from authoritative directive rather than group deliberation.'
  },
  'Team Success Belief': {
    egalitarian: 'Confidence stems from trust in each other and belief in collective capability to figure things out together.',
    hierarchical: 'Confidence comes from faith in leadership competence and the robustness of the plan handed down from above.'
  },
  'Shared Future Vision': {
    egalitarian: 'Vision is co-created through participatory processes where all members shape the aspirational narrative.',
    hierarchical: 'Vision is articulated by leaders and adopted by followers, with buy-in coming through inspiring communication from the top.'
  },
  'Joint Accountability': {
    egalitarian: 'Accountability is peer-to-peer, with team members holding each other responsible through mutual commitment.',
    hierarchical: 'Accountability flows upward to managers who evaluate and judge individual contributions against standards.'
  },
  'Personal Advancement': {
    egalitarian: 'Advancement happens through peer recognition and demonstrated contribution to collective success, not formal promotion.',
    hierarchical: 'Advancement requires impressing superiors and competing successfully for scarce positions in the hierarchy.'
  },
  'Credit Attribution': {
    egalitarian: 'Credit is diffused across contributors, with individual attribution seen as less important than team achievement.',
    hierarchical: 'Credit is precisely tracked because it determines career outcomes, making attribution politically significant.'
  },
  'Self-Serving Goals': {
    egalitarian: 'Personal goals are pursued through contribution to group success, aligning individual benefit with collective good.',
    hierarchical: 'Personal goals may conflict with others, requiring political maneuvering and strategic positioning within the structure.'
  },
  'Competitive Positioning': {
    egalitarian: 'Competition is de-emphasized in favor of complementary strengths, with status coming from being helpful rather than superior.',
    hierarchical: 'Competition for rank is explicit and expected, with positioning relative to peers determining access to resources and influence.'
  },
  'Warmth & Acceptance': {
    egalitarian: 'Acceptance comes from authentic connection and being genuinely liked as a person beyond professional capability.',
    hierarchical: 'Acceptance is more conditional, tied to role performance and maintaining appropriate professional distance.'
  },
  'Informal Influence': {
    egalitarian: 'Influence operates primarily through networks and relationships, with persuasion more important than authority.',
    hierarchical: 'Informal influence supplements formal authority but must be navigated carefully to avoid undermining hierarchy.'
  },
  'Social Support': {
    egalitarian: 'Support is freely given based on need, with helping others seen as basic membership obligation.',
    hierarchical: 'Support may be more strategic, calculated based on relationship importance and potential future reciprocity.'
  },
  'Relational Safety': {
    egalitarian: 'Safety comes from shared norms of acceptance and collective protection against judgment.',
    hierarchical: 'Safety depends on maintaining good standing with superiors who control consequences.'
  },
  'Formal Authority': {
    egalitarian: 'Authority is situational and fluid, assigned based on expertise for specific contexts rather than permanent rank.',
    hierarchical: 'Authority is fixed to positions and stable, with clear chains of command that persist across contexts.'
  },
  'Command Capacity': {
    egalitarian: 'Command is rare and situational, used only when urgency demands immediate coordination.',
    hierarchical: 'Command is routine and expected, with subordinates prepared to execute directives without extensive discussion.'
  },
  'Decision Rights': {
    egalitarian: 'Decision rights are distributed or rotated, with those affected by choices having strong voice in outcomes.',
    hierarchical: 'Decision rights are concentrated at higher levels, with lower ranks executing decisions made above them.'
  },
  'Hierarchical Control': {
    egalitarian: 'Control is minimal and exercised through peer pressure and collective norms rather than authority.',
    hierarchical: 'Control is formalized through reporting structures and managers who monitor and direct subordinate work.'
  },
  'Unconditional Helping': {
    egalitarian: 'Helping without expectation is the cultural norm and primary way value circulates through the group.',
    hierarchical: 'Unconditional help is less common, reserved for close relationships rather than being the default interaction mode.'
  },
  'Resource Fluidity': {
    egalitarian: 'Resources move naturally toward needs, with little bureaucratic friction or permission-seeking required.',
    hierarchical: 'Resource movement requires approval through channels, with formal processes controlling allocation.'
  },
  'Pay-it-Forward Culture': {
    egalitarian: 'Helping others who cannot immediately reciprocate is expected, trusting the system will balance over time.',
    hierarchical: 'Direct reciprocity is more important - helping those who can help you back takes priority.'
  },
  'Low Transaction Costs': {
    egalitarian: 'Cooperation happens spontaneously with minimal negotiation because shared goals align interests naturally.',
    hierarchical: 'Cooperation often requires negotiation and agreement on terms because interests may diverge.'
  },
  'Conditional Help': {
    egalitarian: 'Conditional exchanges are viewed negatively, seen as undermining the solidarity that makes groups work.',
    hierarchical: 'Conditional help is normal and accepted, with explicit or implicit quid pro quo arrangements being common.'
  },
  'Favor Trading': {
    egalitarian: 'Favor trading is subtle if present, since overt transactionalism violates norms of generosity.',
    hierarchical: 'Favor trading is explicit and strategic, a key mechanism for building alliances and gaining support.'
  },
  'Transactional Norms': {
    egalitarian: 'Transactional thinking is discouraged in favor of collective orientation and intrinsic motivation.',
    hierarchical: 'Transactional norms are embraced, with clear exchanges preventing exploitation and clarifying obligations.'
  },
  'Resource Bargaining': {
    egalitarian: 'Bargaining is minimal - resources are shared based on need and trust rather than negotiated exchanges.',
    hierarchical: 'Bargaining is a normal part of resource allocation, with formal or informal negotiations determining distribution.'
  },
  'Psychological Safety': {
    egalitarian: 'Safety is collectively maintained through norms of acceptance and mutual protection from judgment.',
    hierarchical: 'Safety depends heavily on leader behavior, with authority figures signaling whether risk-taking is acceptable.'
  },
  'Challenge Welcome': {
    egalitarian: 'Challenges to ideas are seen as contributions that strengthen collective thinking and are actively invited.',
    hierarchical: 'Challenges must be calibrated carefully to avoid undermining authority, often channeled through proper protocols.'
  },
  'Innovation Space': {
    egalitarian: 'Innovation emerges bottom-up from anyone, with experimentation distributed throughout the group.',
    hierarchical: 'Innovation is more controlled, often requiring permission or happening in designated roles/contexts.'
  },
  'Open Dialogue': {
    egalitarian: 'Dialogue is truly open with all voices carrying weight based on merit of ideas rather than status.',
    hierarchical: 'Dialogue follows protocols that respect rank, with some voices carrying more weight due to position.'
  },
  'Status Quo Defense': {
    egalitarian: 'Status quo is defended collectively if it serves the group, but easily abandoned when better alternatives emerge.',
    hierarchical: 'Status quo is protected by those benefiting from current arrangements, making change require authority approval.'
  },
  'Norm Enforcement': {
    egalitarian: 'Norms are enforced through peer pressure and collective disapproval rather than authority sanctions.',
    hierarchical: 'Norms are enforced by managers and formal consequences for violations, with clear penalties for non-compliance.'
  },
  'Change Suppression': {
    egalitarian: 'Change is suppressed only through collective resistance if group does not see value in the proposal.',
    hierarchical: 'Change is suppressed by gatekeepers who control approval processes and resource allocation.'
  },
  'Stability Preference': {
    egalitarian: 'Stability comes from predictable relationships and shared culture rather than fixed structures.',
    hierarchical: 'Stability comes from clear roles, procedures, and hierarchical order that provide operational predictability.'
  },
  'Peer Competence': {
    egalitarian: 'Competence is assumed by default with trust given until proven otherwise through relationship over time.',
    hierarchical: 'Competence must be demonstrated and proven to superiors through visible achievements and evaluations.'
  },
  'Trust in Intentions': {
    egalitarian: 'Intentions are assumed good by default, with benefit of doubt extended freely to fellow members.',
    hierarchical: 'Trust is more guarded and must be earned, with skepticism about others\' motives being prudent.'
  },
  'Role Model Effect': {
    egalitarian: 'Role models are peers who inspire through example, with horizontal identification driving emulation.',
    hierarchical: 'Role models are often those above you in the hierarchy who demonstrate successful ascent paths.'
  },
  'Horizontal Delegation': {
    egalitarian: 'Delegation happens naturally peer-to-peer without formal authority involved, based on who is best positioned.',
    hierarchical: 'Delegation typically flows through formal channels with managers assigning work downward to reports.'
  },
  'Perceived Competence': {
    egalitarian: 'Competence is judged by peers based on contributions to collective work and quality of collaboration.',
    hierarchical: 'Competence is judged by superiors based on individual deliverables and performance against objectives.'
  },
  'Reputation Management': {
    egalitarian: 'Reputation emerges organically from how you treat others and contribute, not actively managed.',
    hierarchical: 'Reputation requires active cultivation and visibility management since it influences career advancement.'
  },
  'Approval Seeking': {
    egalitarian: 'Approval from peers matters more than formal validation, with collective regard being the valued currency.',
    hierarchical: 'Approval from superiors is critical since it determines performance ratings, raises, and promotions.'
  },
  'Performance Visibility': {
    egalitarian: 'Visibility happens naturally through collaboration, with contribution quality being evident to those you work with.',
    hierarchical: 'Visibility must be actively managed since evaluators may not directly observe work, requiring strategic signaling.'
  }
};

const forces = {
  purpose: {
    egalitarian: [
      'Collective Goal Clarity',
      'Team Success Belief',
      'Shared Future Vision',
      'Joint Accountability'
    ],
    hierarchical: [
      'Personal Advancement',
      'Credit Attribution',
      'Self-Serving Goals',
      'Competitive Positioning'
    ]
  },
  interpersonal: {
    egalitarian: [
      'Warmth & Acceptance',
      'Informal Influence',
      'Social Support',
      'Relational Safety'
    ],
    hierarchical: [
      'Formal Authority',
      'Command Capacity',
      'Decision Rights',
      'Hierarchical Control'
    ]
  },
  learning: {
    egalitarian: [
      'Unconditional Helping',
      'Resource Fluidity',
      'Pay-it-Forward Culture',
      'Low Transaction Costs'
    ],
    hierarchical: [
      'Conditional Help',
      'Favor Trading',
      'Transactional Norms',
      'Resource Bargaining'
    ]
  },
  action: {
    egalitarian: [
      'Psychological Safety',
      'Challenge Welcome',
      'Innovation Space',
      'Open Dialogue'
    ],
    hierarchical: [
      'Status Quo Defense',
      'Norm Enforcement',
      'Change Suppression',
      'Stability Preference'
    ]
  },
  resilience: {
    egalitarian: [
      'Peer Competence',
      'Trust in Intentions',
      'Role Model Effect',
      'Horizontal Delegation'
    ],
    hierarchical: [
      'Perceived Competence',
      'Reputation Management',
      'Approval Seeking',
      'Performance Visibility'
    ]
  }
};

const connections = [
  { 
    from: 'purpose', 
    to: 'action', 
    description: 'Direction drives execution',
    detail: 'Clear purpose creates focused energy for action. When people understand why they\'re doing something, they execute with greater precision and commitment.',
    forceLinks: {
      egalitarian: ['Collective Goal Clarity energizes Psychological Safety', 'Shared Future Vision enables Innovation Space'],
      hierarchical: ['Personal Advancement motivates Status Quo Defense', 'Self-Serving Goals drive Stability Preference']
    }
  },
  { 
    from: 'purpose', 
    to: 'learning', 
    description: 'Goals guide learning',
    detail: 'Purpose defines what knowledge matters most. Teams with clear direction learn strategically, focusing effort on capabilities that advance their mission.',
    forceLinks: {
      egalitarian: ['Team Success Belief encourages Resource Fluidity', 'Joint Accountability promotes Unconditional Helping'],
      hierarchical: ['Credit Attribution incentivizes Favor Trading', 'Competitive Positioning creates Transactional Norms']
    }
  },
  { 
    from: 'interpersonal', 
    to: 'learning', 
    description: 'Relationships enable sharing',
    detail: 'Strong interpersonal bonds create channels for knowledge transfer. Trust and rapport determine whether people share what they know freely or hoard expertise.',
    forceLinks: {
      egalitarian: ['Warmth & Acceptance enables Pay-it-Forward Culture', 'Social Support strengthens Low Transaction Costs'],
      hierarchical: ['Formal Authority enforces Conditional Help', 'Command Capacity controls Resource Bargaining']
    }
  },
  { 
    from: 'interpersonal', 
    to: 'action', 
    description: 'Collaboration fuels momentum',
    detail: 'Interpersonal dynamics determine execution velocity. Whether through influence or authority, relationships shape how quickly groups mobilize and coordinate action.',
    forceLinks: {
      egalitarian: ['Informal Influence promotes Challenge Welcome', 'Relational Safety enables Open Dialogue'],
      hierarchical: ['Decision Rights enforce Norm Enforcement', 'Hierarchical Control maintains Change Suppression']
    }
  },
  { 
    from: 'learning', 
    to: 'action', 
    description: 'Knowledge informs execution',
    detail: 'Learning creates the foundation for effective action. The quality of knowledge transfer and the norms around helping directly impact execution quality and speed.',
    forceLinks: {
      egalitarian: ['Unconditional Helping supports Innovation Space', 'Resource Fluidity enables Psychological Safety'],
      hierarchical: ['Favor Trading reinforces Status Quo Defense', 'Transactional Norms strengthen Stability Preference']
    }
  },
  { 
    from: 'learning', 
    to: 'resilience', 
    description: 'Adaptability builds strength',
    detail: 'Continuous learning develops resilience. Groups that adapt knowledge quickly recover from setbacks faster and build respect through demonstrated competence.',
    forceLinks: {
      egalitarian: ['Pay-it-Forward Culture builds Peer Competence', 'Low Transaction Costs strengthen Trust in Intentions'],
      hierarchical: ['Conditional Help shapes Perceived Competence', 'Resource Bargaining affects Reputation Management']
    }
  },
  { 
    from: 'action', 
    to: 'resilience', 
    description: 'Practice develops endurance',
    detail: 'Repeated execution under varying conditions builds resilience. How teams approach action - with safety or control - determines their capacity to withstand pressure.',
    forceLinks: {
      egalitarian: ['Psychological Safety develops Role Model Effect', 'Innovation Space enables Horizontal Delegation'],
      hierarchical: ['Norm Enforcement demands Approval Seeking', 'Status Quo Defense requires Performance Visibility']
    }
  },
  { 
    from: 'resilience', 
    to: 'purpose', 
    description: 'Strength renews direction',
    detail: 'Resilience creates capacity to reassess purpose. Groups that maintain respect and competence through adversity can realign their goals with greater wisdom.',
    forceLinks: {
      egalitarian: ['Peer Competence reinforces Team Success Belief', 'Trust in Intentions strengthens Joint Accountability'],
      hierarchical: ['Perceived Competence enables Personal Advancement', 'Reputation Management drives Credit Attribution']
    }
  }
];

export default function ForcesRepository({ blendRatio = 0, userScores = {} }) {
  const mode = blendRatio < 0.5 ? 'egalitarian' : 'hierarchical';
  const pillars = ['purpose', 'interpersonal', 'learning', 'action', 'resilience'];
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedForce, setSelectedForce] = useState(null);

  return (
    <div className="mt-8 p-6 rounded-2xl border backdrop-blur-sm bg-white/5 border-white/10">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">COMPILAR Forces Repository</h2>
        <p className="text-zinc-400 text-sm">
          20 psychological forces organized by pillar • {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode
        </p>
      </div>

      {/* Visual map of forces */}
      <div className="grid md:grid-cols-5 gap-4 mb-8">
        {pillars.map((pillar, pillarIndex) => {
          const config = pillarConfig[pillar];
          const Icon = config.icon;
          const pillarForces = forces[pillar][mode];
          const score = userScores[pillar];

          return (
            <motion.div
              key={pillar}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: pillarIndex * 0.1 }}
              className={cn(
                'p-4 rounded-xl border backdrop-blur-sm',
                `bg-${config.color}-500/5 border-${config.color}-500/20`
              )}
            >
              {/* Pillar header */}
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                <div className={`w-8 h-8 rounded-lg bg-${config.color}-500/20 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${config.color}-400`} />
                </div>
                <div className="flex-1">
                  <p className="text-white text-xs font-semibold capitalize">{pillar}</p>
                  {score && (
                    <p className={`text-${config.color}-400 text-xs`}>{score}%</p>
                  )}
                </div>
              </div>

              {/* Forces list */}
              <div className="space-y-2">
                {pillarForces.map((force, forceIndex) => (
                  <motion.div
                    key={force}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: pillarIndex * 0.1 + forceIndex * 0.05 }}
                    onClick={() => setSelectedForce({ name: force, pillar, config })}
                    className={cn(
                      'p-2 rounded-lg transition-all cursor-pointer',
                      `hover:bg-${config.color}-500/20 hover:scale-105 active:scale-95`
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <motion.div
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 bg-${config.color}-400`}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{
                          duration: 2,
                          delay: forceIndex * 0.3,
                          repeat: Infinity
                        }}
                      />
                      <p className="text-zinc-300 text-xs leading-tight">{force}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Connection network visualization */}
      <div className="p-6 rounded-xl bg-black/20 border border-white/5">
        <h3 className="text-white font-semibold mb-4 text-sm">Pillar Interconnections</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {connections.map((conn, i) => {
            const fromConfig = pillarConfig[conn.from];
            const toConfig = pillarConfig[conn.to];
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => setSelectedConnection(conn)}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer hover:bg-white/10"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full bg-${fromConfig.color}-400`} />
                    <span className="text-zinc-400 text-xs capitalize">{conn.from}</span>
                  </div>
                  <span className="text-zinc-600 text-xs">→</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full bg-${toConfig.color}-400`} />
                    <span className="text-zinc-400 text-xs capitalize">{conn.to}</span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs italic">{conn.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mode indicator */}
      <div className="mt-6 text-center">
        <p className="text-zinc-500 text-xs">
          Repository adapts to mode • Slide to see {mode === 'egalitarian' ? 'hierarchical' : 'egalitarian'} forces
        </p>
      </div>

      {/* Connection Detail Modal */}
      <AnimatePresence>
        {selectedConnection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedConnection(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F0F12] border border-white/10 rounded-3xl p-6 max-w-2xl w-full relative"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedConnection(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Connection header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${pillarConfig[selectedConnection.from].color}40` }}
                  >
                    {React.createElement(pillarConfig[selectedConnection.from].icon, {
                      className: 'w-5 h-5',
                      style: { color: pillarConfig[selectedConnection.from].color }
                    })}
                  </div>
                  <span className="text-white font-semibold capitalize">{selectedConnection.from}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-500" />
                <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${pillarConfig[selectedConnection.to].color}40` }}
                  >
                    {React.createElement(pillarConfig[selectedConnection.to].icon, {
                      className: 'w-5 h-5',
                      style: { color: pillarConfig[selectedConnection.to].color }
                    })}
                  </div>
                  <span className="text-white font-semibold capitalize">{selectedConnection.to}</span>
                </div>
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                <p className="text-violet-300 text-lg font-medium italic">
                  "{selectedConnection.description}"
                </p>
              </div>

              {/* Detailed explanation */}
              <div className="mb-6">
                <h3 className="text-white font-semibold mb-2">How They Connect</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {selectedConnection.detail}
                </p>
              </div>

              {/* Force-level connections */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-white font-semibold mb-3 text-sm">
                  Force Connections in {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode
                </h3>
                <div className="space-y-2">
                  {selectedConnection.forceLinks[mode].map((link, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-start gap-2 text-sm"
                    >
                      <ArrowRight className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">{link}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mode toggle hint */}
              <div className="mt-4 text-center">
                <p className="text-zinc-500 text-xs">
                  Adjust the mode slider to see {mode === 'egalitarian' ? 'hierarchical' : 'egalitarian'} force connections
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Force Detail Modal */}
      <AnimatePresence>
        {selectedForce && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedForce(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0F0F12] border border-white/10 rounded-2xl p-6 max-w-2xl w-full relative my-8"
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedForce(null)}
                className="absolute top-3 right-3 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="flex items-start gap-3 mb-6">
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${selectedForce.config.color}-500/20`}
                >
                  {React.createElement(selectedForce.config.icon, {
                    className: `w-6 h-6 text-${selectedForce.config.color}-400`
                  })}
                </div>
                <div className="flex-1">
                  <p className="text-zinc-500 text-xs capitalize mb-1">{selectedForce.pillar}</p>
                  <h3 className="text-white font-semibold text-lg">{selectedForce.name}</h3>
                </div>
              </div>

              <div className={`p-4 rounded-xl bg-${selectedForce.config.color}-500/10 border border-${selectedForce.config.color}-500/20 mb-6`}>
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {forceExplanations[selectedForce.name]}
                </p>
              </div>

              {/* Leadership Implications */}
              <div className="mb-6">
                <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className={`w-1 h-4 rounded bg-${selectedForce.config.color}-500`} />
                  Implications for Leadership
                </h4>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-zinc-300 text-sm leading-relaxed">
                    {leadershipImplications[selectedForce.name]}
                  </p>
                </div>
              </div>

              {/* Mode Manifestation */}
              <div>
                <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className={`w-1 h-4 rounded bg-${selectedForce.config.color}-500`} />
                  How It Manifests in Each Mode
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                    <p className="text-indigo-400 text-xs font-medium uppercase mb-2 tracking-wider">Egalitarian Mode</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {modeManifestation[selectedForce.name]?.egalitarian}
                    </p>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-amber-400 text-xs font-medium uppercase mb-2 tracking-wider">Hierarchical Mode</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      {modeManifestation[selectedForce.name]?.hierarchical}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-zinc-500">
                <span>Current: {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode</span>
                <span>Scroll for more • Tap outside to close</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}