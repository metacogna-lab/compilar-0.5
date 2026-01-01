import React from 'react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Compass, Heart, BookOpen, Zap, Shield } from 'lucide-react';

const pillarIcons = {
  prospects: Compass,
  involved: Heart,
  liked: BookOpen,
  agency: Zap,
  respect: Shield,
};

const pillarColors = {
  prospects: '#10B981',
  involved: '#EC4899',
  liked: '#4F46E5',
  agency: '#8B5CF6',
  respect: '#F59E0B'
};

export default function PillarsDropdown({ mode, selectedPillarFilter, onSelectPillar }) {
  const pillars = [
    { id: 'prospects', label: 'Prospects' },
    { id: 'involved', label: 'Involved' },
    { id: 'liked', label: 'Liked' },
    { id: 'agency', label: 'Agency' },
    { id: 'respect', label: 'Respect' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="relative z-20"
    >
      <Select onValueChange={onSelectPillar} value={selectedPillarFilter}>
        <SelectTrigger className="w-[220px] bg-gradient-to-r from-violet-500/30 to-pink-500/30 backdrop-blur-xl border-2 border-violet-400/50 text-white hover:border-violet-300 transition-all shadow-2xl shadow-violet-500/50 hover:shadow-violet-500/70 text-lg font-bold [&>span]:text-white [&>svg]:text-violet-300 hover:[&>svg]:text-white ring-2 ring-violet-500/20">
          <SelectValue placeholder="Filter by Pillar" />
        </SelectTrigger>
        <SelectContent className="bg-black/95 backdrop-blur-xl border border-violet-400/50 text-white">
          <SelectItem value="all" className="hover:bg-white/15 cursor-pointer py-2 px-3 focus:bg-white/10">
            <span className="font-medium">All Pillars</span>
          </SelectItem>
          {pillars.map((pillar) => {
            const Icon = pillarIcons[pillar.id];
            const color = pillarColors[pillar.id];
            return (
              <SelectItem 
                key={pillar.id} 
                value={pillar.id} 
                className="hover:bg-white/15 flex items-center gap-2 cursor-pointer py-2 px-3 focus:bg-white/10 data-[state=checked]:bg-white/10 data-[state=checked]:text-white"
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" style={{ color }} />
                  <span>{pillar.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </motion.div>
  );
}