import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mechanicalSpring } from '../config/motion';

export default function PillarDeck({ onSelectCard }) {
  const [isShuffling, setIsShuffling] = useState(false);

  const handleShuffle = () => {
    if (!onSelectCard) return;
    setIsShuffling(true);
    setTimeout(() => {
      setIsShuffling(false);
      onSelectCard();
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-8 relative z-10">
      <div className="relative w-80 h-96 pointer-events-none">
        {/* Card Stack */}
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            layout
            className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/20 backdrop-blur-xl"
            style={{
              transformOrigin: 'center bottom',
            }}
            animate={isShuffling ? {
              rotate: [0, -5, 5, -3, 3, 0],
              y: [0, -10, -5, -8, -3, 0],
            } : {
              rotate: index * 1.5,
              y: index * 2,
              x: index * 1,
            }}
            transition={isShuffling ? { duration: 0.6, delay: index * 0.05 } : mechanicalSpring}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
                <div className="text-6xl font-bold text-white/10">?</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={handleShuffle}
        disabled={isShuffling}
        className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-8 py-6 text-lg relative z-20 cursor-pointer"
      >
        <Shuffle className={`w-5 h-5 mr-2 ${isShuffling ? 'animate-spin' : ''}`} />
        Draw Random Card
      </Button>
    </div>
  );
}