import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Maximize, Minimize, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChordGraph from './ChordGraph';
import Pilar3DChatbot from './Pilar3DChatbot';
import PillarConnectionModal from './PillarConnectionModal';
import Pillar3DDetailModal from './Pillar3DDetailModal';
import PilarTheoryModal from './PilarTheoryModal';
import { ArcaneOrb } from '@/components/ui/arcane-orb';
import { SparklesCore } from '@/components/ui/sparkles';
import { pillarsInfo } from './pillarsData';

export default function Pillar3DViewModal({ isOpen, onClose, initialMode }) {
  const [mode, setMode] = useState(initialMode || 'egalitarian');
  const [selectedPillarId, setSelectedPillarId] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [selectedPillars, setSelectedPillars] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(true);
  const [authorityLevel, setAuthorityLevel] = useState(0.5);
  const [showTheoryModal, setShowTheoryModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const modalRef = useRef(null);
  
  const currentPillars = pillarsInfo[mode] || [];

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      modalRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={modalRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black overflow-auto"
      >
        {/* Arcane Orb Shader Background */}
        <div className="absolute inset-0 z-0 opacity-[0.2] pointer-events-none">
          <ArcaneOrb hue={260} speed={0.5} intensity={1.0} className="w-full h-full" />
        </div>
        
        {/* Sparkles Background Layer */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <SparklesCore
            id="3d-view-sparkles"
            background="transparent"
            minSize={0.4}
            maxSize={1.2}
            particleDensity={80}
            className="w-full h-full"
            particleColor="#8B5CF6"
            speed={0.5}
          />
        </div>

        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-0 left-0 right-0 z-10 p-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                <span className="ml-2">Full Screen</span>
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <X className="w-5 h-5 mr-2" />
                Exit 3D View
              </Button>
              </div>
              </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setChatbotOpen(!chatbotOpen)}
              variant="ghost"
              className="flex flex-col items-center gap-1 text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 rounded-xl p-3"
            >
              <MessageCircle className="w-7 h-7" />
              <span className="text-[10px] font-medium">chat</span>
            </Button>
          </div>
        </motion.div>

        {/* Light White Gradient Border at Page Edges */}
        <div className="absolute inset-0 pointer-events-none z-[100]">
          <div className="absolute inset-0 rounded-none border-4 border-white/10" 
               style={{
                 background: 'linear-gradient(to right, rgba(255,255,255,0.1) 0%, transparent 2%, transparent 98%, rgba(255,255,255,0.1) 100%), linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 2%, transparent 98%, rgba(255,255,255,0.1) 100%)'
               }}
          />
        </div>

        {/* Main Content */}
        <div className="relative z-0 h-full pt-24 pb-12 px-6 overflow-auto">
          <div className="min-h-[calc(100vh-144px)] flex justify-center pb-12">
            {/* Unified Visualization Container - matching 2D design */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-6xl rounded-[28px] p-12 border-2 backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/20 flex flex-col"
              >
              {/* Title */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <Layers className="w-10 h-10 text-violet-400" />
                </div>
                <h1 className="text-5xl font-bold text-white tracking-tight">3D PILAR Exploration</h1>
              </div>

              {/* Mode Toggle - Centered Over Graph */}
              <div className="flex justify-center mb-4">
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-full border border-white/10">
                  <button
                    onClick={() => setMode('egalitarian')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      mode === 'egalitarian'
                        ? 'bg-indigo-500 text-white shadow-lg'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Egalitarian
                  </button>
                  <button
                    onClick={() => setMode('hierarchical')}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      mode === 'hierarchical'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Hierarchical
                  </button>
                </div>
              </div>

              {/* Graph Container */}
              <div className="relative rounded-2xl overflow-hidden bg-black/20 border-2 border-white/10 min-h-[600px] p-8 mb-6">
                <ChordGraph
                  mode={mode}
                  pillarsInfo={currentPillars}
                  onPillarClick={setSelectedPillarId}
                  onConnectionClick={setSelectedConnection}
                  searchQuery={searchQuery}
                />
              </div>

              {/* Authority Slider - Only in Hierarchical Mode */}
              {mode === 'hierarchical' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-col items-center mt-4"
                >
                  <div className="p-4 bg-white/5 rounded-xl border border-amber-500/30 max-w-md w-full cursor-pointer hover:bg-white/10 transition-colors" onClick={() => setShowTheoryModal(true)}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-amber-400 cursor-pointer">Authority Impact</label>
                      <span className="text-xs text-zinc-400">
                        {['Minimal', 'Low', 'Moderate', 'High', 'Maximum'][Math.round(authorityLevel * 4)]}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      value={Math.round(authorityLevel * 4)}
                      onChange={(e) => {
                        e.stopPropagation();
                        setAuthorityLevel(parseInt(e.target.value) / 4);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-amber-500/50"
                    />
                    <div className="flex justify-between mt-2">
                      {[0, 0.25, 0.5, 0.75, 1].map((val, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            setAuthorityLevel(val);
                          }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            Math.abs(authorityLevel - val) < 0.01
                              ? 'bg-amber-500 scale-125'
                              : 'bg-white/20 hover:bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      Adjusts how strongly authority flows through the hierarchical structure
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Chatbot Panel - Floating Temporary Pane */}
            <AnimatePresence>
              {chatbotOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="fixed top-20 right-6 w-96 max-h-[calc(100vh-120px)] bg-gradient-to-br from-zinc-900/95 to-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
                >
                  <Pilar3DChatbot
                    mode={mode}
                    selectedPillar={selectedPillarId}
                    selectedPillars={selectedPillars}
                    pillarsInfo={currentPillars}
                    onClose={() => setChatbotOpen(false)}
                    onSelectedPillarsChange={setSelectedPillars}
                    searchQuery={searchQuery}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Pillar Connection Modal */}
        <PillarConnectionModal
          isOpen={!!selectedConnection}
          onClose={() => setSelectedConnection(null)}
          connection={selectedConnection}
          mode={mode}
        />

        {/* Pillar 3D Detail Modal */}
        <Pillar3DDetailModal
          isOpen={!!selectedPillarId}
          onClose={() => setSelectedPillarId(null)}
          pillar={selectedPillarId}
          mode={mode}
        />

        {/* PILAR Theory Modal */}
        <PilarTheoryModal
          isOpen={showTheoryModal}
          onClose={() => setShowTheoryModal(false)}
        />
      </motion.div>
    </AnimatePresence>
  );
}