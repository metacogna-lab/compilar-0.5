import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Sparkles, Zap, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { dataAdapter, validateData } from '@/components/pilarDefinitions/dataAdapter';
import Observatory from '@/components/pilarDefinitions/Observatory';
import Pillar3DViewModal from '@/components/pilar/Pillar3DViewModal';
import PillarForceMatrix from '@/components/pilarDefinitions/PillarForceMatrix';
import ForceDetailModal from '@/components/pilar/ForceDetailModal';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { adaptConnectionData } from '@/components/pilar/pillarConnectionData';
import ForceWordCloud from '@/components/pilar/ForceWordCloud';
import { base44 } from '@/api/base44Client';
import { usePageStore } from '@/components/stores/usePageStore';

// Source data for pillars and forces
const frameworkData = {
  egalitarian: {
    mode: 'egalitarian',
    displayName: 'Egalitarian Collaboration Mode',
    summary: 'Group cultures where power, voice, and benefits are distributed relatively evenly.',
    pillars: {
      purpose: {
        id: 'grpprosp',
        construct: 'Group Prospects',
        abbreviation: 'GrpProsp',
        counterpart: 'OwnProsp',
        definition: 'Perceived likelihood that the team as a whole will achieve its agreed goals.',
        mechanism: { focus: 'Future success of shared goals', engagement: 'High Group Prospects increase willingness to contribute' },
        subdomains: [
          { name: 'Collective Goal Clarity', description: 'Shared understanding of team objectives' },
          { name: 'Team Success Belief', description: 'Confidence in group\'s ability' }
        ],
        forces: [
          { name: 'Collective Efficacy', description: 'Shared belief in team capability', type: 'reinforce' },
          { name: 'Goal Alignment', description: 'Consensus on objectives', type: 'reinforce' },
          { name: 'Success Visibility', description: 'Clear progress indicators', type: 'discretionary' },
          { name: 'Shared Investment', description: 'Mutual stake in outcomes', type: 'reinforce' }
        ]
      },
      interpersonal: {
        id: 'popularity',
        construct: 'Popularity',
        abbreviation: 'Pop',
        counterpart: 'Status',
        definition: 'Perceived extent to which others like you and have your back.',
        mechanism: { focus: 'Warmth and informal influence', engagement: 'High Popularity increases engagement through social support' },
        subdomains: [
          { name: 'Warmth & Acceptance', description: 'Feeling welcomed and valued' },
          { name: 'Informal Influence', description: 'Shaping decisions through relationships' }
        ],
        forces: [
          { name: 'Social Affinity', description: 'Natural liking and attraction', type: 'reinforce' },
          { name: 'Peer Support', description: 'Having others\' backing', type: 'reinforce' },
          { name: 'Network Centrality', description: 'Position in social network', type: 'discretionary' },
          { name: 'Interpersonal Trust', description: 'Confidence in relationships', type: 'reinforce' }
        ]
      },
      learning: {
        id: 'indrecip',
        construct: 'Indirect Reciprocity',
        abbreviation: 'IndRecip',
        counterpart: 'DirRecip',
        definition: 'Willingness to give help without expecting direct repayment.',
        mechanism: { focus: 'Unconditional assistance flows', engagement: 'Creates joint endeavor mentality' },
        subdomains: [
          { name: 'Unconditional Helping', description: 'Assistance without repayment expectation' },
          { name: 'Resource Fluidity', description: 'Effort moves where needed' }
        ],
        forces: [
          { name: 'Generalized Exchange', description: 'Pay-it-forward mentality', type: 'reinforce' },
          { name: 'Reputation Effects', description: 'Long-term social standing', type: 'discretionary' },
          { name: 'Group Identity', description: 'Collective belonging', type: 'reinforce' },
          { name: 'Altruistic Norms', description: 'Cultural helping expectations', type: 'reinforce' }
        ]
      },
      action: {
        id: 'divsexp',
        construct: 'Diverse Expression',
        abbreviation: 'DivsExp',
        counterpart: 'NormExp',
        definition: 'Confidence that challenging ideas will be genuinely listened to.',
        mechanism: { focus: 'Psychological safety for dissent', engagement: 'Invites creativity and candid risk information' },
        subdomains: [
          { name: 'Psychological Safety', description: 'Voice concerns without fear' },
          { name: 'Challenge Welcome', description: 'Dissent invited and considered' }
        ],
        forces: [
          { name: 'Voice Safety', description: 'Freedom to speak up', type: 'reinforce' },
          { name: 'Idea Receptivity', description: 'Openness to new thoughts', type: 'reinforce' },
          { name: 'Dissent Protection', description: 'No punishment for disagreement', type: 'reinforce' },
          { name: 'Cognitive Diversity', description: 'Valuing different perspectives', type: 'discretionary' }
        ]
      },
      resilience: {
        id: 'outresp',
        construct: 'Outgoing Respect',
        abbreviation: 'OutResp',
        counterpart: 'IncResp',
        definition: 'Degree to which you perceive others as competent and trustworthy.',
        mechanism: { focus: 'Assessment of others\' skills', engagement: 'Motivated to emulate role models' },
        subdomains: [
          { name: 'Peer Competence', description: 'Believing others can deliver' },
          { name: 'Trust in Intentions', description: 'Confidence in good faith' }
        ],
        forces: [
          { name: 'Competence Recognition', description: 'Seeing others\' skills', type: 'reinforce' },
          { name: 'Trust Attribution', description: 'Believing in good faith', type: 'reinforce' },
          { name: 'Role Model Effect', description: 'Inspiration from peers', type: 'discretionary' },
          { name: 'Skill Validation', description: 'Acknowledging expertise', type: 'reinforce' }
        ]
      }
    }
  },
  hierarchical: {
    mode: 'hierarchical',
    displayName: 'Hierarchical Command Mode',
    summary: 'Group cultures where formal power and rewards are unevenly distributed.',
    pillars: {
      purpose: {
        id: 'ownprosp',
        construct: 'Own Prospects',
        abbreviation: 'OwnProsp',
        counterpart: 'GrpProsp',
        definition: 'Perceived likelihood of achieving your personal goals within the group.',
        mechanism: { focus: 'Personal advancement and credit', engagement: 'Motivated when group serves advancement' },
        subdomains: [
          { name: 'Personal Advancement', description: 'Individual career progression' },
          { name: 'Credit Attribution', description: 'Personal contributions recognized' }
        ],
        forces: [
          { name: 'Individual Gain', description: 'Personal benefit focus', type: 'inverse' },
          { name: 'Recognition Seeking', description: 'Credit for contributions', type: 'discretionary' },
          { name: 'Career Trajectory', description: 'Advancement opportunities', type: 'discretionary' },
          { name: 'Self-Interest Alignment', description: 'Personal goals with group', type: 'inverse' }
        ]
      },
      interpersonal: {
        id: 'status',
        construct: 'Status',
        abbreviation: 'Stat',
        counterpart: 'Popularity',
        definition: 'Formal power and capacity to compel others.',
        mechanism: { focus: 'Authority from rank and title', engagement: 'Leaders use group as vehicle for vision' },
        subdomains: [
          { name: 'Formal Authority', description: 'Power from position' },
          { name: 'Command Capacity', description: 'Ability to compel action' }
        ],
        forces: [
          { name: 'Hierarchical Power', description: 'Authority from position', type: 'reinforce' },
          { name: 'Command Influence', description: 'Ability to direct', type: 'reinforce' },
          { name: 'Positional Leverage', description: 'Structural advantage', type: 'discretionary' },
          { name: 'Formal Control', description: 'Institutional authority', type: 'reinforce' }
        ]
      },
      learning: {
        id: 'dirrecip',
        construct: 'Direct Reciprocity',
        abbreviation: 'DirRecip',
        counterpart: 'IndRecip',
        definition: 'Assistance given with expectation of explicit repayment.',
        mechanism: { focus: 'Conditional help and deals', engagement: 'Transactional coordination' },
        subdomains: [
          { name: 'Conditional Help', description: 'Assistance expects return' },
          { name: 'Favor Trading', description: 'Explicit tracking of exchanges' }
        ],
        forces: [
          { name: 'Tit-for-Tat', description: 'Direct exchange expectation', type: 'inverse' },
          { name: 'Favor Accounting', description: 'Tracking obligations', type: 'discretionary' },
          { name: 'Conditional Support', description: 'Help with strings attached', type: 'inverse' },
          { name: 'Reciprocal Deals', description: 'Explicit quid pro quo', type: 'inverse' }
        ]
      },
      action: {
        id: 'normexp',
        construct: 'Normative Expression',
        abbreviation: 'NormExp',
        counterpart: 'DivsExp',
        definition: 'Willingness to defend status quo and suppress change suggestions.',
        mechanism: { focus: 'Control through restricting challenges', engagement: 'Predictability and control' },
        subdomains: [
          { name: 'Status Quo Defense', description: 'Protecting existing arrangements' },
          { name: 'Change Suppression', description: 'Blocking divergent ideas' }
        ],
        forces: [
          { name: 'Conformity Pressure', description: 'Push for alignment', type: 'inverse' },
          { name: 'Dissent Suppression', description: 'Silencing challenges', type: 'inverse' },
          { name: 'Tradition Defense', description: 'Protecting established ways', type: 'discretionary' },
          { name: 'Control Maintenance', description: 'Preserving predictability', type: 'inverse' }
        ]
      },
      resilience: {
        id: 'incresp',
        construct: 'Incoming Respect',
        abbreviation: 'IncResp',
        counterpart: 'OutResp',
        definition: 'Your perception of how competent others think you are.',
        mechanism: { focus: 'Inferred appraisal by others', engagement: 'Feel legitimate and valued' },
        subdomains: [
          { name: 'Perceived Competence', description: 'How others rate abilities' },
          { name: 'Reputation Management', description: 'Maintaining image' }
        ],
        forces: [
          { name: 'Reputation Concern', description: 'Others\' perception of you', type: 'discretionary' },
          { name: 'Competence Signaling', description: 'Demonstrating ability', type: 'reinforce' },
          { name: 'Legitimacy Seeking', description: 'Being seen as valid', type: 'discretionary' },
          { name: 'Image Management', description: 'Controlling perception', type: 'discretionary' }
        ]
      }
    }
  }
};

