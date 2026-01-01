/**
 * Kinetic Paper Motion System
 * 
 * Design Language: "Paper Neuropunk"
 * Physics: High tension, zero wobble - like a camera shutter
 */

export const mechanicalSpring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export const softFade = {
  duration: 0.2,
  ease: "easeOut",
};

/**
 * The "Card Deal" Effect - Pages enter as if dealt from a deck
 */
export const cardDealTransition = {
  initial: { opacity: 0, y: 8, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, filter: "blur(2px)" },
};

/**
 * Living Layout - Smooth reordering with shared layout transitions
 */
export const layoutTransition = {
  layout: true,
  transition: mechanicalSpring,
};