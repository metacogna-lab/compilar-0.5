import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SparklesCore } from '@/components/ui/sparkles';
import { 
  X, 
  Compass, 
  Heart, 
  BookOpen, 
  Zap, 
  Shield,
  ArrowRight,
  PlayCircle,
  Info,
  TrendingUp,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const pillarConfig = {
  purpose: {
    title: 'Purpose',
    icon: Compass,
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    bgGradient: 'from-violet-500/20 via-violet-600/10 to-transparent',
    description: 'Discover your sense of direction, align with your values, and extract meaning from experiences.',
    subdomains: ['Sense of Direction', 'Values Alignment', 'Meaning Extraction'],
    transitionIcon: Target,
    transitionText: 'Find your North Star'
  },
  interpersonal: {
    title: 'Interpersonal',
    icon: Heart,
    color: 'pink',
    gradient: 'from-pink-500 to-pink-600',
    bgGradient: 'from-pink-500/20 via-pink-600/10 to-transparent',
    description: 'Build empathy, enhance communication, and develop healthy conflict resolution skills.',
    subdomains: ['Empathy', 'Communication', 'Conflict Style'],
    transitionIcon: Heart,
    transitionText: 'Connect deeply'
  },
  learning: {
    title: 'Learning',
    icon: BookOpen,
    color: 'indigo',
    gradient: 'from-indigo-500 to-indigo-600',
    bgGradient: 'from-indigo-500/20 via-indigo-600/10 to-transparent',
    description: 'Cultivate curiosity, master skill acquisition, and practice meaningful reflection.',
    subdomains: ['Curiosity', 'Skill Acquisition', 'Reflection'],
    transitionIcon: Sparkles,
    transitionText: 'Unlock growth'
  },
  action: {
    title: 'Action',
    icon: Zap,
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bgGradient: 'from-emerald-500/20 via-emerald-600/10 to-transparent',
    description: 'Build discipline, generate momentum, and excel at execution.',
    subdomains: ['Discipline', 'Momentum', 'Execution'],
    transitionIcon: Zap,
    transitionText: 'Take the leap'
  },
  resilience: {
    title: 'Resilience',
    icon: Shield,
    color: 'amber',
    gradient: 'from-amber-500 to-amber-600',
    bgGradient: 'from-amber-500/20 via-amber-600/10 to-transparent',
    description: 'Manage stress responses, regulate emotions, and accelerate recovery from setbacks.',
    subdomains: ['Stress Response', 'Emotional Regulation', 'Recovery Speed'],
    transitionIcon: Shield,
    transitionText: 'Build your armor'
  }
};

export default function PillarModal({ 
  pillar, 
  isOpen, 
  onClose, 
  onStartAssessment,
  onViewInfo,
  currentScore,
  isRecommended,
  isCompleted,
  recommendationReason
}) {
  if (!pillar || !isOpen) return null;
  
  const config = pillarConfig[pillar];
  const Icon = config.icon;
  const TransitionIcon = config.transitionIcon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          >
            {/* Sparkles Background */}
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
              <SparklesCore
                id="pillar-modal-sparkles"
                background="transparent"
                minSize={0.3}
                maxSize={1}
                particleDensity={60}
                className="w-full h-full"
                particleColor="#8B5CF6"
                speed={0.4}
              />
            </div>
          </motion.div>
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg z-50"
          >
            <div className={cn(
              'relative rounded-[32px] overflow-hidden',
              'bg-[#0F0F12] border border-white/10',
              'shadow-2xl'
            )}>
              {/* Gradient background */}
              <div className={cn(
                'absolute inset-0 bg-gradient-to-br opacity-50',
                config.bgGradient
              )} />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Content */}
              <div className="relative p-8">
                {/* Header */}
                <div className="flex items-start gap-4 mb-6">
                  <motion.div 
                    initial={{ rotate: -10, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring' }}
                    className={cn('p-4 rounded-2xl bg-gradient-to-br', config.gradient)}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-2xl font-bold text-white">{config.title}</h2>
                      {isRecommended && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Recommended
                        </span>
                      )}
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-400 text-sm">{config.description}</p>
                  </div>
                </div>

                {/* Current Score */}
                {currentScore !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-zinc-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Your Current Score
                      </span>
                      <span className="text-2xl font-bold text-white">{currentScore}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentScore}%` }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className={cn('h-full rounded-full bg-gradient-to-r', config.gradient)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Recommendation reason */}
                {isRecommended && recommendationReason && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20"
                  >
                    <p className="text-sm text-amber-200 flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      {recommendationReason}
                    </p>
                  </motion.div>
                )}

                {/* Subdomains */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-8"
                >
                  <h4 className="text-sm font-medium text-zinc-400 mb-3">Key Areas</h4>
                  <div className="space-y-2">
                    {config.subdomains.map((subdomain, index) => (
                      <motion.div
                        key={subdomain}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className={cn('w-2 h-2 rounded-full bg-gradient-to-r', config.gradient)} />
                        <span className="text-white text-sm">{subdomain}</span>
                        <ChevronRight className="w-4 h-4 text-zinc-500 ml-auto" />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={onStartAssessment}
                    className={cn(
                      'w-full py-6 rounded-2xl text-white font-medium',
                      'bg-gradient-to-r shadow-lg hover:shadow-xl transition-all',
                      config.gradient
                    )}
                  >
                    <TransitionIcon className="w-5 h-5 mr-2" />
                    {config.transitionText}
                    <PlayCircle className="w-5 h-5 ml-2" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    onClick={onViewInfo}
                    className="w-full py-4 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10"
                  >
                    <Info className="w-4 h-4 mr-2" />
                    Learn more about {config.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}