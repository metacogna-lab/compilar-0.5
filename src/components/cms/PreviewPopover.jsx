import React, { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import DebouncedPreview from './DebouncedPreview';

const PreviewPopover = memo(({ isOpen, content, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed top-20 right-8 w-[600px] max-h-[80vh] bg-[#0F0F12] border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Live Preview</h3>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[calc(80vh-60px)]">
          <DebouncedPreview content={content} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

PreviewPopover.displayName = 'PreviewPopover';

export default PreviewPopover;