import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Compass, Heart, BookOpen, Zap, Shield, 
  ChevronRight, PlayCircle, RotateCcw, CheckCircle,
  Clock, MessageSquare, Sparkles, ArrowRight, Swords, Scroll
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import PilarCard from '@/components/pilar/PilarCard';
import { 
  analyzeSentiment, 
  calculateResponseConfidence, 
  detectEmotionalIndicators,
  scoreAnswer,
  determineNextPillar,
  generateActivityRecommendations
} from '@/components/pilar/NavigationHeuristics';
import { 
  trackPageView, 
  trackAssessmentStarted, 
  trackAssessmentCompleted,
  trackQuestionAnswered,
  getSessionId
} from '@/components/pilar/ActionTracker';
import { awardPoints, checkBadgeEligibility } from '@/components/pilar/GamificationService';
import { cn } from '@/lib/utils';
import AdventureNarrator, { getPillarLore, getScoreNarrative } from '@/components/pilar/AdventureNarrator';
import QuestProgress from '@/components/pilar/QuestProgress';
import RealmTransition from '@/components/pilar/RealmTransition';

const pillarData = {
  purpose: {
    title: 'Purpose',
    icon: Compass,
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    cards: [
      { id: 'P1', label: 'Sense of Direction', description: 'Understanding your path and where you want to go' },
      { id: 'P2', label: 'Values Alignment', description: 'Living in accordance with your core beliefs' },
      { id: 'P3', label: 'Meaning Extraction', description: 'Finding significance in daily experiences' },
    ],
    questions: [
      { id: 'P_Q1', text: 'What gives you long-term energy and motivation?' },
      { id: 'P_Q2', text: 'How do you choose what matters most to you?' },
      { id: 'P_Q3', text: 'What would you pursue if success was guaranteed?' },
    ],
  },
  interpersonal: {
    title: 'Interpersonal',
    icon: Heart,
    color: 'pink',
    gradient: 'from-pink-500 to-pink-600',
    cards: [
      { id: 'I1', label: 'Empathy', description: 'Understanding and sharing the feelings of others' },
      { id: 'I2', label: 'Communication', description: 'Expressing ideas clearly and listening actively' },
      { id: 'I3', label: 'Conflict Style', description: 'How you approach and resolve disagreements' },
    ],
    questions: [
      { id: 'I_Q1', text: 'How do you usually handle disagreement with others?' },
      { id: 'I_Q2', text: 'What makes collaboration easy or difficult for you?' },
      { id: 'I_Q3', text: 'How do you build trust in relationships?' },
    ],
  },
  learning: {
    title: 'Learning',
    icon: BookOpen,
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    cards: [
      { id: 'L1', label: 'Curiosity', description: 'Natural desire to explore new things' },
      { id: 'L2', label: 'Skill Acquisition', description: 'Ability to develop new competencies' },
      { id: 'L3', label: 'Reflection', description: 'Learning from experiences' },
    ],
    questions: [
      { id: 'L_Q1', text: 'How do you learn best - through doing, reading, or discussion?' },
      { id: 'L_Q2', text: 'What kinds of challenges do you enjoy taking on?' },
      { id: 'L_Q3', text: 'How do you integrate new knowledge into your life?' },
    ],
  },
  action: {
    title: 'Action',
    icon: Zap,
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    cards: [
      { id: 'A1', label: 'Discipline', description: 'Consistent effort toward goals' },
      { id: 'A2', label: 'Momentum', description: 'Building forward progress' },
      { id: 'A3', label: 'Execution', description: 'Turning plans into results' },
    ],
    questions: [
      { id: 'A_Q1', text: 'How quickly do you act on new plans or ideas?' },
      { id: 'A_Q2', text: 'What helps you stay committed to your goals?' },
      { id: 'A_Q3', text: 'How do you overcome procrastination?' },
    ],
  },
  resilience: {
    title: 'Resilience',
    icon: Shield,
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    cards: [
      { id: 'R1', label: 'Stress Response', description: 'How you react to pressure' },
      { id: 'R2', label: 'Emotional Regulation', description: 'Managing feelings in difficulty' },
      { id: 'R3', label: 'Recovery Speed', description: 'Bouncing back from setbacks' },
    ],
    questions: [
      { id: 'R_Q1', text: 'What do you do when under significant pressure?' },
      { id: 'R_Q2', text: 'How do you recover from setbacks or failures?' },
      { id: 'R_Q3', text: 'What practices help you maintain emotional balance?' },
    ],
  },
};

