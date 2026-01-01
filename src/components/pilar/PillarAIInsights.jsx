import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { usePageStore } from '@/components/stores/usePageStore';
import { toast } from 'sonner';
import { highlightPillarsInText, fuzzyMatchPilarEntities } from '@/components/utils/pilarUtils';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import PillarForceChip from '@/components/assess/PillarForceChip';

export default function PillarAIInsights({ selectedPillars, mode, connections, allForces, forceConnections, onClose }) {
  const { currentPageContext, aiConversationTurns, incrementConversationTurns, resetConversationTurns } = usePageStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [metadataQuestions, setMetadataQuestions] = useState([]);

  // Load or generate suggested questions with RAG
  useEffect(() => {
    const loadOrGenerateQuestions = async () => {
      if (!currentPageContext.pageName) return;
      
      try {
        const pageSlug = currentPageContext.pageName.toLowerCase();
        const results = await base44.entities.AiInsightQuestions.filter({ pageSlug });
        
        if (results.length > 0) {
          setSuggestedQuestions(results[0].questions);
        } else {
          // Use RAG to get PILAR-grounded context
          const ragResponse = await base44.functions.invoke('pilarRagQuery', {
            query: `Generate insightful questions about ${currentPageContext.title}`,
            pageContent: currentPageContext.description || '',
            pageTitle: currentPageContext.title
          });

          if (ragResponse.data.success) {
            const fullPrompt = `${ragResponse.data.systemPrompt}

PILAR Knowledge Context:
${ragResponse.data.context}

Current Page: "${currentPageContext.title}"
Description: "${currentPageContext.description}"
Content Summary: "${currentPageContext.contentSummary}"

Generate 5-7 engaging questions that:
- Help users understand how this page relates to PILAR concepts
- Connect theory to practical team situations
- Encourage reflection on group dynamics
- Are conversational and specific to this content

Return ONLY a JSON array of question strings.`;

            const response = await base44.integrations.Core.InvokeLLM({
              prompt: fullPrompt,
              add_context_from_internet: false,
              response_json_schema: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: { type: "string" }
                  }
                }
              }
            });

            const questions = response?.questions?.slice(0, 7) || [
              `How does ${currentPageContext.title} relate to team dynamics?`,
              `What PILAR pillars are most relevant here?`,
              `How can I apply this to my team?`,
              `What patterns should I watch for?`,
              `How does this connect to group behavior?`
            ];

            setSuggestedQuestions(questions);
            
            await base44.entities.AiInsightQuestions.create({
              pageSlug,
              pageTitle: currentPageContext.title,
              questions
            });
          }
        }
      } catch (error) {
        console.error('Failed to load/generate questions:', error);
        setSuggestedQuestions([
          `How does this relate to PILAR?`,
          `What should I focus on here?`,
          `How can I apply this?`,
          `What are the key insights?`,
          `How does this affect teams?`
        ]);
      }
    };
    
    loadOrGenerateQuestions();
    
    // Generate metadata-based questions
    const generateMetadataQuestions = () => {
      const questions = [];
      
      if (currentPageContext.pageTitle) {
        questions.push(`What are the key PILAR principles on this page?`);
        questions.push(`How does this content relate to the PILAR framework?`);
      }
      
      if (currentPageContext.contentSummary) {
        questions.push(`Can you explain the main concepts in simpler terms?`);
      }
      
      questions.push(`What are practical applications of this?`);
      questions.push(`How can I apply this to my situation?`);
      
      setMetadataQuestions(questions);
    };
    
    generateMetadataQuestions();
  }, [currentPageContext, mode]);

  const baseSystemPrompt = useMemo(() => {
    let richKnowledgeContext = '';
    
    if (selectedPillars && selectedPillars.length > 0) {
      richKnowledgeContext = '\n\nBackground knowledge about the current discussion area. Use this to ground your responses accurately:\n\n';
      
      selectedPillars.forEach(pillar => {
        richKnowledgeContext += `Topic: ${pillar.title}\nCore idea: ${pillar.description}\nDeeper understanding: ${pillar.fullDescription}\nWhen very strong: ${pillar.highLowDescriptions?.High?.description || 'N/A'}\nWhen very weak: ${pillar.highLowDescriptions?.Low?.description || 'N/A'}\nStrength indicators: ${pillar.indicators?.high?.join(', ') || 'N/A'}\nChallenge indicators: ${pillar.indicators?.low?.join(', ') || 'N/A'}\nInfluential factors: ${pillar.forces?.map(f => `${f.name} (${f.description})`).join('; ') || 'N/A'}\n\n`;
      });
    }
    
    return `You are a perceptive guide helping users understand how people interact and work within groups.

Carefully analyze each user question for its intent and phrasing. Determine if it relates to dynamics of shared responsibility, consensus-building, collective effort, and flexible contributions OR to dynamics of clear direction, individual accountability, established authority, and structured roles. Subtly ground your response in the appropriate context without explicitly mentioning coordination modes or styles.

Response guidelines:
- Provide clear, natural, conversational explanations
- Connect concepts to concrete team situations
- Describe how behaviors manifest when strong or weak
- Keep responses brief and accurate
- Never use numbered lists or bullet points
- Never use terms like "Pillar", "Force", "Mode", "Egalitarian", "Hierarchical", or specific construct names (e.g., "Diverse Expression", "Collective Efficacy", "Group Prospects")
- Convey underlying concepts using descriptive, practical language
- No speculation or invented information

${richKnowledgeContext}`.trim();
  }, [selectedPillars]);

  const handleSendMessage = async (query) => {
    if (!query?.trim()) return;

    if (aiConversationTurns >= 5) {
      toast.error("Conversation limit reached. Click 'Start New Conversation' to continue.");
      return;
    }

    const userMessage = { role: 'user', content: query };
    const messagesForApi = [...messages, userMessage];
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Fetch dynamic context from assessment coach agent
      const agentContextResponse = await base44.functions.invoke('getChatbotContext', {
        current_pillar: selectedPillars[0]?.id || 'general',
        current_mode: mode,
        assessment_session_id: null
      });
      const agentContext = agentContextResponse.data?.context_string || '';

      const ragResponse = await base44.functions.invoke('pilarRagQuery', {
        query,
        pageContent: currentPageContext.description || '',
        pageTitle: currentPageContext.title || ''
      });

      if (ragResponse.data.success) {
        const enhancedSystemPrompt = `${baseSystemPrompt}\n\nUser Focus Context: ${agentContext}`;
        
        const response = await base44.functions.invoke('streamPilarInsights', {
          messages: messagesForApi,
          ragContext: ragResponse.data.context,
          pageContext: { ...currentPageContext, mode },
          systemPromptOverride: enhancedSystemPrompt
        });

        // Handle non-streaming response and extract tags
        const aiResponse = response.data;
        const extractedTags = fuzzyMatchPilarEntities(aiResponse);
        
        // Extract pillars and forces for UI chips
        let uiChips = [];
        try {
          const extractResponse = await base44.functions.invoke('extractPillarsAndForces', {
            conversationHistory: [...messagesForApi, { role: 'assistant', content: aiResponse }]
          });
          
          if (extractResponse.data?.success && extractResponse.data.extracted) {
            uiChips = extractResponse.data.extracted;
          }
        } catch (extractError) {
          console.error('Failed to extract pillars/forces:', extractError);
        }
        
        const assistantMessage = { 
          role: 'assistant', 
          content: aiResponse,
          tags: extractedTags,
          ui_chips: uiChips
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
        
        incrementConversationTurns();
      } else {
        throw new Error('RAG query failed');
      }
    } catch (error) {
      console.error('Failed to get AI insights:', error);
      toast.error("Failed to get AI insights. Please try again.");
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummary = async () => {
    if (aiConversationTurns >= 5) {
      toast.error("Conversation limit reached. Click 'Start New Conversation' to continue.");
      return;
    }

    setIsLoading(true);
    try {
      const ragResponse = await base44.functions.invoke('pilarRagQuery', {
        query: `Summarize the key PILAR concepts related to ${currentPageContext.title}`,
        pageContent: currentPageContext.description || '',
        pageTitle: currentPageContext.title || ''
      });

      if (ragResponse.data.success) {
        const fullPrompt = `${ragResponse.data.systemPrompt}

PILAR Knowledge Context:
${ragResponse.data.context}

Page Context:
${baseSystemPrompt}

Provide a concise, conversational summary of this page's key concepts and how they relate to the PILAR framework. Focus on practical insights.`;

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: fullPrompt,
          add_context_from_internet: false
        });

        const summaryMessage = { 
          role: 'assistant', 
          content: response || 'Unable to generate summary.'
        };
        
        setMessages([summaryMessage]);
        incrementConversationTurns();
      }
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast.error("Failed to generate summary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartNewConversation = () => {
    setMessages([]);
    resetConversationTurns();
    toast.info("Conversation reset. You can start a new topic.");
  };

  // Handle clicks on highlighted terms
  const handleHighlightClick = (e) => {
    const target = e.target;
    
    // Check if clicked on a pillar or force highlight
    if (target.classList.contains('pilar-highlight') || target.classList.contains('force-highlight') || target.classList.contains('connection-highlight')) {
      navigate(createPageUrl('PilarInfo'));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed right-4 top-20 bottom-4 w-96 bg-black/90 backdrop-blur-xl border border-white/10 rounded-3xl flex flex-col overflow-hidden z-50"
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-400" />
              AI Insights: {currentPageContext.title}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Ask questions about this page</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartNewConversation}
              className="text-zinc-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4" onClick={handleHighlightClick}>
          {messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <p className="text-zinc-400 mb-4">Ask me anything about this page!</p>
              
              {/* Metadata-based questions in purple */}
              {metadataQuestions.length > 0 && (
                <div className="mb-4 space-y-2">
                  <p className="text-xs text-zinc-500 mb-2">Quick Questions:</p>
                  {metadataQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="block w-full text-violet-400 hover:text-violet-300 text-sm transition-colors px-3 py-1.5 rounded hover:bg-violet-500/10"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Suggested questions */}
              <div className="flex flex-col items-center gap-2">
                {suggestedQuestions.slice(0, 3).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors"
                  >
                    {q}
                  </button>
                ))}
                <button
                  onClick={handleSummary}
                  disabled={isLoading}
                  className="text-zinc-400 hover:text-zinc-300 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Summarize Page
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`rounded-lg p-3 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-violet-600 text-white'
                    : 'bg-zinc-700/50 text-zinc-100'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <>
                    <div 
                      className="text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: highlightPillarsInText(msg.content) }}
                    />
                    
                    {/* UI Chips */}
                    {msg.ui_chips && msg.ui_chips.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/10">
                        {msg.ui_chips.map((chip, chipIdx) => (
                          <PillarForceChip 
                            key={chipIdx} 
                            chip={chip}
                            onExplore={() => navigate(createPageUrl('PilarInfo'))}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-zinc-700/50 rounded-lg p-3">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage(input);
                }
              }}
              placeholder={isLoading ? "AI is thinking..." : "Ask a question about this page..."}
              className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSendMessage(input)}
              disabled={isLoading || !input.trim()}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            {5 - aiConversationTurns} turns remaining
          </p>
        </div>
      </div>
    </motion.div>
  );
}