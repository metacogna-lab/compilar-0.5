import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Settings, 
  Database,
  TrendingUp,
  Shield,
  Layers,
  BookOpen
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import AdminRoute from '@/components/admin/AdminRoute';
import { trackPageView } from '@/components/pilar/ActionTracker';

const adminPages = [
  {
    title: 'Analytics Dashboard',
    description: 'ML-driven insights, user engagement, and performance trends',
    icon: BarChart3,
    path: 'AdminAnalytics',
    color: 'from-violet-500 to-purple-500',
    category: 'Analytics'
  },
  {
    title: 'Content Management',
    description: 'Manage blog posts, pages, and site content',
    icon: FileText,
    path: 'CMS',
    color: 'from-blue-500 to-cyan-500',
    category: 'Content'
  },
  {
    title: 'System Documentation',
    description: 'Technical docs, API references, and guides',
    icon: BookOpen,
    path: 'AdminDocs',
    color: 'from-emerald-500 to-teal-500',
    category: 'Documentation'
  },
  {
    title: 'Admin Settings',
    description: 'System configuration and administrative controls',
    icon: Settings,
    path: 'Admin',
    color: 'from-orange-500 to-red-500',
    category: 'System'
  }
];

export default function AdminDashboard() {
  useEffect(() => {
    trackPageView('AdminDashboard');
  }, []);

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  return (
    <AdminRoute>
      <div className="min-h-screen bg-[#0F0F12] relative py-12 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-500/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-violet-400" />
              <h1 className="text-4xl font-bold text-white">Admin Dashboard</h1>
            </div>
            <p className="text-zinc-400 text-lg">
              Welcome back, {user?.full_name || 'Admin'}
            </p>
            <p className="text-zinc-500 text-sm mt-2">
              Central hub for system management and analytics
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12"
          >
            <StatCard
              icon={Users}
              label="Total Users"
              value="Loading..."
              color="text-blue-400"
            />
            <StatCard
              icon={TrendingUp}
              label="Active Today"
              value="Loading..."
              color="text-emerald-400"
            />
            <StatCard
              icon={Database}
              label="Total Records"
              value="Loading..."
              color="text-violet-400"
            />
            <StatCard
              icon={Layers}
              label="Entities"
              value="Loading..."
              color="text-orange-400"
            />
          </motion.div>

          {/* Admin Pages Grid */}
          <div className="space-y-8">
            {['Analytics', 'Content', 'Documentation', 'System'].map((category, categoryIdx) => {
              const categoryPages = adminPages.filter(p => p.category === category);
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + categoryIdx * 0.1 }}
                >
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-violet-500 to-pink-500 rounded-full" />
                    {category}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryPages.map((page, idx) => (
                      <AdminPageCard key={page.path} page={page} delay={idx * 0.05} />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-zinc-500">{label}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function AdminPageCard({ page, delay }) {
  const Icon = page.icon;
  
  return (
    <Link to={createPageUrl(page.path)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
        whileHover={{ scale: 1.02 }}
        className="group relative bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all"
      >
        {/* Gradient background on hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${page.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${page.color} bg-opacity-20`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="px-2 py-1 rounded-full bg-white/5 text-xs text-zinc-400">
              {page.category}
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
            {page.title}
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {page.description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}