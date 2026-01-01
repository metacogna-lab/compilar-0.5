import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Target, Users, Clock, AlertTriangle, CheckCircle, 
  Play, Briefcase, Shield, Zap, Award, ChevronRight,
  UserCheck, TrendingUp, FileText, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const DIFFICULTY_CONFIG = {
  routine: { label: 'Routine', color: 'emerald', multiplier: 1 },
  challenging: { label: 'Challenging', color: 'amber', multiplier: 1.5 },
  critical: { label: 'Critical', color: 'orange', multiplier: 2 },
  legendary: { label: 'Legendary', color: 'violet', multiplier: 3 },
};

const OPERATION_TYPES = {
  strategic: { label: 'Strategic Planning', icon: Target, description: 'Long-term objective coordination' },
  tactical: { label: 'Tactical Execution', icon: Zap, description: 'Immediate action operations' },
  reconnaissance: { label: 'Intelligence Gathering', icon: FileText, description: 'Assessment and analysis missions' },
  coordination: { label: 'Cross-Unit Coordination', icon: Users, description: 'Multi-team collaboration' },
  crisis_response: { label: 'Crisis Response', icon: AlertTriangle, description: 'Time-sensitive critical operations' },
};

export default function CooperativeOperations({ battalion, currentUser }) {
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const queryClient = useQueryClient();

  const { data: operations = [] } = useQuery({
    queryKey: ['operations', battalion?.id],
    queryFn: () => base44.entities.CooperativeOperation.filter({ battalion_id: battalion?.id }),
    enabled: !!battalion?.id,
  });

  const activeOperations = operations.filter(o => o.status === 'active');
  const completedOperations = operations.filter(o => o.status === 'completed');

  const generateOperationMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Generate AI scenario
      const scenario = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a professional leadership development scenario for a team called "${battalion.name}" with ${battalion.officers?.length || 1} members. 
        
        The scenario should:
        1. Require coordination between multiple team members
        2. Focus on leadership competencies (purpose, interpersonal skills, learning, action, resilience)
        3. Be realistic and applicable to professional environments
        4. Include 3-4 specific objectives that different team members can contribute to
        5. Use formal, professional language throughout
        
        Battalion specialization: ${battalion.specialization}`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            briefing: { type: "string" },
            operation_type: { type: "string", enum: ["strategic", "tactical", "reconnaissance", "coordination", "crisis_response"] },
            target_pillar: { type: "string", enum: ["purpose", "interpersonal", "learning", "action", "resilience", "multi_pillar"] },
            difficulty: { type: "string", enum: ["routine", "challenging", "critical", "legendary"] },
            objectives: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  description: { type: "string" },
                  required_contributors: { type: "number" },
                  target_value: { type: "number" }
                }
              }
            },
            narrative: { type: "string" },
            success_criteria: { type: "string" }
          }
        }
      });

      const diffConfig = DIFFICULTY_CONFIG[scenario.difficulty] || DIFFICULTY_CONFIG.challenging;
      
      return base44.entities.CooperativeOperation.create({
        operation_id: `OP-${Date.now()}`,
        battalion_id: battalion.id,
        title: scenario.title,
        briefing: scenario.briefing,
        operation_type: scenario.operation_type,
        target_pillar: scenario.target_pillar,
        difficulty: scenario.difficulty,
        objectives: scenario.objectives.map((obj, i) => ({
          id: `OBJ-${i + 1}`,
          description: obj.description,
          required_contributors: obj.required_contributors || 1,
          current_contributors: [],
          target_value: obj.target_value || 100,
          current_value: 0,
          completed: false
        })),
        required_personnel: Math.min(battalion.officers?.length || 2, 4),
        assigned_personnel: [],
        rewards: {
          battalion_points: Math.round(100 * diffConfig.multiplier),
          individual_points: Math.round(50 * diffConfig.multiplier),
        },
        time_limit_hours: scenario.difficulty === 'legendary' ? 72 : scenario.difficulty === 'critical' ? 48 : 168,
        started_at: new Date().toISOString(),
        deadline: new Date(Date.now() + (scenario.difficulty === 'legendary' ? 72 : scenario.difficulty === 'critical' ? 48 : 168) * 60 * 60 * 1000).toISOString(),
        status: 'briefing',
        ai_scenario: {
          scenario_type: scenario.operation_type,
          narrative: scenario.narrative,
          outcome: scenario.success_criteria
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operations']);
      setIsGenerating(false);
    },
    onError: () => {
      setIsGenerating(false);
    }
  });

  const joinOperationMutation = useMutation({
    mutationFn: async (operation) => {
      const updatedPersonnel = [
        ...(operation.assigned_personnel || []),
        {
          email: currentUser?.email,
          role: 'Field Officer',
          contribution: 0,
          tasks_completed: 0
        }
      ];
      
      return base44.entities.CooperativeOperation.update(operation.id, {
        assigned_personnel: updatedPersonnel,
        status: updatedPersonnel.length >= operation.required_personnel ? 'active' : 'briefing'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operations']);
    }
  });

  const contributeToObjectiveMutation = useMutation({
    mutationFn: async ({ operation, objectiveId, contribution }) => {
      const updatedObjectives = operation.objectives.map(obj => {
        if (obj.id === objectiveId) {
          const newContributors = obj.current_contributors.includes(currentUser?.email)
            ? obj.current_contributors
            : [...obj.current_contributors, currentUser?.email];
          const newValue = Math.min(obj.target_value, obj.current_value + contribution);
          return {
            ...obj,
            current_contributors: newContributors,
            current_value: newValue,
            completed: newValue >= obj.target_value
          };
        }
        return obj;
      });

      const allCompleted = updatedObjectives.every(o => o.completed);
      
      // Update personnel contribution
      const updatedPersonnel = operation.assigned_personnel.map(p => {
        if (p.email === currentUser?.email) {
          return { ...p, contribution: p.contribution + contribution, tasks_completed: p.tasks_completed + 1 };
        }
        return p;
      });

      await base44.entities.CooperativeOperation.update(operation.id, {
        objectives: updatedObjectives,
        assigned_personnel: updatedPersonnel,
        status: allCompleted ? 'completed' : 'active',
        completed_at: allCompleted ? new Date().toISOString() : null
      });

      // If completed, update battalion points
      if (allCompleted) {
        await base44.entities.Battalion.update(battalion.id, {
          total_points: (battalion.total_points || 0) + operation.rewards.battalion_points,
          missions_completed: (battalion.missions_completed || 0) + 1
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operations']);
      queryClient.invalidateQueries(['battalions']);
    }
  });

  const isAssigned = (operation) => operation.assigned_personnel?.some(p => p.email === currentUser?.email);

  const getTimeRemaining = (deadline) => {
    const remaining = new Date(deadline) - new Date();
    if (remaining < 0) return 'Expired';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h remaining`;
    return `${hours}h remaining`;
  };

  if (!battalion) {
    return (
      <div className="text-center py-8 rounded-xl bg-white/5 border border-white/10">
        <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400">Select a battalion to view operations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-400" />
            Cooperative Operations
          </h3>
          <p className="text-sm text-zinc-400">{battalion.name}</p>
        </div>
        <Button
          onClick={() => generateOperationMutation.mutate()}
          disabled={isGenerating}
          className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              Generate Mission
            </>
          )}
        </Button>
      </div>

      {/* Active Operations */}
      {operations.filter(o => ['briefing', 'active'].includes(o.status)).length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400 uppercase tracking-wider">Active Deployments</p>
          {operations.filter(o => ['briefing', 'active'].includes(o.status)).map((operation, i) => {
            const typeConfig = OPERATION_TYPES[operation.operation_type] || OPERATION_TYPES.tactical;
            const diffConfig = DIFFICULTY_CONFIG[operation.difficulty] || DIFFICULTY_CONFIG.challenging;
            const TypeIcon = typeConfig.icon;
            const totalProgress = operation.objectives?.length > 0
              ? Math.round(operation.objectives.reduce((sum, o) => sum + (o.current_value / o.target_value) * 100, 0) / operation.objectives.length)
              : 0;
            const assigned = isAssigned(operation);

            return (
              <motion.div
                key={operation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "p-5 rounded-xl border backdrop-blur-sm",
                  operation.status === 'active' 
                    ? "bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/30"
                    : "bg-white/5 border-white/10"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-xl bg-${diffConfig.color}-500/20`}>
                      <TypeIcon className={`w-5 h-5 text-${diffConfig.color}-400`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{operation.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs bg-${diffConfig.color}-500/20 text-${diffConfig.color}-400`}>
                          {diffConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2">{operation.briefing}</p>
                    </div>
                  </div>
                </div>

                {/* Progress & Stats */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-zinc-400">Mission Progress</span>
                    <span className="text-white font-medium">{totalProgress}%</span>
                  </div>
                  <Progress value={totalProgress} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400">
                      <Users className="w-4 h-4" />
                      <span className="font-bold">{operation.assigned_personnel?.length || 0}/{operation.required_personnel}</span>
                    </div>
                    <p className="text-xs text-zinc-500">Personnel</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="flex items-center justify-center gap-1 text-amber-400">
                      <Award className="w-4 h-4" />
                      <span className="font-bold">{operation.rewards?.battalion_points}</span>
                    </div>
                    <p className="text-xs text-zinc-500">Reward</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="flex items-center justify-center gap-1 text-orange-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <p className="text-xs text-zinc-500">{getTimeRemaining(operation.deadline)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!assigned ? (
                    <Button
                      onClick={() => joinOperationMutation.mutate(operation)}
                      disabled={joinOperationMutation.isPending}
                      className="flex-1 bg-violet-500 hover:bg-violet-600 text-white"
                    >
                      <UserCheck className="w-4 h-4 mr-2" />
                      Accept Assignment
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSelectedOperation(operation);
                        setShowBriefing(true);
                      }}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute Objectives
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedOperation(operation);
                      setShowBriefing(true);
                    }}
                    className="border-white/20 text-zinc-400 hover:bg-white/10"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 rounded-xl bg-white/5 border border-white/10">
          <Target className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h4 className="text-white font-medium mb-2">No Active Operations</h4>
          <p className="text-zinc-400 text-sm">
            Generate a new mission to deploy your battalion.
          </p>
        </div>
      )}

      {/* Completed Operations */}
      {completedOperations.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-zinc-400 uppercase tracking-wider">Completed Missions ({completedOperations.length})</p>
          <div className="grid gap-2">
            {completedOperations.slice(0, 3).map((operation) => (
              <div key={operation.id} className="p-3 rounded-lg bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-white text-sm">{operation.title}</span>
                </div>
                <span className="text-amber-400 font-medium">+{operation.rewards?.battalion_points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operation Briefing Dialog */}
      <Dialog open={showBriefing} onOpenChange={setShowBriefing}>
        <DialogContent className="bg-[#0F0F12] border-white/10 text-white max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Operation Briefing
            </DialogTitle>
          </DialogHeader>
          {selectedOperation && (
            <div className="space-y-4 pt-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedOperation.title}</h3>
                <p className="text-zinc-400">{selectedOperation.briefing}</p>
              </div>

              {selectedOperation.ai_scenario?.narrative && (
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/30">
                  <p className="text-sm text-violet-200 italic">"{selectedOperation.ai_scenario.narrative}"</p>
                </div>
              )}

              <div>
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Mission Objectives
                </h4>
                <div className="space-y-3">
                  {selectedOperation.objectives?.map((obj, i) => (
                    <div key={obj.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm text-white">{obj.description}</p>
                        {obj.completed && <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      </div>
                      <Progress value={(obj.current_value / obj.target_value) * 100} className="h-1.5 mb-2" />
                      <div className="flex justify-between text-xs text-zinc-500">
                        <span>{obj.current_contributors?.length || 0}/{obj.required_contributors} contributors</span>
                        <span>{obj.current_value}/{obj.target_value}</span>
                      </div>
                      {isAssigned(selectedOperation) && !obj.completed && (
                        <Button
                          size="sm"
                          onClick={() => contributeToObjectiveMutation.mutate({
                            operation: selectedOperation,
                            objectiveId: obj.id,
                            contribution: 25
                          })}
                          disabled={contributeToObjectiveMutation.isPending}
                          className="w-full mt-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Contribute Progress
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Completion Reward</span>
                  <span className="text-amber-400 font-bold">+{selectedOperation.rewards?.battalion_points} Battalion Points</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}