import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageCircle, X, Send, Sparkles, Bot, User,
  Compass, Heart, BookOpen, Zap, Shield, Loader2
} from 'lucide-react';
import { getSessionId, trackChatbotInteraction } from './ActionTracker';

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield
};

const pillarColors = {
  purpose: 'violet',
  interpersonal: 'pink',
  learning: 'indigo',
  action: 'emerald',
  resilience: 'amber'
};

const SYSTEM_PROMPT = `You are the PILAR Expert Communicator, trained in Ben Heslop's PILAR framework for leadership development. You help users develop across five interconnected pillars of capability: Purpose, Interpersonal, Learning, Action, and Resilience.

I. IDENTITY & PHILOSOPHY
You are the PILAR Foundation AI Guide—a brilliant, empathetic Systems Engineer and Leadership Coach. You don't just "provide information"; you are a Thought Partner dedicated to the global application of Ben Heslop’s PILAR Research. Your tone is warm, intellectually honest, and deeply inquisitive.

Your Core Mission: To help users discover the "Force Vectors" between their leadership behaviors and their systemic impact.

II. COGNITIVE FRAMEWORK (The PILAR Worldview)
You view all human performance through these five interconnected lenses. When a user mentions a struggle, you mentally map it to these dimensions:

PURPOSE (Vision & Direction): The Resilience fuel. Are they moving toward a "Meaning Extraction" point or just drifting?

INTERPERSONAL (Connection & Influence): The Trust architecture. Is the psychological safety high enough for distributed leadership?

LEARNING (Growth & Adaptation): The Hub Pillar. This is the engine of agility. If this is low, every other pillar stagnates.

ACTION (Execution & Momentum): The Impact transformer. Discipline is the bridge between vision and reality.

RESILIENCE (Endurance & Recovery): The Sustaining Force. Effectiveness under pressure is a function of recovery, not just "toughness."

III. THE SOCRATIC INTERACTION PROTOCOL
Do not simply lecture. Engage the user in a systemic dialogue:

Acknowledge & Contextualize: Start by referencing what is on the user's current page or their specific pillar scores.

RAG Integration (The Deep "Why"): Query your Vector Stores to find specific Ben Heslop research papers or case studies that mirror the user's situation. Cite them as a "Peer" would: "The research suggests..."

The Socratic Probe: Instead of giving a solution, ask a question that bridges two pillars.

Example: "I see your Action score is high, but your Resilience is dipping. How much of your current momentum is fueled by Purpose, and how much is just 'busy-ness'?"

Pattern Recognition: Identify "Force Vectors" (the connections). If they are struggling with Interpersonal conflict, point out how a Learning-focused reflection might de-escalate it.

IV. RAG & CONTEXTUAL DIRECTIVES
Vector Store Priority: When asked a technical question, prioritize the most recent research in your Vector Store. If the data is contradictory, point it out—be transparent about the evolving nature of leadership science.

Page Awareness: If the user is looking at a specific "Force Connection" chart on the site, use it as a visual reference in your text: "Looking at the connections on this page, you'll notice..."

Information Density: Use Markdown tables for comparisons and bolding for emphasis. Keep paragraphs short and "scannable."

V. GROUP & TEAM DYNAMICS (The Mentorship Loop)
When analyzing groups:

Identify Complementary "Force Vectors": "User A’s high Resilience can serve as the 'Anchor' for User B’s high-energy but volatile Action style."

Mentorship Mapping: Suggest specific peer-to-peer activities: "Since you excel in Learning, could you mentor the team on how you structure your daily reflection sessions?"

VI. RESPONSE STRUCTURE
Insight Summary: A 1-2 sentence "vibe" check of the current situation.

The Socratic Analysis: The core of the response, weaving pillars together with research-backed insights.

The Force Vector Recommendation: One high-impact suggestion based on their unique profile.

Next Step: End with a single, high-value question or action to keep the momentum.`

