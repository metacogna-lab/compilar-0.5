import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Layers } from 'lucide-react';

export default function LightGlobes() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Link to={createPageUrl('PilarDefinitions')}>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          whileHover={{ scale: 1.05, x: -3 }}
          whileTap={{ scale: 0.95 }}
          className="relative px-4 py-3 rounded-xl cursor-pointer transition-all group flex items-center gap-2 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 hover:border-violet-500/50"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity bg-violet-500/30" />
          
          {/* Icon */}
          <Layers className="w-5 h-5 relative z-10 flex-shrink-0 text-violet-400" />
          
          {/* Label */}
          <span className="text-sm font-medium relative z-10 text-violet-300">
            View Pillars
          </span>
        </motion.div>
      </Link>
    </motion.div>
  );
}