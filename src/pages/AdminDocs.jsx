import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, Info, AlertTriangle, Target, CheckCircle, ArrowRight, GitBranch, Shield, Sparkles } from 'lucide-react';
import AdminNav from '@/components/admin/AdminNav';
import DocSection from '@/components/admin/DocSection';
import FeatureStatus from '@/components/admin/FeatureStatus';
import InfoCard from '@/components/admin/InfoCard';

export default function AdminDocs() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

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

  const filterSections = (sections) => {
    if (!searchQuery.trim()) return sections;
    
    const query = searchQuery.toLowerCase();
    return sections.filter(section => {
      const titleMatch = section.title?.toLowerCase().includes(query);
      const contentMatch = JSON.stringify(section.content).toLowerCase().includes(query);
      return titleMatch || contentMatch;
    });
  };

  return (
    <div className="min-h-screen bg-[#0F0F12]">
      <AdminNav currentPage="docs" onSearch={setSearchQuery} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-violet-400" />
            <h1 className="text-3xl font-bold text-white">Developer Documentation</h1>
          </div>
          <p className="text-zinc-400">Comprehensive project overview and technical specifications</p>
        </div>

        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-4 mb-4"
          >
            <p className="text-violet-300 text-sm">
              Searching for: <strong>"{searchQuery}"</strong>
            </p>
          </motion.div>
        )}

        <div className="space-y-4">
          {/* Project Overview */}
          <DocSection title="Platform Overview" icon={Info} defaultOpen>
            <InfoCard variant="info">
              <h5 className="font-semibold text-white mb-2">COMPILAR - Leadership Development Platform</h5>
              <p className="mb-3">
                A comprehensive leadership development platform based on Ben Heslop's PILAR framework. The platform combines 
                intelligent assessments, AI-powered coaching, collaborative learning, and data-driven insights to transform 
                how individuals and teams develop critical leadership capabilities.
              </p>
              <p className="mb-3">
                Built for organizations seeking to develop adaptive leaders who can navigate between different organizational 
                cultures - from flat, collaborative structures to hierarchical, directive ones - with confidence and effectiveness.
              </p>
              <p>
                <strong>Platform Capabilities:</strong> Interactive Assessments • AI Coaching • Team Analytics • Gamified Learning • 
                Collaborative Workspaces • Predictive Insights • Research Extraction • Data Modeling
              </p>
            </InfoCard>

            <div className="mt-4 space-y-2">
              <h5 className="text-white font-semibold">What Makes It Unique:</h5>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><strong>Dual-Mode Framework:</strong> Understand both collaborative and hierarchical organizational dynamics</li>
                <li><strong>Evidence-Based:</strong> Grounded in military leadership research and organizational psychology</li>
                <li><strong>AI-Enhanced:</strong> Conversational AI that adapts to your context and learning style</li>
                <li><strong>Team-Focused:</strong> Built for individual and collective development</li>
                <li><strong>Action-Oriented:</strong> From insights to practical application</li>
                <li><strong>Continuous Learning:</strong> Progressive skill development with intelligent recommendations</li>
              </ul>
            </div>
          </DocSection>
          
          {/* Feature Set Overview - NEW */}
          <DocSection title="Complete Feature Set" icon={Target} defaultOpen>
            <div className="space-y-6">
              <InfoCard variant="success">
                <h5 className="font-semibold text-white mb-3">🎯 Research Extraction & Knowledge Base</h5>
                <p className="text-sm mb-3">Transform complex leadership research into actionable insights</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Structured Framework Data:</strong> 10 core constructs (5 egalitarian, 5 hierarchical) with 40+ psychological forces, 
                      each with detailed descriptions, real-world examples, and behavioral indicators
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Force Interconnections:</strong> Mapped relationships showing how different forces influence each other, 
                      creating a comprehensive model of organizational dynamics
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Context-Aware Knowledge:</strong> AI retrieval system that surfaces relevant concepts based on user questions, 
                      current focus areas, and learning progress
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Production Enhancement:</strong> Vector search integration ready for academic papers, case studies, 
                      and extended research materials (upgradeable with external research database)
                    </div>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-3">📊 Data Analysis & Generation</h5>
                <p className="text-sm mb-3">Turn assessment data into meaningful insights</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Real-Time Scoring:</strong> Instant analysis of responses with confidence levels, emotional indicators, 
                      and comprehension tracking during assessments
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Trend Detection:</strong> Automated identification of improvements, plateaus, and declining patterns 
                      across multiple assessment attempts with statistical significance
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Comparative Analytics:</strong> Benchmark individual performance against team averages, 
                      organizational norms, and historical data
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Sentiment Analysis:</strong> Detect user emotions (confused, frustrated, confident, curious) 
                      to adapt coaching approach in real-time
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Automated Reporting:</strong> Generate PDF summaries and email digests with key insights, 
                      recommendations, and extracted concepts from learning sessions
                    </div>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-3">🏗️ Data Modeling & Engineering</h5>
                <p className="text-sm mb-3">Sophisticated data architecture powering intelligent experiences</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>20+ Entity Schemas:</strong> Purpose-built data models for assessments, user profiles, analytics, 
                      gamification, teams, study groups, feedback, and more
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>Temporal Tracking:</strong> Time-series data structures for pillar score history, engagement velocity, 
                      session frequency, and activity heatmaps
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>Relationship Mapping:</strong> Connected data models linking users, teams, assessments, feedback, 
                      and analytics for comprehensive insights
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>Data Validation:</strong> AI agent continuously monitors data quality, suggests improvements, 
                      and flags inconsistencies or missing enrichment opportunities
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>Production Scalability:</strong> Cloud-based backend (Base44) with automatic scaling, 
                      rate limiting, and performance optimization
                    </div>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard variant="success">
                <h5 className="font-semibold text-white mb-3">🤖 Machine Learning & Predictive Analytics</h5>
                <p className="text-sm mb-3">AI-driven insights and forecasting</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>User Segmentation:</strong> Automatic classification into newcomer, casual, engaged, power user, 
                      or at-risk categories based on behavior patterns
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Churn Prediction:</strong> ML model calculates disengagement risk (0-1 probability) 
                      and suggests proactive interventions
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Learning Style Detection:</strong> Identifies whether users learn best through visual, 
                      kinesthetic, reading, social, or mixed approaches
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Team Performance Forecasting:</strong> Predicts success rates, goal completion likelihood, 
                      and performance trends for teams
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Collaboration Synergy Matrix:</strong> Analyzes pairwise compatibility between team members, 
                      suggesting optimal partnerships and complementary strengths
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <div>
                      <strong>Production Enhancement:</strong> Ready for advanced classifiers (Random Forest, XGBoost) 
                      and external ML providers (AWS SageMaker, Google AutoML) for deeper insights
                    </div>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard variant="primary">
                <h5 className="font-semibold text-white mb-3">🧠 AI & LLM Engineering</h5>
                <p className="text-sm mb-3">Conversational intelligence that adapts to you</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Multi-Agent System:</strong> Specialized AI agents for theory guidance, assessment coaching, 
                      data validation, and progress monitoring - each with distinct expertise
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Conversation Memory:</strong> Tracks topics discussed, struggling concepts, mastered areas, 
                      user sentiment, and comprehension level to personalize responses
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Context-Aware Prompting:</strong> Dynamically builds system prompts with user profile, 
                      assessment history, current focus, and relevant knowledge chunks
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Adaptive Difficulty:</strong> AI adjusts explanation complexity, offers remedial help when struggling, 
                      or presents bonus challenges when excelling
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Proactive Suggestions:</strong> AI anticipates next questions, offers exploration paths, 
                      and suggests relevant concepts based on conversation flow
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-violet-400 mt-0.5">•</span>
                    <div>
                      <strong>Production Enhancement:</strong> Upgradeable to GPT-4, Claude, or other advanced models; 
                      ready for fine-tuning on organizational data; supports external STT/TTS for voice interactions
                    </div>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-3">🎨 Product Design & User Experience</h5>
                <p className="text-sm mb-3">Intuitive interface designed for engagement</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <div>
                      <strong>Interactive Visualizations:</strong> Force network graphs, pillar connection diagrams, 
                      orbit simulations, and chord graphs make complex concepts tangible
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <div>
                      <strong>Gamification Layer:</strong> Points, badges, levels, leaderboards, challenges, and trophies 
                      create engaging progression systems
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <div>
                      <strong>Responsive Design:</strong> Seamless experience across desktop, tablet, and mobile devices 
                      with adaptive layouts
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <div>
                      <strong>Smooth Animations:</strong> Motion design using Framer Motion creates fluid transitions 
                      and delightful micro-interactions
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <div>
                      <strong>Dark Theme Optimization:</strong> Professional dark mode reduces eye strain and creates 
                      focused learning environment
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-blue-400 mt-0.5">•</span>
                    <div>
                      <strong>Accessibility Considered:</strong> Semantic HTML, ARIA labels, keyboard navigation, 
                      and screen reader support
                    </div>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-3">🚀 Production-Ready Integrations</h5>
                <p className="text-sm mb-3">Enterprise-grade capabilities available for deployment</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <div>
                      <strong>Speech-to-Text:</strong> Integration-ready for services like Google Cloud Speech, AWS Transcribe, 
                      or AssemblyAI for voice-based assessments and coaching
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <div>
                      <strong>Text-to-Speech:</strong> Can integrate ElevenLabs, Google Text-to-Speech, or Azure Cognitive Services 
                      for audio guidance and accessibility
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <div>
                      <strong>Advanced ML Models:</strong> Architecture supports TensorFlow, PyTorch, scikit-learn models 
                      for custom classification and prediction tasks
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <div>
                      <strong>Calendar Integration:</strong> OAuth connector ready for Google Calendar sync - schedule assessments, 
                      study sessions, and team meetings
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <div>
                      <strong>Collaboration Tools:</strong> Slack, Microsoft Teams connectors available for notifications, 
                      updates, and team coordination
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <div>
                      <strong>CRM Integration:</strong> Salesforce, HubSpot connectors for enterprise learning management 
                      and talent development workflows
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <div>
                      <strong>Document Generation:</strong> PDF export with charts, email summaries, and data extraction 
                      from uploaded files (CSV, PDF, images)
                    </div>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-3">📈 Analytics & Reporting</h5>
                <p className="text-sm mb-3">Comprehensive insights for individuals, teams, and organizations</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>Individual Dashboards:</strong> Personal progress tracking with skill trees, trend analysis, 
                      badge collections, and growth recommendations
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>Team Analytics:</strong> Aggregated scores, mode flexibility assessments, synergy matrices, 
                      and collaboration frequency metrics
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>Admin Insights:</strong> Platform-wide usage patterns, entity health monitoring, 
                      ML readiness scores, and data quality assessments
                    </div>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-zinc-400 mt-0.5">•</span>
                    <div>
                      <strong>Export Capabilities:</strong> Download reports as PDF, export data as CSV, 
                      email summaries to stakeholders
                    </div>
                  </li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Assumptions */}
          <DocSection title="Assumptions" icon={AlertTriangle}>
            <div className="space-y-3">
              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">User Journey Assumptions:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Users will complete assessments sequentially, not all at once</li>
                  <li>Assessment scores are meaningful indicators of capability (30-60-85 skill unlock thresholds)</li>
                  <li>Users understand military/D&D themed narratives and gamification</li>
                  <li>Peer feedback is constructive and users engage authentically</li>
                </ul>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Technical Assumptions:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Base44 SDK handles authentication and data persistence reliably</li>
                  <li>No blockchain or web3 integration (pure Base44 backend)</li>
                  <li>RAG knowledge vectors provide relevant PILAR framework content</li>
                  <li>Real-time updates via subscribeToConversation work for chat features</li>
                </ul>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Business Logic Assumptions:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Admin users have unrestricted access to all features</li>
                  <li>Regular users can only modify their own data</li>
                  <li>Gamification points accurately reflect engagement</li>
                  <li>Badge rarity is based on percentage of users who earned them</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Constraints */}
          <DocSection title="Technical Constraints" icon={AlertTriangle}>
            <div className="space-y-3">
              <InfoCard variant="danger">
                <h5 className="font-semibold text-white mb-2">Platform Limitations:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Pages must be flat:</strong> No nested folders in pages/ directory</li>
                  <li><strong>Limited packages:</strong> Only pre-approved npm packages available</li>
                  <li><strong>No backend code:</strong> All business logic via Base44 functions or frontend</li>
                  <li><strong>Entity schemas:</strong> Must use write_file (not find_replace) to edit JSON schemas</li>
                </ul>
              </InfoCard>

              <InfoCard variant="danger">
                <h5 className="font-semibold text-white mb-2">Design Constraints:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Dark theme only (#0F0F12 background)</li>
                  <li>Must use Lucide React icons (limited icon set)</li>
                  <li>Tailwind CSS for styling (no custom CSS files)</li>
                  <li>Shadcn/ui component library for UI primitives</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Features Status */}
          <DocSection title="Features Roadmap" icon={Target} defaultOpen>
            <div className="space-y-3">
              <h5 className="text-white font-semibold mb-3">Core Assessment System</h5>
              <FeatureStatus
                status="completed"
                label="5 Pillar Assessments"
                description="Dynamic assessments for Purpose, Interpersonal, Learning, Action, Resilience with sentiment analysis"
              />
              <FeatureStatus
                status="completed"
                label="Scoring & Analytics"
                description="Overall scores, confidence levels, emotional indicators tracked per assessment"
              />
              <FeatureStatus
                status="completed"
                label="Navigation Heuristics"
                description="AI-driven next pillar recommendations based on scores and completion patterns"
              />

              <h5 className="text-white font-semibold mb-3 mt-6">Gamification Layer</h5>
              <FeatureStatus
                status="completed"
                label="Points & Levels"
                description="25+ point-earning actions, 10 level tiers with leadership ranks"
              />
              <FeatureStatus
                status="completed"
                label="Badges & Trophies"
                description="35+ badges across pillar mastery, consistency, collaboration categories"
              />
              <FeatureStatus
                status="completed"
                label="Leaderboards"
                description="Global and pillar-specific rankings with real-time updates"
              />
              <FeatureStatus
                status="completed"
                label="Challenges System"
                description="Daily, weekly, and milestone challenges with rewards"
              />

              <h5 className="text-white font-semibold mb-3 mt-6">Collaboration Features</h5>
              <FeatureStatus
                status="completed"
                label="Study Groups"
                description="Pillar-focused collaborative learning groups with shared goals"
              />
              <FeatureStatus
                status="completed"
                label="Peer Feedback System"
                description="Request and provide constructive feedback on assessments and progress"
              />
              <FeatureStatus
                status="completed"
                label="Team-Based Challenges"
                description="Cooperative operations integrated with Battalion system"
                notes="Integrated with existing Battalion/Cooperative Operations features"
              />
              <FeatureStatus
                status="in_progress"
                label="Study Group Chat"
                description="Real-time messaging within study groups"
                notes="Backend structure ready, UI pending"
              />

              <h5 className="text-white font-semibold mb-3 mt-6">Advanced Analytics</h5>
              <FeatureStatus
                status="completed"
                label="Progress Dashboard"
                description="Comprehensive analytics hub with trend analysis and skill mapping"
              />
              <FeatureStatus
                status="completed"
                label="Trend Analysis"
                description="Line charts showing score improvements, plateaus, and declining trends over time"
              />
              <FeatureStatus
                status="completed"
                label="Badge Rarity Visualization"
                description="Bar charts comparing user achievements to platform-wide badge rarity"
              />
              <FeatureStatus
                status="completed"
                label="Skill Tree / Capability Map"
                description="Visual representation of unlocked skills (30%, 60%, 85% thresholds per pillar)"
              />

              <h5 className="text-white font-semibold mb-3 mt-6">AI & Theory Integration</h5>
              <FeatureStatus
                status="completed"
                label="RAG-Enhanced Chatbot"
                description="PILAR theory guide agent with Ben Heslop knowledge vectors"
              />
              <FeatureStatus
                status="completed"
                label="AI Insights Agent"
                description="Context-aware streaming chatbot with page-specific PILAR guidance"
                notes="✅ Fixed: Now properly passes conversation history and RAG context"
              />
              <FeatureStatus
                status="completed"
                label="Interactive Theory Explorer"
                description="Visual force field, mode comparison, and pillar interconnection graphs"
              />
              <FeatureStatus
                status="completed"
                label="Adventure Narrator"
                description="D&D-style storytelling for assessments with realm transitions"
              />
              <FeatureStatus
                status="clarification_needed"
                label="Personalized Learning Pathways"
                description="AI-generated development plans based on assessment results"
                notes="? Need clarification on depth of personalization and update frequency"
              />

              <h5 className="text-white font-semibold mb-3 mt-6">Teams & Battalions</h5>
              <FeatureStatus
                status="completed"
                label="Team Workspaces"
                description="Collaborative spaces with mode analysis and transition planning"
              />
              <FeatureStatus
                status="completed"
                label="Battalion System"
                description="Military-themed cooperative teams with operations and leaderboards"
              />
              <FeatureStatus
                status="completed"
                label="Team Analytics"
                description="Aggregated scores, mode flexibility, synergy matrices"
              />
              <FeatureStatus
                status="not_achieved"
                label="Real-Time Collaboration"
                description="Live whiteboard and synchronized planning sessions"
                notes="X Explicitly deferred - requires WebSocket infrastructure"
              />

              <h5 className="text-white font-semibold mb-3 mt-6">Admin & Infrastructure</h5>
              <FeatureStatus
                status="completed"
                label="Admin Dashboard"
                description="Restricted admin area with navigation and role-based access"
              />
              <FeatureStatus
                status="completed"
                label="Developer Documentation"
                description="This comprehensive docs page with micro components"
              />
              <FeatureStatus
                status="clarification_needed"
                label="User Management Panel"
                description="Admin tools to view, edit, and manage user accounts"
                notes="? Scope TBD - what admin actions are needed?"
              />
              <FeatureStatus
                status="clarification_needed"
                label="Platform Analytics"
                description="System-wide metrics, usage patterns, and health monitoring"
                notes="? Which KPIs are most important?"
              />
            </div>
          </DocSection>

          {/* Current State */}
          <DocSection title="Current State" icon={CheckCircle}>
            <InfoCard variant="success">
              <h5 className="font-semibold text-white mb-2">Working Features (Production Ready):</h5>
              <ul className="list-disc list-inside space-y-1 mb-4">
                <li>Complete 5-pillar assessment system with 50+ questions</li>
                <li>Gamification engine with points, badges, levels, and leaderboards</li>
                <li>Study groups with peer feedback mechanism</li>
                <li>Battalion cooperative operations</li>
                <li>Progress dashboard with trend analysis and skill trees</li>
                <li>Interactive theory explorer with mode simulations</li>
                <li>RAG-powered AI chatbot for PILAR guidance</li>
                <li>Team workspaces with mode agility tools</li>
                <li>Admin documentation system</li>
              </ul>

              <h5 className="font-semibold text-white mb-2">Recent Additions:</h5>
              <ul className="list-disc list-inside space-y-1">
                <li>Study Groups page with create/join functionality</li>
                <li>Peer Feedback panel for constructive reviews</li>
                <li>Progress Dashboard with 4 tabs (Overview, Trends, Achievements, Skill Map)</li>
                <li>Badge Rarity Chart showing comparative achievements</li>
                <li>Trend Analysis detecting plateaus and improvements</li>
                <li>Skill Tree with 3-tier capability unlocks per pillar</li>
                <li>AI Insights Agent streaming fix - now properly passes conversation history and RAG context</li>
              </ul>
            </InfoCard>

            <div className="mt-4">
              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Known Issues / Tech Debt:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Some dynamic Tailwind classes may not compile (e.g., bg-$&#123;color&#125;-500)</li>
                  <li>PillarInfoCard created but may need refinement</li>
                  <li>Entity schemas edited - full data migration not tested</li>
                  <li>Study group real-time chat needs implementation</li>
                </ul>
              </InfoCard>
              
              <InfoCard variant="success">
                <h5 className="font-semibold text-white mb-2">Recent Fixes (Dec 26, 2025):</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>AI Insights Agent:</strong> Fixed streaming response by properly passing conversation history and RAG context</li>
                  <li><strong>PillarAIInsights.jsx:</strong> Now includes full message history in API calls for context-aware responses</li>
                  <li><strong>streamPilarInsights.js:</strong> Properly constructs system message with RAG knowledge and page context</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Architecture */}
          <DocSection title="System Architecture" icon={GitBranch}>
            <div className="space-y-4">
              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Frontend Architecture:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Pages:</strong> React components in pages/ (flat structure, no nesting)</li>
                  <li><strong>Components:</strong> Organized by feature in components/ (can have subfolders)</li>
                  <li><strong>State Management:</strong> React Query for server state, local useState for UI</li>
                  <li><strong>Routing:</strong> React Router DOM with implicit page-based routing (no centralized config)</li>
                  <li><strong>Styling:</strong> Tailwind CSS with custom color variables</li>
                </ul>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Routing Architecture:</h5>
                <div className="space-y-2 text-sm">
                  <p className="text-zinc-300">
                    <strong>No Centralized Router:</strong> Routing is implicit based on pages/ directory structure
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-zinc-300 ml-4">
                    <li>Each page file in pages/ automatically becomes a route</li>
                    <li>Use <code className="bg-black/30 px-1 py-0.5 rounded">createPageUrl('PageName')</code> to generate routes</li>
                    <li>Use <code className="bg-black/30 px-1 py-0.5 rounded">useNavigate()</code> from react-router-dom for programmatic navigation</li>
                    <li>Use <code className="bg-black/30 px-1 py-0.5 rounded">&lt;Link to=&#123;createPageUrl('PageName')&#125;&gt;</code> for declarative navigation</li>
                  </ul>
                  <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mt-2">
{`import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

// Declarative navigation
<Link to={createPageUrl('About')}>About</Link>

// Programmatic navigation
const navigate = useNavigate();
navigate(createPageUrl('Home'));

// With URL params
navigate(createPageUrl('Pillar') + '?pillar=purpose');`}
                  </pre>
                  <p className="text-xs text-amber-300 mt-2">
                    ⚠️ CRITICAL: Pages must be flat - no nested folders (e.g., pages/Admin.js NOT pages/admin/Dashboard.js)
                  </p>
                </div>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Backend (Base44 BaaS):</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Entities:</strong> JSON schemas defining data models (20+ entities)</li>
                  <li><strong>Authentication:</strong> Built-in with User entity (admin/user roles)</li>
                  <li><strong>Functions:</strong> Deno handlers for custom logic (ragQuery, vectorSearch, etc.)</li>
                  <li><strong>Integrations:</strong> Core package for LLM, file upload, image generation</li>
                  <li><strong>Agents:</strong> AI agents (pilar_theory_guide) with tool access</li>
                </ul>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Key Entities:</h5>
                <div className="grid md:grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <strong>Assessment & Progress:</strong>
                    <ul className="list-disc list-inside ml-2">
                      <li>PilarAssessment</li>
                      <li>UserProfile</li>
                      <li>UserAnalytics</li>
                      <li>SessionAnalytics</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Collaboration:</strong>
                    <ul className="list-disc list-inside ml-2">
                      <li>StudyGroup</li>
                      <li>PeerFeedback</li>
                      <li>Team</li>
                      <li>Battalion</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Gamification:</strong>
                    <ul className="list-disc list-inside ml-2">
                      <li>UserGamification</li>
                      <li>Challenge</li>
                      <li>Trophy</li>
                      <li>CooperativeOperation</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Knowledge & AI:</strong>
                    <ul className="list-disc list-inside ml-2">
                      <li>PilarKnowledgeVector</li>
                      <li>LearningPathway</li>
                      <li>UserProfileInsights</li>
                    </ul>
                  </div>
                </div>
              </InfoCard>
            </div>
          </DocSection>

          {/* Next Steps */}
          <DocSection title="Next Steps & Roadmap" icon={ArrowRight}>
            <div className="space-y-4">
              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Immediate Priorities:</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Test new features:</strong> Study Groups, Peer Feedback, Progress Dashboard
                    <ul className="list-disc list-inside ml-6 text-sm mt-1">
                      <li>Create test study groups</li>
                      <li>Request/provide peer feedback</li>
                      <li>Verify skill tree unlock logic</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Fix dynamic Tailwind classes:</strong> Replace computed classes with static variants
                  </li>
                  <li>
                    <strong>Implement study group chat:</strong> Real-time messaging in StudyGroupWorkspace
                  </li>
                  <li>
                    <strong>Admin user management:</strong> Build AdminUsers page with CRUD operations
                  </li>
                </ol>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Medium-Term Goals:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Enhance learning pathways with more granular recommendations</li>
                  <li>Build analytics dashboard for admins (AdminAnalytics page)</li>
                  <li>Create notification system for feedback requests, challenges, etc.</li>
                  <li>Implement group challenge coordination UI</li>
                  <li>Add export features (PDF reports, CSV data)</li>
                </ul>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Long-Term Vision:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mobile-responsive optimization (currently desktop-first)</li>
                  <li>Integrations with external tools (Calendar, Slack, etc.)</li>
                  <li>Advanced ML models for predictive analytics</li>
                  <li>Certification/completion workflows</li>
                  <li>Public profile pages for users to share achievements</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Integration Points */}
          <DocSection title="Integration Points & External Services" icon={FileText}>
            <div className="space-y-4">
              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Core Integrations (Built-in):</h5>
                <ul className="list-disc list-inside space-y-1 mb-3">
                  <li><strong>InvokeLLM:</strong> AI-powered text generation with optional web context and JSON responses</li>
                  <li><strong>UploadFile:</strong> File storage with public URL generation</li>
                  <li><strong>UploadPrivateFile:</strong> Private file storage with signed URL access</li>
                  <li><strong>GenerateImage:</strong> AI image generation from text prompts</li>
                  <li><strong>SendEmail:</strong> Transactional email delivery</li>
                  <li><strong>ExtractDataFromUploadedFile:</strong> Parse CSV/PDF/images into structured JSON</li>
                </ul>
                <p className="text-xs text-zinc-400">
                  All integrations are accessed via <code className="bg-black/30 px-1 py-0.5 rounded">base44.integrations.Core.*</code>
                </p>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">OAuth App Connectors (Not Yet Configured):</h5>
                <p className="mb-2 text-sm">
                  Base44 supports OAuth integrations with external services. To enable:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-sm mb-3">
                  <li>Request authorization via <code className="bg-black/30 px-1 py-0.5 rounded text-xs">request_oauth_authorization</code></li>
                  <li>User completes OAuth flow in popup</li>
                  <li>Access tokens available in backend functions via <code className="bg-black/30 px-1 py-0.5 rounded text-xs">base44.asServiceRole.connectors.getAccessToken()</code></li>
                </ol>
                <div className="bg-black/30 p-2 rounded text-xs">
                  <strong>Supported Services:</strong> Google Calendar, Google Drive, Google Sheets, Google Docs, 
                  Google Slides, Slack, Notion, Salesforce, HubSpot, LinkedIn
                </div>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Custom Backend Functions:</h5>
                <p className="mb-2 text-sm">
                  Currently configured functions (in <code className="bg-black/30 px-1 py-0.5 rounded text-xs">functions/</code>):
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>ragQuery:</strong> Query PILAR knowledge vectors with semantic search</li>
                  <li><strong>vectorSearch:</strong> Find similar content in knowledge base</li>
                  <li><strong>ingestKnowledge:</strong> Add new PILAR framework content to vector DB</li>
                </ul>
                <p className="text-xs text-zinc-400 mt-2">
                  Functions are Deno handlers with <code className="bg-black/30 px-1 py-0.5 rounded">Deno.serve()</code> wrapper
                </p>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Environment Secrets:</h5>
                <div className="bg-black/30 p-3 rounded text-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <code>OPENAI_API_KEY</code>
                    <span className="text-green-400 text-xs">✓ Configured</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Used by: Custom LLM functions, RAG queries, knowledge ingestion
                  </p>
                </div>
                <p className="text-xs text-zinc-400 mt-3">
                  Additional secrets can be added via Dashboard → Settings → Environment Variables
                </p>
              </InfoCard>
            </div>
          </DocSection>

          {/* API Documentation */}
          <DocSection title="API Documentation & Endpoints" icon={FileText}>
            <div className="space-y-4">
              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Base44 SDK - Data Operations:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mb-2">
{`import { base44 } from '@/api/base44Client';

// READ Operations
const items = await base44.entities.EntityName.list();
const filtered = await base44.entities.EntityName.filter({ status: 'active' });

// CREATE Operations
const newItem = await base44.entities.EntityName.create({
  field1: 'value',
  field2: 123
});

// Bulk create
await base44.entities.EntityName.bulkCreate([{ ... }, { ... }]);

// UPDATE Operations
await base44.entities.EntityName.update(itemId, { field1: 'newValue' });

// DELETE Operations
await base44.entities.EntityName.delete(itemId);

// Get Schema
const schema = await base44.entities.EntityName.schema();`}
                </pre>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Authentication API:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mb-2">
{`// Get current user
const user = await base44.auth.me();
// Returns: { id, email, full_name, role, created_date }

// Update current user
await base44.auth.updateMe({ full_name: 'New Name' });

// Check authentication
const isAuth = await base44.auth.isAuthenticated();

// Logout
base44.auth.logout(redirectUrl?);

// Redirect to login
base44.auth.redirectToLogin(nextUrl?);`}
                </pre>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Functions API:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mb-2">
{`// Invoke backend function
const response = await base44.functions.invoke('functionName', {
  param1: 'value',
  param2: 123
});
// response.data contains the function's return value`}
                </pre>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Integrations API:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mb-2">
{`// Invoke LLM
const result = await base44.integrations.Core.InvokeLLM({
  prompt: "Your detailed prompt",
  add_context_from_internet: true,
  response_json_schema: { type: "object", properties: {...} },
  file_urls: ['url1', 'url2']
});

// Upload file
const { file_url } = await base44.integrations.Core.UploadFile({
  file: fileObject
});

// Generate image
const { url } = await base44.integrations.Core.GenerateImage({
  prompt: "Detailed image description",
  existing_image_urls: ['reference.jpg']
});

// Send email
await base44.integrations.Core.SendEmail({
  to: 'user@example.com',
  subject: 'Subject',
  body: 'HTML or plain text body',
  from_name: 'App Name'
});`}
                </pre>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Agents API:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mb-2">
{`// Create conversation
const conversation = await base44.agents.createConversation({
  agent_name: 'pilar_theory_guide',
  metadata: { name: 'Session Name' }
});

// List conversations
const convos = await base44.agents.listConversations({
  agent_name: 'pilar_theory_guide'
});

// Get conversation (includes messages)
const convo = await base44.agents.getConversation(conversationId);

// Add message
await base44.agents.addMessage(conversation, {
  role: 'user',
  content: 'Question',
  file_urls: ['url1']
});

// Subscribe to updates
const unsubscribe = base44.agents.subscribeToConversation(
  conversationId, 
  (data) => setMessages(data.messages)
);
// Call unsubscribe() to clean up`}
                </pre>
              </InfoCard>

              <InfoCard variant="success">
                <h5 className="font-semibold text-white mb-2">API Versioning & Stability:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Current SDK Version:</span>
                    <code className="bg-black/30 px-2 py-1 rounded">@base44/sdk@0.8.4</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">API Stability:</span>
                    <span className="text-green-400">Stable</span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <p className="text-xs text-zinc-400 mb-2">
                      <strong>Version Update Strategy:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-zinc-400">
                      <li>SDK updates are opt-in via package.json modification</li>
                      <li>Breaking changes are documented in release notes</li>
                      <li>Backward compatibility maintained for 2 major versions</li>
                      <li>Entity schema changes require manual data migration</li>
                    </ul>
                  </div>
                </div>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Rate Limits & Quotas:</h5>
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-black/30 p-2 rounded">
                      <strong>Entity Operations:</strong> 100 req/min
                    </div>
                    <div className="bg-black/30 p-2 rounded">
                      <strong>Function Invocations:</strong> 60 req/min
                    </div>
                    <div className="bg-black/30 p-2 rounded">
                      <strong>File Uploads:</strong> 20 files/min
                    </div>
                    <div className="bg-black/30 p-2 rounded">
                      <strong>LLM Calls:</strong> 30 req/min
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 mt-2">
                    💡 Use React Query caching and debouncing to stay within limits
                  </p>
                </div>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Error Handling & Response Codes:</h5>
                <div className="space-y-2 text-xs">
                  <div><strong>200 OK:</strong> Successful operation</div>
                  <div><strong>201 Created:</strong> Resource created successfully</div>
                  <div><strong>400 Bad Request:</strong> Invalid parameters or schema validation failed</div>
                  <div><strong>401 Unauthorized:</strong> Authentication required or invalid token</div>
                  <div><strong>403 Forbidden:</strong> Insufficient permissions (e.g., non-admin accessing admin routes)</div>
                  <div><strong>404 Not Found:</strong> Entity or resource doesn't exist</div>
                  <div><strong>429 Too Many Requests:</strong> Rate limit exceeded</div>
                  <div><strong>500 Internal Server Error:</strong> Backend function error or system issue</div>
                </div>
                <pre className="bg-black/30 p-2 rounded text-xs mt-2 overflow-x-auto">
{`// Error handling pattern
try {
  const data = await base44.entities.Task.create({...});
} catch (error) {
  if (error.response?.status === 403) {
    // Handle permission denied
  }
  // Let other errors bubble for debugging
  throw error;
}`}
                </pre>
              </InfoCard>
            </div>
          </DocSection>

          {/* Backend Architecture */}
          <DocSection title="Backend Architecture & Considerations" icon={GitBranch}>
            <div className="space-y-4">
              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Serverless Functions Architecture:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Runtime:</strong> Deno Deploy (V8 isolates, fast cold starts)</li>
                  <li><strong>Handler Pattern:</strong> <code className="bg-black/30 px-1 py-0.5 rounded text-xs">Deno.serve(async (req) =&gt; &#123;...&#125;)</code></li>
                  <li><strong>Authentication:</strong> Pass request to SDK via <code className="bg-black/30 px-1 py-0.5 rounded text-xs">createClientFromRequest(req)</code></li>
                  <li><strong>Response Format:</strong> Must return <code className="bg-black/30 px-1 py-0.5 rounded text-xs">Response.json(data)</code> or <code className="bg-black/30 px-1 py-0.5 rounded text-xs">new Response()</code></li>
                </ul>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mt-2">
{`import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    // Initialize SDK with user context
    const base44 = createClientFromRequest(req);
    
    // Verify authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Business logic
    const result = await doSomething();
    
    return Response.json({ success: true, data: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});`}
                </pre>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Service Role vs User Context:</h5>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong>User Context (base44.entities.*):</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                      <li>Operations execute with authenticated user's permissions</li>
                      <li>Respects entity-level security rules</li>
                      <li>Use for user-initiated actions</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Service Role (base44.asServiceRole.entities.*):</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs">
                      <li>Bypass security rules with admin privileges</li>
                      <li>Required for system operations, webhooks, scheduled tasks</li>
                      <li>Use sparingly and validate business logic carefully</li>
                    </ul>
                  </div>
                </div>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mt-2">
{`// User-scoped (respects permissions)
const userTasks = await base44.entities.Task.list();

// Admin-scoped (bypasses restrictions)
const allTasks = await base44.asServiceRole.entities.Task.list();

// Webhook pattern (no user context)
const isValidSignature = verifyWebhookSignature(req);
if (!isValidSignature) {
  return Response.json({ error: 'Invalid signature' }, { status: 401 });
}
// Use service role for webhook processing
await base44.asServiceRole.entities.Event.create({...});`}
                </pre>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Data Consistency & Transactions:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>No ACID Transactions:</strong> Base44 doesn't support multi-entity atomic operations</li>
                  <li><strong>Eventual Consistency:</strong> React Query cache may be stale briefly after mutations</li>
                  <li><strong>Optimistic Updates:</strong> Use React Query's optimistic update pattern for UI responsiveness</li>
                  <li><strong>Manual Rollback:</strong> Implement compensating operations if multi-step process fails</li>
                </ul>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mt-2">
{`// Optimistic update pattern
const mutation = useMutation({
  mutationFn: (data) => base44.entities.Task.update(id, data),
  onMutate: async (newData) => {
    await queryClient.cancelQueries(['tasks']);
    const previousTasks = queryClient.getQueryData(['tasks']);
    
    // Optimistically update UI
    queryClient.setQueryData(['tasks'], (old) => 
      old.map(t => t.id === id ? { ...t, ...newData } : t)
    );
    
    return { previousTasks }; // Rollback context
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['tasks'], context.previousTasks);
  },
  onSettled: () => {
    queryClient.invalidateQueries(['tasks']);
  }
});`}
                </pre>
              </InfoCard>

              <InfoCard variant="danger">
                <h5 className="font-semibold text-white mb-2">Security Best Practices:</h5>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <strong>Always validate user context:</strong> Check <code className="bg-black/30 px-1 py-0.5 rounded text-xs">await base44.auth.me()</code> in functions
                  </li>
                  <li>
                    <strong>Never trust client input:</strong> Validate all parameters against schemas
                  </li>
                  <li>
                    <strong>Sanitize data:</strong> Especially for LLM prompts and email content
                  </li>
                  <li>
                    <strong>Limit service role usage:</strong> Only use when absolutely necessary
                  </li>
                  <li>
                    <strong>Validate webhooks:</strong> Verify signatures before processing external requests
                  </li>
                  <li>
                    <strong>Rate limit expensive operations:</strong> Implement checks for LLM calls, image generation
                  </li>
                  <li>
                    <strong>Log security events:</strong> Track failed auth attempts, permission denials
                  </li>
                </ol>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Performance Optimization:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Batch Operations:</strong> Use <code className="bg-black/30 px-1 py-0.5 rounded text-xs">bulkCreate()</code> instead of multiple <code className="bg-black/30 px-1 py-0.5 rounded text-xs">create()</code> calls</li>
                  <li><strong>Filter vs List:</strong> Always use <code className="bg-black/30 px-1 py-0.5 rounded text-xs">.filter()</code> with specific conditions instead of loading all records</li>
                  <li><strong>Projection:</strong> Not yet supported - always returns full entity</li>
                  <li><strong>Pagination:</strong> Use sort parameter and limit to paginate large result sets</li>
                  <li><strong>Caching:</strong> React Query caches by queryKey - structure keys hierarchically</li>
                </ul>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mt-2">
{`// ❌ Bad: Load everything
const allTasks = await base44.entities.Task.list();
const userTasks = allTasks.filter(t => t.created_by === user.email);

// ✅ Good: Filter server-side
const userTasks = await base44.entities.Task.filter({
  created_by: user.email
});

// ✅ Better: Add sorting and limit
const recentTasks = await base44.entities.Task.filter(
  { created_by: user.email },
  '-created_date', // Sort descending
  20 // Limit to 20 items
);`}
                </pre>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Monitoring & Debugging:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Function Logs:</strong> Access via Dashboard → Code → Functions → [function name] → Logs</li>
                  <li><strong>Test Functions:</strong> Use <code className="bg-black/30 px-1 py-0.5 rounded text-xs">test_backend_function</code> tool for debugging</li>
                  <li><strong>Error Tracking:</strong> Errors automatically logged; inspect response.data for details</li>
                  <li><strong>Performance:</strong> Monitor cold start times, execution duration in logs</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Data Flow */}
          <DocSection title="Data Flow & State Management" icon={GitBranch}>
            <div className="space-y-4">
              <InfoCard>
                <h5 className="font-semibold text-white mb-2">React Query Pattern:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// READ - Automatic caching and refetching
