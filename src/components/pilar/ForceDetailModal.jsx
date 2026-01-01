import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import ForcePromptCard from './ForcePromptCard';

export default function ForceDetailModal({ isOpen, onClose, forceName, mode, effectForces = [] }) {
  const { data: forcePromptCard, isLoading } = useQuery({
    queryKey: ['forcePromptCard', forceName, mode],
    queryFn: () => base44.entities.ForcePromptCard.filter({ name: forceName, mode: mode }).then(res => res[0]),
    enabled: isOpen && !!forceName && !!mode,
  });

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] overflow-y-auto bg-gradient-to-br from-[#1a1a1f] to-[#0F0F12] border border-white/20 rounded-2xl shadow-2xl p-6 md:p-8 relative pointer-events-auto"
            >
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                </div>
              ) : forcePromptCard ? (
                <ForcePromptCard forceData={forcePromptCard} effectForces={effectForces} />
              ) : (
                <div className="text-center text-zinc-400 py-12">
                  <p>No prompt card data found for this force.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}