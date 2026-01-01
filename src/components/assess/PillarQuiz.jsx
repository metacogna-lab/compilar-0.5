import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { restClient } from '@/api/restClient';
import { toast } from 'sonner';

export default function PillarQuiz({ pillar, mode, userProfile, onComplete }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState('medium');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveIncorrect, setConsecutiveIncorrect] = useState(0);

  const totalQuestions = 8;
  const progressPercentage = Math.round((currentQuestionIndex / totalQuestions) * 100);
  const correctCount = responses.filter(r => r.is_correct).length;
  const currentScore = responses.length > 0 ? Math.round((correctCount / responses.length) * 100) : 0;

  const difficultyColors = {
    easy: 'bg-green-500',
    medium: 'bg-yellow-500',
    hard: 'bg-red-500'
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      if (questions.length >= totalQuestions) return;

      setIsLoadingQuestions(true);
      try {
        const response = await restClient.post('/api/v1/ai/quiz-questions', {
          pillar_id: pillar,
          mode,
          difficulty: currentDifficulty,
          count: 3,
          user_context: {
            userProfile,
            previousPerformance: responses.length > 0 ? {
              correctCount: responses.filter(r => r.is_correct).length,
              totalCount: responses.length
            } : null
          }
        });

        if (response.questions) {
          setQuestions(prev => [...prev, ...response.questions]);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
        toast.error('Failed to load questions');
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    if (questions.length === 0 || currentQuestionIndex >= questions.length - 1) {
      fetchQuestions();
    }
  }, [pillar, mode, currentDifficulty, currentQuestionIndex]);

  const handleAnswerSelect = async () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    setIsLoadingFeedback(true);
    try {
      const feedbackData = {
        feedback: currentQuestion.explanation || 'Good effort! Keep learning.'
      };

      const newResponse = {
        question_id: currentQuestion.question_text,
        user_answer: selectedAnswer,
        is_correct: isCorrect,
        ai_feedback: feedbackData.feedback,
        answered_at: new Date().toISOString()
      };

      const updatedResponses = [...responses, newResponse];
      setResponses(updatedResponses);
      setShowFeedback(true);
      setFeedback(feedbackData.feedback);

      // Adaptive difficulty logic
      if (isCorrect) {
        const newConsecutiveCorrect = consecutiveCorrect + 1;
        setConsecutiveCorrect(newConsecutiveCorrect);
        setConsecutiveIncorrect(0);

        // Increase difficulty after 2 consecutive correct
        if (newConsecutiveCorrect >= 2 && currentDifficulty !== 'hard') {
          setCurrentDifficulty(currentDifficulty === 'easy' ? 'medium' : 'hard');
          toast.success('🎯 Leveling up! Questions getting harder.');
        }
      } else {
        const newConsecutiveIncorrect = consecutiveIncorrect + 1;
        setConsecutiveIncorrect(newConsecutiveIncorrect);
        setConsecutiveCorrect(0);

        // Decrease difficulty after 2 consecutive incorrect
        if (newConsecutiveIncorrect >= 2 && currentDifficulty !== 'easy') {
          setCurrentDifficulty(currentDifficulty === 'hard' ? 'medium' : 'easy');
          toast.info('📚 Adjusting difficulty to help you learn.');
        }
      }

    } catch (error) {
      console.error('Error processing answer:', error);
      toast.error('Failed to process answer');
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setFeedback('');
    } else {
      // Complete assessment
      const finalScore = Math.round((correctCount / responses.length) * 100);
      onComplete({
        responses,
        score: finalScore
      });
    }
  };

  if (isLoadingQuestions && questions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <div className="text-center py-12 text-slate-400">
        No questions available
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white drop-shadow-lg">
            {currentQuestionIndex + 1} / {totalQuestions}
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">
              Score: <span className="text-white font-semibold">{currentScore}%</span>
            </span>
            <span className="text-slate-400">
              Correct: <span className="text-emerald-400 font-semibold">{correctCount}/{responses.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs">Difficulty:</span>
            <motion.div
              key={currentDifficulty}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={`px-2 py-1 rounded text-xs font-semibold text-white ${difficultyColors[currentDifficulty]}`}
            >
              {currentDifficulty.toUpperCase()}
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-6"
        >
          {/* Question Card */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-semibold">
                {currentQuestionIndex + 1}
              </div>
              <p className="text-lg text-white leading-relaxed flex-1">
                {currentQuestion.question_text}
              </p>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.options?.map((option, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => !showFeedback && setSelectedAnswer(option)}
                  disabled={showFeedback}
                  className={`w-full p-4 rounded-lg text-left transition-all ${
                    selectedAnswer === option
                      ? showFeedback
                        ? option === currentQuestion.correct_answer
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : 'bg-red-500/20 border-2 border-red-500'
                        : 'bg-violet-500/20 border-2 border-violet-500'
                      : showFeedback && option === currentQuestion.correct_answer
                      ? 'bg-emerald-500/20 border-2 border-emerald-500'
                      : 'bg-slate-700/50 border border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                  } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white">{option}</span>
                    {showFeedback && option === currentQuestion.correct_answer && (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    )}
                    {showFeedback && selectedAnswer === option && option !== currentQuestion.correct_answer && (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Feedback Section */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-800/50 border border-slate-700 rounded-xl p-6"
              >
                <div className="flex items-start gap-3 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-white font-semibold mb-2">Explanation</h4>
                    <p className="text-slate-300 text-sm leading-relaxed">{feedback}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            {!showFeedback ? (
              <Button
                onClick={handleAnswerSelect}
                disabled={!selectedAnswer || isLoadingFeedback}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {isLoadingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Submit Answer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                className="bg-violet-600 hover:bg-violet-700"
              >
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Complete Assessment'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}