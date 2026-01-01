import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Heart, BookOpen, Zap, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield
};

const pillarColors = {
  purpose: '#8B5CF6',
  interpersonal: '#EC4899',
  learning: '#4F46E5',
  action: '#10B981',
  resilience: '#F59E0B'
};

// Forces data from ForcesRepository
const forces = {
  purpose: {
    egalitarian: [
      { name: 'Collective Goal Clarity', description: 'Everyone understands and agrees on what the team is trying to achieve together.' },
      { name: 'Team Success Belief', description: 'Members feel confident the group will accomplish its shared goals.' },
      { name: 'Shared Future Vision', description: 'The team has a common picture of where they are heading collectively.' },
      { name: 'Joint Accountability', description: 'All members take ownership of outcomes together, not just individually.' }
    ],
    hierarchical: [
      { name: 'Personal Advancement', description: 'Focus on climbing the ladder and achieving individual career progression.' },
      { name: 'Credit Attribution', description: 'Ensuring your contributions are recognized and recorded by those who matter.' },
      { name: 'Self-Serving Goals', description: 'Pursuing objectives that primarily benefit your own interests within the group.' },
      { name: 'Competitive Positioning', description: 'Maintaining or improving your standing relative to peers in the hierarchy.' }
    ]
  },
  interpersonal: {
    egalitarian: [
      { name: 'Warmth & Acceptance', description: 'Feeling genuinely liked, welcomed, and valued by others in the group.' },
      { name: 'Informal Influence', description: 'Ability to shape decisions through relationships rather than formal authority.' },
      { name: 'Social Support', description: 'Others stand by you and help when challenges arise, no strings attached.' },
      { name: 'Relational Safety', description: 'You can disagree or make mistakes without damaging your social standing.' }
    ],
    hierarchical: [
      { name: 'Formal Authority', description: 'Power derived from your position, rank, or official role in the structure.' },
      { name: 'Command Capacity', description: 'The ability to compel others to act based on your hierarchical position.' },
      { name: 'Decision Rights', description: 'Holding the mandate to make binding choices that others must follow.' },
      { name: 'Hierarchical Control', description: 'Using rank and reporting lines to settle disputes and enforce compliance.' }
    ]
  },
  learning: {
    egalitarian: [
      { name: 'Unconditional Helping', description: 'Giving assistance freely without expecting direct repayment or favors.' },
      { name: 'Resource Fluidity', description: 'Effort and support flow naturally to wherever they are needed most.' },
      { name: 'Pay-it-Forward Culture', description: 'Help circulates through the group rather than being traded bilaterally.' },
      { name: 'Low Transaction Costs', description: 'Minimal negotiation or deal-making needed to get cooperation.' }
    ],
    hierarchical: [
      { name: 'Conditional Help', description: 'Assistance is given with clear expectations of return favors or benefits.' },
      { name: 'Favor Trading', description: 'Help is explicitly tracked and exchanged like currency between individuals.' },
      { name: 'Transactional Norms', description: 'Cooperation operates on "what\'s in it for me" deal-making principles.' },
      { name: 'Resource Bargaining', description: 'Support and effort are leveraged as negotiation tools for personal gain.' }
    ]
  },
  action: {
    egalitarian: [
      { name: 'Psychological Safety', description: 'You can voice concerns, take risks, and challenge ideas without fear.' },
      { name: 'Challenge Welcome', description: 'Dissenting views and questions are actively invited and seriously considered.' },
      { name: 'Innovation Space', description: 'Room exists for novel ideas, experiments, and divergent thinking.' },
      { name: 'Open Dialogue', description: 'Genuine two-way communication where all voices can contribute meaningfully.' }
    ],
    hierarchical: [
      { name: 'Status Quo Defense', description: 'Protecting existing arrangements, processes, and power structures from change.' },
      { name: 'Norm Enforcement', description: 'Ensuring everyone complies with established rules and cultural expectations.' },
      { name: 'Change Suppression', description: 'Actively blocking or dismissing suggestions that deviate from current plans.' },
      { name: 'Stability Preference', description: 'Valuing predictability and control over adaptation and innovation.' }
    ]
  },
  resilience: {
    egalitarian: [
      { name: 'Peer Competence', description: 'Believing your colleagues have the skills and ability to deliver quality work.' },
      { name: 'Trust in Intentions', description: 'Confidence that others act in good faith and have the group\'s interests at heart.' },
      { name: 'Role Model Effect', description: 'Wanting to emulate and learn from colleagues you genuinely admire.' },
      { name: 'Horizontal Delegation', description: 'Comfortable sharing work and responsibility directly with peers.' }
    ],
    hierarchical: [
      { name: 'Perceived Competence', description: 'How capable and trustworthy others think you are at your role.' },
      { name: 'Reputation Management', description: 'Carefully maintaining your image and standing in others\' eyes.' },
      { name: 'Approval Seeking', description: 'High sensitivity to signals of validation or disapproval from superiors.' },
      { name: 'Performance Visibility', description: 'Making your competence and contributions apparent to those who evaluate you.' }
    ]
  }
};

