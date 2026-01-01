import React from 'react';
import { Check, X, HelpCircle, Clock } from 'lucide-react';

export default function FeatureStatus({ status, label, description, notes }) {
  const statusConfig = {
    completed: {
      icon: Check,
      color: 'emerald',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400'
    },
    not_achieved: {
      icon: X,
      color: 'red',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-400'
    },
    clarification_needed: {
      icon: HelpCircle,
      color: 'amber',
      bg: 'bg-amber-500/20',
      border: 'border-amber-500/30',
      text: 'text-amber-400'
    },
    in_progress: {
      icon: Clock,
      color: 'indigo',
      bg: 'bg-indigo-500/20',
      border: 'border-indigo-500/30',
      text: 'text-indigo-400'
    }
  };

  const config = statusConfig[status] || statusConfig.clarification_needed;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-lg border ${config.border} ${config.bg}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${config.text} mt-0.5 flex-shrink-0`} />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-white font-medium">{label}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
              {status.replace('_', ' ')}
            </span>
          </div>
          {description && (
            <p className="text-sm text-zinc-400 mb-2">{description}</p>
          )}
          {notes && (
            <p className="text-xs text-zinc-500 italic">{notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}