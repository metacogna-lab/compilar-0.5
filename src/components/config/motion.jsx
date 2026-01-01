
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

/**
 * SUBTLE MICRO-INTERACTIONS
 * Fast, snappy, no wobble - crisp animations only
 */
export const subtle = {
  // Fast, snappy spring - no wobble
  spring: { 
    type: "spring", 
    stiffness: 400, 
    damping: 30 
  },
  
  // Stagger animations for lists
  stagger: {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
      }
    },
    item: {
      hidden: { opacity: 0, y: 5 },
      show: { 
        opacity: 1, 
        y: 0, 
        transition: { type: "spring", stiffness: 300 } 
      }
    }
  }
};
