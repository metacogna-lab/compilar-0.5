import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Folder, Edit2, Search, Filter, X, Plus, Trash2, AlertCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEditorStore } from './useEditorStore';
import { base44 } from '@/api/base44Client';
import { systemPrompts } from './systemPrompts';

// Import PILAR data for filtering
import { pillarsInfo } from '@/components/pilar/pillarsData';

export default function CMSSidebar({ onCreateNew, onDelete, onGenerateSuggestions, generatingSuggestions, onLoadSitePages, loadingSitePages, selectedCategory, setSelectedCategory, toast }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPillars, setSelectedPillars] = useState([]);
  const [showPillarFilter, setShowPillarFilter] = useState(false);
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  
  const { library, selectedFile, canNavigate, openFile, setLoading } = useEditorStore();

  // Get all unique pillars from PILAR data
  const allPillars = useMemo(() => {
    const pillars = new Set();
    ['egalitarian', 'hierarchical'].forEach(mode => {
      pillarsInfo[mode]?.forEach(pillar => {
        pillars.add(pillar.title);
      });
    });
    return Array.from(pillars);
  }, []);

  // Get tags and years for blog filtering
  const getAllTags = () => {
    const tags = new Set();
    if (library?.blog) {
      library.blog.forEach(entry => {
        if (entry.tagsArray) {
          entry.tagsArray.forEach(tag => tags.add(tag));
        }
      });
    }
    return Array.from(tags);
  };

  const getAllYears = () => {
    const years = new Set();
    if (library?.blog) {
      library.blog.forEach(entry => {
        if (entry.year) years.add(entry.year);
      });
    }
    return Array.from(years).sort((a, b) => b - a);
  };

  // Get current entries based on selected category
  const getCurrentEntries = () => {
    if (selectedCategory === 'prompts') {
      return systemPrompts.map(p => ({ 
        filename: p.id, 
        title: p.name, 
        name: p.name,
        appliesTo: p.appliesTo 
      }));
    }
    const entriesMap = {
      blog: library?.blog || [],
      pages: library?.pages || [],
      fragments: library?.fragments || []
    };
    return entriesMap[selectedCategory] || [];
  };

  // Filter entries
  const getFilteredEntries = () => {
    let filtered = getCurrentEntries();

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(entry =>
        (entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         entry.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         entry.filename?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Pillar filter
    if (selectedPillars.length > 0) {
      filtered = filtered.filter(entry => {
        const tags = entry.tags?.toLowerCase() || '';
        const title = entry.title?.toLowerCase() || '';
        return selectedPillars.some(pillar => 
          tags.includes(pillar.toLowerCase()) || title.includes(pillar.toLowerCase())
        );
      });
    }

    // Blog-specific filters
    if (selectedCategory === 'blog') {
      if (selectedTag !== 'all') {
        filtered = filtered.filter(entry =>
          entry.tagsArray?.includes(selectedTag) || entry.tags?.includes(selectedTag)
        );
      }

      if (selectedYear !== 'all') {
        filtered = filtered.filter(entry => entry.year?.toString() === selectedYear);
      }
    }

    return filtered;
  };

  const handleSelectFile = async (file, type) => {
    if (!canNavigate()) return;

    setLoading(true, 'Loading content...');
    try {
      if (type === 'prompts') {
        const promptData = systemPrompts.find(p => p.id === file.filename);
        if (promptData) {
          openFile(file, type, promptData);
        } else {
          throw new Error('System prompt not found');
        }
      } else {
        const response = await base44.functions.invoke('contentManagement', {
          action: 'read',
          contentType: type,
          slug: file.slug
        });
        
        const entry = response.data.entry;
        if (entry) {
          openFile(file, type, {
            title: entry.title,
            content: entry.content,
            seoDescription: entry.seoDescription,
            status: entry.status,
            author: entry.author,
            publishedDate: entry.publishedDate,
            pillar: entry.pillar,
            force_vector: entry.force_vector,
            tags: entry.tags,
            tagsArray: entry.tagsArray,
            category: entry.category,
            excerpt: entry.excerpt,
            socialImageUrl: entry.socialImageUrl,
            slug: entry.slug
          });
        } else {
          throw new Error('Content not found');
        }
      }
    } catch (error) {
      console.error('Failed to load file:', error);
      if (toast) {
        toast.error('Failed to load file: ' + (error.message || 'Unknown error'));
      } else {
        alert('Failed to load file');
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePillar = (pillar) => {
    setSelectedPillars(prev => 
      prev.includes(pillar) 
        ? prev.filter(p => p !== pillar)
        : [...prev, pillar]
    );
  };

  const categoryOptions = [
    { key: 'blog', label: 'Policy Blog', icon: FileText },
    { key: 'pages', label: 'Site Narrative', icon: Folder },
    { key: 'fragments', label: 'UI Snippets', icon: Edit2 },
    { key: 'prompts', label: 'System Prompts', icon: Zap }
  ];

  const filteredEntries = getFilteredEntries();
  const currentCategory = categoryOptions.find(c => c.key === selectedCategory);

  return (
    <div className="w-80 border-r border-white/10 bg-black/20 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <h1 className="text-xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
          Content Library
        </h1>
        
        {/* Category Dropdown */}
        <div className="mb-3">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-violet-500/50"
          >
            {categoryOptions.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-black/30 border-white/10"
            placeholder="Search content..."
          />
        </div>

        {/* Pillar Filter Toggle */}
        <div className="flex gap-2 mb-3">
          <Button
            onClick={() => setShowPillarFilter(!showPillarFilter)}
            size="sm"
            variant="outline"
            className="flex-1 text-xs"
          >
            <Filter className="w-3 h-3 mr-2" />
            Pillar Filter {selectedPillars.length > 0 && `(${selectedPillars.length})`}
          </Button>
        </div>

        {/* Pillar Multi-Select */}
        <AnimatePresence>
          {showPillarFilter && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-3 overflow-hidden"
            >
              <div className="p-2 bg-black/30 border border-white/10 rounded-lg space-y-1 max-h-48 overflow-y-auto">
                {allPillars.map(pillar => (
                  <button
                    key={pillar}
                    onClick={() => togglePillar(pillar)}
                    className={cn(
                      "w-full text-left px-2 py-1 text-xs rounded transition-colors",
                      selectedPillars.includes(pillar)
                        ? "bg-violet-500/30 text-violet-300"
                        : "hover:bg-white/5 text-zinc-400"
                    )}
                  >
                    {pillar}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blog-specific filters */}
        {selectedCategory === 'blog' && (
          <div className="flex gap-2">
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs bg-black/30 border border-white/10 rounded"
            >
              <option value="all">All Tags</option>
              {getAllTags().map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs bg-black/30 border border-white/10 rounded"
            >
              <option value="all">All Years</option>
              {getAllYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2 space-y-1">
          {selectedCategory === 'pages' ? (
            <>
              <Button
                onClick={onLoadSitePages}
                disabled={loadingSitePages}
                size="sm"
                className="w-full justify-start text-xs bg-indigo-500 hover:bg-indigo-600"
              >
                <Folder className="w-3 h-3 mr-2" />
                {loadingSitePages ? 'Loading...' : 'Load Site Narrative'}
              </Button>
              <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                <p className="font-semibold mb-1">⚠️ Editable Pages Only:</p>
                <p className="text-[10px] leading-tight">• What is Compilar? (Both views)<br/>• Theory (About)</p>
              </div>
            </>
          ) : selectedCategory !== 'prompts' && (
            <Button
              onClick={() => onCreateNew(selectedCategory)}
              size="sm"
              className="w-full justify-start text-xs bg-violet-500 hover:bg-violet-600"
            >
              <Plus className="w-3 h-3 mr-2" />
              New {currentCategory?.label}
            </Button>
          )}

          {filteredEntries.map(entry => (
            <div
              key={entry.filename}
              className={cn(
                "flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group",
                selectedFile?.filename === entry.filename && "bg-violet-500/20"
              )}
            >
              <button
                onClick={() => handleSelectFile(entry, selectedCategory)}
                className="flex-1 text-left min-w-0"
              >
                <p className="text-sm truncate">
                  {entry.title || entry.name || entry.filename}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {selectedCategory === 'prompts' ? entry.appliesTo : entry.filename}
                </p>
              </button>
              {selectedCategory !== 'prompts' && (
                <button
                  onClick={() => onDelete(entry, selectedCategory)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              )}
            </div>
          ))}

          {filteredEntries.length === 0 && (
            <p className="text-xs text-zinc-600 text-center py-4">No files</p>
          )}
        </div>
      </div>

      {/* Footer - Suggest Posts Button */}
      {selectedCategory === 'blog' && (
        <div className="p-4 border-t border-white/10">
          <Button
            onClick={onGenerateSuggestions}
            disabled={generatingSuggestions}
            className="w-full bg-violet-500 hover:bg-violet-600 text-white"
            size="sm"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            {generatingSuggestions ? 'Generating...' : 'Suggest New Posts'}
          </Button>
        </div>
      )}

    </div>
  );
}