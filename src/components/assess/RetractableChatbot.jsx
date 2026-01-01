import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronRight } from 'lucide-react';
import AssessmentChatbot from './AssessmentChatbot';

export default function RetractableChatbot({ pillar, mode, conversationHistory, onUpdateHistory, onAgentAnalysis, onForceClick }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Collapsed Tab - Always visible on right edge */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            exit={{ x: 100 }}
            onClick={() => setIsOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-l from-violet-500/90 to-pink-500/90 hover:from-violet-600/90 hover:to-pink-600/90 text-white px-3 py-6 rounded-l-xl shadow-2xl transition-all hover:px-4 flex flex-col items-center gap-2"
            style={{
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            <MessageCircle className="w-5 h-5" style={{ writingMode: 'horizontal-tb' }} />
            <span className="text-sm font-semibold tracking-wide">AI COACH</span>
            <ChevronRight className="w-4 h-4 rotate-180" style={{ writingMode: 'horizontal-tb' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] lg:w-[520px] bg-[#0F0F12] border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-pink-500/10">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-violet-400" />
                  <h3 className="text-lg font-semibold text-white">AI Assessment Coach</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Chatbot Content */}
              <div className="flex-1 overflow-hidden">
                <AssessmentChatbot
                  pillar={pillar}
                  mode={mode}
                  conversationHistory={conversationHistory}
                  onUpdateHistory={onUpdateHistory}
                  onAgentAnalysis={onAgentAnalysis}
                  onForceClick={onForceClick}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}