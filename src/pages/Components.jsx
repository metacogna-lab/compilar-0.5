import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { Boxes } from 'lucide-react';

export default function Components() {
  const [content, setContent] = useState('');
  const [pageData, setPageData] = useState({
    title: 'PILAR Components',
    subtitle: 'The building blocks of systemic analysis'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await base44.functions.invoke('contentManagement', {
        action: 'read',
        contentType: 'pages',
        slug: 'components'
      });
      
      if (response.data.success && response.data.entry) {
        setContent(response.data.entry.content);
        setPageData({
          title: response.data.entry.title || 'PILAR Components',
          subtitle: response.data.entry.seoDescription || 'The building blocks of systemic analysis'
        });
      }
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-24 pt-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {pageData.title}
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
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
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-12"
          >
            <article className="prose prose-invert prose-violet max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => (
                    <section className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-8">
                      <h2 className="text-3xl font-bold mb-6 text-white flex items-center gap-3">
                        <Boxes className="w-8 h-8 text-violet-400" />
                        {children}
                      </h2>
                    </section>
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
                    <strong className="text-violet-400 font-semibold">
                      {children}
                    </strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-2 text-zinc-300 mb-4">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-2 text-zinc-300 mb-4">
                      {children}
                    </ol>
                  )
                }}
              >
                {content}
              </ReactMarkdown>
            </article>
          </motion.div>
        )}
      </div>
    </div>
  );
}