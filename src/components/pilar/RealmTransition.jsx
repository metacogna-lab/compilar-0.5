import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Heart, BookOpen, Zap, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REALM_DATA = {
  purpose: {
    name: 'The Command Spire',
    icon: Compass,
    color: 'violet',
    gradient: 'from-violet-600 to-purple-800',
    particle: '⚔',
  },
  interpersonal: {
    name: 'The Allied Encampment',
    icon: Heart,
    color: 'pink',
    gradient: 'from-pink-600 to-rose-800',
    particle: '⚜',
  },
  learning: {
    name: 'The War Academy',
    icon: BookOpen,
    color: 'indigo',
    gradient: 'from-indigo-600 to-blue-800',
    particle: '📜',
  },
  action: {
    name: 'The Siege Forge',
    icon: Zap,
    color: 'emerald',
    gradient: 'from-emerald-600 to-green-800',
    particle: '⚡',
  },
  resilience: {
    name: 'The Unbreached Fortress',
    icon: Shield,
    color: 'amber',
    gradient: 'from-amber-600 to-orange-800',
    particle: '🛡',
  },
};

export default function RealmTransition({ 
  fromPillar, 
  toPillar, 
  isVisible, 
  onTransitionComplete,
  recommendation 
}) {
  const toRealm = REALM_DATA[toPillar] || REALM_DATA.purpose;
  const ToIcon = toRealm.icon;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-lg"
        >
          {/* Magical particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: window.innerHeight + 20,
                  opacity: 0 
                }}
                animate={{ 
                  y: -20,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                }}
                className={`absolute text-2xl text-${toRealm.color}-400`}
              >
                {toRealm.particle}
              </motion.div>
            ))}
          </div>

          {/* Transition content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-center px-6 max-w-md"
          >
            {/* Realm portal */}
            <motion.div
              animate={{ 
                rotate: 360,
                boxShadow: [
                  `0 0 40px 10px rgba(var(--${toRealm.color}-500), 0.3)`,
                  `0 0 60px 20px rgba(var(--${toRealm.color}-500), 0.5)`,
                  `0 0 40px 10px rgba(var(--${toRealm.color}-500), 0.3)`,
                ]
              }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: 'linear' }, boxShadow: { duration: 2, repeat: Infinity } }}
              className={`w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br ${toRealm.gradient} flex items-center justify-center border-4 border-white/20`}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ToIcon className="w-16 h-16 text-white" />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className={`w-5 h-5 text-${toRealm.color}-400`} />
                <span className="text-sm text-zinc-400 uppercase tracking-wider">Campaign Continues</span>
                <Sparkles className={`w-5 h-5 text-${toRealm.color}-400`} />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                {toRealm.name}
              </h2>
              
              {recommendation && (
                <p className="text-zinc-400 mb-6 italic">
                  "{recommendation}"
                </p>
              )}

              <Button
                onClick={onTransitionComplete}
                className={`bg-gradient-to-r ${toRealm.gradient} text-white px-8 py-6 rounded-2xl text-lg font-medium shadow-2xl hover:scale-105 transition-transform`}
              >
                Deploy to Theatre
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}