import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Users, Settings, BarChart3, Shield, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DocSection from '@/components/admin/DocSection';
import InfoCard from '@/components/admin/InfoCard';
import FeatureStatus from '@/components/admin/FeatureStatus';
import AdminNav from '@/components/admin/AdminNav';

export default function Admin() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (!isLoading && currentUser?.role !== 'admin') {
      navigate(createPageUrl('Home'));
    }
  }, [currentUser, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return null;
  }

  const documentationSections = [
    {
      title: 'Project Overview',
      variant: 'primary',
      content: (
        <>
          <p className="text-zinc-300 mb-4">
            The PILAR Framework Platform is a comprehensive personal development system based on Ben Heslop's research.
            It measures and develops five core pillars of human capability through assessments, visualizations, and AI-guided learning.
          </p>
          <InfoCard title="Core Purpose">
            <p className="text-sm text-zinc-300">
              Transform theoretical leadership frameworks into practical, actionable tools that help individuals and teams 
              develop across five interconnected pillars: Purpose, Interpersonal, Learning, Action, and Resilience.
            </p>
          </InfoCard>
        </>
      )
    },
    {
      title: 'Current Feature Status',
      variant: 'success',
      content: (
        <div className="space-y-3">
          <FeatureStatus 
            status="completed" 
            label="Interactive 3D Visualization"
            description="Full 3D pillar exploration with mode switching, authority levels, and AI chatbot"
          />
          <FeatureStatus 
            status="completed" 
            label="2D Connection Graph"
            description="Interactive 2D visualization showing pillar relationships and connection strengths"
          />
          <FeatureStatus 
            status="completed" 
            label="Theory Documentation"
            description="Comprehensive PILAR theory modal with framework explanations"
          />
          <FeatureStatus 
            status="completed" 
            label="Multi-Pillar Selection"
            description="Ctrl+Click to select multiple pillars and view combined influence"
          />
          <FeatureStatus 
            status="completed" 
            label="Search & Navigation"
            description="Real-time connection search and smooth transitions between modes"
          />
          <FeatureStatus 
            status="completed" 
            label="Authority Visualization"
            description="Dynamic central authority sphere with scaling based on authority level"
          />
          <FeatureStatus 
            status="completed" 
            label="Pillar Forces Modal"
            description="Detailed view of forces acting on each pillar in both modes"
          />
          <FeatureStatus 
            status="in_progress" 
            label="User Assessments"
            description="Pillar assessment system with AI analysis"
          />
          <FeatureStatus 
            status="in_progress" 
            label="Team Collaboration"
            description="Team workspaces with mode transition planning"
          />
        </div>
      )
    },
    {
      title: 'System Architecture',
      variant: 'default',
      content: (
        <>
          <InfoCard title="Frontend Stack" variant="info">
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• React 18 with hooks and context</li>
              <li>• Three.js for 3D visualizations</li>
              <li>• Framer Motion for animations</li>
              <li>• Tailwind CSS for styling</li>
              <li>• React Query for data management</li>
            </ul>
          </InfoCard>
          <InfoCard title="Backend Infrastructure" variant="info">
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• Base44 BaaS for authentication & data</li>
              <li>• Entity-based data modeling</li>
              <li>• Real-time updates via subscriptions</li>
              <li>• Serverless functions for AI integration</li>
            </ul>
          </InfoCard>
        </>
      )
    },
    {
      title: 'Integration Points',
      variant: 'default',
      content: (
        <>
          <InfoCard title="AI Integration" variant="info">
            <p className="text-sm text-zinc-300 mb-3">
              The platform uses OpenAI's API for intelligent features including assessment analysis, 
              personalized recommendations, and interactive chatbot guidance.
            </p>
            <div className="space-y-2">
              <div className="text-xs text-zinc-400 font-mono bg-black/30 p-2 rounded">
                <span className="text-violet-400">Function:</span> InvokeLLM<br/>
                <span className="text-violet-400">Purpose:</span> Generate insights, analyze pillar combinations, provide recommendations
              </div>
              <div className="text-xs text-zinc-400 font-mono bg-black/30 p-2 rounded">
                <span className="text-violet-400">Function:</span> UploadFile<br/>
                <span className="text-violet-400">Purpose:</span> Process and analyze user-uploaded content
              </div>
            </div>
          </InfoCard>
          <InfoCard title="Data Endpoints" variant="info">
            <p className="text-sm text-zinc-300 mb-2">Core entities accessed via Base44 SDK:</p>
            <ul className="text-xs text-zinc-400 space-y-1 font-mono">
              <li>• base44.entities.PilarAssessment</li>
              <li>• base44.entities.UserProfile</li>
              <li>• base44.entities.Team</li>
              <li>• base44.entities.TeamAnalytics</li>
              <li>• base44.entities.UserAnalytics</li>
            </ul>
          </InfoCard>
        </>
      )
    },
    {
      title: 'API Versioning & Stability',
      variant: 'warning',
      content: (
        <InfoCard variant="warning">
          <p className="text-sm text-zinc-300 mb-2">
            <strong>Current SDK Version:</strong> @base44/sdk@0.8.3
          </p>
          <p className="text-sm text-zinc-300 mb-2">
            The platform is built on a stable Base44 infrastructure with predictable update patterns.
            Breaking changes are rare and well-documented when they occur.
          </p>
          <ul className="text-xs text-zinc-400 space-y-1">
            <li>• Entity schemas are versioned independently</li>
            <li>• SDK updates follow semantic versioning</li>
            <li>• Migration guides provided for major updates</li>
          </ul>
        </InfoCard>
      )
    },
    {
      title: 'Backend Architecture',
      variant: 'default',
      content: (
        <>
          <InfoCard title="Function Structure" variant="info">
            <p className="text-sm text-zinc-300 mb-2">
              Backend functions are Deno-based serverless handlers deployed via Base44:
            </p>
            <div className="text-xs text-zinc-400 font-mono bg-black/30 p-3 rounded space-y-2">
              <div>
                <div className="text-violet-400 mb-1">Standard Pattern:</div>
                <pre className="text-zinc-300">
{`import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  
  // Service role operations when needed
  const data = await base44.asServiceRole
    .entities.EntityName.list();
    
  return Response.json({ data });
});`}
                </pre>
              </div>
            </div>
          </InfoCard>
          <InfoCard title="Authentication Flow" variant="info">
            <ul className="text-sm text-zinc-300 space-y-1">
              <li>• Request-scoped auth via createClientFromRequest</li>
              <li>• User operations use base44.entities.*</li>
              <li>• Admin operations use base44.asServiceRole.*</li>
              <li>• No manual token management required</li>
            </ul>
          </InfoCard>
        </>
      )
    },
    {
      title: 'Feature Roadmap',
      variant: 'default',
      content: (
        <div className="space-y-3">
          <InfoCard title="Phase 1: Core Visualization (Complete)" variant="success">
            <ul className="text-xs text-zinc-300 space-y-1">
              <li>✓ 3D pillar graph with mode switching</li>
              <li>✓ Authority level visualization</li>
              <li>✓ Interactive connection exploration</li>
              <li>✓ AI-powered chatbot for guidance</li>
            </ul>
          </InfoCard>
          <InfoCard title="Phase 2: Assessment & Analysis (In Progress)" variant="warning">
            <ul className="text-xs text-zinc-300 space-y-1">
              <li>⧗ Pillar assessment questionnaires</li>
              <li>⧗ AI-powered scoring and insights</li>
              <li>⧗ Progress tracking over time</li>
              <li>⧗ Personalized development recommendations</li>
            </ul>
          </InfoCard>
          <InfoCard title="Phase 3: Team Features (Planned)">
            <ul className="text-xs text-zinc-300 space-y-1">
              <li>○ Team composition analysis</li>
              <li>○ Mode transition planning tools</li>
              <li>○ Collaborative workshops</li>
              <li>○ Team analytics dashboard</li>
            </ul>
          </InfoCard>
        </div>
      )
    },
    {
      title: 'Outstanding Questions',
      variant: 'warning',
      content: (
        <div className="space-y-3">
          <InfoCard variant="warning">
            <p className="text-sm font-medium text-amber-300 mb-2">Assessment Scoring Algorithm</p>
            <p className="text-xs text-zinc-300">
              Need to define the exact methodology for converting questionnaire responses into pillar scores (0-100 scale).
              Should we use weighted averages, factor analysis, or ML-based scoring?
            </p>
          </InfoCard>
          <InfoCard variant="warning">
            <p className="text-sm font-medium text-amber-300 mb-2">Team Mode Recommendations</p>
            <p className="text-xs text-zinc-300">
              What specific criteria should trigger a recommendation to shift from egalitarian to hierarchical mode (or vice versa)?
              Need clear business rules based on team composition, project phase, or external factors.
            </p>
          </InfoCard>
          <InfoCard variant="warning">
            <p className="text-sm font-medium text-amber-300 mb-2">Data Retention & Privacy</p>
            <p className="text-xs text-zinc-300">
              Clarify data retention policies for user assessments and team analytics. GDPR compliance requirements?
            </p>
          </InfoCard>
        </div>
      )
    }
  ];

  const filterSections = (sections) => {
    if (!searchQuery.trim()) return sections;
    
    const query = searchQuery.toLowerCase();
    return sections.filter(section => {
      const titleMatch = section.title?.toLowerCase().includes(query);
      const contentMatch = JSON.stringify(section.content).toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  };

  const filteredSections = filterSections(documentationSections);

  return (
    <div className="min-h-screen bg-[#0F0F12]">
      <AdminNav currentPage="dashboard" />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-violet-400" />
              <div>
                <h1 className="text-3xl font-bold text-white">Admin & Developer Documentation</h1>
                <p className="text-zinc-400">Platform administration and technical specifications</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-4"
            >
              <p className="text-violet-300 text-sm">
                Found {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} matching: <strong>"{searchQuery}"</strong>
              </p>
            </motion.div>
          )}
        </div>

        <div className="space-y-4">
          {filteredSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <DocSection title={section.title} variant={section.variant}>
                {section.content}
              </DocSection>
            </motion.div>
          ))}
          
          {filteredSections.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <p className="text-zinc-400">No documentation sections found matching "{searchQuery}"</p>
              <Button
                onClick={() => setSearchQuery('')}
                variant="ghost"
                className="mt-4 text-violet-400 hover:text-violet-300"
              >
                Clear search
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}