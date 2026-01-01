import React from 'react';
import { motion } from 'framer-motion';
import { Users, Award, Network, TrendingUp } from 'lucide-react';

export default function ModeInfoBanner({ mode }) {
  const modeInfo = {
    egalitarian: {
      title: 'Egalitarian Mode',
      subtitle: 'Collaborative Excellence Through Shared Vision',
      icon: Users,
      color: 'indigo',
      features: [
        { icon: Network, label: 'Peer Networks', description: 'Equal collaboration' },
        { icon: Users, label: 'Collective Goals', description: 'Shared ownership' },
        { icon: TrendingUp, label: 'Mutual Growth', description: 'Rising together' }
      ],
      gradient: 'from-indigo-500/20 via-indigo-600/10 to-transparent'
    },
    hierarchical: {
      title: 'Hierarchical Mode',
      subtitle: 'Structured Excellence Through Clear Authority',
      icon: Award,
      color: 'amber',
      features: [
        { icon: Award, label: 'Clear Roles', description: 'Defined authority' },
        { icon: TrendingUp, label: 'Performance', description: 'Individual achievement' },
        { icon: Network, label: 'Chain of Command', description: 'Structured coordination' }
      ],
      gradient: 'from-amber-500/20 via-amber-600/10 to-transparent'
    }
  };

  const info = modeInfo[mode];
  const Icon = info.icon;

  return (
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl border border-white/10 p-6 bg-gradient-to-r ${info.gradient}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-${info.color}-500/20 border border-${info.color}-500/30`}>
          <Icon className={`w-5 h-5 text-${info.color}-400`} />
        </div>
        <div className="flex-1">
          <h4 className="text-white font-semibold mb-1">{info.title}</h4>
          <p className="text-zinc-400 text-sm mb-4">{info.subtitle}</p>
          <div className="grid grid-cols-3 gap-3">
            {info.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <feature.icon className={`w-4 h-4 text-${info.color}-400 mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="text-xs font-medium text-white">{feature.label}</p>
                  <p className="text-[10px] text-zinc-500">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}