export default function PillarForcesModal({ isOpen, onClose, pillar }) {
  const [mode, setMode] = useState('egalitarian');

  if (!isOpen || !pillar) return null;

  const Icon = pillarIcons[pillar.id] || Compass;
  const color = pillarColors[pillar.id] || '#8B5CF6';
  const pillarForces = forces[pillar.id];

  if (!pillarForces) {
    console.warn('No forces found for pillar:', pillar.id, pillar);
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-[#0F0F12] border border-white/10 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-[#0F0F12]/95 backdrop-blur-xl border-b border-white/10 p-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{pillar.title}</h2>
                  <p className="text-sm text-zinc-400">Forces & Dynamics</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-zinc-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mode Toggle */}
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10">
              <button
                onClick={() => setMode('egalitarian')}
                className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  mode === 'egalitarian'
                    ? 'bg-indigo-500 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Egalitarian
              </button>
              <button
                onClick={() => setMode('hierarchical')}
                className={`flex-1 px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
                  mode === 'hierarchical'
                    ? 'bg-amber-500 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Hierarchical
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Pillar Description */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-zinc-300 leading-relaxed">{pillar.description}</p>
            </div>

            {/* Mini Radial Force Graph */}
            <div>
              <h3 className="text-white font-semibold mb-3">Force Distribution</h3>
              <div className="relative h-64 rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
                  <defs>
                    <radialGradient id={`radial-${pillar.id}`}>
                      <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                      <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow-forces">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  
                  {/* Background circle */}
                  <circle cx="100" cy="100" r="80" fill={`url(#radial-${pillar.id})`} />
                  
                  {/* Concentric circles */}
                  {[20, 40, 60, 80].map((r, i) => (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r}
                      fill="none"
                      stroke="rgba(255,255,255,0.05)"
                      strokeWidth="0.5"
                    />
                  ))}
                  
                  {/* Force nodes in radial pattern */}
                  {pillarForces[mode].map((force, i) => {
                    const angle = (i * 2 * Math.PI) / pillarForces[mode].length - Math.PI / 2;
                    const radius = 60;
                    const x = 100 + radius * Math.cos(angle);
                    const y = 100 + radius * Math.sin(angle);
                    
                    return (
                      <motion.g
                        key={force.name}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        {/* Connection line to center */}
                        <line
                          x1="100"
                          y1="100"
                          x2={x}
                          y2={y}
                          stroke={color}
                          strokeWidth="1"
                          strokeOpacity="0.3"
                          strokeDasharray="2,2"
                        />
                        
                        {/* Force node */}
                        <circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill={color}
                          opacity="0.8"
                          filter="url(#glow-forces)"
                        />
                        
                        {/* Pulse effect */}
                        <motion.circle
                          cx={x}
                          cy={y}
                          r="8"
                          fill="none"
                          stroke={color}
                          strokeWidth="1"
                          opacity="0.5"
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.8, opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      </motion.g>
                    );
                  })}
                  
                  {/* Center pillar node */}
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <circle
                      cx="100"
                      cy="100"
                      r="15"
                      fill={color}
                      filter="url(#glow-forces)"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="12"
                      fill="rgba(15, 15, 18, 0.8)"
                    />
                  </motion.g>
                </svg>
                
                {/* Force count */}
                <div className="absolute bottom-2 right-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
                  <p className="text-xs text-zinc-300">
                    {pillarForces[mode].length} forces
                  </p>
                </div>
              </div>
            </div>

            {/* Mode Description */}
            <div 
              className="p-4 rounded-xl border"
              style={{ 
                backgroundColor: mode === 'egalitarian' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                borderColor: mode === 'egalitarian' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(245, 158, 11, 0.3)'
              }}
            >
              <h3 
                className="text-sm font-semibold mb-2 uppercase tracking-wider"
                style={{ color: mode === 'egalitarian' ? '#818CF8' : '#FCD34D' }}
              >
                {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {mode === 'egalitarian' 
                  ? 'In egalitarian settings, this pillar emphasizes collaboration, shared decision-making, and mutual support without rigid hierarchies.'
                  : 'In hierarchical settings, this pillar operates through clear authority structures, formal processes, and defined roles.'}
              </p>
            </div>

            {/* Forces Grid */}
            <div className="space-y-3">
              <h3 className="text-white font-semibold mb-3">
                Key Forces in {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode
              </h3>
              {pillarForces[mode].map((force, index) => (
                <motion.div
                  key={force.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{force.name}</h4>
                      <p className="text-sm text-zinc-400 leading-relaxed">{force.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mode Comparison Hint */}
            <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <p className="text-sm text-violet-300 flex items-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Toggle between modes to see how {pillar.title} manifests differently in each context
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}