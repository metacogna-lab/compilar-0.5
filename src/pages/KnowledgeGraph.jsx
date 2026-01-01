import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowLeft, Filter, SortAsc, SortDesc, Grid3X3, 
  List, Compass, Heart, BookOpen, Zap, Shield,
  ChevronDown, TrendingUp, TrendingDown, Minus,
  Sparkles, Target, CheckCircle, AlertCircle, Network
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { trackPageView } from '@/components/pilar/ActionTracker';
import KnowledgeNode from '@/components/pilar/KnowledgeNode';
import KnowledgeMiniMap from '@/components/pilar/KnowledgeMiniMap';
import ForceGraph3D from '@/components/pilar/ForceGraph3D';
import ProfileAvatar from '@/components/pilar/ProfileAvatar';

const pillarConfig = {
  purpose: { icon: Compass, color: 'violet', label: 'Purpose' },
  interpersonal: { icon: Heart, color: 'pink', label: 'Interpersonal' },
  learning: { icon: BookOpen, color: 'indigo', label: 'Learning' },
  action: { icon: Zap, color: 'emerald', label: 'Action' },
  resilience: { icon: Shield, color: 'amber', label: 'Resilience' },
};

const subdomains = {
  purpose: ['Sense of Direction', 'Values Alignment', 'Meaning Extraction'],
  interpersonal: ['Empathy', 'Communication', 'Conflict Resolution'],
  learning: ['Curiosity', 'Skill Acquisition', 'Reflection'],
  action: ['Discipline', 'Momentum', 'Execution'],
  resilience: ['Stress Response', 'Emotional Regulation', 'Recovery'],
};

