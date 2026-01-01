import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ArrowLeft, Plus, BookOpen, Target, CheckCircle, Circle,
  Clock, Zap, ChevronRight, Play, Pause, RotateCcw, Sparkles,
  Compass, Heart, Lightbulb, Shield, FileText, MessageSquare,
  Award, TrendingUp, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { generatePersonalizedPath, completePathwayModule } from '@/components/pilar/PersonalizedPathGenerator';
import { generateMicroMissions } from '@/components/pilar/UserIntentAnalytics';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';
import confetti from 'canvas-confetti';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning' },
  action: { icon: Zap, color: 'emerald', label: 'Action' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience' },
};

const moduleTypeIcons = {
  micro_learning: Lightbulb,
  exercise: Target,
  reflection: MessageSquare,
  article: FileText,
  practice: Play,
  assessment: Award,
};

export default function LearningPathways() {
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [activeModule, setActiveModule] = useState(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [moduleNotes, setModuleNotes] = useState('');
  const [moduleRating, setModuleRating] = useState(0);
  
  const queryClient = useQueryClient();

  React.useEffect(() => {
    trackPageView('LearningPathways');
  }, []);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: pathways = [], isLoading } = useQuery({
    queryKey: ['learningPathways', currentUser?.email],
    queryFn: async () => {
      if (!currentUser?.email) return [];
      return base44.entities.LearningPathway.filter({ user_email: currentUser.email });
    },
    enabled: !!currentUser?.email,
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const records = await base44.entities.UserGamification.list();
      return records[0];
    },
  });

  const createPathwayMutation = useMutation({
    mutationFn: async (pillar) => {
      return generatePersonalizedPath(currentUser.email, userProfile, { targetPillar: pillar });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['learningPathways']);
      setShowCreateDialog(false);
      setSelectedPillar(null);
    },
  });

  const completeModuleMutation = useMutation({
    mutationFn: async ({ pathwayId, moduleId, notes, rating }) => {
      return completePathwayModule(pathwayId, moduleId, notes, rating);
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries(['learningPathways']);
      
      // Award points
      if (gamification && result.points > 0) {
        const newPoints = (gamification.total_points || 0) + result.points;
        await base44.entities.UserGamification.update(gamification.id, {
          total_points: newPoints,
          points_history: [
            ...(gamification.points_history || []),
            { points: result.points, reason: 'Module completed', earned_at: new Date().toISOString() }
          ]
        });
        queryClient.invalidateQueries(['gamification']);
      }
      
      // Celebration for pathway completion
      if (result.isCompleted) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      
      setActiveModule(null);
      setModuleNotes('');
      setModuleRating(0);
    },
  });

  const activePathways = pathways.filter(p => p.status === 'active');
  const completedPathways = pathways.filter(p => p.status === 'completed');

  const scores = userProfile?.pillar_scores || {};
  const weakestPillars = Object.entries(scores)
    .filter(([_, score]) => score > 0)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([pillar]) => pillar);

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('GlobalMap')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white">Learning Pathways</h1>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Pathway
        </Button>
        <ProfileAvatar user={currentUser} size="sm" />
      </div>

      <div className="relative z-10 p-4 max-w-4xl mx-auto">
        {/* Active Pathways */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            Active Learning Paths
          </h2>
          
          {activePathways.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/20 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Start Your Learning Journey</h3>
              <p className="text-zinc-400 mb-4">Create a personalized pathway based on your PILAR profile.</p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Pathway
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {activePathways.map((pathway, index) => {
                const config = pillarConfig[pathway.target_pillar];
                const Icon = config?.icon || BookOpen;
                
                return (
                  <motion.div
                    key={pathway.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01]",
                      `bg-gradient-to-br from-${config?.color}-500/10 to-transparent`,
                      `border-${config?.color}-500/30 hover:border-${config?.color}-500/50`
                    )}
                    onClick={() => setSelectedPathway(pathway)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-${config?.color}-500/20`}>
                          <Icon className={`w-5 h-5 text-${config?.color}-400`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{pathway.title}</h3>
                          <p className="text-sm text-zinc-400">{pathway.difficulty_level} • {pathway.estimated_duration_days} days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold text-${config?.color}-400`}>{pathway.current_progress}%</p>
                        <p className="text-xs text-zinc-500">{pathway.modules_completed}/{pathway.modules?.length} modules</p>
                      </div>
                    </div>
                    
                    <Progress value={pathway.current_progress} className="h-2 mb-3" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Target className="w-3.5 h-3.5" />
                          {pathway.starting_score}% → {pathway.target_score}%
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          {pathway.modules?.reduce((sum, m) => sum + (m.completed ? 0 : m.points), 0)} pts remaining
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Pathways */}
        {completedPathways.length > 0 && (
          <div>
            <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              Completed Pathways
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {completedPathways.map((pathway) => {
                const config = pillarConfig[pathway.target_pillar];
                return (
                  <motion.div
                    key={pathway.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                      <div>
                        <p className="font-medium text-white">{pathway.title}</p>
                        <p className="text-xs text-zinc-400">
                          Completed {new Date(pathway.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Pathway Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Create Learning Pathway</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-sm text-zinc-400">Choose a pillar to focus on:</p>
            
            {weakestPillars.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-4">
                <p className="text-xs text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Recommended based on your profile
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(pillarConfig).map(([pillar, config]) => {
                const Icon = config.icon;
                const isRecommended = weakestPillars.includes(pillar);
                const score = scores[pillar];
                
                return (
                  <button
                    key={pillar}
                    onClick={() => setSelectedPillar(pillar)}
                    className={cn(
                      "p-4 rounded-xl text-left transition-all relative",
                      selectedPillar === pillar
                        ? `bg-${config.color}-500/30 border-2 border-${config.color}-500`
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    )}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </span>
                    )}
                    <Icon className={`w-6 h-6 text-${config.color}-400 mb-2`} />
                    <p className="font-medium text-white">{config.label}</p>
                    {score !== undefined && (
                      <p className="text-xs text-zinc-400">Current: {score}%</p>
                    )}
                  </button>
                );
              })}
            </div>
            
            <Button
              onClick={() => createPathwayMutation.mutate(selectedPillar)}
              disabled={!selectedPillar || createPathwayMutation.isPending}
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
            >
              {createPathwayMutation.isPending ? 'Creating...' : 'Create Pathway'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pathway Detail Dialog */}
      <Dialog open={!!selectedPathway} onOpenChange={() => setSelectedPathway(null)}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedPathway && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {React.createElement(pillarConfig[selectedPathway.target_pillar]?.icon || BookOpen, {
                    className: `w-5 h-5 text-${pillarConfig[selectedPathway.target_pillar]?.color}-400`
                  })}
                  {selectedPathway.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-2">
                <p className="text-sm text-zinc-400">{selectedPathway.description}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-2 py-1 rounded bg-white/10 text-zinc-300">
                    {selectedPathway.difficulty_level}
                  </span>
                  <span className="text-zinc-400">
                    {selectedPathway.current_progress}% complete
                  </span>
                </div>
                
                <Progress value={selectedPathway.current_progress} className="h-2" />
                
                {/* Modules List */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-zinc-300">Modules</h4>
                  {selectedPathway.modules?.map((module, index) => {
                    const ModuleIcon = moduleTypeIcons[module.module_type] || Circle;
                    const isLocked = index > 0 && !selectedPathway.modules[index - 1]?.completed;
                    
                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "p-3 rounded-xl flex items-center gap-3 transition-all",
                          module.completed 
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : isLocked
                              ? "bg-white/5 border border-white/5 opacity-50"
                              : "bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer"
                        )}
                        onClick={() => !module.completed && !isLocked && setActiveModule(module)}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          module.completed ? "bg-emerald-500" : "bg-white/10"
                        )}>
                          {module.completed ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <ModuleIcon className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm font-medium truncate",
                            module.completed ? "text-emerald-400" : "text-white"
                          )}>
                            {module.title}
                          </p>
                          <p className="text-xs text-zinc-500 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            {module.duration_minutes} min
                            <Zap className="w-3 h-3 text-amber-400" />
                            {module.points} pts
                          </p>
                        </div>
                        {!module.completed && !isLocked && (
                          <ChevronRight className="w-4 h-4 text-zinc-500" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Module Detail Dialog */}
      <Dialog open={!!activeModule} onOpenChange={() => setActiveModule(null)}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-md">
          {activeModule && (
            <>
              <DialogHeader>
                <DialogTitle>{activeModule.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {activeModule.duration_minutes} minutes
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    {activeModule.points} points
                  </span>
                </div>
                
                <p className="text-sm text-zinc-300">{activeModule.description}</p>
                
                {activeModule.content && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-zinc-300 leading-relaxed">{activeModule.content}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">Notes (optional)</label>
                  <Textarea
                    value={moduleNotes}
                    onChange={(e) => setModuleNotes(e.target.value)}
                    placeholder="Capture your reflections..."
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">How helpful was this? (optional)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setModuleRating(star)}
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                          moduleRating >= star ? "bg-amber-500 text-white" : "bg-white/10 text-zinc-500"
                        )}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
                
                <Button
                  onClick={() => completeModuleMutation.mutate({
                    pathwayId: selectedPathway?.id,
                    moduleId: activeModule.id,
                    notes: moduleNotes,
                    rating: moduleRating || null
                  })}
                  disabled={completeModuleMutation.isPending}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                >
                  {completeModuleMutation.isPending ? 'Completing...' : 'Mark as Complete'}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}