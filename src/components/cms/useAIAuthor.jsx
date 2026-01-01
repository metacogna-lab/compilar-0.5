import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export function useAIAuthor(toast) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'generating' | 'reviewing' | 'refining'
  const [draft, setDraft] = useState('');
  const [topic, setTopic] = useState('');
  const [feedback, setFeedback] = useState('');
  const [iteration, setIteration] = useState(1);
  const [suggestedTopics, setSuggestedTopics] = useState(null);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const loadSuggestedTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await base44.functions.invoke('suggestTopics', {});
      if (response.data?.success && response.data?.topics) {
        setSuggestedTopics(response.data.topics);
      }
    } catch (error) {
      console.error('Failed to load suggested topics:', error);
    } finally {
      setLoadingTopics(false);
    }
  };

  const generate = async () => {
    if (!topic.trim()) {
      toast.warning('Please enter a topic');
      return;
    }

    setStatus('generating');
    setDraft(''); // Clear previous draft
    
    try {
      const systemPrompt = `You are a policy analyst and writer specializing in PILAR Theory (Purpose, Interpersonal, Learning, Action, Resilience). Your task is to write an insightful, evidence-based policy analysis grounded in organizational psychology and systems thinking.

Guidelines:
- Use concrete examples and case studies where possible
- Reference relevant research and theory without being overly academic
- Write in a clear, engaging narrative style (Ben Heslop's voice: practical yet profound)
- Structure content with clear sections and takeaways
- Balance theory with practical application
- Avoid jargon; make complex ideas accessible
- Be specific about which PILAR pillars or forces apply
- Aim for 800-1200 words`;

      // Simulate progressive updates for better UX
      const loadingSteps = [
        'Analyzing topic...',
        'Structuring outline...',
        'Generating content...',
        'Refining analysis...'
      ];
      
      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < loadingSteps.length) {
          setDraft(prev => prev + (prev ? '\n\n' : '') + `_${loadingSteps[currentStep]}_`);
          currentStep++;
        }
      }, 1500);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nTopic: ${topic}\n\nWrite a comprehensive policy analysis blog post on this topic.`,
        add_context_from_internet: false
      });

      clearInterval(progressInterval);
      setDraft(response);
      setStatus('reviewing');
      toast.success('Draft generated');
    } catch (error) {
      console.error('AI generation error:', error);
      toast.error('Failed to generate content');
      setStatus('idle');
      setDraft('');
    }
  };

  const refine = async () => {
    if (!feedback.trim()) {
      toast.warning('Please provide feedback');
      return;
    }

    if (iteration >= 3) {
      toast.warning('Maximum refinement iterations reached');
      return;
    }

    setStatus('refining');
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Current draft:\n\n${draft}\n\nUser feedback: ${feedback}\n\nRefine the draft based on this feedback while maintaining the PILAR Theory lens and professional tone.`,
        add_context_from_internet: false
      });

      setDraft(response);
      setFeedback('');
      setIteration(prev => prev + 1);
      setStatus('reviewing');
      toast.success(`Draft refined (iteration ${iteration + 1}/3)`);
    } catch (error) {
      console.error('AI refinement error:', error);
      toast.error('Failed to refine content');
      setStatus('reviewing');
    }
  };

  const reset = () => {
    setStatus('idle');
    setDraft('');
    setTopic('');
    setFeedback('');
    setIteration(1);
    setSuggestedTopics(null);
  };

  const selectTopic = (selectedTopic) => {
    setTopic(selectedTopic);
    setSuggestedTopics(null);
  };

  return {
    status,
    draft,
    topic,
    feedback,
    iteration,
    suggestedTopics,
    loadingTopics,
    setTopic,
    setFeedback,
    loadSuggestedTopics,
    generate,
    refine,
    reset,
    selectTopic
  };
}