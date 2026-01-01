import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import PillarBadge from './PillarBadge';
import { motion } from 'framer-motion';

export default function BlogFeaturedCard({ post }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8 }}
      className="relative group w-full h-96 bg-gradient-to-br from-white/5 to-black/5 border border-white/10 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-end p-6 transition-all duration-300 ease-out hover:border-violet-500/30"
      style={{
        backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0) 100%), url(${post.socialImageUrl || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />

      <div className="relative z-10 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          {post.pillar && <PillarBadge pillar={post.pillar} />}
          {post.force_vector && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
              ⚡ {post.force_vector}
            </span>
          )}
        </div>

        <Link to={`${createPageUrl('BlogPost')}?slug=${post.filename.replace('.md', '')}`}> 
          <h3 className="text-3xl font-bold text-white mb-3 leading-tight group-hover:text-violet-300 transition-colors">
            {post.title}
          </h3>
        </Link>

        <p className="text-zinc-300 text-base mb-4 line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Calendar className="w-4 h-4" />
            {post.publishedDate && format(new Date(post.publishedDate), 'MMM d, yyyy')}
          </div>

          <Link
            to={`${createPageUrl('BlogPost')}?slug=${post.filename.replace('.md', '')}`}
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors group-hover:translate-x-1 duration-300"
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-base font-semibold">Read Insight</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}