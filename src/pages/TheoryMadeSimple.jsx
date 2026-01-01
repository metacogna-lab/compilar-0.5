import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Menu, X, Compass, Heart, BookOpen, Zap, Shield,
  ChevronDown, ChevronUp, MessageCircle, ArrowRight, Lightbulb,
  Target, Users, TrendingUp, AlertCircle, Info, Eye, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import InteractiveTheoryMap from '@/components/pilar/InteractiveTheoryMap';
import InteractivePillarGraph from '@/components/pilar/InteractivePillarGraph';
import DynamicModeExplorer from '@/components/pilar/DynamicModeExplorer';
import InteractiveForceNetwork from '@/components/pilar/InteractiveForceNetwork';
import ForceFieldVisualization from '@/components/pilar/ForceFieldVisualization';
import ModeShiftSimulator from '@/components/pilar/ModeShiftSimulator';
import InteractiveModeSimulation from '@/components/pilar/InteractiveModeSimulation';
import IntegratedPillarForcesView from '@/components/pilar/IntegratedPillarForcesView';
import PilarTheoryChatbot from '@/components/pilar/PilarTheoryChatbot';
import { trackPageView } from '@/components/pilar/ActionTracker';
import ReactMarkdown from 'react-markdown';

const quickInfo = [
  { 
    id: 'framework', 
    icon: Target, 
    title: '5 Interconnected Pillars',
    description: 'Purpose, Interpersonal, Learning, Action, Resilience form a complete system'
  },
  { 
    id: 'modes', 
    icon: Users, 
    title: 'Two Operating Modes',
    description: 'Egalitarian (distributed) and Hierarchical (concentrated) power structures'
  },
  { 
    id: 'forces', 
    icon: Zap, 
    title: '8 Core Forces',
    description: 'Psychological dynamics that manifest differently in each mode'
  }
];

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', title: 'Purpose', simple: 'Why we exist and where we\'re going' },
  interpersonal: { icon: Heart, color: 'pink', title: 'Interpersonal', simple: 'How we relate and connect' },
  learning: { icon: BookOpen, color: 'indigo', title: 'Learning', simple: 'How we grow and adapt' },
  action: { icon: Zap, color: 'emerald', title: 'Action', simple: 'How we get things done' },
  resilience: { icon: Shield, color: 'amber', title: 'Resilience', simple: 'How we handle pressure' }
};

export default function TheoryMadeSimple() {
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [currentMode, setCurrentMode] = useState('egalitarian');
  const [showForces, setShowForces] = useState(false);
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(true);

  React.useEffect(() => {
    trackPageView('TheoryMadeSimple');
    loadPageContent();
  }, []);

  const loadPageContent = async () => {
    try {
      const response = await base44.functions.invoke('contentManagement', {
        action: 'read',
        contentType: 'pages',
        slug: 'theory-made-simple'
      });
      
      if (response.data.success && response.data.entry) {
        setContent(response.data.entry.content);
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  return (
    <div className="min-h-screen bg-[#0F0F12] relative">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0F0F12]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={createPageUrl('GlobalMap')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <div className="flex-1 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">PILAR Framework</h1>
            <p className="text-xs text-zinc-400">Interactive Theory Explorer</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setChatbotOpen(!chatbotOpen)}
              className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300"
            >
              <MessageCircle className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Ask AI</span>
            </Button>
            <Link to={createPageUrl('FAQ')}>
              <Button
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <Info className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">FAQ</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* CMS Content Section */}
        {loadingContent ? (
          <div className="text-center py-12 mb-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-500 border-r-transparent"></div>
            <p className="text-zinc-400 mt-4">Loading content...</p>
          </div>
        ) : content && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <article className="prose prose-invert prose-violet max-w-none bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                      <Target className="w-7 h-7 text-violet-400" />
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-violet-400 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-zinc-300 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-violet-400 font-semibold">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 text-zinc-300 mb-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-2 text-zinc-300 mb-4">
                      {children}
                    </ol>
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          </motion.div>
        )}

        {/* Quick Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {quickInfo.map((info, i) => {
            const Icon = info.icon;
            return (
              <motion.div
                key={info.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-violet-500/30 transition-all"
              >
                <Icon className="w-6 h-6 text-violet-400 mb-2" />
                <h3 className="text-white font-semibold mb-1">{info.title}</h3>
                <p className="text-sm text-zinc-400">{info.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Mode Toggle - Prominent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4">
            <span className="text-sm text-zinc-400">Operating Mode:</span>
            <button
              onClick={() => setCurrentMode('egalitarian')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentMode === 'egalitarian'
                  ? 'bg-indigo-500/20 border-2 border-indigo-500/50 text-indigo-300 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              Egalitarian
            </button>
            <button
              onClick={() => setCurrentMode('hierarchical')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                currentMode === 'hierarchical'
                  ? 'bg-amber-500/20 border-2 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10'
              }`}
            >
              Hierarchical
            </button>
          </div>
        </motion.div>

        {/* Main Graph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">The PILAR System</h2>
            <p className="text-zinc-400">Click any pillar to explore its connections and details</p>
          </div>
          
          <InteractivePillarGraph
            userProfile={userProfile}
            onPillarSelect={setSelectedPillar}
            selectedPillar={selectedPillar}
          />
        </motion.div>

        {/* Forces Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8 text-center"
        >
          <Button
            onClick={() => setShowForces(!showForces)}
            size="lg"
            className={`${
              showForces 
                ? 'bg-violet-500/20 hover:bg-violet-500/30 text-violet-300' 
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <Zap className="w-5 h-5 mr-2" />
            {showForces ? 'Hide' : 'Explore'} 8 Forces in Detail
            <ChevronDown className={`w-5 h-5 ml-2 transition-transform ${showForces ? 'rotate-180' : ''}`} />
          </Button>
        </motion.div>

        {/* Forces Detail */}
        <AnimatePresence>
          {showForces && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-900/20 to-pink-900/20 border border-violet-500/20 mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Forces Within Each Pillar</h3>
                <p className="text-zinc-400 mb-6">
                  Each pillar contains specific forces that operate differently in {currentMode} mode.
                </p>
                <IntegratedPillarForcesView
                  currentMode={currentMode}
                  selectedPillar={selectedPillar}
                  onPillarSelect={setSelectedPillar}
                  userProfile={userProfile}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Practice Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Try It in Practice</h2>
            <p className="text-zinc-400">Simulate mode shifts and see real-time impact</p>
          </div>

          <InteractiveModeSimulation />

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Lightbulb className="w-8 h-8 text-amber-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Start With Awareness</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Begin by noticing which mode your team defaults to.
              </p>
              <Link to={createPageUrl('Profile')}>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">Take Assessments</Button>
              </Link>
            </div>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-white font-semibold mb-2">Practice Mode Shifts</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Try deliberate transitions in your team.
              </p>
              <Link to={createPageUrl('Teams')}>
                <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">Join a Team</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chatbot Integration */}
      {chatbotOpen && (
        <PilarTheoryChatbot
          currentMode={currentMode}
          userProfile={userProfile}
          isOpen={chatbotOpen}
          onClose={() => setChatbotOpen(false)}
        />
      )}
    </div>
  );
}