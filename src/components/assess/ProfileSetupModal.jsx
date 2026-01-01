import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Briefcase, Target, X, ArrowRight, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import GoalEnrichmentModal from './GoalEnrichmentModal';

export default function ProfileSetupModal({ user, existingProfile, onComplete, onSkip }) {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    position: '',
    goal: '',
    life_complications: ''
  });
  const [showLifeComplications, setShowLifeComplications] = useState(false);
  const [showGoalEnrichment, setShowGoalEnrichment] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        full_name: existingProfile?.full_name || user.full_name || '',
        email: existingProfile?.email || user.email || ''
      }));
    }
    if (existingProfile) {
      setFormData(prev => ({
        ...prev,
        position: existingProfile.position || '',
        goal: existingProfile.goal || '',
        life_complications: existingProfile.life_complications || ''
      }));
      if (existingProfile.life_complications) {
        setShowLifeComplications(true);
      }
    }
  }, [user, existingProfile]);

  const handleEnhanceGoal = () => {
    if (!formData.goal || formData.goal.trim().length < 10) {
      toast.error('Please write a goal first (at least 10 characters)');
      return;
    }
    setShowGoalEnrichment(true);
  };

  const handleGoalEnrichmentComplete = (selectedGoal) => {
    setFormData(prev => ({ ...prev, goal: selectedGoal }));
    setShowGoalEnrichment(false);
  };

  const handleGoalEnrichmentSkip = () => {
    setShowGoalEnrichment(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onComplete(formData);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-lg w-full bg-gradient-to-br from-white/15 to-white/5 rounded-3xl border-2 border-white/20 backdrop-blur-xl p-8 shadow-2xl"
        >
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/10 flex items-center justify-center border border-violet-500/30">
              <User className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Personalize Your Journey</h2>
            <p className="text-sm text-zinc-400">
              Help us track your progress and provide tailored insights
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Position / Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 z-10 pointer-events-none" />
                <Select
                  value={formData.position}
                  onValueChange={(value) => setFormData({ ...formData, position: value })}
                  required
                >
                  <SelectTrigger className="pl-10 bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Executive/C-Suite">Executive/C-Suite</SelectItem>
                    <SelectItem value="Public Office">Public Office</SelectItem>
                    <SelectItem value="Developer">Developer</SelectItem>
                    <SelectItem value="Founder">Founder</SelectItem>
                    <SelectItem value="Business/Marketing Leader">Business/Marketing Leader</SelectItem>
                    <SelectItem value="Curious Employee">Curious Employee</SelectItem>
                    <SelectItem value="Thought Leader">Thought Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Goal <span className="text-zinc-500">(Optional)</span>
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                <Textarea
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 min-h-[80px]"
                  placeholder="What do you hope to achieve with PILAR?"
                />
              </div>
              {formData.goal && formData.goal.trim().length >= 10 && (
                <Button
                  type="button"
                  onClick={handleEnhanceGoal}
                  size="sm"
                  className="mt-2 bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30 hover:from-violet-500/30 hover:to-pink-500/30 text-violet-300"
                >
                  <Sparkles className="w-3 h-3 mr-1.5" />
                  Enhance for PILAR Alignment
                </Button>
              )}
              <p className="text-xs text-zinc-500 mt-1.5">
                Our AI will refine your goal to align with PILAR theory principles
              </p>
            </div>

            {!showLifeComplications ? (
              <button
                type="button"
                onClick={() => setShowLifeComplications(true)}
                className="flex items-center text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add current life challenges (optional)
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-zinc-300">
                  Current Life Challenges <span className="text-zinc-500">(Optional)</span>
                </label>
                <Textarea
                  value={formData.life_complications}
                  onChange={(e) => setFormData({ ...formData, life_complications: e.target.value })}
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 min-h-[80px]"
                  placeholder="e.g., Managing work-life balance, organizational changes, health concerns..."
                />
                <p className="text-xs text-zinc-500">
                  This helps us provide more contextual guidance tailored to your situation
                </p>
              </motion.div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onSkip}
                variant="outline"
                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 text-white"
              >
                Skip for now
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {showGoalEnrichment && (
        <GoalEnrichmentModal
          goal={formData.goal}
          position={formData.position}
          lifeComplications={formData.life_complications}
          onComplete={handleGoalEnrichmentComplete}
          onSkip={handleGoalEnrichmentSkip}
          userProfile={existingProfile}
        />
      )}
    </AnimatePresence>
  );
}