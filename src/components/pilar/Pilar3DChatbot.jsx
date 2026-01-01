import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, Bot, User, FileText, Lightbulb, Download, Compass, Heart, BookOpen, Zap, Shield, ChevronDown, ChevronUp, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { connections } from './Pillar3DGraph';

const pillarIcons = {
  purpose: Compass,
  interpersonal: Heart,
  learning: BookOpen,
  action: Zap,
  resilience: Shield
};

const pillarColors = {
  purpose: '#8B5CF6',
  interpersonal: '#EC4899',
  learning: '#4F46E5',
  action: '#10B981',
  resilience: '#F59E0B'
};

export default function Pilar3DChatbot({ mode, selectedPillar, selectedPillars = [], pillarsInfo, onClose, onSelectedPillarsChange }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I'm your PILAR guide. I can help you understand the forces, pillars, hierarchy and between pillars in egalitarian mode. ${selectedPillar ? `Let's explore ${selectedPillar}!` : 'Click on a pillar to learn more, or ask me anything about the framework.'}`
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [combinedSummary, setCombinedSummary] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const messagesEndRef = useRef(null);
  const hasGeneratedSummary = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate combined influence summary when multiple pillars are selected
  useEffect(() => {
    if (selectedPillars.length > 1 && !hasGeneratedSummary.current) {
      hasGeneratedSummary.current = true;
      generateCombinedInfluenceSummary();
    } else if (selectedPillars.length <= 1) {
      hasGeneratedSummary.current = false;
      setCombinedSummary(null);
    }
  }, [selectedPillars, mode]);

  const generateCombinedInfluenceSummary = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const pillarNames = selectedPillars.map(id => id.charAt(0).toUpperCase() + id.slice(1)).join(', ');
      const activeConnections = connections.filter(c => 
        selectedPillars.includes(c.from) && selectedPillars.includes(c.to) && c.modes.includes(mode)
      );
      
      const prompt = `As an expert in Ben Heslop's PILAR framework, provide a brief 3-sentence summary of the combined influence between these pillars: ${pillarNames}.

Context:
- Current Mode: ${mode.toUpperCase()}
- Selected Pillars: ${pillarNames}
- Number of Active Connections: ${activeConnections.length}

Provide exactly 3 sentences that:
1. Explain how these pillars work together in ${mode} mode
2. Describe the key synergies or tensions between them
3. Suggest one practical application of understanding this combination

Be concise, insightful, and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      const summary = response.data || 'Unable to generate combined influence summary.';
      setCombinedSummary(summary);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `🔗 **Combined Influence Summary**\n\n${summary}`,
        isCombinedSummary: true
      }]);
    } catch (error) {
      console.error('Combined summary error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Unable to generate combined influence summary. ${error.message || 'Please try again.'}`,
        isCombinedSummary: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev.slice(-2), { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Build context for the LLM
      const contextParts = [];
      
      contextParts.push(`You are an expert guide on Ben Heslop's PILAR framework (Purpose, Interpersonal, Learning, Action, Resilience).`);
      contextParts.push(`Current mode: ${mode.toUpperCase()}`);
      
      if (mode === 'egalitarian') {
        contextParts.push(`In Egalitarian mode, leadership emphasizes collaboration, shared decision-making, and mutual support between pillars.`);
      } else {
        contextParts.push(`In Hierarchical mode, leadership emphasizes clear authority, structured processes, and directive relationships between pillars.`);
      }

      if (selectedPillar) {
        const pillarData = pillarsInfo.find(p => p.id === selectedPillar);
        if (pillarData) {
          contextParts.push(`\nCurrently focused on: ${pillarData.title}`);
          contextParts.push(`Description: ${pillarData.description}`);
          
          if (pillarData.modeSpecificContent?.[mode]) {
            const modeContent = pillarData.modeSpecificContent[mode];
            contextParts.push(`\nMode-specific characteristics: ${modeContent.keyChars?.join(', ')}`);
            contextParts.push(`Focus: ${modeContent.focus}`);
          }
          
          contextParts.push(`\nKey subdomains: ${pillarData.subdomains.map(s => `${s.name} - ${s.description}`).join('; ')}`);
        }
      } else {
        contextParts.push(`\nAll five pillars: ${pillarsInfo.map(p => `${p.title} (${p.id})`).join(', ')}`);
      }

      contextParts.push(`\nUser question: ${userMessage}`);
      contextParts.push(`\nProvide a concise, insightful answer that helps understand the PILAR framework in the context of ${mode} mode. Be specific and actionable.`);

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextParts.join('\n'),
        add_context_from_internet: false
      });

      setMessages(prev => [...prev.slice(-2), {
        role: 'assistant',
        content: response.data || 'I apologize, but I encountered an issue generating a response. Please try again.'
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev.slice(-2), {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try asking your question again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const generateRecommendations = async () => {
    if (!selectedPillar || isLoading) return;
    
    setIsLoading(true);
    const pillarData = pillarsInfo.find(p => p.id === selectedPillar);
    
    try {
      const prompt = `As an expert in Ben Heslop's PILAR framework, provide personalized recommendations for developing the ${pillarData.title} pillar.

Context:
- Current Mode: ${mode.toUpperCase()}
- Pillar: ${pillarData.title}
- Description: ${pillarData.description}
${pillarData.modeSpecificContent?.[mode] ? `
- ${mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Focus: ${pillarData.modeSpecificContent[mode].focus}
- Key Characteristics: ${pillarData.modeSpecificContent[mode].keyChars?.join(', ')}
` : ''}

Provide:
1. **${mode === 'egalitarian' ? 'Collaborative' : 'Hierarchical'} Context**: How this pillar operates in ${mode} mode
2. **Actionable Steps**: 3-4 specific, practical actions for growth
3. **Professional Application**: How to apply this in the workplace
4. **Personal Development**: How to develop this in daily life
5. **Warning Signs**: What to watch for if this pillar is weak

Format as clear sections with bullet points. Be specific and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev.slice(-2), {
        role: 'assistant',
        content: response.data || 'Unable to generate recommendations. Please try again.'
      }]);
    } catch (error) {
      console.error('Recommendations error:', error);
      setMessages(prev => [...prev.slice(-2), {
        role: 'assistant',
        content: 'I encountered an error generating recommendations. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSessionReport = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const exploredPillars = [...new Set(messages
        .filter(m => m.role === 'assistant' && m.content.includes('selected'))
        .map(m => m.content.match(/\*\*([^*]+)\*\*/)?.[1])
        .filter(Boolean))];
      
      const prompt = `Generate a comprehensive session summary for a PILAR framework 3D exploration session.

Session Details:
- Mode Explored: ${mode.toUpperCase()}
- Pillars Interacted: ${exploredPillars.length > 0 ? exploredPillars.join(', ') : 'Overview only'}
- Current Focus: ${selectedPillar ? selectedPillar.charAt(0).toUpperCase() + selectedPillar.slice(1) : 'General exploration'}
- Total Interactions: ${messages.filter(m => m.role === 'user').length}

Provide:
1. **Session Overview**: What was explored
2. **Key Insights**: 3-4 main takeaways about the PILAR framework in ${mode} mode
3. **Recommended Next Steps**: What to explore or develop further
4. **Integration Opportunities**: How the explored concepts connect
5. **Action Plan**: 2-3 immediate actions to take

Be encouraging and specific. Format clearly with headers and bullet points.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setMessages(prev => [...prev.slice(-2), {
        role: 'assistant',
        content: `📊 **Session Report**\n\n${response.data || 'Unable to generate report. Please try again.'}`
      }]);
    } catch (error) {
      console.error('Report error:', error);
      setMessages(prev => [...prev.slice(-2), {
        role: 'assistant',
        content: 'I encountered an error generating the session report. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const exportConversation = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      mode,
      selectedPillar,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      })),
      summary: {
        totalMessages: messages.length,
        userQuestions: messages.filter(m => m.role === 'user').length,
        pillarFocus: selectedPillar || 'general'
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pilar-chat-${mode}-${selectedPillar || 'general'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      animate={{ 
        height: isCollapsed ? 'auto' : '100%',
        minHeight: isCollapsed ? '70px' : 'auto'
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="flex flex-col bg-zinc-800/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden"
      style={{ height: isCollapsed ? 'auto' : '100%' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-4 border-b border-white/10 bg-zinc-700/50">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-xl"
            style={{ 
              background: selectedPillar 
                ? `linear-gradient(135deg, ${pillarColors[selectedPillar]}, ${pillarColors[selectedPillar]}dd)`
                : 'linear-gradient(135deg, #8B5CF6, #EC4899)'
            }}
          >
            {selectedPillar && pillarIcons[selectedPillar] ? (
              React.createElement(pillarIcons[selectedPillar], { className: 'w-5 h-5 text-white' })
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className="text-white font-semibold">PILAR Guide</h3>
            <p className="text-zinc-400 text-xs">
              {mode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode
              {selectedPillar && ` • ${selectedPillar.charAt(0).toUpperCase() + selectedPillar.slice(1)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={exportConversation}
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-white/10"
            title="Export conversation"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-white/10"
            title={isCollapsed ? "Expand chat" : "Collapse chat"}
          >
            {isCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-zinc-400 hover:text-white hover:bg-white/10"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence mode="wait">
          {messages.slice(-3).map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ 
                    background: selectedPillar 
                      ? `linear-gradient(135deg, ${pillarColors[selectedPillar]}, ${pillarColors[selectedPillar]}dd)`
                      : 'linear-gradient(135deg, #8B5CF6, #EC4899)'
                  }}
                >
                  {selectedPillar && pillarIcons[selectedPillar] ? (
                    React.createElement(pillarIcons[selectedPillar], { className: 'w-4 h-4 text-white' })
                  ) : (
                    <Sparkles className="w-4 h-4 text-white" />
                  )}
                </div>
              )}
              
              <div className={`max-w-[80%] rounded-2xl p-4 relative group ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
                  : 'bg-white/5 border border-white/10 text-zinc-100'
              }`}>
                {message.role === 'assistant' ? (
                  <>
                    <ReactMarkdown 
                      className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                      components={{
                        p: ({ children }) => <p className="leading-relaxed mb-2 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                        li: ({ children }) => <li className="text-sm">{children}</li>
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                    {message.isCombinedSummary && (
                      <button
                        onClick={() => copySummary(message.content.replace('🔗 **Combined Influence Summary**\n\n', ''))}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
                        title="Copy summary"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-zinc-300" />
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-sm leading-relaxed">{message.content}</p>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ 
                background: selectedPillar 
                  ? `linear-gradient(135deg, ${pillarColors[selectedPillar]}, ${pillarColors[selectedPillar]}dd)`
                  : 'linear-gradient(135deg, #8B5CF6, #EC4899)'
              }}
            >
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      )}

      {/* Quick Actions */}
      {!isCollapsed && selectedPillar && (
        <div className="px-4 pb-2 flex gap-2">
          <Button
            onClick={generateRecommendations}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Get Recommendations
          </Button>
          <Button
            onClick={generateSessionReport}
            disabled={isLoading}
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <FileText className="w-4 h-4 mr-2" />
            Session Report
          </Button>
        </div>
      )}

      {/* Input */}
      {!isCollapsed && (
        <div className="p-4 border-t border-white/10 bg-zinc-700/50">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${mode} mode connections...`}
            className="min-h-[60px] bg-white/5 border-white/10 text-white placeholder:text-zinc-500 resize-none rounded-2xl"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-2xl disabled:opacity-50"
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
    </motion.div>
  );
}