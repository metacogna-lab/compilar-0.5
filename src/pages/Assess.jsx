import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Mail, Loader2, Download, Sparkles, Shuffle, ArrowRight, RotateCcw, ChevronLeft, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { forceConnectionsData } from '@/components/pilar/forceConnectionsData';
import { 
  getPillarData, 
  getPillarDrawOptions, 
  formatRevealedCardData,
  getPillarForces,
  getForceConnections
} from '@/components/assess/assessDataAdapter';
import { initializeAssessmentSession, calculateSessionQuality } from '@/components/assess/assessmentSchema';
import PersistentAICoach from '@/components/assess/PersistentAICoach';
import PillarModeVisualizer from '@/components/assess/PillarModeVisualizer';
import ForceInfluenceGraph from '@/components/assess/ForceInfluenceGraph';
import PillarQuiz from '@/components/assess/PillarQuiz';
import PillarDeck from '@/components/assess/PillarDeck';
import RevealedPillarCard from '@/components/assess/RevealedPillarCard';
import AICoachingFeedback from '@/components/assess/AICoachingFeedback';
import ProfileSetupModal from '@/components/assess/ProfileSetupModal';
import GoalEnrichmentModal from '@/components/assess/GoalEnrichmentModal';
import PilarDiagnosticHUD from '@/components/assess/PilarDiagnosticHUD';
import CollapsibleMetricsSidebar from '@/components/assess/CollapsibleMetricsSidebar';
import AssessmentBreadcrumbs from '@/components/assess/AssessmentBreadcrumbs';
import ForceDetailModal from '@/components/pilar/ForceDetailModal';
import RetractableChatbot from '@/components/assess/RetractableChatbot';
import { toast } from 'sonner';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { subtle } from '@/components/config/motion';
import { useAssessmentStore, useLoadingState, useAssessmentActions } from '@/components/stores/useAssessmentStore';
import ThinkingLoader from '@/components/assess/ThinkingLoader';
import AIGuidancePanel from '@/components/assess/AIGuidancePanel';
import InteractiveAICoach from '@/components/assess/InteractiveAICoach';
import GoalDisplayWithChips from '@/components/assess/GoalDisplayWithChips';

