import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, AlertTriangle, X, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

export default function MetadataSlider({ 
  formData, 
  setFormData, 
  selectedFile, 
  onAnalyzeAlignment,
  analyzingContent,
  aiAnalysis,
  setAiAnalysis,
  onCheckConsistency,
  checkingConsistency,
  consistencyCheck,
  setConsistencyCheck
}) {
  const [generatingMetadata, setGeneratingMetadata] = useState(false);

  const handleGenerateMetadata = async () => {
    if (!formData.content || !formData.title) {
      alert('Please add title and content first');
      return;
    }

    setGeneratingMetadata(true);
    try {
      const response = await base44.functions.invoke('generateMetadata', {
        content: formData.content,
        title: formData.title,
        contentType: selectedFile.type
      });

      if (response.data.success) {
        const metadata = response.data.metadata;
        
        const updates = {
          ...formData,
          ...(metadata.tags && { tags: Array.isArray(metadata.tags) ? metadata.tags.join(', ') : metadata.tags }),
          ...(metadata.category && { category: metadata.category }),
          ...(metadata.pillar && { pillar: metadata.pillar }),
          ...(metadata.force_vector && { force_vector: metadata.force_vector }),
          ...(metadata.excerpt && { excerpt: metadata.excerpt }),
          ...(metadata.seoDescription && { seoDescription: metadata.seoDescription }),
          ...(metadata.socialImageDescription && { socialImageDescription: metadata.socialImageDescription })
        };
        
        setFormData(updates);
        alert('Metadata generated successfully!');
      } else {
        alert('Failed to generate metadata: ' + (response.data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating metadata:', error);
      alert('Failed to generate metadata: ' + error.message);
    } finally {
      setGeneratingMetadata(false);
    }
  };
  
  // SEO Health Checks
  const getSlugHealth = (slug) => {
    if (!slug) return { status: 'error', message: 'Required' };
    if (!/^[a-z0-9-]+$/.test(slug)) return { status: 'error', message: 'Use only lowercase, numbers, hyphens' };
    if (slug.length > 100) return { status: 'warning', message: 'Too long (>100)' };
    if (slug.length < 3) return { status: 'warning', message: 'Too short (<3)' };
    return { status: 'success', message: 'Good' };
  };

  const getMetaDescriptionHealth = (desc) => {
    if (!desc) return { status: 'error', message: 'Required' };
    const len = desc.length;
    if (len < 120) return { status: 'warning', message: `Too short (${len}/160)` };
    if (len > 160) return { status: 'error', message: `Too long (${len}/160)` };
    return { status: 'success', message: `Perfect (${len}/160)` };
  };

  const getTitleHealth = (title) => {
    if (!title) return { status: 'error', message: 'Required' };
    const len = title.length;
    if (len < 30) return { status: 'warning', message: `Short (${len} chars)` };
    if (len > 70) return { status: 'warning', message: `Long (${len} chars)` };
    return { status: 'success', message: `Good (${len} chars)` };
  };

  const slugHealth = getSlugHealth(formData.slug);
  const metaHealth = getMetaDescriptionHealth(formData.excerpt);
  const titleHealth = getTitleHealth(formData.title);

  const HealthIndicator = ({ health }) => {
    const icons = {
      success: <CheckCircle className="w-3 h-3 text-green-500" />,
      warning: <AlertTriangle className="w-3 h-3 text-amber-500" />,
      error: <AlertCircle className="w-3 h-3 text-red-500" />
    };
    
    return (
      <div className="flex items-center gap-1.5 mt-1">
        {icons[health.status]}
        <span className={cn(
          "text-xs",
          health.status === 'success' && "text-green-500",
          health.status === 'warning' && "text-amber-500",
          health.status === 'error' && "text-red-500"
        )}>
          {health.message}
        </span>
      </div>
    );
  };

  return (
    <div className="w-80 space-y-4 overflow-y-auto pr-2 border-r border-white/10">
      <h3 className="text-sm font-semibold text-zinc-400 mb-4">Metadata & Intelligence</h3>

      {selectedFile?.type !== 'fragments' && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-zinc-400">Content Type</label>
          <span className="text-violet-400 capitalize text-sm">{selectedFile?.type}</span>
        </div>
      )}

      {/* AI Analysis Buttons */}
      {(selectedFile?.type === 'blog' || selectedFile?.type === 'pages') && (
        <div className="space-y-2 pb-4 border-b border-white/10">
          <Button
            onClick={handleGenerateMetadata}
            disabled={generatingMetadata || !formData.content || !formData.title}
            size="sm"
            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {generatingMetadata ? 'Generating...' : 'AI Generate Metadata'}
          </Button>
          
          {selectedFile?.type === 'blog' && (
            <>
              <Button
                onClick={onCheckConsistency}
                disabled={checkingConsistency || !formData.content}
                size="sm"
                className="w-full bg-violet-500 hover:bg-violet-600"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {checkingConsistency ? 'Checking...' : 'Check Consistency'}
              </Button>
              <Button
                onClick={onAnalyzeAlignment}
                disabled={analyzingContent || !formData.content}
                size="sm"
                className="w-full bg-indigo-500 hover:bg-indigo-600"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                {analyzingContent ? 'Analyzing...' : 'Analyze Systemic Alignment'}
              </Button>
            </>
          )}
        </div>
      )}

      {selectedFile?.type !== 'fragments' && (
        <>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Title</label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
              placeholder="Enter title"
            />
            <HealthIndicator health={titleHealth} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Slug</label>
            <Input
              value={formData.slug || ''}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
              placeholder="url-friendly-slug"
            />
            <HealthIndicator health={slugHealth} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Date</label>
            <Input
              type="date"
              value={formData.publishedDate || ''}
              onChange={(e) => setFormData({ ...formData, publishedDate: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Social Image URL</label>
            <Input
              value={formData.socialImageUrl || ''}
              onChange={(e) => setFormData({ ...formData, socialImageUrl: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
              placeholder="https://..."
            />
          </div>

          {formData.socialImageDescription && (
            <div>
              <label className="block text-xs font-medium mb-1.5 text-zinc-400">
                Social Image Description <span className="text-violet-400 text-xs">(AI)</span>
              </label>
              <Textarea
                value={formData.socialImageDescription || ''}
                onChange={(e) => setFormData({ ...formData, socialImageDescription: e.target.value })}
                className="bg-black/30 border-white/10 h-16 text-sm"
                placeholder="AI-generated image description..."
              />
              <p className="text-xs text-zinc-500 mt-1">Use with DALL-E, Midjourney, or other image generators</p>
            </div>
          )}
        </>
      )}

      {selectedFile?.type === 'blog' && (
        <>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">
              Primary Pillar <span className="text-red-400">*</span>
            </label>
            <Input
              value={formData.pillar || ''}
              onChange={(e) => setFormData({ ...formData, pillar: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
              placeholder="e.g., Purpose, Action"
            />
            {!formData.pillar && (
              <div className="flex items-center gap-1.5 mt-1">
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span className="text-xs text-red-500">Required for publication</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Force Vector</label>
            <Input
              value={formData.force_vector || ''}
              onChange={(e) => setFormData({ ...formData, force_vector: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
              placeholder="e.g., Status, Reciprocity"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">
              Excerpt (Meta Description)
            </label>
            <Textarea
              value={formData.excerpt || ''}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="bg-black/30 border-white/10 h-20 text-sm"
              placeholder="Short summary for SEO and social (120-160 chars)"
            />
            <HealthIndicator health={metaHealth} />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Category</label>
            <Input
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Tags</label>
            <Input
              value={formData.tags || ''}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
              placeholder="tag1, tag2"
            />
          </div>
        </>
      )}

      {selectedFile?.type === 'fragments' && (
        <>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Fragment Name</label>
            <Input
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-black/30 border-white/10 text-sm"
              placeholder="snippet-name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">Description</label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="bg-black/30 border-white/10 h-20 text-sm"
              placeholder="What is this snippet for?"
            />
          </div>
        </>
      )}

      {selectedFile?.type === 'pages' && (
        <>
          <div>
            <label className="block text-xs font-medium mb-1.5 text-zinc-400">SEO Description</label>
            <Textarea
              value={formData.seoDescription || ''}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              className="bg-black/30 border-white/10 h-20 text-sm"
              placeholder="Meta description for search engines"
            />
          </div>

          {formData.socialImageDescription && (
            <div>
              <label className="block text-xs font-medium mb-1.5 text-zinc-400">
                Hero Image Description <span className="text-violet-400 text-xs">(AI)</span>
              </label>
              <Textarea
                value={formData.socialImageDescription || ''}
                onChange={(e) => setFormData({ ...formData, socialImageDescription: e.target.value })}
                className="bg-black/30 border-white/10 h-16 text-sm"
                placeholder="AI-generated image description..."
              />
            </div>
          )}
        </>
      )}

      {selectedFile?.type !== 'fragments' && (
        <div>
          <label className="block text-xs font-medium mb-1.5 text-zinc-400">Status</label>
          <select
            value={formData.status || 'draft'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-white text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      )}

      {/* Social Previews */}
      {selectedFile?.type === 'blog' && (
        <div className="mt-6 space-y-4 pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold text-zinc-400 mb-3">Social Media Previews</h4>
          
          {/* X (Twitter) Card */}
          <div className="bg-black/20 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X (Twitter)
            </div>
            {formData.socialImageUrl && (
              <img 
                src={formData.socialImageUrl} 
                alt="Social preview"
                className="w-full h-32 object-cover rounded mb-2"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="text-xs font-semibold text-white line-clamp-2 mb-1">
              {formData.title || 'Your Post Title'}
            </div>
            <div className="text-xs text-zinc-400 line-clamp-2 mb-1">
              {formData.excerpt || 'Add an excerpt for social media preview'}
            </div>
            <div className="text-xs text-zinc-600">
              pilartheory.com/{formData.slug || 'post-slug'}
            </div>
          </div>

          {/* LinkedIn Card */}
          <div className="bg-black/20 border border-white/10 rounded-lg p-3">
            <div className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </div>
            {formData.socialImageUrl && (
              <img 
                src={formData.socialImageUrl} 
                alt="Social preview"
                className="w-full h-36 object-cover rounded mb-2"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="text-xs font-semibold text-white line-clamp-2 mb-1">
              {formData.title || 'Your Post Title'}
            </div>
            <div className="text-xs text-zinc-400 line-clamp-2">
              {formData.excerpt || 'Add an excerpt for social media preview'}
            </div>
          </div>
        </div>
      )}

      {/* Consistency Check Results */}
      {consistencyCheck && selectedFile?.type === 'blog' && (
        <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-violet-400">AI Suggestions</h4>
            <button 
              onClick={() => setConsistencyCheck(null)}
              className="text-zinc-600 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-3">
            {consistencyCheck.suggested_pillar && (
              <div>
                <div className="text-xs text-zinc-400 mb-1">Primary Pillar</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-violet-300">
                    {consistencyCheck.suggested_pillar}
                  </span>
                  <button
                    onClick={() => {
                      const currentTags = formData.tags || '';
                      if (!currentTags.includes(consistencyCheck.suggested_pillar)) {
                        const newTags = currentTags ? `${currentTags}, ${consistencyCheck.suggested_pillar}` : consistencyCheck.suggested_pillar;
                        setFormData({ ...formData, tags: newTags, pillar: consistencyCheck.suggested_pillar });
                      }
                    }}
                    className="text-xs px-2 py-1 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {consistencyCheck.suggested_force && (
              <div>
                <div className="text-xs text-zinc-400 mb-1">Primary Force Vector</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-violet-300">
                    {consistencyCheck.suggested_force}
                  </span>
                  <button
                    onClick={() => {
                      setFormData({ ...formData, force_vector: consistencyCheck.suggested_force });
                    }}
                    className="text-xs px-2 py-1 bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 rounded"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {consistencyCheck.reasoning && (
              <div>
                <div className="text-xs text-zinc-400 mb-1">Reasoning</div>
                <p className="text-xs text-white">{consistencyCheck.reasoning}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Analysis Results */}
      {aiAnalysis && selectedFile?.type === 'blog' && (
        <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-semibold text-indigo-400">Systemic Alignment</h4>
            <button 
              onClick={() => setAiAnalysis(null)}
              className="text-zinc-600 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="text-xs text-zinc-400 mb-1">Alignment Score</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${aiAnalysis.alignment_score || 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-white">
                  {aiAnalysis.alignment_score || 0}/100
                </span>
              </div>
            </div>

            {aiAnalysis.summary && (
              <div>
                <div className="text-xs text-zinc-400 mb-1">Summary</div>
                <p className="text-xs text-white">{aiAnalysis.summary}</p>
              </div>
            )}

            {aiAnalysis.recommendations?.length > 0 && (
              <div>
                <div className="text-xs text-zinc-400 mb-1">Recommendations</div>
                <ul className="text-xs text-zinc-300 space-y-1">
                  {aiAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-indigo-400">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SEO Preview */}
      {selectedFile?.type === 'pages' && (
        <div className="mt-6 p-4 bg-black/20 border border-white/10 rounded-lg">
          <h4 className="text-xs font-semibold text-zinc-400 mb-3">SEO Preview</h4>
          <div className="space-y-2">
            <div className="text-blue-400 text-sm">{formData.title || 'Page Title'}</div>
            <div className="text-xs text-emerald-600">pilartheory.com/{formData.slug || 'slug'}</div>
            <div className="text-xs text-zinc-400">{formData.seoDescription || 'SEO description'}</div>
          </div>
        </div>
      )}
    </div>
  );
}