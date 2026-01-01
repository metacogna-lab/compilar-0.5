import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MapNode from '@/components/pilar/MapNode';
import PillarModal from '@/components/pilar/PillarModal';
import PillarDetailModal from '@/components/pilar/PillarDetailModal';
import PilarChatBot from '@/components/pilar/PilarChatBot';
import GamificationFloatingWidget from '@/components/pilar/GamificationFloatingWidget';
import AnalyzePanel from '@/components/pilar/AnalyzePanel';
import SuggestionsPanel from '@/components/pilar/SuggestionsPanel';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Info, BarChart3, Compass, Sparkles, Users, Network, Brain, Lightbulb, BookOpen, TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { determineNextPillar } from '@/components/pilar/NavigationHeuristics';
import { trackPageView, trackPillarSelected, trackModalOpened, trackModalClosed, trackNavigationClick, trackGraphInteraction, trackInsightViewed } from '@/components/pilar/ActionTracker';
import { generateCompetencyProfile, calculateLeadershipMetrics, detectUserIntent, generateLearningRecommendations } from '@/components/pilar/UserIntentAnalytics';

// Pentagon vertices: Purpose at top, then clockwise - pillars at outer edges
const pillars = [
  { id: 'purpose', position: { x: '50%', y: '2%' } },          // Top apex
  { id: 'interpersonal', position: { x: '97%', y: '36%' } },   // Right apex
  { id: 'action', position: { x: '80%', y: '95%' } },          // Bottom-right apex
  { id: 'learning', position: { x: '20%', y: '95%' } },        // Bottom-left apex
  { id: 'resilience', position: { x: '3%', y: '36%' } },       // Left apex
];

