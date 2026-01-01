import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ExternalLink, ChevronDown, Sparkles, Target, Users as UsersIcon, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function PillarInfoCard({ pillar, index, mode = 'egalitarian', onViewForces }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showCharacteristics, setShowCharacteristics] = React.useState(false);
  const [showSubdomains, setShowSubdomains] = React.useState(false);
  const [showQuestions, setShowQuestions] = React.useState(false);
  const Icon = pillar.icon;
  
  // Map pillar IDs to generic categories
  const pillarCategoryMap = {
    normexp: 'purpose',
    divsexp: 'purpose',
    dirrecip: 'interpersonal',
    indrecip: 'interpersonal',
    status: 'resilience',
    popularity: 'resilience',
    ownprosp: 'action',
    grpprosp: 'action',
    incresp: 'learning',
    outresp: 'learning'
  };
  
  // Mode-specific descriptions and key characteristics
  const modeContent = {
    egalitarian: {
      purpose: {
        description: 'In egalitarian settings, purpose emerges through collective dialogue and shared vision-building, where every voice contributes to defining meaningful goals.',
        keyChars: ['Shared vision creation', 'Collective goal-setting', 'Democratic decision-making', 'Diverse perspectives valued'],
        focus: 'Group prospects and normative expression'
      },
      interpersonal: {
        description: 'Egalitarian relationships prioritize mutual trust, psychological safety, and indirect reciprocity, creating environments where collaboration flourishes naturally.',
        keyChars: ['Indirect reciprocity', 'Peer trust building', 'Psychological safety', 'Collective belonging'],
        focus: 'Cooperation without expectation of immediate return'
      },
      learning: {
        description: 'Learning in egalitarian contexts emphasizes peer-to-peer knowledge sharing, collective problem-solving, and open exploration without hierarchical barriers.',
        keyChars: ['Peer learning networks', 'Shared expertise', 'Open questioning culture', 'Collaborative discovery'],
        focus: 'Mutual growth and collective intelligence'
      },
      action: {
        description: 'Action flows from collective ownership and distributed initiative, with team members self-organizing around shared objectives.',
        keyChars: ['Distributed leadership', 'Team autonomy', 'Collective accountability', 'Self-organization'],
        focus: 'Shared responsibility and initiative'
      },
      resilience: {
        description: 'Resilience is built through strong social support networks, emotional resources from peers, and collective stress management.',
        keyChars: ['Peer support systems', 'Emotional safety nets', 'Collective coping', 'Mutual encouragement'],
        focus: 'Community-based recovery and strength'
      }
    },
    hierarchical: {
      purpose: {
        description: 'In hierarchical structures, purpose flows from strategic direction and clear organizational mandates, providing focused alignment and accountability.',
        keyChars: ['Top-down vision', 'Strategic alignment', 'Clear mandates', 'Individual goals aligned to org'],
        focus: 'Own prospects and structured objectives'
      },
      interpersonal: {
        description: 'Hierarchical relationships leverage formal roles, direct reciprocity, and clear authority structures to coordinate complex initiatives efficiently.',
        keyChars: ['Direct reciprocity', 'Role-based interactions', 'Formal authority', 'Chain of command'],
        focus: 'Structured cooperation with expected returns'
      },
      learning: {
        description: 'Learning follows structured paths with mentorship, formal training, and expertise flowing from senior to junior members.',
        keyChars: ['Mentorship programs', 'Formal training paths', 'Expertise hierarchy', 'Knowledge transfer'],
        focus: 'Structured skill development and certification'
      },
      action: {
        description: 'Action is driven by clear chains of command, individual accountability, and disciplined execution of defined responsibilities.',
        keyChars: ['Clear accountability', 'Defined responsibilities', 'Command structure', 'Individual performance'],
        focus: 'Disciplined execution and measurable results'
      },
      resilience: {
        description: 'Resilience emerges from formal support systems, clear stress management protocols, and institutional stability during challenges.',
        keyChars: ['Formal support programs', 'Structured interventions', 'Institutional stability', 'Role clarity in crisis'],
        focus: 'Systematic stress management and resources'
      }
    }
  };
  
  const pillarCategory = pillarCategoryMap[pillar.id] || pillar.id;
  const currentContent = modeContent[mode]?.[pillarCategory];
  const currentDescription = currentContent?.description || pillar.description;
  
  return (
    <motion.div
      key={`${pillar.id}-${mode}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ y: -4, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
      transition={{ delay: index * 0.08, type: 'spring', stiffness: 100 }}
      className={cn(
        'rounded-[28px] p-6 border backdrop-blur-xl bg-gradient-to-br transition-all duration-300',
        pillar.bgGradient,
        pillar.borderColor
      )}
    >
      {/* Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start gap-4 mb-6 text-left group"
      >
        <motion.div 
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
          className={`p-3 rounded-2xl bg-${pillar.color}-500 shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  mode === 'egalitarian' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {mode}
              </motion.span>
            </div>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            </motion.div>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">{pillar.description}</p>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {/* Expandable Sections */}
            <div className="space-y-2 mb-6">
              {/* Key Characteristics */}
              {currentContent && (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCharacteristics(!showCharacteristics);
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className={`w-4 h-4 ${mode === 'egalitarian' ? 'text-indigo-400' : 'text-amber-400'}`} />
                      <span className="text-sm font-medium text-white">Key Characteristics</span>
                    </div>
                    <motion.div
                      animate={{ rotate: showCharacteristics ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showCharacteristics && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 bg-white/5">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            {currentContent.keyChars.map((char, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                                  mode === 'egalitarian' ? 'bg-indigo-400' : 'bg-amber-400'
                                }`} />
                                <span className="text-xs text-zinc-300">{char}</span>
                              </div>
                            ))}
                          </div>
                          <div className={`pt-3 border-t ${mode === 'egalitarian' ? 'border-indigo-500/20' : 'border-amber-500/20'}`}>
                            <div className="flex items-start gap-2">
                              <Target className={`w-3.5 h-3.5 mt-0.5 ${mode === 'egalitarian' ? 'text-indigo-400' : 'text-amber-400'}`} />
                              <div>
                                <p className="text-xs font-medium text-zinc-400 mb-1">Primary Focus</p>
                                <p className="text-xs text-zinc-300 italic">{currentContent.focus}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Forces */}
              {pillar.forces && (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSubdomains(!showSubdomains);
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-medium text-white">Forces</span>
                    </div>
                    <motion.div
                      animate={{ rotate: showSubdomains ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {showSubdomains && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-4 pb-4 space-y-3 bg-white/5">
                          {pillar.forces && pillar.forces.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-zinc-400 mb-2">Key Forces:</p>
                              {pillar.forces.map((force, i) => (
                                <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10 mb-2">
                                  <div className="flex items-start gap-3">
                                    <div className={`w-6 h-6 rounded-lg bg-${pillar.color}-500/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                                      <span className={`text-xs font-bold text-${pillar.color}-400`}>{i + 1}</span>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white mb-1 text-sm">{force.name}</h4>
                                      <p className="text-xs text-zinc-400 leading-relaxed">{force.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Reflective Questions */}
              <div className="border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuestions(!showQuestions);
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm font-medium text-white">Reflective Questions</span>
                  </div>
                  <motion.div
                    animate={{ rotate: showQuestions ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {showQuestions && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-4 pb-4 space-y-2 bg-white/5">
                        {pillar.keyQuestions && pillar.keyQuestions.map((q, i) => (
                          <div key={i} className="flex items-start gap-3 text-zinc-300 p-3 rounded-lg bg-white/5">
                            <span className={`w-5 h-5 rounded-full bg-${pillar.color}-500/20 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                              <span className={`text-xs text-${pillar.color}-400`}>?</span>
                            </span>
                            <span className="text-sm leading-relaxed">{q}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center gap-2">
              <Button 
                onClick={() => onViewForces?.(pillar)}
                variant="ghost" 
                className={cn(
                  "flex-1 text-zinc-300 hover:text-white transition-all group",
                  `hover:bg-${pillar.color}-500/10`
                )}
              >
                <Zap className="w-4 h-4 mr-2" />
                <span>View Forces</span>
              </Button>
              <Link to={createPageUrl(`Pillar?pillar=${pillar.id}`)} className="flex-1">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full text-zinc-300 hover:text-white transition-all group",
                    `hover:bg-${pillar.color}-500/10`
                  )}
                >
                  <span className="flex-1 text-left">Begin Assessment</span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <ExternalLink className="w-4 h-4 group-hover:text-white" />
                  </motion.div>
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}