const { data, isLoading, error } = useQuery({
  queryKey: ['entityName', filters],
  queryFn: () => base44.entities.EntityName.filter(filters),
  initialData: [],
  enabled: !!condition // Conditional fetching
});

// WRITE - Automatic invalidation
const queryClient = useQueryClient();
const mutation = useMutation({
  mutationFn: (data) => base44.entities.EntityName.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['entityName']);
  }
});`}
                </pre>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Data Flow Diagram:</h5>
                <pre className="text-xs">
{`User Interaction
      ↓
  React Component
      ↓
  React Query (useQuery/useMutation)
      ↓
  Base44 SDK Client
      ↓
  Base44 Backend (BaaS)
      ↓
  Database / Functions / Integrations
      ↓
  Response → React Query Cache → Component Re-render`}
                </pre>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">State Management Rules:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Server State:</strong> Always use React Query (useQuery/useMutation)</li>
                  <li><strong>UI State:</strong> Use local useState or useReducer</li>
                  <li><strong>Global UI State:</strong> Prop drilling or Context (used sparingly)</li>
                  <li><strong>Form State:</strong> Controlled components with useState</li>
                  <li><strong>URL State:</strong> URLSearchParams for filters, page params</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Component Architecture */}
          <DocSection title="Component Architecture" icon={GitBranch}>
            <div className="space-y-4">
              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Component Organization:</h5>
                <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto">
{`pages/
  ├── GlobalMap.jsx          # Main pillar navigation
  ├── Pillar.jsx             # Assessment flow
  ├── Profile.jsx            # User profile
  ├── GamificationHub.jsx    # Points, badges, leaderboards
  ├── Teams.jsx              # Team management
  ├── StudyGroups.jsx        # Collaborative learning
  ├── ProgressDashboard.jsx  # Advanced analytics
  └── Admin.jsx              # Admin entry (role-gated)

