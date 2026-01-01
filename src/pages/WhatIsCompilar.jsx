import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight, Sparkles, Users, Target, BookOpen, Zap, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

export default function WhatIsCompilar() {
  const [selectedView, setSelectedView] = useState(null); // null = original, 'pillars', 'forces'
  const [content, setContent] = useState({});
  const [pageData, setPageData] = useState({
    title: 'What is Compilar?',
    subtitle: 'A framework for understanding how groups actually work—not how we wish they would.'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    try {
      const [overviewRes, pillarsRes, forcesRes] = await Promise.all([
        base44.functions.invoke('contentManagement', {
          action: 'read',
          contentType: 'pages',
          slug: 'what-is-compilar-overview'
        }),
        base44.functions.invoke('contentManagement', {
          action: 'read',
          contentType: 'pages',
          slug: 'what-is-compilar-pillars'
        }),
        base44.functions.invoke('contentManagement', {
          action: 'read',
          contentType: 'pages',
          slug: 'what-is-compilar-forces'
        })
      ]);

      setContent({
        overview: overviewRes.data.entry?.content || '',
        pillars: pillarsRes.data.entry?.content || '',
        forces: forcesRes.data.entry?.content || ''
      });
      
      if (overviewRes.data.entry) {
        setPageData({
          title: overviewRes.data.entry.title || 'What is Compilar?',
          subtitle: overviewRes.data.entry.seoDescription || 'A framework for understanding how groups actually work—not how we wish they would.'
        });
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12]">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden border-b border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 py-20 relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-400" />
              <span className="text-sm text-violet-400 font-medium">The Framework</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {pageData.title}
            </h1>
            <p className="text-xl text-zinc-300 leading-relaxed">
              {pageData.subtitle}
            </p>

            {/* View Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-3 mt-8"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedView(selectedView === 'pillars' ? null : 'pillars')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  selectedView === 'pillars'
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Pillars
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedView(selectedView === 'forces' ? null : 'forces')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  selectedView === 'forces'
                    ? 'bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Zap className="w-4 h-4" />
                Forces
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-500 border-r-transparent"></div>
            <p className="text-zinc-400 mt-4">Loading content...</p>
          </div>
        ) : (
          <motion.div
            key={selectedView || 'overview'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <article className="prose prose-invert prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-3xl font-bold text-white mb-6 mt-12">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-violet-400 mt-8 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-lg text-zinc-300 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 text-zinc-300 mb-6">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-2 text-zinc-300 mb-6">
                      {children}
                    </ol>
                  )
                }}
              >
                {selectedView === 'pillars' ? content.pillars :
                 selectedView === 'forces' ? content.forces :
                 content.overview}
              </ReactMarkdown>
            </article>

            {!selectedView && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12 bg-gradient-to-br from-violet-500/10 to-pink-500/5 rounded-2xl border border-violet-500/20 p-8"
              >
                <Link to={createPageUrl('PilarDefinitions')}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Explore the Framework
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}