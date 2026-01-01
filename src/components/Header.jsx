import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HamburgerNav from './HamburgerNav';
import { base44 } from '@/api/base44Client';
import { usePageStore } from '@/components/stores/usePageStore';
import { motion, LayoutGroup } from 'framer-motion';

const navigationItems = [
  { label: 'Components', page: 'PilarDefinitions' },
  { label: 'Assess', page: 'Assess' },
  { label: 'What is ComPILAR', page: 'WhatIsCompilar' },
  { label: 'Theory', page: 'About' },
  { label: 'Blog', page: 'PolicyBlog' },
];

export default function Header() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isAdmin, setIsAdmin] = useState(false);
  const { toggleAIInsights } = usePageStore();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const user = await base44.auth.me();
      setIsAdmin(user?.role === 'admin');
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const visibleNavItems = navigationItems.filter(item => 
    !item.adminOnly || isAdmin
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-violet-900/20 via-indigo-900/20 to-violet-900/20 backdrop-blur-xl border-b border-violet-500/20">
      <div className="max-w-[120rem] mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Left: Compilar Logo + Mobile Menu */}
        <div className="flex items-center gap-4">
          <Link 
            to={createPageUrl('PilarInfo')}
            className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent hover:from-violet-300 hover:to-pink-300 transition-all"
          >
            <Sparkles className="w-6 h-6 text-violet-400" />
            <span>Compilar</span>
          </Link>
          
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <HamburgerNav />
          </div>
        </div>

        {/* Center: Navigation */}
        <LayoutGroup>
          <nav className="hidden md:flex items-center gap-1">
            {visibleNavItems.map((item) => {
              const isActive = currentPath === createPageUrl(item.page) || 
                             (item.page === 'Home' && currentPath === '/');
              
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={`relative px-4 py-2 rounded-lg text-sm transition-colors ${
                    item.bold ? 'font-bold' : 'font-medium'
                  } ${
                    isActive
                      ? 'text-violet-300'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-violet-500/20 border border-violet-500/30 rounded-lg -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </LayoutGroup>

        {/* Right: AI Insights (global) */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAIInsights}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </button>
        </div>
      </div>
    </header>
  );
}