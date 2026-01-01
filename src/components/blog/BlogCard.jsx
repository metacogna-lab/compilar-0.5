import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import PillarBadge from './PillarBadge';
import { motion } from 'framer-motion';

export default function BlogCard({ post }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-violet-500/30 transition-all duration-300 flex flex-col h-full"
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
      
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          {post.pillar && <PillarBadge pillar={post.pillar} />}
          {post.force_vector && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium">
              ⚡ {post.force_vector}
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 hover:text-violet-400 transition-colors">
          {post.title}
        </h3>

        <p className="text-zinc-400 text-sm mb-4 line-clamp-3 flex-1">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Calendar className="w-3 h-3" />
            {post.publishedDate && format(new Date(post.publishedDate), 'MMM d, yyyy')}
          </div>

          <Link
            to={`${createPageUrl('BlogPost')}?slug=${post.filename.replace('.md', '')}`}
            className="flex items-center gap-1 text-sm text-violet-400 hover:text-violet-300 transition-colors group"
          >
            Read more
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}