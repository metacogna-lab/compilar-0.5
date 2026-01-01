import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { subtle } from '@/components/config/motion';

import { trackPageView } from '@/components/pilar/ActionTracker';

import PillarConnectionGraph2 from '@/components/pilar/PillarConnectionGraph2';
import PillarInfoCard from '@/components/pilar/PillarInfoCard';
import ModeInfoBanner from '@/components/pilar/ModeInfoBanner';
import HowPillarsConnect from '@/components/pilar/HowPillarsConnect';
import PillarFilterChips from '@/components/pilar/PillarFilterChips';
import { cn } from '@/lib/utils';
import { AnimatePresence } from 'framer-motion';
import Pillar3DViewModal from '@/components/pilar/Pillar3DViewModal';
import PillarForcesModal from '@/components/pilar/PillarForcesModal';
import PilarTheoryModal from '@/components/pilar/PilarTheoryModal';
import PillarAIInsights from '@/components/pilar/PillarAIInsights';
import LightGlobes from '@/components/pilar/LightGlobes';
import PillarDetailModal from '@/components/pilar/PillarDetailModal';
import ForceDetailModal from '@/components/pilar/ForceDetailModal';
import { SparklesCore } from '@/components/ui/sparkles';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { forceConnectionsData } from '@/components/pilar/forceConnectionsData';


export { pillarsInfo };

