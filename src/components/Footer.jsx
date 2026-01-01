import React from 'react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="relative w-full border-t border-white/5 bg-gradient-to-b from-black/30 to-black/50 backdrop-blur-xl mt-20 py-8"
    >
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-sm text-zinc-400">
          Based upon <span className="text-zinc-300 font-medium">Ben Heslop's</span> published research | contact us at <a href="mailto:collab@compilar.app" className="text-violet-400 hover:text-violet-300 transition-colors">collab@compilar.app</a>
        </p>
      </div>
    </motion.footer>
  );
}