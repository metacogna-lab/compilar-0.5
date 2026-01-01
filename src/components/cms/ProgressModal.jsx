import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ProgressModal({ isOpen, message = 'Loading...', progress = null }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
                <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-ping" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-white">{message}</h3>
                <p className="text-sm text-zinc-400">Please wait while we process your request</p>
              </div>

              {progress !== null && (
                <div className="w-full space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-zinc-500 text-center">{Math.round(progress)}% complete</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}