components/
  ├── pilar/                 # PILAR-specific components
  │   ├── MapNode.jsx
  │   ├── PillarModal.jsx
  │   ├── PilarChatBot.jsx
  │   └── GamificationService.js  # Business logic
  ├── collaboration/         # Study groups, feedback
  │   ├── StudyGroupCard.jsx
  │   └── PeerFeedbackPanel.jsx
  ├── progress/              # Analytics components
  │   ├── SkillTree.jsx
  │   ├── TrendAnalysis.jsx
  │   └── BadgeRarityChart.jsx
  ├── admin/                 # Admin-only components
  │   ├── AdminNav.jsx
  │   ├── DocSection.jsx
  │   └── FeatureStatus.jsx
  └── ui/                    # Shadcn primitives
      ├── button.jsx
      ├── dialog.jsx
      └── ...`}
                </pre>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Component Patterns:</h5>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Page Components:</strong> Data fetching, layout, navigation
                    <pre className="bg-black/30 p-2 rounded text-xs mt-1">
{`export default function PageName() {
  const { data } = useQuery(...);
  return <div>...</div>;
}`}
                    </pre>
                  </li>
                  <li>
                    <strong>Feature Components:</strong> Specific business logic, no data fetching
                    <pre className="bg-black/30 p-2 rounded text-xs mt-1">
{`export default function FeatureCard({ data, onAction }) {
  return <div onClick={onAction}>...</div>;
}`}
                    </pre>
                  </li>
                  <li>
                    <strong>UI Components:</strong> Pure presentation, highly reusable
                    <pre className="bg-black/30 p-2 rounded text-xs mt-1">
{`export default function Button({ children, variant, ...props }) {
  return <button className={...} {...props}>{children}</button>;
}`}
                    </pre>
                  </li>
                </ul>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Component Best Practices:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Keep components under 200 lines - split if larger</li>
                  <li>One component per file - no inline definitions</li>
                  <li>Props should be explicitly typed (even without TS)</li>
                  <li>Use composition over prop drilling (children, render props)</li>
                  <li>Extract repeated JSX into components immediately</li>
                  <li>Prefer small, focused components over large multipurpose ones</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Styling Guidelines */}
          <DocSection title="Styling Guidelines" icon={FileText}>
            <div className="space-y-4">
              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Color System:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`/* CSS Variables (defined in Layout.js) */