export default function PilarInfo() {
  const [mode, setMode] = React.useState('egalitarian');
  const [selectedPillar, setSelectedPillar] = React.useState(null);
  const [selectedPillarForDetail, setSelectedPillarForDetail] = React.useState(null);
  const [forcesModalPillar, setForcesModalPillar] = React.useState(null);
  const [authorityLevel, setAuthorityLevel] = React.useState(0.5);
  const [showTheoryModal, setShowTheoryModal] = React.useState(false);
  const [detailModalPillar, setDetailModalPillar] = React.useState(null);
  const [hoveredPillarId, setHoveredPillarId] = React.useState(null);
  const [show3DModal, setShow3DModal] = React.useState(false);
  const [showAIInsights, setShowAIInsights] = React.useState(false);
  const [forceModalPillar, setForceModalPillar] = React.useState(null);
  const [content, setContent] = useState({ title: '', description: '' });

  useEffect(() => {
    trackPageView('PilarInfo');
    
    const loadContent = async () => {
      try {
        const response = await base44.functions.invoke('contentManagement', {
          action: 'read',
          contentType: 'pages',
          slug: 'pilar-info'
        });
        
        if (response.data.success && response.data.content) {
          setContent({
            title: response.data.content.title || 'The Compilar Model',
            description: response.data.content.content || 'COMPILAR explores two fundamental modes of group coordination through 5 core pillars: Prospects, Involved, Liked, Agency, and Respect. Each pillar is driven by 4 psychological forces that shape team dynamics and performance.'
          });
        }
      } catch (error) {
        console.error('Failed to load content:', error);
      }
    };
    
    loadContent();
  }, []);

  const currentPillars = pillarsInfo[mode];
  
  const selectedPillarData = selectedPillarForDetail 
    ? currentPillars.find(p => p.id === selectedPillarForDetail)
    : null;

  return (
    <div className="min-h-screen bg-[#0F0F12] relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px]" />
      </div>

      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <SparklesCore
          id="pilar-info-sparkles"
          background="transparent"
          minSize={0.3}
          maxSize={1}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#8B5CF6"
          speed={0.4}
        />
      </div>


      
      <div className="fixed bottom-6 right-6 z-50">
        <LightGlobes />
      </div>

      <motion.div 
        className="relative z-10 px-4 md:px-6 pb-12 md:pb-20 max-w-3xl mx-auto"
        variants={subtle.stagger.container}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={subtle.stagger.item}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
            {content.title}
          </h1>
          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto mb-4 md:mb-6 px-2">
            {content.description}
          </p>
        </motion.div>

        <motion.div
          variants={subtle.stagger.item}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm border border-white/10 rounded-lg p-1">
            <button
              onClick={() => setMode('egalitarian')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                mode === 'egalitarian'
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Egalitarian
            </button>
            <button
              onClick={() => setMode('hierarchical')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition-all ${
                mode === 'hierarchical'
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Hierarchical
            </button>
          </div>
        </motion.div>

        <motion.div
          variants={subtle.stagger.item}
          className="rounded-2xl md:rounded-[28px] p-4 md:p-6 lg:p-8 border backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 mb-8 md:mb-12"
        >
          <HowPillarsConnect mode={mode} />
        </motion.div>

        <motion.div
          key="forces-graph"
          variants={subtle.stagger.item}
          className="rounded-2xl md:rounded-[28px] p-4 md:p-6 lg:p-8 border backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 mb-8 md:mb-12"
        >
          <PillarConnectionGraph2 
            mode={mode}
            authorityLevel={authorityLevel}
            onPillarNodeClick={(pillar) => {
              setForcesModalPillar(pillar);
            }}
            onPillarClick={(pillarId) => {
              const pillar = currentPillars.find(p => p.id === pillarId);
              setDetailModalPillar(pillar);
            }}
            onViewForces={(pillarIdOrName, connections) => {
              // pillarIdOrName is the pillar ID (from conn.from)
              const pillarData = currentPillars?.find(p => p.id === pillarIdOrName);
              
              if (!pillarData || !connections || connections.length === 0) return;
              
              // The connection already has all we need from pillarConnectionData
              const conn = connections[0];
              
              const toPillarData = currentPillars?.find(p => p.id === conn.to);
              
              // Create formatted connection for modal display
              const formattedConn = {
                id: conn.id,
                name: conn.label || "Connection Force",
                mode: mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical',
                force_from: pillarData?.title || pillarIdOrName,
                force_to: toPillarData?.title || conn.to,
                effect_type: conn.strength > 0.75 ? 'Reinforce' : conn.strength < 0.6 ? 'Inverse' : 'Discretionary',
                type: conn.strength > 0.75 ? 'Reinforce' : conn.strength < 0.6 ? 'Inverse' : 'Discretionary',
                description: conn.detail || conn.description || "No description available"
              };
              
              // Create force object
              const force = {
                id: conn.from,
                label: pillarData?.title || pillarIdOrName,
                description: pillarData?.description || '',
                pillarId: pillarIdOrName,
                group: pillarIdOrName,
                modeType: mode
              };
              
              setForceModalPillar({ 
                force, 
                connections: [formattedConn],
                pillarConnectionData: {
                  pillars: currentPillars || [],
                  connections: [formattedConn],
                  allForces: []
                }
              });
            }}
          />
        </motion.div>

        <motion.div
          variants={subtle.stagger.item}
          className="rounded-2xl md:rounded-[28px] p-4 md:p-6 lg:p-8 border backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 mb-8 md:mb-12"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Psychological Forces
            </h2>
            <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto mb-6">
              Each pillar is driven by {currentPillars[0]?.forces?.length || 4} fundamental forces that shape behavior and outcomes
            </p>
          </div>
          <div className="mb-6">
            <ModeInfoBanner mode={mode} />
          </div>
        </motion.div>

        <Pillar3DViewModal
          isOpen={show3DModal}
          onClose={() => setShow3DModal(false)}
          initialMode={mode}
          pillarsInfo={pillarsInfo}
          currentPillars={currentPillars}
        />

        <PillarForcesModal
          isOpen={!!forcesModalPillar}
          onClose={() => setForcesModalPillar(null)}
          pillar={forcesModalPillar}
        />

        <PilarTheoryModal
          isOpen={showTheoryModal}
          onClose={() => setShowTheoryModal(false)}
        />

        <PillarDetailModal
          isOpen={!!detailModalPillar}
          onClose={() => setDetailModalPillar(null)}
          pillar={detailModalPillar}
          mode={mode}
          connections={[]}
        />

        <ForceDetailModal
          isOpen={!!forceModalPillar}
          onClose={() => setForceModalPillar(null)}
          force={forceModalPillar?.force}
          mode={mode}
          connections={forceModalPillar?.connections || []}
          pillarConnectionData={forceModalPillar?.pillarConnectionData}
        />

        <AnimatePresence>
          {showAIInsights && (
            <PillarAIInsights
              selectedPillars={selectedPillarForDetail ? [currentPillars.find(p => p.id === selectedPillarForDetail)] : currentPillars}
              mode={mode}
              connections={[]}
              onClose={() => setShowAIInsights(false)}
            />
          )}
        </AnimatePresence>

        {/* Full Pillars Panel */}
        <motion.div
          variants={subtle.stagger.item}
          className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 mb-16 mt-8"
        >
          {/* Pillars Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              {currentPillars?.map((pillar, index) => {
                const Icon = pillar.icon;
                return (
                  <motion.div
                    key={pillar.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -4, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative p-6 rounded-2xl border backdrop-blur-sm transition-all cursor-pointer ${pillar.bgGradient} ${pillar.borderColor}`}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`p-4 rounded-xl bg-${pillar.color}-500/20`}>
                        <Icon className={`w-8 h-8 text-${pillar.color}-400`} />
                      </div>
                      <div className="text-center">
                        <h3 className="text-base font-bold text-white mb-1">{pillar.title}</h3>
                        <p className={`text-xs font-semibold text-${pillar.color}-400`}>{pillar.abbreviation}</p>
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">{pillar.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={subtle.stagger.item}
          className="text-center"
        >
          <Link to={createPageUrl('PilarDefinitions')}>
            <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full">
              Explore Definitions
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}