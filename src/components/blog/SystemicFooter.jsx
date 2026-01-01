import React from 'react';
import { Lightbulb, TrendingUp } from 'lucide-react';
import PillarBadge from './PillarBadge';

export default function SystemicFooter({ pillar, force_vector, tags, forceExplanation }) {
  if (!pillar && !force_vector) return null;

  const forceVectorExplanations = {
    'Status': 'Formal hierarchical authority that enables command and resource control.',
    'Direct Reciprocity': 'Conditional exchange where help is traded bilaterally with clear expectations.',
    'Normative Expression': 'Defense of status quo through suppression of dissent and reward for conformity.',
    'Incoming Respect': 'Perceived competence and trustworthiness from superiors and peers.',
    'Own Prospects': 'Personal advancement likelihood within the hierarchical structure.',
    'Popularity': 'Informal influence through warmth, acceptance, and social connection.',
    'Indirect Reciprocity': 'Unconditional help that circulates through the group without direct return.',
    'Diverse Expression': 'Psychological safety to challenge norms and voice dissenting opinions.',
    'Outgoing Respect': 'Trust in colleagues\' competence and willingness to delegate.',
    'Group Prospects': 'Collective confidence in achieving shared goals and vision.'
  };

  const explanation = forceExplanation || forceVectorExplanations[force_vector] || 'A behavioral force influencing systemic outcomes.';

  return (
    <div className="mt-16 pt-8 border-t border-white/10">
      <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-2xl p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-violet-500/20 rounded-lg">
            <Lightbulb className="w-6 h-6 text-violet-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Systemic Context</h3>
            <p className="text-zinc-400 text-sm">
              This content is aligned with the PILAR Theory framework, which analyzes organizational and social systems through five core pillars and their dynamic force interactions.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pillar && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-violet-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-zinc-300">Primary Pillar</h4>
              </div>
              <PillarBadge pillar={pillar} className="text-base px-4 py-2" />
              <p className="text-xs text-zinc-500 mt-3">
                This content primarily addresses the <strong className="text-white">{pillar}</strong> pillar, focusing on how this aspect influences systemic behavior and outcomes.
              </p>
            </div>
          )}

          {force_vector && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-zinc-300">Dominant Force Vector</h4>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span className="text-base font-semibold text-indigo-300">{force_vector}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-3">
                {explanation}
              </p>
            </div>
          )}
        </div>

        {tags && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="text-xs text-zinc-500 mb-2">Related Tags</div>
            <div className="flex flex-wrap gap-2">
              {tags.split(',').map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-zinc-400">
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-black/20 rounded-lg">
          <p className="text-xs text-zinc-500 italic">
            The PILAR Theory provides a comprehensive framework for understanding how social forces shape organizational behavior, individual development, and systemic outcomes. Each piece of content is tagged to help you navigate the interconnected dynamics of human systems.
          </p>
        </div>
      </div>
    </div>
  );
}