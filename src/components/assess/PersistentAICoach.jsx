import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function PersistentAICoach({ 
  stage, 
  userProfile, 
  sessionData,
  currentPillar,
  currentMode 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cachedQuestions, setCachedQuestions] = useState(null);
  const messagesEndRef = useRef(null);

  // Load cached questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const cacheKey = `coach_questions_${userProfile?.email || 'guest'}`;
        const cached = localStorage.getItem(cacheKey);
        
        if (cached) {
          const parsed = JSON.parse(cached);
          // Check if cache is less than 24 hours old
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            setCachedQuestions(parsed.questions);
            return;
          }
        }

        // Generate new questions
        const response = await base44.functions.invoke('generateCoachQuestions', {
          userProfile,
          sessionData
        });

        if (response.data?.questions) {
          setCachedQuestions(response.data.questions);
          localStorage.setItem(cacheKey, JSON.stringify({
            questions: response.data.questions,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
      }
    };

    if (userProfile) {
      loadQuestions();
    }
  }, [userProfile]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const sessionId = sessionData?.session_id || `coach_${Date.now()}`;
      const response = await base44.functions.invoke('coachConversation', {
        messages: [...messages, userMessage],
        assessmentResults: sessionData,
        userProfile,
        pillar: currentPillar,
        mode: currentMode,
        sessionId,
        stage
      });

      if (response.data?.message) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.data.message
        }]);
      }
    } catch (error) {
      console.error('Coach error:', error);
      toast.error('Failed to get response');
    } finally {
      setIsLoading(false);
    }
  };

  const stageQuestions = cachedQuestions?.[stage] || [];
  const regularQuestions = cachedQuestions?.regular || [];
  const allSuggestions = [...regularQuestions, ...stageQuestions].slice(0, 6);

  return (
    <>
      {/* Floating Tab Button */}
      <motion.button
        initial={{ x: 100 }}
        animate={{ x: isOpen ? 100 : 0 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-50",
          "bg-gradient-to-r from-violet-500 to-pink-500",
          "text-white px-4 py-3 rounded-l-xl shadow-2xl",
          "flex items-center gap-2 font-semibold",
          "hover:from-violet-600 hover:to-pink-600 transition-all",
          isOpen && "opacity-0 pointer-events-none"
        )}
      >
        <Sparkles className="w-5 h-5" />
        <span className="text-sm">AI Coach</span>
      </motion.button>

      {/* Coach Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/50 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-violet-500/30">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">AI Coach</h3>
                  <p className="text-xs text-slate-400">Here to help you navigate</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-violet-500/30">
                    <MessageCircle className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-slate-400 text-sm mb-4">
                    Ask me anything about your assessment journey!
                  </p>
                  
                  {/* Quick suggestions */}
                  {allSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Quick Questions</p>
                      {allSuggestions.map((q, idx) => {
                        const isStandard = idx < 3;
                        return (
                          <button
                            key={idx}
                            onClick={() => sendMessage(q)}
                            className={cn(
                              "block w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                              isStandard 
                                ? "bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30" 
                                : "bg-white/5 hover:bg-white/10 text-slate-300"
                            )}
                          >
                            {q}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-2",
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-violet-500/30 flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-2 rounded-2xl",
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white'
                        : 'bg-white/10 text-slate-200'
                    )}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="text-sm prose prose-invert prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc ml-4 mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal ml-4 mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children }) => <code className="px-1 py-0.5 rounded bg-slate-900/50 text-violet-300 text-xs">{children}</code>
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center border border-violet-500/30">
                    <Sparkles className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-2xl">
                    <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask your coach..."
                  className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}