import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { cardDealTransition, mechanicalSpring } from '../config/motion';

/**
 * KineticOutlet - Wraps page content with "Card Deal" animation
 * 
 * Pages snap into focus like mechanical paper sliding into the focal plane,
 * then blur out when exiting (camera shutter effect).
 */
export default function KineticOutlet({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={cardDealTransition.initial}
        animate={cardDealTransition.animate}
        exit={cardDealTransition.exit}
        transition={mechanicalSpring}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}