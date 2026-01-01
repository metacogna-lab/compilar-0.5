import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function PilarTheoryChatbot({ blendRatio, currentMode, userProfile }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !conversationId) {
      initializeConversation();
    }
  }, [isOpen]);

  const initializeConversation = async () => {
    try {
      const conversation = await base44.agents.createConversation({
        agent_name: 'pilar_theory_guide',
        metadata: {
          name: 'PILAR Theory Discussion',
          current_blend_ratio: blendRatio,
          current_mode: currentMode
        }
      });
      setConversationId(conversation.id);
      setMessages(conversation.messages || []);

      // Send initial context message
      const contextMessage = `I'm exploring the PILAR framework at ${Math.round(blendRatio * 100)}% on the slider (${currentMode} mode). ${userProfile ? `My scores: Purpose ${userProfile.pillar_scores?.purpose || 'N/A'}%, Interpersonal ${userProfile.pillar_scores?.interpersonal || 'N/A'}%, Learning ${userProfile.pillar_scores?.learning || 'N/A'}%, Action ${userProfile.pillar_scores?.action || 'N/A'}%, Resilience ${userProfile.pillar_scores?.resilience || 'N/A'}%.` : 'I haven\'t completed assessments yet.'} What should I know about this mode?`;
      
      await sendMessage(contextMessage, conversation);
    } catch (error) {
      console.error('Failed to initialize conversation:', error);
    }
  };

  const sendMessage = async (text, conv = null) => {
    if (!text.trim() || isLoading) return;

    const conversationToUse = conv || { id: conversationId };
    setIsLoading(true);
    setInput('');

    try {
      const updatedConversation = await base44.agents.addMessage(conversationToUse, {
        role: 'user',
        content: text
      });

      setMessages(updatedConversation.messages);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage(input);
    }
  };

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages);
    });

    return () => unsubscribe();
  }, [conversationId]);

  return (
    <>
      {/* Floating button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-2xl"
        >
          {isOpen ? <X className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-[#0F0F12] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-40"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">PILAR Theory Guide</h3>
                  <p className="text-zinc-400 text-xs">Courtesy of Compilar</p>
                </div>
              </div>
              <p className="text-zinc-500 text-xs mt-2">
                {currentMode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'} Mode • {Math.round(blendRatio * 100)}%
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <ReactMarkdown
                        className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="text-zinc-300 leading-relaxed my-2">{children}</p>,
                          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                          em: ({ children }) => <em className="text-violet-300">{children}</em>,
                          ul: ({ children }) => <ul className="list-disc ml-4 space-y-1">{children}</ul>,
                          li: ({ children }) => <li className="text-zinc-300">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Ask about the PILAR framework..."
                  className="flex-1 min-h-[60px] max-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-zinc-500 resize-none"
                />
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}