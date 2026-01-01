import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

export default function AssessmentBreadcrumbs({ currentView, pillarTitle, mode, onNavigate }) {
  const steps = [
    { id: 'overview', name: 'Pillar Selection' },
    { id: 'quiz', name: `Assessing: ${pillarTitle || '...'}` },
    { id: 'completed', name: 'Coaching & Results' },
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentView);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center space-x-2 text-sm text-zinc-500 mb-8"
    >
      {steps.map((step, index) => (
        <div key={step.id} className="contents">
          <button
            onClick={() => index <= currentStepIndex && onNavigate?.(step.id)}
            disabled={index > currentStepIndex}
            className={`font-medium transition-colors ${
              index <= currentStepIndex 
                ? 'text-white hover:text-violet-400 cursor-pointer' 
                : 'text-zinc-500 cursor-not-allowed'
            }`}
          >
            {step.name}
          </button>
          {index < steps.length - 1 && (
            <ChevronRight className="w-4 h-4 text-zinc-600" />
          )}
        </div>
      ))}
    </motion.div>
  );
}