export default function PilarDefinitions() {
  const [mode, setMode] = useState('egalitarian');
  const [observatoryView, setObservatoryView] = useState('pillars');
  const [show3DModal, setShow3DModal] = useState(false);
  const [selectedPillarFilter, setSelectedPillarFilter] = useState(null);
  const [forceDetailModal, setForceDetailModal] = useState({ isOpen: false, forceName: null, effectForces: [] });
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [forceCloudModal, setForceCloudModal] = useState({ isOpen: false, pillar: null, forces: [] });
  const [pageData, setPageData] = useState({
    title: 'Compilar Pillars & Forces',
    subtitle: 'Professional pillar and force exploration'
  });

  useEffect(() => {
    trackPageView('PilarDefinitions');
    loadPageContent();
  }, []);

  useEffect(() => {
    // Update global page context
    const modeData = frameworkData[mode];
    usePageStore.getState().setCurrentPageContext({
      title: pageData.title,
      description: pageData.subtitle,
      contentSummary: `${modeData.displayName}: ${modeData.summary}. Explore ${Object.keys(modeData.pillars).length} pillars and their interconnected forces.`,
      pageName: "PilarDefinitions"
    });
  }, [mode, pageData.title, pageData.subtitle]);

  const loadPageContent = async () => {
    try {
      const response = await base44.functions.invoke('contentManagement', {
        action: 'read',
        contentType: 'pages',
        slug: 'pilar-definitions'
      });
      
      if (response.data.success && response.data.entry) {
        setPageData({
          title: response.data.entry.title || 'Compilar Pillars & Forces',
          subtitle: response.data.entry.seoDescription || 'Professional pillar and force exploration'
        });
      }
    } catch (error) {
      console.error('Failed to load page content:', error);
    }
  };

  // Prepare data using adapter
  const adaptedData = useMemo(() => {
    const connections = adaptConnectionData(mode);
    return dataAdapter(frameworkData, connections, mode);
  }, [mode]);

  const warnings = useMemo(() => {
    return validateData(adaptedData);
  }, [adaptedData]);

  return (
    <div className="min-h-screen bg-[#0F0F12] relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 border-b border-white/5 bg-gradient-to-b from-zinc-900/50 to-black/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="text-center mb-3 md:mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{pageData.title}</h1>
            <p className="text-zinc-400 text-xs md:text-sm">{pageData.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 mb-6 pt-6">
        <button
          onClick={() => setObservatoryView('pillars')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            observatoryView === 'pillars'
              ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Pillars Overview
        </button>
        <button
          onClick={() => setObservatoryView('forces')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
            observatoryView === 'forces'
              ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30'
              : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Zap className="w-4 h-4" />
          Forces Overview
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center gap-3 mb-8"
        >
          <button
            onClick={() => setMode('egalitarian')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'egalitarian'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            Egalitarian
          </button>
          <button
            onClick={() => setMode('hierarchical')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              mode === 'hierarchical'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white border border-white/10'
            }`}
          >
            Hierarchical
          </button>
        </motion.div>

        <div className="relative z-10">
          {observatoryView === 'pillars' ? (
            <Observatory 
              adaptedData={adaptedData} 
              mode={mode} 
              onModeChange={setMode} 
              observatoryView={observatoryView}
              onPillarClick={(pillar) => {
                const pillarForces = frameworkData[mode].pillars[pillar.id]?.forces || [];
                setForceCloudModal({ 
                  isOpen: true, 
                  pillar: frameworkData[mode].pillars[pillar.id],
                  forces: pillarForces 
                });
              }}
              onForceClick={(forceName) => {
                // Extract effect forces from frameworkData
                const currentModePillars = frameworkData[mode].pillars;
                let effectForces = [];
                for (const pillarKey in currentModePillars) {
                  const pillar = currentModePillars[pillarKey];
                  const foundForce = pillar.forces.find(f => f.name === forceName);
                  if (foundForce) {
                    effectForces = pillar.forces.filter(f => f.name !== forceName).map(f => f.name);
                    break;
                  }
                }
                
                setForceDetailModal({
                  isOpen: true,
                  forceName: forceName,
                  effectForces: effectForces
                });
              }}
            />
          ) : (
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl md:rounded-[28px] p-4 md:p-6 border backdrop-blur-xl bg-gradient-to-br from-violet-500/5 to-violet-600/[0.02] border-violet-500/30"
              >
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  Understanding the Matrix
                </h3>
                <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
                  <p>
                    The <span className="font-semibold text-white">Pillar-Force Matrix</span> visualizes how individual psychological forces map to the five PILAR pillars. Each row represents a specific force, while columns represent the pillars.
                  </p>
                  <p>
                    A <span className="text-violet-400 font-medium">colored indicator</span> shows which pillar a force belongs to. Click on any force name on the left or on the originating dot within the matrix to view detailed information about that force, including its <span className="font-medium">connections to other forces</span> and how it influences team dynamics in the current {mode} mode.
                  </p>
                  <p>
                    Clicking a <span className="font-medium">pillar header</span> filters the matrix to show only forces originating from or influencing that pillar, helping you focus on specific interconnections.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl md:rounded-[28px] p-4 md:p-6 border backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10"
              >
                <div className="mb-6 space-y-2">
                  <h2 className="text-xl md:text-2xl font-bold text-white">Pillar-Force Matrix</h2>
                  <p className="text-sm text-zinc-400">Click on any force to explore its connections</p>
                </div>
                <PillarForceMatrix
                  mode={mode}
                  allForces={adaptedData.allForces || []}
                  onForceClick={(force) => {
                    // Extract effect forces from frameworkData
                    const currentModePillars = frameworkData[mode].pillars;
                    let effectForces = [];
                    for (const pillarKey in currentModePillars) {
                      const pillar = currentModePillars[pillarKey];
                      const foundForce = pillar.forces.find(f => f.name === force.name);
                      if (foundForce) {
                        effectForces = pillar.forces.filter(f => f.name !== force.name).map(f => f.name);
                        break;
                      }
                    }
                    
                    setForceDetailModal({
                      isOpen: true,
                      forceName: force.name,
                      effectForces: effectForces
                    });
                  }}
                  selectedPillar={selectedPillar}
                  setSelectedPillar={setSelectedPillar}
                />
              </motion.div>
            </div>
          )}
        </div>
      </div>

      <Pillar3DViewModal
        isOpen={show3DModal}
        onClose={() => setShow3DModal(false)}
        initialMode={mode}
        pillarsInfo={pillarsInfo}
        currentPillars={pillarsInfo[mode]}
      />

      <ForceDetailModal
        isOpen={forceDetailModal.isOpen}
        onClose={() => setForceDetailModal({ isOpen: false, forceName: null, effectForces: [] })}
        forceName={forceDetailModal.forceName}
        mode={mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'}
        effectForces={forceDetailModal.effectForces}
      />

      <ForceWordCloud
        isOpen={forceCloudModal.isOpen}
        onClose={() => setForceCloudModal({ isOpen: false, pillar: null, forces: [] })}
        pillar={forceCloudModal.pillar}
        mode={mode}
        forces={forceCloudModal.forces}
      />
    </div>
  );
}