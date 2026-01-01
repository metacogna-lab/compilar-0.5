import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, MessageCircle } from 'lucide-react';

const pillarColors = {
  purpose: 'from-violet-500/20 to-violet-600/5 border-violet-500/30',
  interpersonal: 'from-pink-500/20 to-pink-600/5 border-pink-500/30',
  learning: 'from-indigo-500/20 to-indigo-600/5 border-indigo-500/30',
  action: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30',
  resilience: 'from-amber-500/20 to-amber-600/5 border-amber-500/30',
};

const buttonColors = {
  purpose: 'bg-violet-500 hover:bg-violet-600',
  interpersonal: 'bg-pink-500 hover:bg-pink-600',
  learning: 'bg-indigo-500 hover:bg-indigo-600',
  action: 'bg-emerald-500 hover:bg-emerald-600',
  resilience: 'bg-amber-500 hover:bg-amber-600',
};

export default function AssessmentCard({ 
  question, 
  questionNumber,
  totalQuestions,
  pillar = 'purpose',
  onSubmit,
  onSkip 
}) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setIsSubmitting(true);
    await onSubmit(answer);
    setAnswer('');
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'rounded-[28px] p-8 border backdrop-blur-xl',
        'bg-gradient-to-br',
        pillarColors[pillar]
      )}
    >
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, i) => (
            <div 
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i < questionNumber ? 'bg-white' : i === questionNumber ? 'bg-white/80 w-6' : 'bg-white/20'
              )}
            />
          ))}
        </div>
        <span className="text-sm text-zinc-400 ml-auto">
          {questionNumber + 1} of {totalQuestions}
        </span>
      </div>

      {/* Question */}
      <div className="flex items-start gap-4 mb-6">
        <div className={cn('p-3 rounded-2xl', buttonColors[pillar].split(' ')[0])}>
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-xl font-medium text-white leading-relaxed pt-2">
          {question}
        </h3>
      </div>

      {/* Answer input */}
      <Textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Share your thoughts..."
        className={cn(
          'min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-zinc-500',
          'rounded-2xl resize-none focus:ring-2 focus:ring-white/20 focus:border-transparent',
          'text-base leading-relaxed'
        )}
      />

      {/* Actions */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="ghost"
          onClick={onSkip}
          className="text-zinc-400 hover:text-white hover:bg-white/10"
        >
          Skip for now
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!answer.trim() || isSubmitting}
          className={cn(
            'px-6 rounded-xl text-white',
            buttonColors[pillar]
          )}
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}