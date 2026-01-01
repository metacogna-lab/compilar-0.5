import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Filter, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import BlogCard from '@/components/blog/BlogCard';
import BlogFeaturedCard from '@/components/blog/BlogFeaturedCard';
import { motion } from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';

export default function PolicyBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('all');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('contentManagement', {
        action: 'list',
        contentType: 'blog'
      });
      
      const publishedPosts = (response.data.entries || [])
        .filter(post => post.status === 'published')
        .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate));
      
      setPosts(publishedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPillar = selectedPillar === 'all' || 
      post.pillar?.toLowerCase() === selectedPillar.toLowerCase();
    
    return matchesSearch && matchesPillar;
  });

  const uniquePillars = [...new Set(posts.map(p => p.pillar).filter(Boolean))];
  
  // Separate featured posts (first 3) from regular posts
  const featuredPosts = filteredPosts.slice(0, 3);
  const regularPosts = filteredPosts.slice(3);

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <Sparkles className="w-10 h-10 text-violet-400" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Policy Blog
            </h1>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
          >
            Analyzing policy through the lens of PILAR Theory—understanding the systemic forces that shape outcomes, behaviors, and institutional dynamics.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 max-w-4xl mx-auto"
        >
          <div className="flex flex-col md:flex-row gap-4 p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 backdrop-blur-sm">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-black/20 border-white/20 focus:border-violet-500/50 h-12 text-white placeholder:text-zinc-500"
                placeholder="Search posts..."
              />
            </div>

            <div className="flex items-center gap-3 bg-black/20 px-4 rounded-lg border border-white/20">
              <Filter className="w-5 h-5 text-zinc-400" />
              <select
                value={selectedPillar}
                onChange={(e) => setSelectedPillar(e.target.value)}
                className="py-3 bg-transparent border-none text-white focus:outline-none cursor-pointer"
              >
                <option value="all">All Pillars</option>
                {uniquePillars.map(pillar => (
                  <option key={pillar} value={pillar}>{pillar}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Featured Posts Carousel */}
        {!loading && featuredPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Featured Insights</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => emblaApi?.scrollPrev()}
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => emblaApi?.scrollNext()}
                  className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {featuredPosts.map((post) => (
                  <div key={post.filename} className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0">
                    <BlogFeaturedCard post={post} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Regular Posts Grid */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-zinc-400 text-lg"
              >
                Loading posts...
              </motion.div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-violet-500/10 mb-6">
                <Sparkles className="w-10 h-10 text-violet-400" />
              </div>
              <p className="text-zinc-400 text-xl mb-2">No posts found</p>
              <p className="text-sm text-zinc-600">Try adjusting your filters or search query</p>
            </motion.div>
          ) : regularPosts.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">Latest Insights</h2>
              <div className="grid md:grid-cols-2 gap-8">
                {regularPosts.map((post, i) => (
                  <motion.div
                    key={post.filename}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                  >
                    <BlogCard post={post} />
                  </motion.div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}