export default function PilarChatBot({ userProfile, groupId = null, groupData = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();
  const sessionId = getSessionId();

  const { data: knowledge = [] } = useQuery({
    queryKey: ['pilarKnowledge'],
    queryFn: () => base44.entities.PilarKnowledge.list(),
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.GroupRound.list(),
    enabled: !groupData,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Find user's active groups
  const userGroups = React.useMemo(() => {
    if (groupData) return [groupData];
    return groups.filter(g => 
      g.participants?.some(p => p.email === currentUser?.email && p.status === 'joined')
    );
  }, [groups, groupData, currentUser]);

  const { data: chatHistory = [] } = useQuery({
    queryKey: ['chatHistory', sessionId],
    queryFn: async () => {
      const history = await base44.entities.ChatMessage.filter({ session_id: sessionId });
      return history;
    },
    enabled: isOpen,
  });

  const { data: activePlans = [] } = useQuery({
    queryKey: ['activePlans'],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ status: 'active' }),
  });

  useEffect(() => {
    if (chatHistory.length > 0 && messages.length === 0) {
      setMessages(chatHistory.map(m => ({ role: m.role, content: m.content })));
    }
  }, [chatHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const saveMessage = async (role, content) => {
    await base44.entities.ChatMessage.create({
      role,
      content,
      session_id: sessionId,
      context: {
        user_scores: userProfile?.pillar_scores,
        group_id: groupId
      }
    });
  };

  const buildContextPrompt = () => {
    let context = SYSTEM_PROMPT + '\n\n';
    
    // Add user context with detailed profile analysis
    context += `=== CURRENT USER PROFILE ===\n`;
    if (userProfile?.pillar_scores) {
      const scores = userProfile.pillar_scores;
      const sortedPillars = Object.entries(scores)
        .filter(([, s]) => s > 0)
        .sort(([, a], [, b]) => b - a);
      
      context += `Pillar Scores:\n`;
      Object.entries(scores).forEach(([pillar, score]) => {
        const status = score >= 70 ? 'STRENGTH' : score >= 50 ? 'developing' : score > 0 ? 'GROWTH AREA' : 'not assessed';
        context += `- ${pillar}: ${score || 0}% [${status}]\n`;
      });
      
      if (sortedPillars.length > 0) {
        context += `\nProfile Analysis:\n`;
        context += `- Strongest: ${sortedPillars[0]?.[0]} (${sortedPillars[0]?.[1]}%)\n`;
        context += `- Growth Priority: ${sortedPillars[sortedPillars.length - 1]?.[0]} (${sortedPillars[sortedPillars.length - 1]?.[1]}%)\n`;
        
        // Calculate balance
        if (sortedPillars.length >= 2) {
          const gap = sortedPillars[0][1] - sortedPillars[sortedPillars.length - 1][1];
          context += `- Balance Gap: ${gap}% (${gap > 30 ? 'significant imbalance' : gap > 15 ? 'moderate imbalance' : 'well-balanced'})\n`;
        }
      }
      
      context += `- Journey Stage: ${userProfile?.journey_stage || 'newcomer'}\n`;
      context += `- Confidence: ${userProfile?.confidence_score || 0}%\n\n`;
    }

    // Add relevant knowledge
    if (knowledge.length > 0) {
      const weakestPillar = userProfile?.weakest_pillar;
      const relevantKnowledge = weakestPillar 
        ? knowledge.filter(k => k.pillar === weakestPillar)
        : knowledge.slice(0, 3);
      
      if (relevantKnowledge.length > 0) {
        context += 'Relevant PILAR knowledge to draw from:\n';
        relevantKnowledge.forEach(k => {
          context += `\n${k.title}: ${k.description}\n`;
          if (k.development_strategies) {
            context += `Strategies: ${k.development_strategies.slice(0, 2).join(', ')}\n`;
          }
        });
      }
    }

    // Add development plan context
    if (activePlans.length > 0) {
      context += '\n--- DEVELOPMENT PLANS ---\n';
      activePlans.forEach(plan => {
        context += `Active Plan: "${plan.title}"\n`;
        context += `Focus: ${plan.target_pillars?.join(', ')}\n`;
        context += `Progress: ${plan.progress_percentage || 0}%\n`;
        const pendingActivities = plan.activities?.filter(a => !a.completed) || [];
        if (pendingActivities.length > 0) {
          context += `Pending activities: ${pendingActivities.slice(0, 3).map(a => a.title).join(', ')}\n`;
        }
      });
      context += 'When appropriate, reference the user\'s development plan and encourage them to complete pending activities.\n';
    }

    // Add group context
    if (userGroups.length > 0) {
      context += '\n--- GROUP CONTEXT ---\n';
      context += `This user is part of ${userGroups.length} group round(s). Focus on team cohesion.\n\n`;
      
      userGroups.forEach(group => {
        context += `Group: "${group.name}"\n`;
        context += `Participants: ${group.participants?.length || 0}\n`;
        if (group.focus_pillars?.length > 0) {
          context += `Focus Pillars: ${group.focus_pillars.join(', ')}\n`;
        }
        
        // Add group insights if available
        if (group.group_insights) {
          if (group.group_insights.collective_strengths?.length > 0) {
            context += `Group Strengths: ${group.group_insights.collective_strengths.join(', ')}\n`;
          }
          if (group.group_insights.collective_growth_areas?.length > 0) {
            context += `Group Growth Areas: ${group.group_insights.collective_growth_areas.join(', ')}\n`;
          }
          if (group.group_insights.cohesion_score) {
            context += `Cohesion Score: ${group.group_insights.cohesion_score}%\n`;
          }
        }
        context += '\n';
      });
      
      context += 'IMPORTANT: When responding, consider how this user\'s development can contribute to their group\'s collective growth. Suggest collaborative activities and highlight how they can support or learn from teammates.\n';
    }

    return context;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    
    // Track chatbot interaction for analytics
    trackChatbotInteraction('pilar_coach', 'user_message', userProfile?.weakest_pillar);

    await saveMessage('user', userMessage);

    const contextPrompt = buildContextPrompt();
    const conversationHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');

    const fullPrompt = `${contextPrompt}\n\nConversation so far:\n${conversationHistory}\nuser: ${userMessage}\n\nRespond as the PILAR Coach:`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt: fullPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          response: { type: "string" },
          suggested_pillar: { type: "string" },
          action_item: { type: "string" }
        }
      }
    });

    const assistantMessage = response.response || response;
    setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    await saveMessage('assistant', assistantMessage);
    
    setIsLoading(false);
  };

  const getInitialMessage = () => {
    if (userProfile?.pillar_scores && Object.keys(userProfile.pillar_scores).length > 0) {
      const weakest = userProfile.weakest_pillar;
      return `Welcome back! I see you've been exploring your PILAR profile. Your ${weakest || 'growth'} area looks like a great opportunity for development. What's on your mind today?`;
    }
    return "Hello! I'm your PILAR Coach. I'm here to help you explore and develop across the five pillars: Purpose, Interpersonal, Learning, Action, and Resilience. What brings you here today?";
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full',
          'bg-gradient-to-r from-violet-500 to-pink-500',
          'flex items-center justify-center shadow-xl',
          'hover:shadow-violet-500/30 transition-shadow',
          isOpen && 'hidden'
        )}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              'fixed bottom-6 right-6 z-50',
              'w-[380px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)]',
              'rounded-3xl overflow-hidden',
              'bg-[#0F0F12] border border-white/10',
              'shadow-2xl shadow-black/50',
              'flex flex-col'
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-pink-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">PILAR Coach</h3>
                    <p className="text-xs text-zinc-400">Your personal guide</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Initial message */}
              {messages.length === 0 && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-md p-3 max-w-[85%]">
                    <p className="text-sm text-zinc-200">{getInitialMessage()}</p>
                  </div>
                </div>
              )}

              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'flex gap-3',
                    msg.role === 'user' && 'flex-row-reverse'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    msg.role === 'user' ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                  )}>
                    {msg.role === 'user' 
                      ? <User className="w-4 h-4 text-emerald-400" />
                      : <Bot className="w-4 h-4 text-violet-400" />
                    }
                  </div>
                  <div className={cn(
                    'rounded-2xl p-3 max-w-[85%]',
                    msg.role === 'user' 
                      ? 'bg-emerald-500/20 rounded-tr-md' 
                      : 'bg-white/5 rounded-tl-md'
                  )}>
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-md p-3">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask your PILAR Coach..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="bg-violet-500 hover:bg-violet-600 rounded-xl px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}