export default function Pillar() {
  const urlParams = new URLSearchParams(window.location.search);
  const pillarId = urlParams.get('pillar') || 'purpose';
  const pillar = pillarData[pillarId];
  const Icon = pillar.icon;

  const [showAssessment, setShowAssessment] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState([]);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
      const [questionStartTime, setQuestionStartTime] = useState(null);
      const [narratorPhase, setNarratorPhase] = useState('intro');
      const [showNarrator, setShowNarrator] = useState(false);
      const [questStage, setQuestStage] = useState(0);
      const [showRealmTransition, setShowRealmTransition] = useState(false);
  
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    trackPageView('Pillar', pillarId);
  }, [pillarId]);

  useEffect(() => {
    if (showAssessment) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestion, showAssessment]);

  const { data: existingAssessments = [] } = useQuery({
    queryKey: ['assessments', pillarId],
    queryFn: async () => {
      return base44.entities.PilarAssessment.filter({ pillar: pillarId });
    },
  });

  const { data: allAssessments = [] } = useQuery({
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

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const records = await base44.entities.UserGamification.list();
      return records[0];
    },
  });

  const completedAssessment = existingAssessments.find(a => a.completed);
  const attemptNumber = existingAssessments.length + 1;

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      return base44.entities.PilarAssessment.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assessments']);
      queryClient.invalidateQueries(['userProfile']);
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      if (userProfile) {
        return base44.entities.UserProfile.update(userProfile.id, data);
      }
      return base44.entities.UserProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
    },
  });

  const handleStartAssessment = () => {
        setShowNarrator(true);
        setNarratorPhase('intro');
        setQuestStage(0);
        setResponses([]);
        setShowResults(false);
        trackAssessmentStarted(pillarId, attemptNumber);
      };

      const handleNarratorComplete = () => {
        if (narratorPhase === 'intro') {
          setNarratorPhase('quest');
          setQuestStage(1);
        } else if (narratorPhase === 'quest') {
          setShowNarrator(false);
          setShowAssessment(true);
          setCurrentQuestion(0);
          setQuestStage(2);
        }
      };

      const handleNavigateToNextPillar = () => {
        setShowRealmTransition(true);
      };

      const handleRealmTransitionComplete = () => {
        setShowRealmTransition(false);
        navigate(createPageUrl(`Pillar?pillar=${nextPillar.pillar}`));
      };

  const handleAnswerSubmit = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);

    const timeSpent = questionStartTime ? Math.round((Date.now() - questionStartTime) / 1000) : 0;
    const sentiment = analyzeSentiment(answer);
    const confidence = calculateResponseConfidence(answer, timeSpent);
    const score = scoreAnswer(answer, pillarId, pillar.questions[currentQuestion].id);

    const responseData = {
      question_id: pillar.questions[currentQuestion].id,
      question: pillar.questions[currentQuestion].text,
      answer: answer,
      score: score,
      sentiment: sentiment.sentiment,
      confidence: confidence,
      time_spent_seconds: timeSpent,
      answered_at: new Date().toISOString()
    };

    const newResponses = [...responses, responseData];
    setResponses(newResponses);
    
    trackQuestionAnswered(pillarId, pillar.questions[currentQuestion].id, timeSpent, false);

    if (currentQuestion < pillar.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer('');
      setIsSubmitting(false);
    } else {
      // Complete assessment
      const avgScore = Math.round(newResponses.reduce((sum, r) => sum + r.score, 0) / newResponses.length);
      const avgConfidence = Math.round(newResponses.reduce((sum, r) => sum + r.confidence, 0) / newResponses.length);
      const emotionalIndicators = detectEmotionalIndicators(newResponses);

      const assessmentData = {
        pillar: pillarId,
        session_id: getSessionId(),
        responses: newResponses,
        overall_score: avgScore,
        confidence_level: avgConfidence,
        emotional_indicators: emotionalIndicators,
        completed: true,
        started_at: new Date(questionStartTime - (newResponses.length * 60000)).toISOString(),
        completed_at: new Date().toISOString(),
        attempt_number: attemptNumber
      };

      await saveMutation.mutateAsync(assessmentData);
      
      // Update user profile
      const updatedScores = {
        ...(userProfile?.pillar_scores || {}),
        [pillarId]: avgScore
      };
      
      const scoreEntries = Object.entries(updatedScores).filter(([_, v]) => v !== undefined);
      const strongest = scoreEntries.reduce((a, b) => a[1] > b[1] ? a : b, ['', 0])[0];
      const weakest = scoreEntries.reduce((a, b) => a[1] < b[1] ? a : b, ['', 100])[0];
      
      const completionCounts = {
        ...(userProfile?.pillar_completion_count || {}),
        [pillarId]: (userProfile?.pillar_completion_count?.[pillarId] || 0) + 1
      };
      
      const totalCompleted = Object.values(completionCounts).reduce((a, b) => a + b, 0);
      const avgAllScores = scoreEntries.length > 0 
        ? scoreEntries.reduce((sum, [_, s]) => sum + s, 0) / scoreEntries.length 
        : 0;

      const nextRecommendation = determineNextPillar(
        { ...userProfile, pillar_scores: updatedScores },
        [...allAssessments, assessmentData],
        pillarId
      );

      await updateProfileMutation.mutateAsync({
        pillar_scores: updatedScores,
        pillar_completion_count: completionCounts,
        strongest_pillar: strongest || undefined,
        weakest_pillar: weakest || undefined,
        recommended_next_pillar: nextRecommendation.pillar,
        recommended_activities: generateActivityRecommendations(weakest || pillarId, updatedScores[weakest || pillarId] || avgScore),
        total_assessments_completed: totalCompleted,
        last_assessment_date: new Date().toISOString(),
        journey_stage: totalCompleted === 0 ? 'newcomer' : totalCompleted < 3 ? 'explorer' : totalCompleted < 5 ? 'practitioner' : 'master',
        confidence_score: avgConfidence
      });

      trackAssessmentCompleted(pillarId, avgScore, newResponses.length);

      // Award points for assessment completion
      const isFirstAssessment = attemptNumber === 1;
      const pointsReason = isFirstAssessment ? 'assessment_completed' : 'assessment_retake';
      await awardPoints(base44, pointsReason, pillarId);

      // Check for new badges
      const newBadges = checkBadgeEligibility(gamification, { ...userProfile, pillar_scores: updatedScores }, [...allAssessments, assessmentData], []);
      if (newBadges.length > 0 && gamification) {
        await base44.entities.UserGamification.update(gamification.id, {
          badges: [...(gamification.badges || []), ...newBadges]
        });
      }

      queryClient.invalidateQueries(['gamification']);

      setShowAssessment(false);
      setQuestStage(3); // Victory stage
      setShowResults(true);
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    const timeSpent = questionStartTime ? Math.round((Date.now() - questionStartTime) / 1000) : 0;
    trackQuestionAnswered(pillarId, pillar.questions[currentQuestion].id, timeSpent, true);

    if (currentQuestion < pillar.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswer('');
    } else {
      setShowAssessment(false);
      setCurrentQuestion(0);
    }
  };

  const finalScore = responses.length > 0 
        ? Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length)
        : completedAssessment?.overall_score;

      const lore = getPillarLore(pillarId);
      const scoreNarrative = finalScore ? getScoreNarrative(finalScore) : null;

      const nextPillar = determineNextPillar(
    { ...userProfile, pillar_scores: { ...(userProfile?.pillar_scores || {}), [pillarId]: finalScore }},
    allAssessments,
    pillarId
  );

  return (
        <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
          {/* Realm Transition Overlay */}
          <RealmTransition
            fromPillar={pillarId}
            toPillar={nextPillar.pillar}
            isVisible={showRealmTransition}
            onTransitionComplete={handleRealmTransitionComplete}
            recommendation={nextPillar.reason}
          />

          {/* Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className={`absolute top-0 right-0 w-[600px] h-[600px] bg-${pillar.color}-500/20 rounded-full blur-[180px]`} />
            <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] bg-${pillar.color}-500/10 rounded-full blur-[120px]`} />
          </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between">
        <Link to={createPageUrl('GlobalMap')}>
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Map
          </Button>
        </Link>
        {completedAssessment && (
          <div className={`px-3 py-1.5 rounded-full bg-${pillar.color}-500/20 border border-${pillar.color}-500/30 flex items-center gap-2`}>
            <CheckCircle className={`w-4 h-4 text-${pillar.color}-400`} />
            <span className={`text-${pillar.color}-400 font-medium text-sm`}>
              {completedAssessment.overall_score}%
            </span>
          </div>
        )}
      </div>

      <div className="relative z-10 px-4 md:px-6 pb-20 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
                        {/* Adventure Narrator Overlay */}
                        {showNarrator && (
                          <motion.div
                            key="narrator"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-8"
                          >
                            <QuestProgress currentStage={questStage} pillarColor={pillar.color} />
                            <AdventureNarrator 
                              pillarId={pillarId} 
                              phase={narratorPhase}
                              onComplete={handleNarratorComplete}
                              userProfile={userProfile}
                            />
                          </motion.div>
                        )}

                        {showResults ? (
                          /* Victory Screen - D&D Style */
                          <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="py-8"
                          >
                            <QuestProgress currentStage={questStage} pillarColor={pillar.color} />

                            {/* Victory Narrator - RAG Enhanced */}
                            <div className="mb-8">
                              <AdventureNarrator 
                                pillarId={pillarId} 
                                phase="victory"
                                score={finalScore}
                                userProfile={userProfile}
                              />
                            </div>

                            {/* Achievement Badge */}
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', delay: 0.5 }}
                              className="text-center mb-8"
                            >
                              <div className={`inline-flex flex-col items-center p-8 rounded-3xl bg-gradient-to-br ${pillar.gradient}/20 border-2 border-${pillar.color}-500/50`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Swords className={`w-6 h-6 text-${pillar.color}-400`} />
                                  <span className={`text-${pillar.color}-400 font-bold uppercase tracking-wider text-sm`}>
                                    {scoreNarrative?.title || 'Recruit'}
                                  </span>
                                  <Swords className={`w-6 h-6 text-${pillar.color}-400`} />
                                </div>
                                <div className="text-6xl font-bold text-white mb-2">{finalScore}%</div>
                                <p className="text-zinc-400 text-sm">{pillar.title} Combat Rating</p>
                              </div>
                            </motion.div>

                            {/* Next Mission Recommendation */}
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.8 }}
                              className={`p-6 rounded-2xl bg-gradient-to-br from-${pillar.color}-900/30 to-${pillar.color}-950/50 border border-${pillar.color}-500/30 mb-8 max-w-md mx-auto`}
                            >
                              <div className={`flex items-center gap-2 text-${pillar.color}-400 mb-3`}>
                                <Scroll className="w-5 h-5" />
                                <span className="font-medium uppercase tracking-wider text-sm">Next Deployment Orders</span>
                              </div>
                              <p className="text-white text-xl font-semibold capitalize mb-2">
                                {getPillarLore(nextPillar.pillar).realm}
                              </p>
                              <p className={`text-${pillar.color}-200/70 text-sm italic`}>"{nextPillar.reason}"</p>
                            </motion.div>

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                              <Button
                                onClick={handleNavigateToNextPillar}
                                className={`bg-gradient-to-r ${pillar.gradient} text-white px-8 py-6 rounded-2xl text-lg font-medium shadow-2xl hover:scale-105 transition-transform`}
                              >
                                <Swords className="w-5 h-5 mr-2" />
                                Deploy to {getPillarLore(nextPillar.pillar).realm}
                              </Button>
                              <Link to={createPageUrl('Profile')}>
                                <Button variant="outline" className={`border-${pillar.color}-500/30 text-${pillar.color}-200 hover:bg-${pillar.color}-500/10 px-6 py-5 rounded-xl`}>
                                  View Service Record
                                </Button>
                              </Link>
                            </div>
                          </motion.div>
                        ) : !showAssessment && !showNarrator ? (
            /* Pillar Overview */
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Theatre Header - Military D&D Style */}
                                  <div className="text-center mb-8 md:mb-12">
                                    <motion.div 
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: 'spring' }}
                                      className={`inline-flex p-4 rounded-3xl bg-gradient-to-br ${pillar.gradient} mb-4 md:mb-6 relative`}
                                    >
                                      <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                      <motion.div
                                        animate={{ 
                                          boxShadow: [`0 0 20px 5px var(--color-pillar-${pillarId === 'purpose' ? 'purpose' : pillarId === 'interpersonal' ? 'interpersonal' : pillarId === 'learning' ? 'learning' : pillarId === 'action' ? 'action' : 'resilience'})`, `0 0 40px 10px var(--color-pillar-${pillarId})`, `0 0 20px 5px var(--color-pillar-${pillarId})`]
                                        }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 rounded-3xl"
                                      />
                                    </motion.div>
                                    <p className={`text-${pillar.color}-400 text-sm uppercase tracking-widest mb-2`}>{lore.realm}</p>
                                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 md:mb-4">{pillar.title}</h1>
                                    <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto italic">
                                      "{lore.narrative.split('.')[0]}..."
                                    </p>
                                  </div>

              {/* Subdomain Cards */}
              <div className="grid gap-4 md:grid-cols-3 mb-8 md:mb-12">
                {pillar.cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PilarCard
                      id={card.id}
                      label={card.label}
                      description={card.description}
                      pillar={pillarId}
                      icon={Icon}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Begin Mission Button */}
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-center"
                                  >
                                    <Button
                                      size="lg"
                                      onClick={handleStartAssessment}
                                      className={`bg-gradient-to-r ${pillar.gradient} text-white px-10 py-7 text-lg rounded-2xl shadow-2xl hover:scale-105 transition-transform`}
                                    >
                                      {completedAssessment ? (
                                        <>
                                          <RotateCcw className="w-5 h-5 mr-2" />
                                          Redeploy to Theatre
                                        </>
                                      ) : (
                                        <>
                                          <Swords className="w-5 h-5 mr-2" />
                                          Begin Campaign
                                        </>
                                      )}
                                    </Button>
                                    <p className="text-zinc-500 text-sm mt-4">
                                      {completedAssessment 
                                        ? `Previous Rating: ${completedAssessment.overall_score}% (${getScoreNarrative(completedAssessment.overall_score).title})`
                                        : 'Report to Command and prove your mettle'
                                      }
                                    </p>
                                  </motion.div>
            </motion.div>
          ) : showAssessment && (
                            /* Combat Assessment - Military D&D Style */
                            <motion.div
                              key="assessment"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            >
                              <QuestProgress currentStage={questStage} pillarColor={pillar.color} />

                              <div className={cn(
                                'rounded-[28px] p-6 md:p-8 border backdrop-blur-xl',
                                `bg-gradient-to-br from-${pillar.color}-900/30 via-stone-900/60 to-stone-950/80`,
                                `border-${pillar.color}-500/30`
                              )}>
                                {/* Commander Header */}
                                <div className="flex items-center gap-3 mb-4">
                                  <div className={`p-2 rounded-xl bg-${pillar.color}-500/20 border border-${pillar.color}-500/30`}>
                                    <Scroll className={`w-5 h-5 text-${pillar.color}-400`} />
                                  </div>
                                  <div>
                                    <p className={`text-${pillar.color}-400 text-xs font-medium uppercase tracking-wider`}>{lore.guardian}</p>
                                    <p className={`text-${pillar.color}-200/50 text-xs`}>Objective {currentQuestion + 1} of {pillar.questions.length}</p>
                                  </div>
                                </div>

                                {/* Progress Markers */}
                                <div className="flex items-center gap-3 mb-6">
                                  <div className="flex gap-2">
                                    {pillar.questions.map((_, i) => (
                                      <motion.div 
                                        key={i}
                                        animate={i === currentQuestion ? { scale: [1, 1.2, 1] } : {}}
                                        transition={{ duration: 1, repeat: i === currentQuestion ? Infinity : 0 }}
                                        className={cn(
                                          'w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 font-bold',
                                          i < currentQuestion 
                                            ? `bg-${pillar.color}-500 border-${pillar.color}-400 text-white` 
                                            : i === currentQuestion 
                                              ? `bg-${pillar.color}-500/30 border-${pillar.color}-400 text-${pillar.color}-400` 
                                              : 'bg-white/5 border-white/20 text-zinc-500'
                                        )}
                                      >
                                        {i < currentQuestion ? '✓' : i + 1}
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>

                                {/* Question as Commander Directive */}
                                <div className={`mb-6 p-4 rounded-xl bg-${pillar.color}-500/5 border border-${pillar.color}-500/20`}>
                                  <p className={`text-${pillar.color}-100/90 text-lg md:text-xl leading-relaxed font-serif italic`}>
                                    "{pillar.questions[currentQuestion].text}"
                                  </p>
                                </div>

                {/* Answer Input - Styled as Field Report */}
                                      <div className="mb-4">
                                        <p className={`text-${pillar.color}-400/70 text-sm mb-2 flex items-center gap-2`}>
                                          <MessageSquare className="w-4 h-4" />
                                          Your Field Report
                                        </p>
                                        <Textarea
                                          value={answer}
                                          onChange={(e) => setAnswer(e.target.value)}
                                          placeholder="Submit your tactical response to Command..."
                                          className={cn(
                                            `min-h-[120px] bg-white/5 border-${pillar.color}-500/20 text-white placeholder:text-zinc-500`,
                                            `rounded-2xl resize-none focus:ring-2 focus:ring-${pillar.color}-500/30 focus:border-${pillar.color}-500/50`,
                                            'text-base leading-relaxed'
                                          )}
                                        />
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center justify-between mt-6">
                                        <Button
                                          variant="ghost"
                                          onClick={handleSkip}
                                          className={`text-zinc-500 hover:text-${pillar.color}-400 hover:bg-${pillar.color}-500/10`}
                                        >
                                          Withdraw
                                        </Button>
                                        <Button
                                          onClick={handleAnswerSubmit}
                                          disabled={!answer.trim() || isSubmitting}
                                          className={`px-6 rounded-xl text-white bg-gradient-to-r ${pillar.gradient} hover:opacity-90`}
                                        >
                                          {isSubmitting ? 'Command reviewing...' : currentQuestion < pillar.questions.length - 1 ? 'Next Objective' : 'Complete Mission'}
                                          <Swords className="w-4 h-4 ml-2" />
                                        </Button>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
      </div>
    </div>
  );
}