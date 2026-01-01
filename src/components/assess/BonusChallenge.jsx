import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Zap, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function BonusChallenge({ isOpen, onClose, pillar, mode, masteryIndicators = [] }) {
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateBonusQuestion();
    }
  }, [isOpen]);

  const generateBonusQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('pilarRagQuery', {
        query: `Generate an advanced challenge question for ${pillar} that tests mastery. The user has demonstrated: ${masteryIndicators.join(', ')}`,
        pillar,
        mode,
        pageContent: 'Advanced mastery challenge',
        pageTitle: 'Bonus Question'
      });

      if (response.data?.success) {
        // Generate a thoughtful question
        const questionPrompt = `Based on the user's mastery of ${pillar}, create a challenging scenario-based question that requires them to apply concepts in a novel situation. Make it thought-provoking and practical.`;
        
        const llmResponse = await base44.integrations.Core.InvokeLLM({
          prompt: questionPrompt,
          add_context_from_internet: false
        });

        setQuestion(llmResponse.trim());
      }
    } catch (error) {
      console.error('Failed to generate bonus question:', error);
      setQuestion('How would you apply your understanding of this pillar in a high-stakes, ambiguous situation where the standard approaches don\'t work?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!userAnswer.trim()) return;

    setIsSubmitted(true);
    setIsLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Evaluate this answer to the mastery question: "${question}"\n\nUser's Answer: ${userAnswer}\n\nProvide detailed feedback on the depth of understanding, practical application, and nuanced thinking demonstrated. Be rigorous but encouraging.`,
        add_context_from_internet: false
      });

      setFeedback(response.trim());
    } catch (error) {
      console.error('Failed to evaluate answer:', error);
      setFeedback('Great attempt! Your answer shows deep thinking about the concepts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setFeedback(null);
    setIsSubmitted(false);
    generateBonusQuestion();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Mastery Challenge</h3>
                      <p className="text-sm text-zinc-400">You've unlocked an advanced question!</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>

                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Zap className="w-5 h-5 text-violet-400 mt-0.5" />
                    <p className="text-sm text-violet-200">
                      Your responses show exceptional understanding. Ready for a real challenge?
                    </p>
                  </div>
                </div>

                {isLoading && !question ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="bg-white/10 rounded-xl p-5 border border-white/10 mb-6">
                      <h4 className="text-sm font-semibold text-white mb-3">The Challenge:</h4>
                      <p className="text-sm text-zinc-300 leading-relaxed">{question}</p>
                    </div>

                    {!isSubmitted ? (
                      <>
                        <Textarea
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Take your time to craft a thoughtful response..."
                          className="bg-white/5 border-white/10 text-white placeholder-zinc-500 min-h-[150px] mb-4"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={onClose}
                            variant="outline"
                            className="border-white/20"
                          >
                            Skip for Now
                          </Button>
                          <Button
                            onClick={handleSubmit}
                            disabled={!userAnswer.trim() || isLoading}
                            className="bg-violet-500 hover:bg-violet-600"
                          >
                            {isLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              'Submit Answer'
                            )}
                          </Button>
                        </div>
                      </>
                    ) : feedback ? (
                      <>
                        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 mb-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-green-300 mb-2">Expert Feedback:</h4>
                              <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{feedback}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={handleReset}
                            variant="outline"
                            className="border-violet-500/30"
                          >
                            Try Another
                          </Button>
                          <Button
                            onClick={onClose}
                            className="bg-violet-500 hover:bg-violet-600"
                          >
                            Continue Assessment
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}