import React from 'react';
import { Link2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConnectionStrengthIndicator({ pillarId, mode, connections }) {
  const relevantConnections = connections.filter(
    c => (c.from === pillarId || c.to === pillarId) && c.modes.includes(mode)
  );

  const strongConnections = relevantConnections.filter(c => c.strength >= 0.85);
  const avgStrength = relevantConnections.length > 0
    ? relevantConnections.reduce((sum, c) => sum + c.strength, 0) / relevantConnections.length
    : 0;

  const getStrengthLabel = (strength) => {
    if (strength >= 0.85) return 'Very Strong';
    if (strength >= 0.7) return 'Strong';
    return 'Moderate';
  };

  const getStrengthColor = (strength) => {
    if (strength >= 0.85) return 'emerald';
    if (strength >= 0.7) return 'amber';
    return 'zinc';
  };

  const strengthColor = getStrengthColor(avgStrength);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <Link2 className={`w-4 h-4 text-${strengthColor}-400`} />
        <span className="text-xs text-zinc-400">
          {relevantConnections.length} connection{relevantConnections.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      {relevantConnections.length > 0 && (
        <>
          <div className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-1 h-3 rounded-full transition-all',
                    i < Math.round(avgStrength * 5)
                      ? `bg-${strengthColor}-400`
                      : 'bg-white/10'
                  )}
                />
              ))}
            </div>
            <span className={`text-xs font-medium text-${strengthColor}-400`}>
              {getStrengthLabel(avgStrength)}
            </span>
          </div>

          {strongConnections.length > 0 && (
            <>
              <div className="h-3 w-px bg-white/10" />
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-[10px] text-emerald-400 font-medium">
                  ★ {strongConnections.length} key
                </span>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}