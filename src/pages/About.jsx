import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Target, Users, BookOpen, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackPageView } from '@/components/pilar/ActionTracker';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { subtle } from '@/components/config/motion';

export default function About() {
  const [content, setContent] = useState('');
  const [pageData, setPageData] = useState({ title: 'About the PILAR Framework', subtitle: 'Understanding the purpose and foundations of group coordination theory' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView('About');
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await base44.functions.invoke('contentManagement', {
        action: 'read',
        contentType: 'pages',
        slug: 'about'
      });
      
      if (response.data.success && response.data.entry) {
        setContent(response.data.entry.content);
        setPageData({
          title: response.data.entry.title || 'About the PILAR Framework',
          subtitle: response.data.entry.seoDescription || 'Understanding the purpose and foundations of group coordination theory'
        });
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"
        />
      </div>

      
      <motion.div 
        className="relative z-10 px-6 pb-20 max-w-4xl mx-auto"
        variants={subtle.stagger.container}
        initial="hidden"
        animate="show"
      >
        {/* Title */}
        <motion.div
          variants={subtle.stagger.item}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {pageData.title}
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            {pageData.subtitle}
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-violet-500 border-r-transparent"></div>
            <p className="text-zinc-400 mt-4">Loading content...</p>
          </div>
        ) : (
          <motion.div
            variants={subtle.stagger.item}
            className="space-y-8"
          >
            <article className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <div className="rounded-[28px] p-8 border backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border-white/10 mb-8">
                      <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                        <Target className="w-8 h-8 text-violet-400" />
                        {children}
                      </h2>
                    </div>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-violet-400 mt-6 mb-3">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-zinc-300 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-violet-400 font-medium">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 text-zinc-300">
                      {children}
                    </ul>
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          variants={subtle.stagger.item}
          className="mt-12 text-center"
        >
          <Link to={createPageUrl('PilarInfo')}>
            <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white shadow-lg shadow-violet-500/30">
              <BookOpen className="w-4 h-4 mr-2" />
              Explore the Pillars
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}