export default function GlobalMap() {
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    trackPageView('GlobalMap');
  }, []);

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const records = await base44.entities.UserGamification.list();
      return records[0];
    },
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.GroupRound.list(),
  });

  const userInitials = currentUser?.full_name 
    ? currentUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() || 'U';

  // Calculate recommended next pillar using heuristics
  const recommendation = determineNextPillar(userProfile, assessments);

  // Generate competency profile for radial visualization
  const competencyProfile = useMemo(() => {
    return generateCompetencyProfile(userProfile, assessments, gamification);
  }, [userProfile, assessments, gamification]);

  // Calculate leadership metrics
  const leadershipMetrics = useMemo(() => {
    return calculateLeadershipMetrics(competencyProfile);
  }, [competencyProfile]);

  // Detect user intent
  const userIntent = useMemo(() => {
    return detectUserIntent(userProfile, [], 'GlobalMap');
  }, [userProfile]);

  // Generate learning recommendations
  const learningRecommendations = useMemo(() => {
    return generateLearningRecommendations(competencyProfile, userProfile);
  }, [competencyProfile, userProfile]);

  const getNodeVariant = (pillarId) => {
    const assessment = assessments.find(a => a.pillar === pillarId && a.completed);
    if (assessment?.completed) return 'completed';
    if (pillarId === recommendation.pillar) return 'recommended';
    return 'neutral';
  };

  const getScore = (pillarId) => {
    if (userProfile?.pillar_scores?.[pillarId]) {
      return userProfile.pillar_scores[pillarId];
    }
    const assessment = assessments.find(a => a.pillar === pillarId && a.completed);
    return assessment?.overall_score;
  };

  const handleNodeClick = (pillarId) => {
    setSelectedPillar(pillarId);
    setDetailModalOpen(true);
    trackPillarSelected(pillarId, 'map_node');
    trackModalOpened(pillarId);
    trackGraphInteraction('global_map', 'pillar_click', { pillar: pillarId, score: getScore(pillarId) });
  };

  const handleCloseModal = () => {
    if (selectedPillar) {
      trackModalClosed(selectedPillar);
    }
    setModalOpen(false);
    setDetailModalOpen(false);
    setSelectedPillar(null);
  };

  const handleStartAssessment = () => {
    trackNavigationClick('GlobalMap', 'Pillar');
    navigate(createPageUrl(`Pillar?pillar=${selectedPillar}`));
  };

  const handleViewInfo = () => {
    trackNavigationClick('GlobalMap', 'PilarInfo');
    navigate(createPageUrl('PilarInfo'));
  };

  const isCompleted = (pillarId) => {
    return assessments.some(a => a.pillar === pillarId && a.completed);
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[150px]" />
      </div>
      
      {/* Sparkles Background Layer */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <SparklesCore
          id="global-map-sparkles"
          background="transparent"
          minSize={0.4}
          maxSize={1}
          particleDensity={70}
          className="w-full h-full"
          particleColor="#6C4BF4"
          speed={0.5}
        />
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <Link to={createPageUrl('Home')} onClick={() => trackNavigationClick('GlobalMap', 'Home')}>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link to={createPageUrl('TheoryMadeSimple')} onClick={() => trackNavigationClick('GlobalMap', 'TheoryMadeSimple')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <Info className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Theory</span>
            </Button>
          </Link>
          <Link to={createPageUrl('Profile')} onClick={() => trackNavigationClick('GlobalMap', 'Profile')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <BarChart3 className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Profile</span>
            </Button>
          </Link>
          <Link to={createPageUrl('KnowledgeGraph')} onClick={() => trackNavigationClick('GlobalMap', 'KnowledgeGraph')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <Compass className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Graph</span>
            </Button>
          </Link>
          <Link to={createPageUrl('Teams')} onClick={() => trackNavigationClick('GlobalMap', 'Teams')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <Users className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Teams</span>
            </Button>
          </Link>
          <Link to={createPageUrl('Leaderboard')} onClick={() => trackNavigationClick('GlobalMap', 'Leaderboard')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <Trophy className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Rank</span>
            </Button>
          </Link>
          <Link to={createPageUrl('StudyGroups')} onClick={() => trackNavigationClick('GlobalMap', 'StudyGroups')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
              <Users className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Groups</span>
            </Button>
          </Link>
          <ProfileAvatar user={currentUser} size="sm" />
          </div>
          </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 mb-4 md:mb-8 px-4"
      >
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Compilar Collaboration</h1>
        <p className="text-zinc-400 text-sm md:text-base">Explore pillars or tap your profile in the center</p>
      </motion.div>

      {/* Recommendation Badge */}
      {recommendation.pillar && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative z-10 flex justify-center mb-4 px-4"
        >
          <button
            onClick={() => handleNodeClick(recommendation.pillar)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-amber-200">
              Recommended: <span className="font-medium capitalize">{recommendation.pillar}</span>
            </span>
          </button>
        </motion.div>
      )}

      {/* Leadership Metrics Summary */}
      {leadershipMetrics.coverage > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative z-10 flex justify-center gap-4 mb-4 px-4"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-zinc-300">{leadershipMetrics.overallScore}% Overall</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-xs text-zinc-300">{leadershipMetrics.balance}% Balance</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-xs text-zinc-300">{leadershipMetrics.coverage}% Coverage</span>
          </div>
        </motion.div>
      )}

      {/* Map Container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto aspect-square px-4">
        {/* Interactive radial strength visualization - only completed pillars */}
        <Link to={createPageUrl('UserPilarProfile')} onClick={() => trackNavigationClick('GlobalMap', 'UserPilarProfile')}>
          <svg className="absolute inset-0 w-full h-full cursor-pointer hover:scale-105 transition-transform" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.4)" />
                <stop offset="100%" stopColor="rgba(236, 72, 153, 0.4)" />
              </linearGradient>
              <linearGradient id="strengthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(139, 92, 246, 0.6)" />
                <stop offset="100%" stopColor="rgba(236, 72, 153, 0.6)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Animated strength polygon - ALL pillars */}
            {(() => {
              const basePositions = [
                { x: 50, y: 5, pillar: 'purpose' },
                { x: 97, y: 36, pillar: 'interpersonal' },
                { x: 80, y: 95, pillar: 'action' },
                { x: 20, y: 95, pillar: 'learning' },
                { x: 3, y: 36, pillar: 'resilience' },
              ];
              const center = { x: 50, y: 50 };

              const points = basePositions.map(p => {
                const score = getScore(p.pillar) || 0;
                const stretchFactor = score > 0 ? 0.3 + (score / 100) * 0.7 : 0.15;
                const dx = p.x - center.x;
                const dy = p.y - center.y;
                const x = center.x + dx * stretchFactor;
                const y = center.y + dy * stretchFactor;
                return `${x},${y}`;
              }).join(' ');

              return (
                <motion.polygon
                  points={points}
                  fill="url(#strengthGradient)"
                  fillOpacity="0.2"
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  filter="url(#glow)"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ fillOpacity: 0.35, strokeWidth: 3 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              );
            })()}

            {/* Pentagon outer edge - fixed reference */}
            <polygon
              points="50,5 97,36 80,95 20,95 3,36"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
              strokeDasharray="2 2"
            />

            {/* Connections from center - ALL pillars with pulse animation */}
            {[
              { point: '50,5', pillar: 'purpose' },
              { point: '97,36', pillar: 'interpersonal' },
              { point: '80,95', pillar: 'action' },
              { point: '20,95', pillar: 'learning' },
              { point: '3,36', pillar: 'resilience' },
            ].map(({ point, pillar }, i) => {
              const score = getScore(pillar) || 0;
              const comp = competencyProfile[pillar];
              const trend = comp?.trend || 'stable';
              const opacity = score > 0 ? 0.3 + (score / 100) * 0.5 : 0.15;
              const strokeWidth = score > 70 ? 2 : score > 40 ? 1.5 : 1;
              const strokeColor = score === 0 ? 'rgba(100, 100, 100,' : trend === 'improving' ? 'rgba(16, 185, 129,' : trend === 'declining' ? 'rgba(239, 68, 68,' : 'rgba(139, 92, 246,';

              return (
                <motion.line
                  key={i}
                  x1="50"
                  y1="50"
                  x2={point.split(',')[0]}
                  y2={point.split(',')[1]}
                  stroke={`${strokeColor}${opacity})`}
                  strokeWidth={strokeWidth}
                  initial={{ pathLength: 0 }}
                  animate={{ 
                    pathLength: 1,
                    opacity: score > 0 ? [opacity, opacity * 1.3, opacity] : opacity
                  }}
                  transition={{ 
                    pathLength: { duration: 0.8, delay: 0.3 + i * 0.1 },
                    opacity: score > 0 ? { duration: 2, repeat: Infinity, delay: i * 0.2 } : {}
                  }}
                />
              );
            })}

            {/* Score indicators at pillar positions for ALL pillars */}
            {[
              { x: 50, y: 12, pillar: 'purpose' },
              { x: 88, y: 36, pillar: 'interpersonal' },
              { x: 75, y: 85, pillar: 'action' },
              { x: 25, y: 85, pillar: 'learning' },
              { x: 12, y: 36, pillar: 'resilience' },
            ].map(({ x, y, pillar }, i) => {
              const score = getScore(pillar);

              return (
                <motion.g key={pillar} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 + i * 0.1 }}>
                  <circle cx={x} cy={y} r="4" fill={score ? "rgba(139, 92, 246, 0.3)" : "rgba(100, 100, 100, 0.2)"} />
                  <text x={x} y={y + 1} textAnchor="middle" fontSize="3" fill={score ? "white" : "#666"} fontWeight="bold">
                    {score || '—'}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </Link>

        {/* Center Profile Avatar - Links to comprehensive profile */}
        <Link to={createPageUrl('UserPilarProfile')}>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-violet-500/30 to-pink-500/30 border-2 border-white/30 flex items-center justify-center shadow-xl shadow-violet-500/30 cursor-pointer hover:border-white/50 transition-all group"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-violet-600 to-pink-600 flex flex-col items-center justify-center">
              <span className="text-white font-bold text-xl md:text-2xl">{userInitials}</span>
              <span className="text-white/70 text-[10px] md:text-xs mt-0.5 group-hover:text-white transition-colors">View Profile</span>
            </div>
          </motion.div>
        </Link>

        {/* Map Nodes */}
        {pillars.map((pillar, index) => (
          <motion.div
            key={pillar.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.1, type: 'spring' }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: pillar.position.x, top: pillar.position.y }}
          >
            <Link to={createPageUrl(`Pillar?pillar=${pillar.id}`)}>
                <MapNode
                  pillar={pillar.id}
                  variant={getNodeVariant(pillar.id)}
                  score={getScore(pillar.id)}
                  onClick={() => handleNodeClick(pillar.id)}
                  size="lg"
                />
              </Link>
          </motion.div>
        ))}
      </div>

      {/* Pillar Detail Modal - Ben Heslop's PILAR Framework */}
      <PillarDetailModal
        pillar={selectedPillar}
        isOpen={detailModalOpen}
        onClose={handleCloseModal}
        onStartAssessment={handleStartAssessment}
        currentScore={selectedPillar ? getScore(selectedPillar) : undefined}
        userProfile={userProfile}
      />

      {/* Original Pillar Modal (kept for compatibility) */}
      <PillarModal
        pillar={selectedPillar}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onStartAssessment={handleStartAssessment}
        onViewInfo={handleViewInfo}
        currentScore={selectedPillar ? getScore(selectedPillar) : undefined}
        isRecommended={selectedPillar === recommendation.pillar}
        isCompleted={selectedPillar ? isCompleted(selectedPillar) : false}
        recommendationReason={selectedPillar === recommendation.pillar ? recommendation.reason : null}
      />

      {/* PILAR ChatBot */}
      <PilarChatBot userProfile={userProfile} />

      {/* Gamification Widget */}
      <GamificationFloatingWidget 
        gamification={gamification}
        userProfile={userProfile}
      />

      {/* Bottom Left Action Buttons */}
      <div className="fixed bottom-6 left-4 z-40 flex flex-col gap-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => {
              setShowSuggestions(false);
              setShowAnalyze(!showAnalyze);
              if (!showAnalyze) trackInsightViewed('analyze_panel');
            }}
            className={`${showAnalyze ? 'bg-violet-500 hover:bg-violet-600' : 'bg-white/10 hover:bg-white/20'} text-white rounded-xl px-4 py-2 shadow-lg`}
          >
            <Brain className="w-4 h-4 mr-2" />
            Analyze
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={() => {
              setShowAnalyze(false);
              setShowSuggestions(!showSuggestions);
              if (!showSuggestions) trackInsightViewed('suggestions_panel');
            }}
            className={`${showSuggestions ? 'bg-amber-500 hover:bg-amber-600' : 'bg-white/10 hover:bg-white/20'} text-white rounded-xl px-4 py-2 shadow-lg`}
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Suggestions
          </Button>
        </motion.div>
      </div>

      {/* Analyze Panel */}
      <AnalyzePanel
        isOpen={showAnalyze}
        onClose={() => setShowAnalyze(false)}
        userProfile={userProfile}
        gamification={gamification}
        assessments={assessments}
        groups={groups}
        currentUser={currentUser}
      />

      {/* Suggestions Panel */}
      <SuggestionsPanel
        isOpen={showSuggestions}
        onClose={() => setShowSuggestions(false)}
        userProfile={userProfile}
      />

      {/* Learning Recommendations Floating Panel */}
      {learningRecommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="fixed bottom-6 right-4 z-40 w-72 bg-black/80 backdrop-blur-sm rounded-xl border border-white/10 p-4 hidden lg:block"
        >
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            Personalized Recommendations
          </h4>
          <div className="space-y-2">
            {learningRecommendations.slice(0, 2).map((rec, i) => (
              <Link 
                key={i} 
                to={createPageUrl(`Pillar?pillar=${rec.pillar}`)}
                className="block p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${rec.priority === 'high' ? 'bg-amber-400' : 'bg-zinc-400'}`} />
                  <span className="text-xs text-white font-medium">{rec.title}</span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2">{rec.description}</p>
              </Link>
            ))}
          </div>
          <Link to={createPageUrl('LearningPathways')}>
            <Button variant="ghost" size="sm" className="w-full mt-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10">
              View All Pathways
            </Button>
          </Link>
        </motion.div>
      )}
    </div>
  );
}