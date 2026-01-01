import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Calendar, CheckCircle, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ModeTransitionPlanner({ team, teamId }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    from_mode: 'egalitarian',
    to_mode: 'hierarchical',
    trigger: '',
    planned_date: '',
    notes: ''
  });
  const queryClient = useQueryClient();

  const addPlanMutation = useMutation({
    mutationFn: async (data) => {
      const newPlan = {
        plan_uuid: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...data,
        completed: false
      };

      const existingPlans = team?.shared_workspace?.mode_transition_plans || [];
      const updatedWorkspace = {
        ...team.shared_workspace,
        mode_transition_plans: [...existingPlans, newPlan]
      };

      return base44.entities.Team.update(teamId, { shared_workspace: updatedWorkspace });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
      setShowForm(false);
      setFormData({
        from_mode: 'egalitarian',
        to_mode: 'hierarchical',
        trigger: '',
        planned_date: '',
        notes: ''
      });
    },
  });

  const toggleCompleteMutation = useMutation({
    mutationFn: async (planUuid) => {
      const plans = team?.shared_workspace?.mode_transition_plans || [];
      const updatedPlans = plans.map(p =>
        p.plan_uuid === planUuid ? { ...p, completed: !p.completed } : p
      );

      const updatedWorkspace = {
        ...team.shared_workspace,
        mode_transition_plans: updatedPlans
      };

      return base44.entities.Team.update(teamId, { shared_workspace: updatedWorkspace });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['team', teamId]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addPlanMutation.mutate(formData);
  };

  const plans = team?.shared_workspace?.mode_transition_plans || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Mode Transition Plans</h3>
        <Button
          onClick={() => setShowForm(!showForm)}
          size="sm"
          className="bg-violet-500/20 hover:bg-violet-500/30 text-violet-300"
        >
          <Plus className="w-4 h-4 mr-2" />
          Plan Transition
        </Button>
      </div>

      {showForm && (
        <motion.form
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          onSubmit={handleSubmit}
          className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-4"
        >
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">From Mode</label>
              <Select value={formData.from_mode} onValueChange={(value) => setFormData({...formData, from_mode: value})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="egalitarian">Egalitarian</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">To Mode</label>
              <Select value={formData.to_mode} onValueChange={(value) => setFormData({...formData, to_mode: value})}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="egalitarian">Egalitarian</SelectItem>
                  <SelectItem value="hierarchical">Hierarchical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Trigger/Context</label>
            <Input
              value={formData.trigger}
              onChange={(e) => setFormData({...formData, trigger: e.target.value})}
              placeholder="e.g., Sprint planning, Crisis response"
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Planned Date</label>
            <Input
              type="date"
              value={formData.planned_date}
              onChange={(e) => setFormData({...formData, planned_date: e.target.value})}
              className="bg-white/5 border-white/10 text-white"
              required
            />
          </div>

          <div>
            <label className="text-sm text-zinc-400 mb-2 block">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional context or preparation needed..."
              className="bg-white/5 border-white/10 text-white"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={addPlanMutation.isPending}>
              Create Plan
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </motion.form>
      )}

      {/* Plans List */}
      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No mode transitions planned yet</p>
          </div>
        ) : (
          plans.map((plan) => (
            <motion.div
              key={plan.plan_uuid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="flex items-start justify-between">
                <button
                  onClick={() => toggleCompleteMutation.mutate(plan.plan_uuid)}
                  className="mr-3 mt-1"
                >
                  {plan.completed ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-500" />
                  )}
                </button>
                <div className="flex-1">
                  <h4 className={`font-semibold mb-1 ${plan.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                    {plan.from_mode} → {plan.to_mode}
                  </h4>
                  <p className="text-sm text-zinc-400 mb-2">{plan.trigger}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(plan.planned_date).toLocaleDateString()}
                  </div>
                  {plan.notes && (
                    <p className="text-sm text-zinc-400 mt-2 italic">{plan.notes}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}