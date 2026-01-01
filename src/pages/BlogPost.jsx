import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import PillarBadge from '@/components/blog/PillarBadge';
import SystemicFooter from '@/components/blog/SystemicFooter';
import { motion } from 'framer-motion';

export default function BlogPost() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, []);

  const loadPost = async () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    
    if (!slug) {
      setError('No post specified');
      setLoading(false);
      return;
    }

    try {
      const response = await base44.functions.invoke('contentManagement', {
        action: 'get',
        contentType: 'blog',
        slug: `${slug}.md`
      });

      const content = response.data.content;
      const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)/);
      
      if (frontmatterMatch) {
        const metadata = {};
        frontmatterMatch[1].split('\n').forEach(line => {
          const [key, ...valueParts] = line.split(':');
          if (key && valueParts.length) {
            metadata[key.trim()] = valueParts.join(':').trim();
          }
        });
        
        setPost({
          ...metadata,
          content: frontmatterMatch[2],
          slug
        });
      } else {
        setError('Invalid post format');
      }
    } catch (err) {
      setError('Post not found');
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">{error || 'Post not found'}</p>
          <Link to={createPageUrl('PolicyBlog')} className="text-violet-400 hover:text-violet-300">
            ← Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F12]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link 
          to={createPageUrl('PolicyBlog')}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to blog
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          {post.socialImageUrl && (
            <div className="aspect-video overflow-hidden">
              <img
                src={post.socialImageUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {post.pillar && <PillarBadge pillar={post.pillar} />}
              {post.force_vector && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 text-sm font-medium">
                  ⚡ {post.force_vector}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Author & Date */}
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200">
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
              )}
              {post.publishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(post.publishedDate), 'MMMM d, yyyy')}
                </div>
              )}
            </div>

            {/* Content */}
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
                  hr: () => <hr className="my-12 border-gray-200" />
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Systemic Footer */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 -mx-8 md:-mx-12 px-8 md:px-12 py-8 mt-12">
              <SystemicFooter 
                pillar={post.pillar} 
                force_vector={post.force_vector}
                tags={post.tags}
              />
            </div>
          </div>
        </motion.article>
      </div>
    </div>
  );
}