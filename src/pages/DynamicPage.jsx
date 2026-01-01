import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

export default function DynamicPage() {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    
    if (!slug) {
      setError('No page specified');
      setLoading(false);
      return;
    }

    try {
      const response = await base44.functions.invoke('contentManagement', {
        action: 'read',
        contentType: 'pages',
        slug: slug
      });

      if (response.data.success && response.data.entry) {
        setPage(response.data.entry);
      } else {
        setError(response.data.error || 'Page not found');
      }
    } catch (err) {
      setError('Page not found');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">{error || 'Page not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F12]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden p-8 md:p-12"
        >
          {page.title && (
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
              {page.title}
            </h1>
          )}

          <div className="prose prose-lg prose-slate max-w-none">
            <ReactMarkdown
              components={{
                h1: ({children}) => (
                  <h1 className="text-4xl font-bold mb-6 text-gray-900 leading-tight mt-8">
                    {children}
                  </h1>
                ),
                h2: ({children}) => (
                  <h2 className="text-3xl font-semibold mt-12 mb-4 text-gray-900 leading-snug">
                    {children}
                  </h2>
                ),
                h3: ({children}) => (
                  <h3 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 leading-snug">
                    {children}
                  </h3>
                ),
                p: ({children}) => (
                  <p className="text-lg leading-relaxed mb-6 text-gray-700">
                    {children}
                  </p>
                ),
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-violet-500 pl-6 py-2 my-8 italic text-gray-700 bg-violet-50 rounded-r-lg">
                    {children}
                  </blockquote>
                ),
                ul: ({children}) => (
                  <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
                    {children}
                  </ul>
                ),
                ol: ({children}) => (
                  <ol className="list-decimal pl-6 mb-6 space-y-2 text-gray-700">
                    {children}
                  </ol>
                ),
                li: ({children}) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),
                strong: ({children}) => (
                  <strong className="font-semibold text-gray-900">
                    {children}
                  </strong>
                ),
                em: ({children}) => (
                  <em className="italic text-gray-800">
                    {children}
                  </em>
                ),
                code: ({inline, children}) => 
                  inline ? (
                    <code className="px-2 py-1 bg-gray-100 text-violet-600 rounded text-sm font-mono">
                      {children}
                    </code>
                  ) : (
                    <code className="block bg-gray-900 text-gray-100 p-6 rounded-lg my-6 overflow-x-auto text-sm font-mono">
                      {children}
                    </code>
                  ),
                a: ({href, children}) => (
                  <a href={href} className="text-violet-600 hover:text-violet-700 underline font-medium">
                    {children}
                  </a>
                ),
                hr: () => <hr className="my-12 border-gray-200" />,
                img: ({src, alt}) => (
                  <img 
                    src={src} 
                    alt={alt || ''} 
                    className="rounded-lg my-8 w-full"
                    loading="lazy"
                  />
                )
              }}
            >
              {page.content}
            </ReactMarkdown>
          </div>

          {page.seoDescription && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
                <p className="text-sm text-gray-600 italic">{page.seoDescription}</p>
              </div>
            </div>
          )}
        </motion.article>
      </div>
    </div>
  );
}