export default function KnowledgeGraph() {
  const [view, setView] = useState('graph');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('default');
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [showForceGraph, setShowForceGraph] = useState(false);

  React.useEffect(() => {
    trackPageView('KnowledgeGraph');
  }, []);

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list();
      return profiles[0];
    },
  });

  const { data: assessments = [] } = useQuery({
    queryKey: ['assessments'],
    queryFn: () => base44.entities.PilarAssessment.list(),
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['developmentPlans'],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ status: 'active' }),
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Calculate progress for each pillar and subdomain
  const progressData = useMemo(() => {
    const scores = userProfile?.pillar_scores || {};
    const completionCounts = userProfile?.pillar_completion_count || {};
    
    return Object.keys(pillarConfig).map(pillar => {
      const score = scores[pillar];
      const completions = completionCounts[pillar] || 0;
      const status = score >= 70 ? 'strong' : score >= 50 ? 'developing' : score ? 'needs_work' : 'not_started';
      const trend = completions > 1 ? 'improving' : completions === 1 ? 'stable' : 'unknown';
      
      return {
        pillar,
        score,
        completions,
        status,
        trend,
        subdomains: subdomains[pillar].map((name, i) => ({
          name,
          // Simulate subdomain scores based on overall score with some variance
          score: score ? Math.max(0, Math.min(100, score + (Math.random() * 20 - 10))) : null,
        })),
      };
    });
  }, [userProfile]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...progressData];
    
    if (filter === 'needs_work') {
      data = data.filter(d => d.status === 'needs_work' || d.status === 'not_started');
    } else if (filter === 'strong') {
      data = data.filter(d => d.status === 'strong');
    } else if (filter === 'in_progress') {
      data = data.filter(d => d.status === 'developing');
    }
    
    if (sort === 'score_asc') {
      data.sort((a, b) => (a.score || 0) - (b.score || 0));
    } else if (sort === 'score_desc') {
      data.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sort === 'name') {
      data.sort((a, b) => a.pillar.localeCompare(b.pillar));
    }
    
    return data;
  }, [progressData, filter, sort]);

  // Stats
  const stats = useMemo(() => {
    const assessed = progressData.filter(d => d.score !== undefined).length;
    const avgScore = assessed > 0 
      ? Math.round(progressData.filter(d => d.score).reduce((s, d) => s + d.score, 0) / assessed)
      : 0;
    const needsWork = progressData.filter(d => d.status === 'needs_work' || d.status === 'not_started').length;
    
    return { assessed, avgScore, needsWork, total: 5 };
  }, [progressData]);

  return (
    <div className="min-h-screen bg-[#0F0F12] relative overflow-hidden">
      {/* Minimal background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>

      {/* 3D Force Graph Modal */}
      <ForceGraph3D
        isOpen={showForceGraph}
        onClose={() => setShowForceGraph(false)}
        userProfile={userProfile}
        assessments={assessments}
      />

      {/* Compact Header */}
      <div className="relative z-10 p-3 md:p-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <Link to={createPageUrl('GlobalMap')}>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/10 h-8 px-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold text-white" style={{ fontFamily: 'Inter, sans-serif' }}>Knowledge Graph</h1>
        </div>
        
        {/* Quick Stats & 3D Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-zinc-400">{stats.assessed}/{stats.total}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-violet-400" />
              <span className="text-zinc-400">{stats.avgScore}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-zinc-400">{stats.needsWork} focus</span>
            </div>
          </div>
          <ProfileAvatar user={currentUser} size="sm" />
        </div>
      </div>

      {/* Toolbar */}
      <div className="relative z-10 p-3 md:p-4 flex items-center justify-between gap-2 border-b border-white/5">
        {/* View Toggle */}
        <Tabs value={view} onValueChange={setView} className="h-8">
          <TabsList className="h-8 bg-white/5">
            <TabsTrigger value="graph" className="h-6 px-3 text-xs">
              <Grid3X3 className="w-3 h-3 mr-1" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="list" className="h-6 px-3 text-xs">
              <List className="w-3 h-3 mr-1" />
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white">
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                <span className="text-xs capitalize">{filter === 'all' ? 'All' : filter.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1f] border-white/10">
              <DropdownMenuItem onClick={() => setFilter('all')}>All Pillars</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilter('needs_work')}>
                <AlertCircle className="w-3.5 h-3.5 mr-2 text-red-400" />
                Needs Work
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('in_progress')}>
                <Minus className="w-3.5 h-3.5 mr-2 text-amber-400" />
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('strong')}>
                <CheckCircle className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                Strong
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 text-zinc-400 hover:text-white">
                {sort.includes('desc') ? <SortDesc className="w-3.5 h-3.5" /> : <SortAsc className="w-3.5 h-3.5" />}
                <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1f] border-white/10">
              <DropdownMenuItem onClick={() => setSort('default')}>Default Order</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('score_desc')}>Score (High → Low)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('score_asc')}>Score (Low → High)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('name')}>Alphabetical</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-3 md:p-4">
        <AnimatePresence mode="wait">
          {view === 'graph' ? (
            <motion.div
              key="graph"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
            >
              {/* Mini Map Overview - Pentagon with connections */}
              <div className="md:col-span-2 lg:col-span-1 lg:row-span-2">
                <KnowledgeMiniMap 
                  data={progressData} 
                  selectedPillar={selectedPillar}
                  onSelectPillar={setSelectedPillar}
                  showConnections={true}
                />
              </div>
              
              {/* Knowledge Nodes */}
              {filteredData.map((item, index) => (
                <motion.div
                  key={item.pillar}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <KnowledgeNode
                    data={item}
                    config={pillarConfig[item.pillar]}
                    isSelected={selectedPillar === item.pillar}
                    onClick={() => setSelectedPillar(selectedPillar === item.pillar ? null : item.pillar)}
                    activePlan={plans.find(p => p.target_pillars?.includes(item.pillar))}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredData.map((item, index) => {
                const Icon = pillarConfig[item.pillar].icon;
                const color = pillarConfig[item.pillar].color;
                
                return (
                  <motion.div
                    key={item.pillar}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer",
                      selectedPillar === item.pillar && "ring-1 ring-violet-500/50"
                    )}
                    onClick={() => setSelectedPillar(selectedPillar === item.pillar ? null : item.pillar)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-${color}-500/20 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${color}-400`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white capitalize">{item.pillar}</span>
                          <div className="flex items-center gap-2">
                            {item.trend === 'improving' && <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                            {item.trend === 'stable' && <Minus className="w-3.5 h-3.5 text-zinc-400" />}
                            <span className={cn(
                              "text-sm font-medium",
                              item.score >= 70 ? "text-emerald-400" :
                              item.score >= 50 ? "text-amber-400" :
                              item.score ? "text-red-400" : "text-zinc-500"
                            )}>
                              {item.score !== undefined ? `${Math.round(item.score)}%` : '—'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.score || 0}%` }}
                              className={`h-full rounded-full bg-${color}-500`}
                            />
                          </div>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded",
                            item.status === 'strong' ? "bg-emerald-500/20 text-emerald-400" :
                            item.status === 'developing' ? "bg-amber-500/20 text-amber-400" :
                            item.status === 'needs_work' ? "bg-red-500/20 text-red-400" :
                            "bg-zinc-500/20 text-zinc-400"
                          )}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded subdomain view */}
                    <AnimatePresence>
                      {selectedPillar === item.pillar && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-3 pt-3 border-t border-white/5"
                        >
                          <div className="grid grid-cols-3 gap-2">
                            {item.subdomains.map((sub, i) => (
                              <div key={i} className="p-2 rounded-lg bg-white/5 text-center">
                                <p className="text-xs text-zinc-400 truncate">{sub.name}</p>
                                <p className="text-sm font-medium text-white mt-0.5">
                                  {sub.score ? `${Math.round(sub.score)}%` : '—'}
                                </p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Action */}
      {selectedPillar && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20"
        >
          <Link to={createPageUrl(`Pillar?pillar=${selectedPillar}`)}>
            <Button className="bg-gradient-to-r from-violet-500 to-pink-500 text-white rounded-full px-6 shadow-xl">
              <Sparkles className="w-4 h-4 mr-2" />
              Explore {pillarConfig[selectedPillar].label}
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Interactive 3D Button - Bottom Center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
        {!selectedPillar && (
          <Button
            onClick={() => setShowForceGraph(true)}
            className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full px-6 shadow-xl"
          >
            <Network className="w-4 h-4 mr-2" />
            Interactive 3D
          </Button>
        )}
      </div>
    </div>
  );
}