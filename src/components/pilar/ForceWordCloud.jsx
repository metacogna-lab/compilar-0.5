import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ForceWordCloud({ isOpen, onClose, pillar, mode, forces }) {
  const [animatedForces, setAnimatedForces] = useState([]);

  useEffect(() => {
    if (isOpen && forces) {
      // Stagger the animation of forces
      forces.forEach((force, index) => {
        setTimeout(() => {
          setAnimatedForces(prev => [...prev, force]);
        }, index * 150);
      });
    } else {
      setAnimatedForces([]);
    }
  }, [isOpen, forces]);

  if (!isOpen) return null;

  const modeColor = mode === 'egalitarian' ? 'indigo' : 'amber';
  // Map pillar IDs to colors
  const getPillarColor = () => {
    if (!pillar) return modeColor;
    
    const pillarId = pillar.id || '';
    
    // Match by pillar ID patterns
    if (pillarId.includes('prosp')) return 'violet'; // purpose
    if (pillarId.includes('pop') || pillarId.includes('status')) return 'pink'; // interpersonal
    if (pillarId.includes('recip')) return 'indigo'; // learning
    if (pillarId.includes('exp')) return 'emerald'; // action
    if (pillarId.includes('resp')) return 'amber'; // resilience
    
    return modeColor;
  };
  
  const pillarColor = getPillarColor();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-8 md:inset-16 z-50 bg-[#0F0F12] border border-white/20 rounded-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10" style={{
              background: `linear-gradient(to right, rgba(var(--color-${pillarColor}), 0.1), rgba(var(--color-${pillarColor}), 0.05))`
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {pillar?.construct || pillar?.title || 'Forces'}
                  </h3>
                  <p className="text-sm text-zinc-400 capitalize">
                    {mode} Mode • {forces?.length || 0} Forces
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Force Cloud */}
            <div className="flex-1 overflow-hidden relative p-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full max-w-5xl">
                  {animatedForces.map((force, index) => {
                    const total = forces.length;
                    const angle = (index / total) * 2 * Math.PI;
                    const radius = 35; // percentage
                    const centerX = 50;
                    const centerY = 50;
                    
                    const x = centerX + radius * Math.cos(angle);
                    const y = centerY + radius * Math.sin(angle);
                    
                    const size = 1 + (Math.random() * 0.5);
                    
                    return (
                      <motion.div
                        key={force.name}
                        initial={{ opacity: 0, scale: 0, x: '50%', y: '50%' }}
                        animate={{ 
                          opacity: 1, 
                          scale: size,
                          x: `${x}%`,
                          y: `${y}%`
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 100,
                          damping: 15,
                          delay: index * 0.1
                        }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{
                          left: 0,
                          top: 0
                        }}
                      >
                        <div
                          className="px-4 py-2 rounded-lg backdrop-blur-sm cursor-pointer group transition-transform hover:scale-110"
                          style={{
                            background: `linear-gradient(to bottom right, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))`,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderColor: `rgba(139, 92, 246, 0.3)`
                          }}
                        >
                          <p className="text-violet-300 font-semibold whitespace-nowrap text-sm md:text-base">
                            {force.name}
                          </p>
                          <div className="overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-xs text-zinc-400 mt-1 max-w-xs">
                              {force.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Center Pillar Name */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: forces?.length * 0.1 + 0.3 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <div 
                      className="px-8 py-4 rounded-2xl backdrop-blur-md"
                      style={{
                        background: 'linear-gradient(to bottom right, rgba(139, 92, 246, 0.3), rgba(139, 92, 246, 0.2))',
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        borderColor: 'rgba(139, 92, 246, 0.5)'
                      }}
                    >
                      <p className="text-2xl md:text-3xl font-bold text-violet-300 text-center">
                        {pillar?.construct || pillar?.title}
                      </p>
                      <p className="text-xs text-zinc-400 text-center mt-1 capitalize">
                        {mode} Mode
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <p className="text-sm text-zinc-400 text-center">
                Hover over forces to see descriptions • Click anywhere to close
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}