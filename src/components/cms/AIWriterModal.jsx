import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';

export default function AIWriterModal({ isOpen, onClose, onUseContent, toast }) {
  const [aiIteration, setAiIteration] = useState(1);
  const [aiDraft, setAiDraft] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [userFeedback, setUserFeedback] = useState('');
  const [aiTopic, setAiTopic] = useState('');
  const [suggestedTopics, setSuggestedTopics] = useState(null);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    if (isOpen && !suggestedTopics) {
      loadTopics();
    }
  }, [isOpen]);

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await base44.functions.invoke('suggestTopics', {});
      if (response.data.success) {
        setSuggestedTopics(response.data.topics);
      }
    } catch (error) {
      console.error('Error loading topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleStartGeneration = async () => {
    if (!aiTopic.trim()) {
      toast.warning('Please enter a topic');
      return;
    }

    setAiLoading(true);
    setSuggestedTopics(null);

    try {
      const prompt = `You are Ben Heslop, writing a policy analysis grounded in PILAR Theory. Your writing is direct, engaging, and pushes readers to think systemically.

WRITING IMPERATIVES:
- Write in first person with conviction
- Ask provocative questions that challenge assumptions
- Ground every claim in PILAR Theory concepts
- Use specific examples, not abstractions
- Push toward actionable insights, not theoretical musings
- Maintain a friendly but intellectually rigorous tone

FORBIDDEN:
- Corporate jargon and buzzwords
- Passive voice or third-person academic distance
- Unsupported assertions
- Generic policy recommendations

TOPIC: ${aiTopic}

Write a comprehensive blog post that demonstrates deep PILAR Theory thinking using standard template structure.

Be specific, evidence-based, and engaging. Write as an expert sharing insights, not as a detached analyst.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true
      });

      setAiDraft(response);
      toast.success('Draft generated');
    } catch (error) {
      console.error('AI writing error:', error);
      toast.error('Failed to generate content');
    } finally {
      setAiLoading(false);
    }
  };

  const handleNextIteration = async () => {
    if (!userFeedback.trim()) {
      toast.warning('Please provide feedback for refinement');
      return;
    }

    setAiIteration(prev => prev + 1);
    setAiLoading(true);

    try {
      const prompt = `You are Ben Heslop refining this policy analysis. Apply this feedback decisively and improve the piece.

FEEDBACK: "${userFeedback}"

CURRENT DRAFT:
${aiDraft}

Requirements for revision:
- Address the feedback directly and completely
- Maintain first-person voice and PILAR Theory grounding
- Strengthen weak sections, don't just patch them
- Push for deeper insights and more provocative questions
- Ensure every claim connects to PILAR concepts
- Make recommendations more specific and actionable

Revise with confidence. Don't hedge or soften—make it better.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAiDraft(response);
      setUserFeedback('');
      toast.success('Draft refined');
    } catch (error) {
      console.error('AI revision error:', error);
      toast.error('Failed to refine content');
    } finally {
      setAiLoading(false);
    }
  };

  const handleUse = () => {
    onUseContent(aiDraft);
    handleClose();
  };

  const handleClose = () => {
    setAiIteration(1);
    setAiDraft('');
    setUserFeedback('');
    setAiTopic('');
    setSuggestedTopics(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={() => !aiLoading && handleClose()}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-8 z-50 bg-[#0F0F12] border border-violet-500/30 rounded-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-violet-400" />
              AI Content Writer
            </h3>
            <p className="text-sm text-zinc-400 mt-1">
              {aiAuthor.draft ? `Iteration ${aiAuthor.iteration} of 3` : 'Generate content through PILAR Theory lens'}
            </p>
          </div>
          {aiAuthor.status === 'idle' && (
            <button onClick={handleClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex gap-4 p-6">
          <div className="flex-1 flex flex-col space-y-4">
            {suggestedTopics && !aiDraft && (
              <div className="p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
                <h4 className="text-sm font-semibold text-violet-300 mb-3">Suggested Topics from Knowledge Base</h4>
                <div className="flex flex-wrap gap-2">
                  {suggestedTopics.slice(0, 6).map((topic, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setAiTopic(topic.title);
                        setSuggestedTopics(null);
                      }}
                      className="px-3 py-1.5 text-xs bg-violet-500/20 hover:bg-violet-500/30 text-violet-200 rounded-lg border border-violet-500/30 transition-colors"
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
                {loadingTopics && <p className="text-xs text-zinc-500 mt-2">Loading suggestions...</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Topic</label>
              <Textarea
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="Example: The impact of remote work policies on organizational hierarchy and team dynamics"
                className="w-full h-32 bg-black/30 border-white/20 text-white placeholder:text-zinc-500 resize-none"
              />
            </div>

            {aiDraft && (
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Feedback for Refinement</label>
                <Textarea
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                  placeholder="Provide feedback to refine the draft..."
                  className="w-full h-24 bg-black/30 border-white/20 text-white placeholder:text-zinc-500 resize-none"
                />
              </div>
            )}

            <div className="flex gap-2">
              {!aiDraft ? (
                <Button
                  onClick={handleStartGeneration}
                  disabled={!aiTopic.trim() || aiLoading}
                  className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  {aiLoading ? 'Generating...' : 'Generate Content'}
                </Button>
              ) : (
                <>
                  {aiIteration < 3 && (
                    <Button
                      onClick={handleNextIteration}
                      disabled={!userFeedback.trim() || aiLoading}
                      className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
                    >
                      <Wand2 className="w-4 h-4 mr-2" />
                      {aiLoading ? 'Refining...' : `Refine (${aiIteration + 1}/3)`}
                    </Button>
                  )}
                  <Button
                    onClick={handleUse}
                    disabled={aiLoading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    Use This Draft
                  </Button>
                </>
              )}
            </div>

            {aiDraft && (
              <div className="flex-1 overflow-y-auto bg-black/30 border border-white/10 rounded-lg p-6">
                <h4 className="text-sm font-semibold text-zinc-400 mb-3">Generated Draft</h4>
                <article className="prose prose-invert prose-violet max-w-none">
                  <ReactMarkdown>{aiDraft}</ReactMarkdown>
                </article>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}