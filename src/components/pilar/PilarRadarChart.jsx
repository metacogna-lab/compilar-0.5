import React from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

const pillarLabels = {
  purpose: 'Purpose',
  interpersonal: 'Interpersonal',
  learning: 'Learning',
  action: 'Action',
  resilience: 'Resilience',
};

export default function PilarRadarChart({ scores = {} }) {
  const data = Object.keys(pillarLabels).map(key => ({
    pillar: pillarLabels[key],
    value: scores[key] || 0,
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[300px] md:h-[400px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid 
            stroke="rgba(255,255,255,0.1)" 
            strokeDasharray="3 3"
          />
          <PolarAngleAxis 
            dataKey="pillar" 
            tick={{ fill: '#A1A1AA', fontSize: 12 }}
            tickLine={false}
          />
          <PolarRadiusAxis 
            angle={90} 
            domain={[0, 100]} 
            tick={{ fill: '#71717A', fontSize: 10 }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#6C4BF4"
            fill="#6C4BF4"
            fillOpacity={0.3}
            strokeWidth={2}
            dot={{
              r: 4,
              fill: '#6C4BF4',
              stroke: '#fff',
              strokeWidth: 2,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}