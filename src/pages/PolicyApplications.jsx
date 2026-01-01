import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, FileText, Building2, Users, Briefcase, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const policyDomains = [
  {
    id: 'organizational',
    icon: Building2,
    title: 'Organizational Design',
    description: 'Apply PILAR framework to structure teams and reporting lines',
    applications: [
      'Determining optimal team sizes and composition',
      'Setting authority boundaries and escalation paths',
      'Designing communication protocols'
    ]
  },
  {
    id: 'hr',
    icon: Users,
    title: 'HR & Talent Management',
    description: 'Use PILAR insights for hiring, development, and retention',
    applications: [
      'Crafting role profiles aligned with cultural mode',
      'Performance evaluation criteria',
      'Promotion and succession planning'
    ]
  },
  {
    id: 'leadership',
    icon: Briefcase,
    title: 'Leadership Development',
    description: 'Build leadership capabilities matching organizational needs',
    applications: [
      'Executive coaching frameworks',
      'Leadership style assessment',
      'Transition support between modes'
    ]
  },
  {
    id: 'governance',
    icon: Shield,
    title: 'Governance & Risk',
    description: 'Establish governance structures reflecting cultural reality',
    applications: [
      'Decision rights allocation',
      'Risk escalation protocols',
      'Accountability frameworks'
    ]
  }
];

export default function PolicyApplications() {
  const [modeValue, setModeValue] = useState(50);
  const blendRatio = modeValue / 100;

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6 border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <Link to={createPageUrl('PilarDefinitions')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Definitions
            </Button>
          </Link>

          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Policy Applications</h1>
            <p className="text-zinc-400 text-sm md:text-base">Applying the PILAR Framework to organizational practice</p>
          </div>

          {/* Mode Slider */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4 text-sm">
              <motion.span 
                className="text-indigo-400 font-medium"
                animate={{ 
                  opacity: modeValue < 50 ? 1 : 0.4,
                  scale: modeValue < 50 ? 1.05 : 1 
                }}
              >
                Egalitarian Collaboration
              </motion.span>
              <motion.span 
                className="text-amber-400 font-medium"
                animate={{ 
                  opacity: modeValue >= 50 ? 1 : 0.4,
                  scale: modeValue >= 50 ? 1.05 : 1 
                }}
              >
                Hierarchical Command
              </motion.span>
            </div>
            <div className="relative px-6">
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-amber-500/20" />
              <Slider
                value={[modeValue]}
                onValueChange={(value) => setModeValue(value[0])}
                max={100}
                step={1}
                className="relative z-10"
              />
              <div className="flex justify-between mt-2 text-xs text-zinc-500">
                <span>Group Focus</span>
                <span>Individual Focus</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-4 md:p-6 max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-2">
          {policyDomains.map((domain, index) => {
            const Icon = domain.icon;
            return (
              <motion.div
                key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border backdrop-blur-sm bg-white/5 border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">{domain.title}</h3>
                    <p className="text-zinc-400 text-sm">{domain.description}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-zinc-500 mb-2">Key Applications:</p>
                  <ul className="space-y-2">
                    {domain.applications.map((app, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="text-violet-400 mt-0.5">•</span>
                        <span>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-3 rounded-lg ${blendRatio < 0.5 ? 'bg-indigo-500/10 border border-indigo-500/20' : 'bg-amber-500/10 border border-amber-500/20'}`}>
                  <p className="text-xs font-medium text-white mb-1">Mode Recommendation:</p>
                  <p className={`text-xs ${blendRatio < 0.5 ? 'text-indigo-300' : 'text-amber-300'}`}>
                    {blendRatio < 0.5 
                      ? 'Focus on collaborative structures, shared decision-making, and peer accountability'
                      : 'Emphasize clear hierarchies, individual accountability, and formal authority'
                    }
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}