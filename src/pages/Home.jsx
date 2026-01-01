import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HomeConnectionGraph from '@/components/pilar/HomeConnectionGraph';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { pillarsInfo } from '@/components/pilar/pillarsData';
import { subtle } from '@/components/config/motion';

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [pillarMode, setPillarMode] = useState('egalitarian');
  const [graphMode, setGraphMode] = useState('egalitarian');

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const scores = userProfile?.pillar_scores || {};
  const hasScores = Object.keys(scores).length > 0;

  useEffect(() => {
    setIsLoaded(true);
    trackPageView('Home');
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F12] flex flex-col relative overflow-hidden">
      {/* Main Content */}
      <motion.div 
        className="flex-1 flex flex-col items-center justify-center px-4 pb-20"
        variants={subtle.stagger.container}
        initial="hidden"
        animate="show"
      >
      {/* Animated shader background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px]"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/3 right-1/3 w-80 h-80 bg-emerald-500/15 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-amber-500/15 rounded-full blur-[140px]"
        />
      </div>

      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />



      <motion.div
        variants={subtle.stagger.item}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          variants={subtle.stagger.item}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-zinc-400 mb-12"
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>The PILAR Framework</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          variants={subtle.stagger.item}
          className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-8 md:mb-10 leading-tight"
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
            Compilar
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={subtle.stagger.item}
          className="text-base md:text-lg lg:text-xl text-zinc-400 mb-12 md:mb-16 lg:mb-20 leading-relaxed max-w-2xl mx-auto px-4"
        >
          A Framework for Understanding Group Dynamics and Team Coordination
        </motion.p>

        {/* Pillar Connection Graph - Hero Panel */}
        <motion.div
          variants={subtle.stagger.item}
          className="relative w-full max-w-4xl flex justify-center items-center mx-auto mb-12 md:mb-16 lg:mb-24 px-4"
        >
          <div className="relative w-full">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={80}
              inactiveZone={0.01}
              borderWidth={2}
            />
            {/* Mode Toggle Button - Top Left */}
            <div className="absolute top-4 left-4 z-10">
              <button
                onClick={() => setGraphMode(graphMode === 'egalitarian' ? 'hierarchical' : 'egalitarian')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all backdrop-blur-sm border ${
                  graphMode === 'egalitarian' 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30 hover:bg-amber-500/30'
                }`}
              >
                {graphMode === 'egalitarian' ? 'Egalitarian' : 'Hierarchical'}
              </button>
            </div>
            <HomeConnectionGraph mode={graphMode} />
          </div>
        </motion.div>

        {/* Research Backed CTA Panel */}
        <motion.div
          variants={subtle.stagger.item}
          className="mb-12 md:mb-16 max-w-3xl mx-auto px-4"
        >
          <div className="relative p-6 md:p-8 rounded-2xl md:rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-pink-500/10 rounded-3xl" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4 text-center">Research Backed Collaboration</h3>
              <p className="text-zinc-300 text-sm md:text-base leading-relaxed text-center">
                Teams from all sectors and sizes are already benefitting from <span className="font-bold text-violet-400">Compilar</span>. 
                <br />
                <br />
                Built on decades of research in organizational psychology, 
                evolutionary cooperation, and group dynamics, the framework provides <span className="font-bold text-violet-400">evidence-based insights</span> that transform how teams coordinate, 
                communicate, and achieve collective success. Whether you're leading a startup, managing enterprise teams, or studying organizational 
                behavior, Compilar offers a <span className="font-bold text-violet-400">scientifically grounded approach</span> to understanding and optimizing group performance.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Animated Divider */}
        <motion.div
          variants={subtle.stagger.item}
          className="mb-16"
        >
          <motion.div
            className="w-32 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent mx-auto"
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>


      </motion.div>

      {/* Floating elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 right-20 w-16 h-16 rounded-2xl bg-violet-500/20 border border-violet-500/30 hidden lg:block"
      />
      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-32 left-20 w-12 h-12 rounded-full bg-pink-500/20 border border-pink-500/30 hidden lg:block"
      />
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-40 left-32 w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hidden lg:block"
      />
      </motion.div>
    </div>
  );
}