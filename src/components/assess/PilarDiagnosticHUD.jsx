import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Send, Loader2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PILAR_LETTERS = [
  { letter: 'P', name: 'Purpose', color: '#8B5CF6', fullName: 'purpose' },
  { letter: 'I', name: 'Interpersonal', color: '#EC4899', fullName: 'interpersonal' },
  { letter: 'L', name: 'Learning', color: '#4F46E5', fullName: 'learning' },
  { letter: 'A', name: 'Action', color: '#10B981', fullName: 'action' },
  { letter: 'R', name: 'Resilience', color: '#F59E0B', fullName: 'resilience' }
];

export default function PilarDiagnosticHUD({ onComplete, cardData }) {
  const [sessionId] = useState(`diagnostic_${Date.now()}`);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPillar, setCurrentPillar] = useState('P');
  const [unlockedPillars, setUnlockedPillars] = useState([]);
  const [pillarScores, setPillarScores] = useState({
    P: 0, I: 0, L: 0, A: 0, R: 0
  });
  const [radarData, setRadarData] = useState([]);
  const [startTime] = useState(Date.now());
  const [hoveredKeyword, setHoveredKeyword] = useState(null);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const createSnapshotMutation = useMutation({
    mutationFn: (snapshotData) => base44.entities.PilarSnapshot.create(snapshotData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pilarSnapshots'] });
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Update radar chart data
    const data = PILAR_LETTERS.map(({ letter, name }) => ({
      pillar: letter,
      name: name,
      score: pillarScores[letter],
      fullMark: 100
    }));
    setRadarData(data);
  }, [pillarScores]);

  useEffect(() => {
    // Send initial greeting
    if (messages.length === 0) {
      initiateDiagnostic();
    }
  }, []);

  const initiateDiagnostic = async () => {
    setIsLoading(true);
    try {
      const greeting = {
        role: 'assistant',
        content: `Welcome to your PILAR Diagnostic. I'm going to ask you 5 questions—one for each dimension of the framework. As we talk, you'll see your profile take shape in real-time above. Let's begin with **Purpose**.\n\nThink about your current role or situation. What gives your work meaning? What are you really trying to achieve?`,
        pillar: 'P',
        timestamp: new Date().toISOString()
      };
      setMessages([greeting]);
      setCurrentPillar('P');
    } catch (error) {
      console.error('Failed to start diagnostic:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      pillar: currentPillar,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Analyze response using LLM
      const analysisResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this user response for a PILAR diagnostic assessment.
        
Current Pillar: ${PILAR_LETTERS.find(p => p.letter === currentPillar)?.name}
User Response: "${input}"

Evaluate:
1. Depth of self-awareness (0-100)
2. Sentiment (positive/neutral/negative/mixed)
3. Key indicators of strength in this pillar
4. Score (0-100) for this pillar based on the response
5. Keywords mentioned that relate to PILAR theory

Return JSON with: score, sentiment, keywords, insights`,
        response_json_schema: {
          type: 'object',
          properties: {
            score: { type: 'number' },
            sentiment: { type: 'string' },
            keywords: { type: 'array', items: { type: 'string' } },
            insights: { type: 'string' },
            next_question: { type: 'string' }
          }
        }
      });

      const analysis = analysisResponse;

      // Update scores
      const newScores = { ...pillarScores, [currentPillar]: analysis.score };
      setPillarScores(newScores);

      // Unlock current pillar
      if (!unlockedPillars.includes(currentPillar)) {
        setUnlockedPillars([...unlockedPillars, currentPillar]);
      }

      // Determine next pillar
      const currentIndex = PILAR_LETTERS.findIndex(p => p.letter === currentPillar);
      const isComplete = currentIndex === PILAR_LETTERS.length - 1;

      let agentResponse;
      if (isComplete) {
        // Generate summary
        const summaryResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `Generate a comprehensive diagnostic summary for this PILAR assessment:

Scores:
${PILAR_LETTERS.map(p => `${p.name}: ${newScores[p.letter]}/100`).join('\n')}

Conversation transcript:
${updatedMessages.map(m => `${m.role === 'user' ? 'User' : 'Agent'}: ${m.content}`).join('\n\n')}

Provide:
1. Overall assessment (2-3 sentences)
2. Top 3 strengths
3. Top 3 growth areas
4. 3 personalized recommendations`,
          response_json_schema: {
            type: 'object',
            properties: {
              summary: { type: 'string' },
              strengths: { type: 'array', items: { type: 'string' } },
              growth_areas: { type: 'array', items: { type: 'string' } },
              recommendations: { type: 'array', items: { type: 'string' } }
            }
          }
        });

        // Save snapshot
        await createSnapshotMutation.mutateAsync({
          session_id: sessionId,
          pillar_scores: newScores,
          unlocked_pillars: [...unlockedPillars, currentPillar],
          conversation_transcript: updatedMessages.map(m => ({
            pillar: m.pillar,
            question: m.role === 'assistant' ? m.content : null,
            user_response: m.role === 'user' ? m.content : null,
            sentiment: m.role === 'user' ? analysis.sentiment : null,
            score_derived: m.role === 'user' ? analysis.score : null,
            timestamp: m.timestamp
          })),
          agent_summary: summaryResponse.summary,
          insights: summaryResponse.strengths,
          recommendations: summaryResponse.recommendations,
          overall_score: Object.values(newScores).reduce((a, b) => a + b, 0) / 5,
          completion_status: 'completed',
          duration_seconds: Math.floor((Date.now() - startTime) / 1000),
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString()
        });

        agentResponse = {
          role: 'assistant',
          content: `🎯 **Diagnostic Complete**\n\n${summaryResponse.summary}\n\n**Your Strengths:**\n${summaryResponse.strengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n**Growth Opportunities:**\n${summaryResponse.growth_areas.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\n**Recommendations:**\n${summaryResponse.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`,
          pillar: 'complete',
          timestamp: new Date().toISOString()
        };

        setCurrentPillar('complete');
      } else {
        // Move to next pillar
        const nextPillar = PILAR_LETTERS[currentIndex + 1];
        setCurrentPillar(nextPillar.letter);

        agentResponse = {
          role: 'assistant',
          content: `Thank you. I can see ${analysis.insights}\n\nNow let's explore **${nextPillar.name}**.\n\n${analysis.next_question || getNextQuestion(nextPillar.letter)}`,
          pillar: nextPillar.letter,
          timestamp: new Date().toISOString(),
          keywords: analysis.keywords
        };
      }

      setMessages([...updatedMessages, agentResponse]);
    } catch (error) {
      console.error('Diagnostic error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextQuestion = (pillar) => {
    const questions = {
      I: "How would you describe your relationships with your team or colleagues? Do you feel connected and supported?",
      L: "When was the last time you learned something new? How do you approach challenges where you don't have all the answers?",
      A: "Think about your follow-through on commitments. What helps or hinders your ability to execute consistently?",
      R: "When things don't go as planned, how do you typically respond? What helps you bounce back?"
    };
    return questions[pillar] || "Tell me more about this area.";
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 h-screen flex flex-col">
        {/* Header with PILAR Letters */}
        <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                {PILAR_LETTERS.map(({ letter, name, color }) => {
                  const isUnlocked = unlockedPillars.includes(letter);
                  const isCurrent = currentPillar === letter;
                  
                  return (
                    <motion.div
                      key={letter}
                      className="relative"
                      animate={{
                        scale: isCurrent ? 1.1 : 1,
                        opacity: isUnlocked ? 1 : 0.3
                      }}
                    >
                      <div
                        className={`text-4xl font-bold transition-all duration-500 ${
                          isUnlocked ? 'opacity-100' : 'opacity-30'
                        }`}
                        style={{
                          color: isUnlocked ? color : '#555',
                          textShadow: isUnlocked ? `0 0 20px ${color}, 0 0 40px ${color}` : 'none'
                        }}
                      >
                        {letter}
                      </div>
                      {isUnlocked && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1"
                        >
                          <Sparkles className="w-4 h-4" style={{ color }} />
                        </motion.div>
                      )}
                      <div className="text-xs text-zinc-500 text-center mt-1">{name}</div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="text-sm text-zinc-400">
                Diagnostic Session: {sessionId.slice(-8)}
              </div>
            </div>
          </div>
        </div>

        {/* Top Section: Radar Chart */}
        <div className="flex-1 border-b border-white/10 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm p-8">
          <div className="h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#ffffff20" />
                <PolarAngleAxis 
                  dataKey="pillar" 
                  tick={{ fill: '#ffffff80', fontSize: 14 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#ffffff60' }} />
                <Radar
                  name="PILAR Scores"
                  dataKey="score"
                  stroke="#6C4BF4"
                  fill="#6C4BF4"
                  fillOpacity={0.6}
                  animationDuration={1000}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section: Chat */}
        <div className="h-[45vh] bg-black/80 backdrop-blur-xl flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white'
                      : 'bg-white/5 border border-white/10 text-zinc-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/10">
                  <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {currentPillar !== 'complete' && (
            <div className="p-6 border-t border-white/10">
              <div className="max-w-4xl mx-auto flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                  placeholder="Share your thoughts..."
                  className="bg-white/5 border-white/20 text-white placeholder-zinc-500 text-base"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-700 hover:to-cyan-700 px-8"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {currentPillar === 'complete' && (
            <div className="p-6 border-t border-white/10">
              <div className="max-w-4xl mx-auto">
                <Button
                  onClick={() => onComplete && onComplete({ scores: pillarScores, sessionId })}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 py-6 text-lg"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Complete Diagnostic & View Full Report
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}