export default function Assess() {
  const pipelineStage = useAssessmentStore((state) => state.pipelineStage);
  const selectedPillarId = useAssessmentStore((state) => state.selectedPillarId);
  const selectedMode = useAssessmentStore((state) => state.selectedMode);
  const revealedCard = useAssessmentStore((state) => state.revealedCard);
  const conversationHistory = useAssessmentStore((state) => state.conversationHistory);
  const assessmentResults = useAssessmentStore((state) => state.assessmentResults);
  const aiCoaching = useAssessmentStore((state) => state.aiCoaching);
  const sessionStartTime = useAssessmentStore((state) => state.sessionStartTime);
  const isGeneratingCoaching = useAssessmentStore((state) => state.isGeneratingCoaching);
  
  const { isLoading, loadingMessage, thinkingSteps } = useLoadingState();
  const actions = useAssessmentActions();
  
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showForceDetailModal, setShowForceDetailModal] = useState(false);
  const [selectedForceName, setSelectedForceName] = useState(null);
  const [pendingProfileData, setPendingProfileData] = useState(null);
  const [showInteractiveCoach, setShowInteractiveCoach] = useState(false);

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile', user?.email],
    queryFn: () => base44.entities.UserProfile.filter({ created_by: user.email }).then(res => res[0]),
    enabled: !!user
  });

  const { data: assessmentSessions } = useQuery({
    queryKey: ['assessmentSessions', user?.email],
    queryFn: () => base44.entities.AssessmentSession.filter(
      { created_by: user.email },
      '-session_quality_score',
      50
    ),
    enabled: !!user
  });

  const { data: userProgressData } = useQuery({
    queryKey: ['userProgress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user.email }),
    enabled: !!user
  });

  useEffect(() => {
    trackPageView('Assess');
  }, []);

  // Initialize session data from localStorage or create new
  const [sessionData, setSessionData] = useState(() => {
    const saved = localStorage.getItem('assess_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('assess_session');
        return initializeAssessmentSession(user);
      }
    }
    return initializeAssessmentSession(user);
  });

  // Save session data to localStorage
  useEffect(() => {
    if (sessionData) {
      localStorage.setItem('assess_session', JSON.stringify(sessionData));
    }
  }, [sessionData]);

  // Initialize stage based on profile completion
  useEffect(() => {
    if (!userProfile || isLoading) return;
    
    // First-time users: always start at profile
    if (!userProfile.onboarding_completed && pipelineStage !== 'profile') {
      actions.setPipelineStage('profile');
      return;
    }
    
    // Returning users: show welcome and stay at current stage (no auto-progression)
    if (userProfile.onboarding_completed && userProfile.assessment_engagements > 0 && pipelineStage === 'profile') {
      const engagementCount = userProfile.assessment_engagements;
      toast.success(`Welcome back! You've completed ${engagementCount} assessment${engagementCount > 1 ? 's' : ''}!`, {
        duration: 3000
      });
    }
  }, [userProfile, pipelineStage]);

  const createSessionMutation = useMutation({
    mutationFn: (sessionData) => base44.entities.AssessmentSession.create(sessionData),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['assessmentSessions'] })
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profileData) =>
      userProfile?.id
        ? base44.entities.UserProfile.update(userProfile.id, profileData)
        : base44.entities.UserProfile.create(profileData),
    onSuccess: (data) => {
      queryClient.setQueryData(['userProfile', user?.email], data);
    }
  });

  const pillarOptions = useMemo(() => getPillarDrawOptions(), []);
  const egalitarianPillarOptions = pillarOptions.egalitarian;
  const hierarchicalPillarOptions = pillarOptions.hierarchical;

  const handleDrawCard = () => {
    const allPillarOptions = pillarOptions.all;
    const randomIndex = Math.floor(Math.random() * allPillarOptions.length);
    const selectedCard = allPillarOptions[randomIndex];
    
    const cardData = formatRevealedCardData(selectedCard.id, selectedCard.mode);
    
    if (!cardData) {
      toast.error('Failed to load pillar data');
      return;
    }

    actions.setRevealedCard(cardData);
  };

  const handleStartAssessment = () => {
    if (!user) {
      toast.error('Please log in to take an assessment');
      return;
    }

    actions.startAssessment(revealedCard.id, revealedCard.mode, revealedCard);
    actions.setPipelineStage('card_quiz');
  };

  const handleCompleteAssessment = async ({ responses, score }) => {
    try {
      if (!user) {
        toast.error('Please log in to save your assessment');
        return;
      }

      const timeSpent = Math.floor((Date.now() - sessionStartTime) / 1000);
      const selectedPillarData = getPillarData(selectedPillarId, selectedMode);
      const selectedPillarObj = {
        fullName: `${selectedMode.charAt(0).toUpperCase() + selectedMode.slice(1)}: ${selectedPillarData?.title || selectedPillarId}`
      };

      const completionPercentage = responses.length > 0 ? 100 : 0;
      const engagementScore = Math.min(100, (conversationHistory.length * 5) + (timeSpent / 60) * 2);
      const sessionQualityScoreCalc = (completionPercentage * 0.4) + (engagementScore * 0.3) + (score * 0.3);

      const newSessionData = {
        pillar: selectedPillarObj?.fullName,
        mode: selectedMode,
        session_date: new Date().toISOString(),
        total_score: score,
        completion_percentage: completionPercentage,
        session_quality_score: Math.round(sessionQualityScoreCalc * 100) / 100,
        responses,
        conversation_history: conversationHistory,
        status: 'completed',
        engagement_metrics: {
          time_spent_seconds: timeSpent,
          chat_turns: conversationHistory.length,
          questions_attempted: responses.length
        }
      };

      // Update session data schema
      setSessionData(prev => ({
        ...prev,
        card_assessment: {
          pillar_id: selectedPillarId,
          pillar_name: selectedPillarData?.title,
          mode: selectedMode,
          score,
          responses,
          conversation_history: conversationHistory,
          completed_at: new Date().toISOString(),
          time_spent_seconds: timeSpent
        },
        current_stage: 'results',
        completed_at: new Date().toISOString(),
        session_quality_score: Math.round(sessionQualityScoreCalc * 100) / 100
      }));

      await createSessionMutation.mutateAsync(newSessionData);

      const allSessions = [...(assessmentSessions || []), newSessionData];
      const pillarScores = {};
      const pillarCounts = {};

      allSessions.forEach(session => {
        if (session.pillar && session.total_score != null) {
          if (!pillarScores[session.pillar]) {
            pillarScores[session.pillar] = 0;
            pillarCounts[session.pillar] = 0;
          }
          pillarScores[session.pillar] += session.total_score;
          pillarCounts[session.pillar]++;
        }
      });

      const pillarScoresSummary = {};
      Object.keys(pillarScores).forEach(pillar => {
        pillarScoresSummary[pillar] = pillarScores[pillar] / pillarCounts[pillar];
      });

      const sortedPillars = Object.entries(pillarScoresSummary).sort((a, b) => b[1] - a[1]);

      await updateProfileMutation.mutateAsync({
        assessment_engagements: (userProfile?.assessment_engagements || 0) + 1,
        total_assessments_completed: allSessions.length,
        pillar_scores_summary: pillarScoresSummary,
        best_pillar: sortedPillars[0]?.[0],
        worst_pillar: sortedPillars[sortedPillars.length - 1]?.[0],
        last_assessment_date: new Date().toISOString()
      });

      actions.setAssessmentResults({ score, responses, sessionData });
      actions.setPipelineStage('results');
      toast.success(`Assessment completed! Score: ${Math.round(score)}%`);

      actions.setGeneratingCoaching(true);
      try {
        const coachingResponse = await base44.functions.invoke('generateAICoaching', {
          sessionData,
          userProfile: {
            total_assessments_completed: allSessions.length,
            best_pillar: sortedPillars[0]?.[0],
            worst_pillar: sortedPillars[sortedPillars.length - 1]?.[0],
            pillar_scores_summary: pillarScoresSummary
          }
        });

        if (coachingResponse.data?.success && coachingResponse.data?.coaching) {
          actions.setAICoaching(coachingResponse.data.coaching);
        }
      } catch (error) {
        console.error('Failed to generate coaching:', error);
      } finally {
        actions.setGeneratingCoaching(false);
      }
    } catch (error) {
      console.error('Error completing assessment:', error);
      toast.error('Failed to save assessment');
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const extractionResponse = await base44.functions.invoke('extractPillarsAndForces', {
        conversationHistory
      });

      const response = await base44.functions.invoke('generateLearningPDF', {
        conversationHistory,
        pillar: selectedPillarId,
        mode: selectedMode,
        extractedElements: extractionResponse.data?.extracted || []
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PILAR_Assessment_${selectedPillarId}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const currentPillarForces = useMemo(() => {
    if (!selectedPillarId || !selectedMode) return [];

    const pillarData = getPillarData(selectedPillarId, selectedMode);
    if (!pillarData) return [];

    return getPillarForces(pillarData.title, selectedMode);
  }, [selectedPillarId, selectedMode]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative py-8 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-700/10 rounded-full blur-[150px]" />
      </div>

      {/* Profile Modal - Stage 1 */}
      {pipelineStage === 'profile' && (
        <ProfileSetupModal
          user={user}
          existingProfile={userProfile}
          onComplete={async (profileData) => {
            try {
              // Validate required fields
              if (!profileData.full_name || !profileData.email || !profileData.position) {
                toast.error('Please complete all required fields');
                return;
              }

              await updateProfileMutation.mutateAsync({
                ...profileData,
                onboarding_completed: true
              });

              // Update session data
              setSessionData(prev => ({
                ...prev,
                profile: profileData,
                current_stage: 'goals'
              }));

              // Skip goal enrichment modal, go straight to path selection
              setPendingProfileData(profileData);
              actions.setPipelineStage('diagnostic_choice');
              toast.success('Profile saved! Choose your assessment path.');
            } catch (error) {
              console.error('Profile save error:', error);
              toast.error('Failed to save profile. Please try again.');
            }
          }}
          onSkip={() => {
            setSessionData(prev => ({
              ...prev,
              current_stage: 'choose_path'
            }));
            toast.info('Profile skipped. You can complete it later from the breadcrumbs.');
            actions.setPipelineStage('diagnostic_choice');
          }}
        />
      )}



      <ThinkingLoader
        isVisible={isLoading}
        message={loadingMessage}
        thinkingSteps={thinkingSteps}
      />

      {userProfile && <CollapsibleMetricsSidebar userProfile={userProfile} />}

      {/* Persistent AI Coach - Available at all stages */}
      <PersistentAICoach
        stage={pipelineStage}
        userProfile={userProfile}
        sessionData={sessionData}
        currentPillar={selectedPillarId}
        currentMode={selectedMode}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Breadcrumbs Navigation - Always show */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto mb-8"
        >
          <div className="flex items-center justify-center gap-2 text-xs sm:text-sm flex-wrap">
            {/* Step 1: Profile */}
            <button
              onClick={() => actions.setPipelineStage('profile')}
              className={cn(
                "px-3 py-2 rounded-lg transition-all",
                (pipelineStage === 'profile')
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              1. Profile
            </button>
            
            <ArrowRight className="w-3 h-3 text-slate-600" />
            
            {/* Step 2: Choose Path */}
            <button
              onClick={() => {
                actions.resetAssessment();
                actions.setPipelineStage('diagnostic_choice');
              }}
              className={cn(
                "px-3 py-2 rounded-lg transition-all",
                pipelineStage === 'diagnostic_choice'
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "text-slate-400 hover:text-white"
              )}
            >
              2. Choose Path
            </button>
            
            <ArrowRight className="w-3 h-3 text-slate-600" />
            
            {/* Step 3: Assessment */}
            <button
              onClick={() => {
                if (pipelineStage === 'card_quiz' || pipelineStage === 'results') {
                  actions.setPipelineStage('card_draw');
                }
              }}
              disabled={pipelineStage === 'diagnostic_choice' || pipelineStage === 'diagnostic' || pipelineStage === 'profile'}
              className={cn(
                "px-3 py-2 rounded-lg transition-all",
                (pipelineStage === 'card_draw' || pipelineStage === 'card_quiz' || pipelineStage === 'diagnostic')
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : pipelineStage === 'results'
                  ? "text-slate-400 hover:text-white cursor-pointer"
                  : "text-slate-600 cursor-not-allowed"
              )}
            >
              3. Assessment
            </button>
            
            <ArrowRight className="w-3 h-3 text-slate-600" />
            
            {/* Step 4: Results */}
            <div
              className={cn(
                "px-3 py-2 rounded-lg",
                pipelineStage === 'results'
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : "text-slate-600"
              )}
            >
              4. Results
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {pipelineStage === 'diagnostic_choice' && (
            <motion.div
              key="diagnostic-choice"
              variants={subtle.stagger.container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              <motion.div variants={subtle.stagger.item} className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-6">
                  <span className="text-slate-400 text-sm">Step 2: Choose Your Path</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4">
                  {userProfile?.full_name ? `Welcome Back, ${userProfile.full_name.split(' ')[0]}` : 'Assessment Journey'}
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  {userProfile?.assessment_engagements > 0 
                    ? `You've completed ${userProfile.assessment_engagements} assessment${userProfile.assessment_engagements > 1 ? 's' : ''}. Choose your next exploration.`
                    : 'Begin with a comprehensive theory and forces report or dive into focused training'}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <motion.button
                  variants={subtle.stagger.item}
                  whileHover={{ y: -6, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}
                  onClick={() => {
                    setSessionData(prev => ({
                      ...prev,
                      path: {
                        path_type: 'diagnostic',
                        selected_at: new Date().toISOString()
                      },
                      current_stage: 'assessment'
                    }));
                    actions.setPipelineStage('diagnostic');
                    toast.success('Starting comprehensive PILAR diagnostic...');
                  }}
                  className="group relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Sparkles className="w-12 h-12 text-cyan-400 mb-4 relative z-10" />
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">PILAR Theory and Forces Report</h3>
                  <p className="text-slate-400 mb-4 relative z-10">
                    Interactive conversation exploring all five PILAR dimensions and psychological forces with real-time radar visualization
                  </p>
                  <div className="flex items-center text-cyan-400 text-sm font-medium relative z-10">
                    <span>Generate Complete Report</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>

                <motion.button
                  variants={subtle.stagger.item}
                  whileHover={{ y: -6, boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}
                  onClick={() => {
                    setSessionData(prev => ({
                      ...prev,
                      path: {
                        path_type: 'card_draw',
                        selected_at: new Date().toISOString()
                      },
                      current_stage: 'assessment'
                    }));
                    actions.setPipelineStage('card_draw');
                    toast.success('Starting focused training exercise...');
                  }}
                  className="group relative p-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl text-left overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Shuffle className="w-12 h-12 text-violet-400 mb-4 relative z-10" />
                  <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Draw a Card</h3>
                  <p className="text-slate-400 mb-4 relative z-10">
                    Training exercise and profile builder: random pillar selection for focused practice and personalized growth tracking
                  </p>
                  <div className="flex items-center text-violet-400 text-sm font-medium relative z-10">
                    <span>Start Training Exercise</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.button>
              </div>

              {userProfile && (
                <motion.div variants={subtle.stagger.item} className="space-y-4">
                  <GoalDisplayWithChips userProfile={userProfile} />
                  <AIGuidancePanel
                    stage="diagnostic_choice"
                    userProfile={userProfile}
                    userProgress={userProgressData}
                  />
                </motion.div>
              )}
            </motion.div>
          )}

          {pipelineStage === 'diagnostic' && (
            <motion.div
              key="diagnostic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <PilarDiagnosticHUD
                onComplete={() => actions.setPipelineStage('card_draw')}
                onBack={() => actions.setPipelineStage('diagnostic_choice')}
              />
            </motion.div>
          )}

          {pipelineStage === 'card_draw' && !revealedCard && (
            <motion.div
              key="card-draw"
              variants={subtle.stagger.container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto"
            >
              <motion.div variants={subtle.stagger.item} className="text-center mb-12">
                <div className="inline-block px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full mb-6">
                  <span className="text-slate-400 text-sm">Step 3: Draw Your Pillar</span>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4">Reveal Your Path</h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                  Let chance guide your learning journey through the PILAR framework
                </p>
              </motion.div>

              {userProfile && (
                <motion.div variants={subtle.stagger.item} className="mb-8">
                  <AIGuidancePanel
                    stage="card_draw"
                    userProfile={userProfile}
                    userProgress={userProgressData}
                  />
                </motion.div>
              )}

              <motion.div variants={subtle.stagger.item} className="flex flex-col items-center gap-8">
                <PillarDeck onSelectCard={handleDrawCard} />

                <Button
                  variant="outline"
                  onClick={() => actions.setPipelineStage('diagnostic_choice')}
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Path Selection
                </Button>
              </motion.div>
            </motion.div>
          )}

          {pipelineStage === 'card_draw' && revealedCard && (
            <motion.div
              key="revealed-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-3xl mx-auto"
            >
              <RevealedPillarCard
                pillarData={revealedCard}
                mode={revealedCard.mode}
                onClose={() => actions.setRevealedCard(null)}
                onStartAssessment={handleStartAssessment}
              />
            </motion.div>
          )}

          {pipelineStage === 'card_quiz' && selectedPillarId && selectedMode && (
            <motion.div
              key="card-quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between mb-8">
                <Button
                  variant="outline"
                  onClick={() => {
                    actions.setRevealedCard(null);
                    actions.setPipelineStage('card_draw');
                  }}
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Change Pillar
                </Button>
                <div className="inline-block px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-full">
                  <span className="text-slate-400 text-sm">
                    Assessing: {getPillarData(selectedPillarId, selectedMode)?.title}
                  </span>
                </div>
                <div className="w-32"></div>
              </div>

              <div className="border border-slate-700/50 rounded-2xl p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm">
                <PillarModeVisualizer
                  pillarData={{
                    egalitarian: pillarsInfo.egalitarian,
                    hierarchical: pillarsInfo.hierarchical,
                    currentPillar: selectedPillarId
                  }}
                  currentMode={selectedMode}
                  onModeToggle={(mode) => actions.startAssessment(selectedPillarId, mode, revealedCard)}
                />
              </div>

              {userProfile && (
                <AIGuidancePanel
                  stage="card_quiz"
                  userProfile={userProfile}
                  userProgress={userProgressData}
                  currentPillar={getPillarData(selectedPillarId, selectedMode)?.title}
                  currentMode={selectedMode}
                  assessmentResults={null}
                />
              )}

              <div className="border border-emerald-500/20 rounded-2xl p-6 bg-gradient-to-br from-emerald-500/5 to-transparent backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4">Knowledge Assessment</h2>
                <PillarQuiz
                  pillar={selectedPillarId}
                  mode={selectedMode}
                  userProfile={userProfile}
                  onComplete={handleCompleteAssessment}
                />
              </div>

              <div className="border border-violet-500/20 rounded-2xl p-6 bg-gradient-to-br from-violet-500/5 to-transparent backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4">Force Network</h2>
                <ForceInfluenceGraph
                  pillar={selectedPillarId}
                  mode={selectedMode}
                  forces={currentPillarForces}
                  onForceClick={(forceName) => {
                    setSelectedForceName(forceName);
                    setShowForceDetailModal(true);
                  }}
                />
              </div>

              <RetractableChatbot
                pillar={selectedPillarId}
                mode={selectedMode}
                conversationHistory={conversationHistory}
                onUpdateHistory={(history) => actions.updateConversationHistory(history)}
                onForceClick={(forceName) => {
                  setSelectedForceName(forceName);
                  setShowForceDetailModal(true);
                }}
              />
            </motion.div>
          )}

          {pipelineStage === 'results' && assessmentResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  onClick={() => actions.setPipelineStage('card_quiz')}
                  className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Review Questions
                </Button>
              </div>

              <div className="text-center border border-green-500/20 rounded-2xl p-8 bg-gradient-to-br from-green-500/10 to-transparent backdrop-blur-sm">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-500/30 mb-6 border border-green-500/30">
                  <Award className="w-12 h-12 text-green-400" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-3">Assessment Complete!</h2>
                <p className="text-slate-400 text-lg">
                  Your responses have been saved. Here's your personalized coaching:
                </p>
              </div>

              <div className="border border-violet-500/20 rounded-2xl p-6 bg-gradient-to-br from-violet-500/5 to-transparent backdrop-blur-sm">
                <AICoachingFeedback
                  coaching={aiCoaching}
                  onContinue={() => {}}
                />
                
                <div className="mt-4 flex justify-center">
                  <Button
                    onClick={() => setShowInteractiveCoach(true)}
                    className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Ask AI Coach Questions
                  </Button>
                </div>
              </div>

              {userProfile && (
                <AIGuidancePanel
                  stage="results"
                  userProfile={userProfile}
                  userProgress={userProgressData}
                  currentPillar={getPillarData(selectedPillarId, selectedMode)?.title}
                  currentMode={selectedMode}
                  assessmentResults={assessmentResults}
                />
              )}

              <div className="text-center border border-slate-700 rounded-2xl p-6 bg-gradient-to-br from-slate-800/50 to-transparent backdrop-blur-sm">
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button
                    onClick={handleDownloadPDF}
                    disabled={isGeneratingPDF}
                    className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => {
                      actions.resetAssessment();
                      actions.setPipelineStage('diagnostic_choice');
                    }}
                    className="bg-slate-700 hover:bg-slate-600"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Assessment
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedMode && (
        <ForceDetailModal
          isOpen={showForceDetailModal}
          onClose={() => {
            setShowForceDetailModal(false);
            setSelectedForceName(null);
          }}
          forceName={selectedForceName}
          mode={selectedMode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'}
        />
      )}
    </div>
  );
}