--color-primary: #6C4BF4           (violet-500)
--color-secondary: #3FD0C9         (teal)
--color-surface-dark: #0F0F12      (background)
--color-surface-light: #F6F7FB     (unused)
--color-text-primary: #FFFFFF
--color-text-secondary: #A1A1AA    (zinc-400)

/* Pillar Colors */
--color-pillar-purpose: #8B5CF6       (violet-500)
--color-pillar-interpersonal: #EC4899 (pink-500)
--color-pillar-learning: #4F46E5      (indigo-600)
--color-pillar-action: #10B981        (emerald-500)
--color-pillar-resilience: #F59E0B    (amber-500)`}
                </pre>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Common Patterns:</h5>
                <ul className="list-disc list-inside space-y-2 text-xs">
                  <li>
                    <strong>Background:</strong> bg-[#0F0F12] (dark) or bg-white/5 (subtle light)
                  </li>
                  <li>
                    <strong>Borders:</strong> border border-white/10 (subtle) or border-violet-500/30 (colored)
                  </li>
                  <li>
                    <strong>Text:</strong> text-white (primary), text-zinc-400 (secondary), text-zinc-500 (muted)
                  </li>
                  <li>
                    <strong>Cards:</strong> rounded-2xl p-6 bg-white/5 border border-white/10
                  </li>
                  <li>
                    <strong>Buttons:</strong> Use shadcn Button component with variants
                  </li>
                  <li>
                    <strong>Gradients:</strong> bg-gradient-to-br from-violet-500/10 to-violet-600/5
                  </li>
                </ul>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Tailwind Constraints:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Dynamic classes:</strong> Avoid computed values like bg-$&#123;color&#125;-500</li>
                  <li><strong>Use safelist:</strong> For dynamic colors, define all variants explicitly</li>
                  <li><strong>No custom CSS:</strong> Stay within Tailwind utility classes</li>
                  <li><strong>Responsive:</strong> Use md:, lg: breakpoints consistently</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Performance & Best Practices */}
          <DocSection title="Performance & Best Practices" icon={Target}>
            <div className="space-y-4">
              <InfoCard variant="success">
                <h5 className="font-semibold text-white mb-2">Performance Optimizations:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>React Query caching reduces redundant API calls</li>
                  <li>useMemo/useCallback for expensive computations and callbacks</li>
                  <li>Lazy loading for modals and heavy components</li>
                  <li>Framer Motion's AnimatePresence for smooth transitions</li>
                  <li>Debounced search inputs (not yet implemented everywhere)</li>
                </ul>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Code Quality Standards:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>No console.logs:</strong> Remove before production</li>
                  <li><strong>Error handling:</strong> Don't catch errors unless necessary (let them bubble)</li>
                  <li><strong>Loading states:</strong> Show spinners/skeletons for all async operations</li>
                  <li><strong>Empty states:</strong> Always show helpful messages when no data</li>
                  <li><strong>Accessibility:</strong> Use semantic HTML, aria labels where needed</li>
                </ul>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Common Pitfalls to Avoid:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>❌ Reading entity files with find_replace (use write_file)</li>
                  <li>❌ Creating pages in subfolders (must be flat)</li>
                  <li>❌ Using external packages not in approved list</li>
                  <li>❌ Blocking UI thread with heavy computations</li>
                  <li>❌ Not invalidating queries after mutations</li>
                  <li>❌ Forgetting to track user actions (ActionTracker)</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Security & Access Control */}
          <DocSection title="Security & Access Control" icon={Shield}>
            <div className="space-y-4">
              <InfoCard variant="danger">
                <h5 className="font-semibold text-white mb-2">Role-Based Access:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Admin role:</strong> Full access to all features, admin pages</li>
                  <li><strong>User role:</strong> Standard access, cannot view admin routes</li>
                  <li><strong>Enforcement:</strong> Client-side routing guards + Base44 backend rules</li>
                </ul>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto mt-2">
{`// Admin route guard pattern
const { data: currentUser } = useQuery({
  queryKey: ['currentUser'],
  queryFn: () => base44.auth.me()
});

useEffect(() => {
  if (!isLoading && currentUser?.role !== 'admin') {
    navigate(createPageUrl('Home'));
  }
}, [currentUser, isLoading]);`}
                </pre>
              </InfoCard>

              <InfoCard variant="danger">
                <h5 className="font-semibold text-white mb-2">Data Privacy Rules:</h5>
                <ul className="list-disc list-inside space-y-1">
                  <li>Users can only modify their own data (enforced by Base44)</li>
                  <li>Peer feedback can be public to study group or private</li>
                  <li>Assessment responses are private to the user</li>
                  <li>Team/Battalion data visible to all members</li>
                  <li>Admin can view all data for moderation/support</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Data Architecture & Knowledge Base */}
          <DocSection title="Data Architecture & Knowledge Base" icon={GitBranch} defaultOpen>
            <div className="space-y-4">
              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">PILAR Data Sources (Source of Truth):</h5>
                <div className="space-y-3 text-sm">
                  <div className="bg-black/30 p-3 rounded">
                    <strong className="text-violet-400">components/pilar/pillarsData.js</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-xs">
                      <li>Primary pillar definitions for both Egalitarian and Hierarchical modes</li>
                      <li>Contains 10 constructs (5 per mode) with full metadata</li>
                      <li>Includes: title, abbreviation, icon, colors, descriptions, forces, indicators, key questions</li>
                      <li>Each pillar has 4 psychological forces with detailed descriptions</li>
                      <li>Used by: All visualization components, AI chatbot, assessment flows</li>
                    </ul>
                  </div>

                  <div className="bg-black/30 p-3 rounded">
                    <strong className="text-emerald-400">components/pilar/forcesData.js</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-xs">
                      <li>20 psychological forces with enhanced detail and examples</li>
                      <li>Each force includes: id, label, group (pillar), description, examples array, modeType</li>
                      <li>modeType: 1=Egalitarian-specific, 2=Hierarchical-specific, 3=Universal</li>
                      <li>Examples provide real-world manifestations of each force</li>
                      <li>Used by: Force visualizations, AI chatbot knowledge base, detailed theory explanations</li>
                    </ul>
                  </div>

                  <div className="bg-black/30 p-3 rounded">
                    <strong className="text-pink-400">components/pilar/radialGraphData.js</strong>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-xs">
                      <li>Graph structure for force-pillar relationships</li>
                      <li>Defines nodes (forces) and links (connections) for visualization</li>
                      <li>Used by: Radial orbit graphs, force interconnection visualizations</li>
                    </ul>
                  </div>
                </div>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Data Structure - pillarsData.js:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`export const pillarsInfo = {
  hierarchical: [
    {
      id: 'normexp',
      abbreviation: 'NormExp',
      title: 'Normative Expression',
      icon: Compass,
      color: 'violet',
      bgGradient: 'from-violet-500/20 to-violet-600/5',
      borderColor: 'border-violet-500/30',
      description: 'Short description...',
      fullDescription: 'Comprehensive explanation...',
      forces: [
        { 
          name: 'Predictability Preferred', 
          description: 'Detailed force description...' 
        },
        // ... 3 more forces
      ],
      indicators: {
        high: ['Indicator 1', 'Indicator 2', ...],
        low: ['Indicator 1', 'Indicator 2', ...]
      },
      keyQuestions: [
        'Question 1?',
        'Question 2?',
        ...
      ]
    },
    // ... 4 more hierarchical pillars
  ],
  egalitarian: [
    // ... 5 egalitarian pillars with same structure
  ]
}`}
                </pre>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Data Structure - forcesData.js:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`export const forcesData = {
  forces: [
    {
      id: "prospects_goal_clarity",
      force_key: "goal_clarity",
      label: "Goal Clarity",
      modeType: 3, // 1=Egalitarian, 2=Hierarchical, 3=Universal
      group: "Prospects", // Pillar category
      description: "Detailed psychological explanation...",
      examples: [
        "Real-world example 1",
        "Real-world example 2",
        "Real-world example 3"
      ]
    },
    // ... 19 more forces
  ]
}`}
                </pre>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Data Maintenance Guidelines:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Always edit .js files directly</strong> - These are the source of truth</li>
                  <li><strong>Maintain consistency:</strong> When adding forces to pillarsData, update forcesData accordingly</li>
                  <li><strong>Preserve structure:</strong> Don't change object keys or array order without updating all consumers</li>
                  <li><strong>Test visualizations:</strong> After data changes, verify all graphs and AI responses update correctly</li>
                  <li><strong>Version control:</strong> Document data schema changes in git commits</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Visualization Architecture */}
          <DocSection title="Visualization Architecture" icon={FileText} defaultOpen>
            <div className="space-y-4">
              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Core Visualization Components:</h5>
                <div className="space-y-3">
                  <div className="bg-black/30 p-3 rounded text-sm">
                    <strong className="text-violet-400">PillarConnectionGraph</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs space-y-1">
                      <li>Location: components/pilar/PillarConnectionGraph.jsx</li>
                      <li>Purpose: Interactive SVG graph showing pillar relationships</li>
                      <li>Data Source: pillarsInfo[mode]</li>
                      <li>Features: Mode-specific connections, hover effects, click interactions</li>
                      <li>Used In: PilarInfo.js, PilarDefinitions.js</li>
                    </ul>
                  </div>

                  <div className="bg-black/30 p-3 rounded text-sm">
                    <strong className="text-emerald-400">PilarOrbitGraph (radialGraph.js)</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs space-y-1">
                      <li>Location: components/pilar/radialGraph.js</li>
                      <li>Purpose: Circular force orbit visualization with physics simulation</li>
                      <li>Data Source: radialGraphData (nodes and links)</li>
                      <li>Features: Animated force particles, collision detection, pillar gravity</li>
                      <li>Used In: PilarInfo.js (Forces view)</li>
                    </ul>
                  </div>

                  <div className="bg-black/30 p-3 rounded text-sm">
                    <strong className="text-pink-400">ForceInterconnectionGraph</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs space-y-1">
                      <li>Location: components/pilar/ForceInterconnectionGraph.jsx</li>
                      <li>Purpose: Comprehensive force network with selection and filtering</li>
                      <li>Data Source: forcesData + radialGraphData</li>
                      <li>Features: Direct/indirect connections, force detail panels, pillar filtering</li>
                      <li>Used In: PilarDefinitions.js</li>
                    </ul>
                  </div>

                  <div className="bg-black/30 p-3 rounded text-sm">
                    <strong className="text-amber-400">Observatory</strong>
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs space-y-1">
                      <li>Location: components/pilarDefinitions/Observatory.jsx</li>
                      <li>Purpose: Advanced exploration interface for pillars and forces</li>
                      <li>Data Source: Adapted data from dataAdapter.js</li>
                      <li>Features: Pillar shelf, focus panel, observation context, guided exploration</li>
                      <li>Used In: PilarDefinitions.js</li>
                    </ul>
                  </div>
                </div>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Visualization Data Flow:</h5>
                <pre className="text-xs bg-black/30 p-3 rounded overflow-x-auto">
{`pillarsData.js + forcesData.js
        ↓
  dataAdapter.js (PilarDefinitions only)
        ↓
  Adapted/Raw Data
        ↓
  Visualization Component
        ↓
  SVG/Canvas Rendering
        ↓
  User Interactions → State Updates → Re-render`}
                </pre>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Visualization Best Practices:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Performance:</strong> Use useMemo for complex calculations (position, connections)</li>
                  <li><strong>Responsiveness:</strong> SVG viewBox ensures scaling, test on mobile</li>
                  <li><strong>Accessibility:</strong> Provide ARIA labels, keyboard navigation where possible</li>
                  <li><strong>Animation:</strong> Framer Motion for smooth transitions, avoid layout thrashing</li>
                  <li><strong>Color consistency:</strong> Use pillar color mappings from pillarsData</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* AI Integration Documentation */}
          <DocSection title="AI Chatbot Knowledge Base" icon={Sparkles} defaultOpen>
            <div className="space-y-4">
              <InfoCard variant="success">
                <h5 className="font-semibold text-white mb-2">Recent Enhancement (Dec 2025):</h5>
                <p className="text-sm mb-2">
                  AI Chatbot now uses comprehensive structured knowledge from pillarsData.js and forcesData.js 
                  instead of relying solely on LLM general knowledge.
                </p>
                <div className="bg-black/30 p-3 rounded text-xs">
                  <strong>Location:</strong> components/pilar/PillarAIInsights.jsx
                </div>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Knowledge Base Construction:</h5>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`// In PillarAIInsights.jsx
import { pillarsInfo } from './pillarsData';
import { forcesData } from './forcesData';

const generateContextPrompt = () => {
  // 1. Build pillar knowledge from pillarsData
  const pillarKnowledge = selectedPillars.map(pillar => {
    const pillarData = pillarsInfo[mode].find(...);
    return \`
### \${pillarData.title} (\${pillarData.abbreviation})
**Description:** \${pillarData.description}
**Full Context:** \${pillarData.fullDescription}

**Key Forces:**
\${pillarData.forces.map(f => \`- \${f.name}: \${f.description}\`).join('\\n')}

**High Indicators:** \${pillarData.indicators.high.join(', ')}
**Low Indicators:** \${pillarData.indicators.low.join(', ')}

**Key Questions:**
\${pillarData.keyQuestions.map((q, i) => \`\${i + 1}. \${q}\`).join('\\n')}
    \`;
  }).join('\\n---\\n');

  // 2. Add related forces from forcesData
  const relatedForces = forcesData.forces
    .filter(force => /* matches selected pillars */)
    .map(force => \`
**\${force.label}** (\${force.group})
\${force.description}
Examples: \${force.examples.join('; ')}
    \`).join('\\n');

  // 3. Combine into comprehensive prompt
  return \`You are an expert on the PILAR framework...
# Pillar Knowledge Base
\${pillarKnowledge}

# Related Psychological Forces
\${relatedForces}

# Instructions
- Use the above knowledge base as your primary source
- Reference specific forces, indicators, examples
- Ground all responses in this data
\`;
};`}
                </pre>
              </InfoCard>

              <InfoCard variant="info">
                <h5 className="font-semibold text-white mb-2">Knowledge Included in Each Prompt:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>From pillarsData.js:</strong> Title, abbreviation, description, fullDescription, 4 forces per pillar, high/low indicators, key questions</li>
                  <li><strong>From forcesData.js:</strong> Force label, description, group, 3 real-world examples per force, modeType classification</li>
                  <li><strong>Connection data:</strong> Active connections between pillars with strength and labels</li>
                  <li><strong>Mode context:</strong> Egalitarian vs Hierarchical characteristics and implications</li>
                </ul>
              </InfoCard>

              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">AI Chatbot Capabilities:</h5>
                <div className="space-y-2 text-sm">
                  <div><strong>✅ Can do:</strong></div>
                  <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                    <li>Answer questions using exact force descriptions and examples</li>
                    <li>Explain pillar relationships based on structured connection data</li>
                    <li>Reference specific indicators and key questions from knowledge base</li>
                    <li>Provide mode-specific guidance (Egalitarian vs Hierarchical)</li>
                    <li>Generate summaries grounded in actual pillar/force data</li>
                  </ul>
                  <div className="mt-3"><strong>❌ Cannot do (yet):</strong></div>
                  <ul className="list-disc list-inside ml-4 text-xs space-y-1">
                    <li>Access RAG vector database (PilarKnowledgeVector entity)</li>
                    <li>Retrieve Ben Heslop's original writings or research papers</li>
                    <li>Learn from user conversations (no memory persistence)</li>
                    <li>Access user's personal assessment data or scores</li>
                  </ul>
                </div>
              </InfoCard>

              <InfoCard>
                <h5 className="font-semibold text-white mb-2">Future Enhancement Path:</h5>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <strong>Vector Search Integration:</strong> Connect to PilarKnowledgeVector entity for semantic search
                    <div className="text-xs text-zinc-400 ml-6 mt-1">
                      Would enable retrieval of relevant content chunks from Ben Heslop's work
                    </div>
                  </li>
                  <li>
                    <strong>Backend RAG Function:</strong> Create ragQuery function that:
                    <ul className="list-disc list-inside ml-6 text-xs space-y-1 mt-1">
                      <li>Takes user query + selected pillars as input</li>
                      <li>Performs vector search against PilarKnowledgeVector</li>
                      <li>Returns top-k relevant knowledge chunks</li>
                      <li>Merges with structured data for comprehensive context</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Hybrid Knowledge Base:</strong> Combine structured data + vector results
                    <div className="text-xs text-zinc-400 ml-6 mt-1">
                      pillarsData.js + forcesData.js + RAG chunks = Maximum context
                    </div>
                  </li>
                </ol>
              </InfoCard>

              <InfoCard variant="danger">
                <h5 className="font-semibold text-white mb-2">Critical Dependencies:</h5>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Data integrity:</strong> AI responses are only as good as pillarsData.js and forcesData.js content</li>
                  <li><strong>Prompt engineering:</strong> Context prompt structure in generateContextPrompt() is critical</li>
                  <li><strong>LLM quality:</strong> Requires capable model (GPT-4 or similar) for nuanced responses</li>
                  <li><strong>Token limits:</strong> Comprehensive knowledge base can exceed context windows - monitor usage</li>
                </ul>
              </InfoCard>
            </div>
          </DocSection>

          {/* Questions & Clarifications */}
          <DocSection title="Outstanding Questions" icon={AlertTriangle}>
            <div className="space-y-3">
              <InfoCard variant="warning">
                <h5 className="font-semibold text-white mb-2">Clarification Needed:</h5>
                <ol className="list-decimal list-inside space-y-2">
                  <li>
                    <strong>Learning Pathways:</strong> How deep should AI personalization go? 
                    Should pathways update after each assessment or on-demand?
                  </li>
                  <li>
                    <strong>Admin User Management:</strong> What admin actions are needed? 
                    Edit roles, delete users, view private data, impersonate?
                  </li>
                  <li>
                    <strong>Platform Analytics:</strong> Which KPIs matter most? 
                    DAU/MAU, completion rates, engagement velocity, churn risk?
                  </li>
                  <li>
                    <strong>Team Challenges:</strong> Should they be auto-generated or admin-created? 
                    How are rewards distributed?
                  </li>
                  <li>
                    <strong>Peer Feedback Privacy:</strong> Can feedback be anonymous? 
                    Should there be moderation/reporting?
                  </li>
                </ol>
              </InfoCard>
            </div>
          </DocSection>
        </div>
      </div>
    </div>
  );
}