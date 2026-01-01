import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Save, X, AlertCircle, Eye, FileText, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import AdminRoute from '@/components/admin/AdminRoute';
import { useEditorStore } from '@/components/cms/useEditorStore';
import { useCMSReducer } from '@/components/cms/useCMSReducer';
import { useNavigationBlocker } from '@/components/cms/useNavigationBlocker';
import { useContentAnalysis } from '@/components/cms/useContentAnalysis';
import { useAIAuthor } from '@/components/cms/useAIAuthor';
import { useAutoSave } from '@/components/cms/useAutoSave';
import CMSSidebar from '@/components/cms/CMSSidebar';
import MetadataPanel from '@/components/cms/MetadataPanel';
import SiteNarrativeEditor from '@/components/cms/SiteNarrativeEditor';
import ProgressModal from '@/components/cms/ProgressModal';
import { ToastContainer } from '@/components/cms/ToastNotification';
import { useToast } from '@/components/cms/useToast';
import AIWriterModal from '@/components/cms/AIWriterModal';
import SuggestedPostsModal from '@/components/cms/SuggestedPostsModal';
import PreviewPopover from '@/components/cms/PreviewPopover';
import EditorToolbar from '@/components/cms/EditorToolbar';

function CMSContent() {
  const [state, actions] = useCMSReducer();
  const { toasts, removeToast, toast } = useToast();
  const { analyzePilarAlignment, checkConsistency, analyzeBlog } = useContentAnalysis(toast);
  const aiAuthor = useAIAuthor(toast);

  const {
    selectedFile,
    formData,
    isDirty,
    isEditing,
    loading,
    loadingMessage,
    loadingProgress,
    setFormData,
    setOriginalData,
    setLibrary,
    setLoading,
    resetEditor,
    canNavigate,
    openFile
  } = useEditorStore();

  // Auto-save and recovery
  useAutoSave(formData, isDirty, selectedFile, setFormData, toast);

  // Robust navigation blocker with react-router
  useNavigationBlocker(isDirty);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (state.user?.role === 'admin') {
      loadLibrary();
    }
  }, [state.user]);

  const checkAuth = async () => {
    try {
      const userData = await base44.auth.me();
      actions.setUser(userData);
    } catch (error) {
      console.error('Auth check failed:', error);
    }
  };

  const loadLibrary = async () => {
    setLoading(true, 'Loading library...');
    try {
      const [pagesRes, blogRes, fragmentsRes] = await Promise.all([
        base44.functions.invoke('contentManagement', { action: 'list', contentType: 'pages' }),
        base44.functions.invoke('contentManagement', { action: 'list', contentType: 'blog' }),
        base44.functions.invoke('contentManagement', { action: 'list', contentType: 'fragments' })
      ]);

      const libraryData = {
        pages: pagesRes.data.entries || [],
        blog: blogRes.data.entries || [],
        fragments: fragmentsRes.data.entries || []
      };
      setLibrary(libraryData);
    } catch (error) {
      console.error('Failed to load library:', error);
      toast.error('Failed to load library');
    } finally {
      setLoading(false);
    }
  };



  const getTemplate = (type) => {
    if (type === 'blog') {
      return `# Executive Summary

[Provide a compelling 2-3 sentence overview that captures the essence of this policy issue and why it matters now. Focus on the systemic implications and the key force vectors at play.]

## Systemic Impact

[Detail how this policy or change affects the broader system. Consider both immediate effects and downstream consequences. Reference the PILAR framework where relevant - which pillars are most impacted? How does this shift power dynamics, information flow, or resource allocation?]

### Hierarchical Mode Implications

[Analyze how this affects hierarchical structures: status, direct reciprocity, normative expression, incoming respect, and own prospects]

### Egalitarian Mode Implications

[Analyze how this affects egalitarian dynamics: popularity, indirect reciprocity, diverse expression, outgoing respect, and group prospects]

## Force Vector Analysis

**Primary Force Vector:** [Name the dominant force]

[Provide detailed analysis of the primary force driving this system change. What behavioral dynamics does it create? How does it compound over time? What feedback loops emerge?]

**Secondary Forces:**

- **[Force Name]:** [Brief analysis of how this force interacts with the primary vector]
- **[Force Name]:** [Brief analysis]

## Policy Recommendations

1. **[Recommendation Title]:** [Specific, actionable recommendation with clear implementation path]
2. **[Recommendation Title]:** [Another recommendation]
3. **[Recommendation Title]:** [Another recommendation]

## Implementation Considerations

### Short-term Actions (0-3 months)
[List immediate steps]

### Medium-term Strategy (3-12 months)
[List strategic moves]

### Long-term Vision (12+ months)
[Describe sustained change approach]

### Measurement & Adaptation
[Define success metrics and feedback mechanisms]

## Conclusion

[Synthesize key insights and call to action. Emphasize the systemic logic and why acting on this matters for organizational or societal wellbeing.]`;
    } else if (type === 'pages') {
      return `## Introduction

[Opening paragraph that establishes context and purpose]

## Core Concepts

[Main content sections]

## Conclusion

[Summary and next steps]`;
    } else if (type === 'fragments') {
      return `[Reusable content snippet or UI element]`;
    }
    return '';
  };

  const handleCreate = (type) => {
    if (!canNavigate()) return;

    const newData = {
      title: '',
      slug: '',
      content: getTemplate(type),
      status: 'draft',
      publishedDate: new Date().toISOString().split('T')[0],
      ...(type === 'blog' && {
        author: state.user?.full_name || 'Admin',
        pillar: '',
        force_vector: '',
        tags: '',
        category: 'Policy',
        excerpt: '',
        socialImageUrl: ''
      }),
      ...(type === 'pages' && {
        seoDescription: '',
        socialImageUrl: ''
      }),
      ...(type === 'fragments' && {
        name: '',
        description: ''
      })
    };

    openFile({ filename: null }, type, newData);
  };

  const handleGenerateSuggestions = async () => {
    actions.setSuggestions(null, true);
    try {
      const response = await base44.functions.invoke('suggestBlogPosts', {});
      
      if (response.data.success) {
        actions.setSuggestions(response.data.suggestions);
        toast.success('Generated post suggestions');
      } else {
        toast.error('Failed to generate suggestions: ' + (response.data.error || 'Unknown error'));
        actions.setSuggestions(null);
      }
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions: ' + error.message);
      actions.setSuggestions(null);
    }
  };

  const handleAnalyzeBlog = async () => {
    actions.setBlogAnalysis(null, true);
    const result = await analyzeBlog(
      formData.content,
      formData.title,
      formData.tags,
      formData.category,
      formData.excerpt
    );
    actions.setBlogAnalysis(result);
  };

  const handleUseSuggestion = (suggestion) => {
    if (!canNavigate()) return;

    const newData = {
      title: suggestion.title,
      slug: suggestion.slug,
      content: suggestion.content,
      status: 'draft',
      publishedDate: new Date().toISOString().split('T')[0],
      author: state.user?.full_name || 'Admin',
      tags: suggestion.tags,
      category: suggestion.category,
      excerpt: suggestion.excerpt,
      socialImageUrl: ''
    };

    openFile({ filename: null }, 'blog', newData);
    actions.setSuggestions(null);
  };

  const handleLoadSitePages = async () => {
    actions.startLoading('loadingSitePages');
    setLoading(true, 'Loading site pages...');
    try {
      const response = await base44.functions.invoke('contentManagement', { 
        action: 'list', 
        contentType: 'pages' 
      });
      
      const pagesData = response.data.entries || [];
      setLibrary(prev => ({ ...prev, pages: pagesData }));
      
      toast.success(`Loaded ${pagesData.length} site page(s)`);
    } catch (error) {
      console.error('Failed to load site pages:', error);
      toast.error('Failed to load site pages');
    } finally {
      actions.stopLoading('loadingSitePages');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true, 'Saving content...');
    try {
      await base44.functions.invoke('contentManagement', {
        action: selectedFile?.filename ? 'update' : 'create',
        contentType: selectedFile.type,
        data: formData,
        slug: selectedFile?.filename
      });
      
      setOriginalData(formData);
      await loadLibrary();
      toast.success('Content saved successfully');
    } catch (error) {
      console.error('Failed to save:', error);
      toast.error('Failed to save content');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    const updatedData = { ...formData, status: 'published' };
    setFormData(updatedData);
    
    setLoading(true, 'Publishing content...');
    try {
      await base44.functions.invoke('contentManagement', {
        action: selectedFile?.filename ? 'update' : 'create',
        contentType: selectedFile.type,
        data: updatedData,
        slug: selectedFile?.filename
      });
      
      setOriginalData(updatedData);
      await loadLibrary();
      toast.success('Content published successfully');
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error('Failed to publish content');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (file, type) => {
    if (!confirm(`Delete ${file.filename}?`)) return;
    
    setLoading(true, 'Deleting...');
    try {
      await base44.functions.invoke('contentManagement', {
        action: 'delete',
        contentType: type,
        slug: file.filename
      });
      
      if (selectedFile?.filename === file.filename) {
        resetEditor();
      }
      
      await loadLibrary();
      toast.success('Content deleted');
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete content');
    } finally {
      setLoading(false);
    }
  };



  const handleAnalyzePilarAlignment = async () => {
    actions.setAnalysis(null, true);
    const result = await analyzePilarAlignment(formData.content, formData.title);
    actions.setAnalysis(result);
  };

  const handleCheckConsistency = async () => {
    actions.setConsistency(null, true);
    const result = await checkConsistency(
      formData.content,
      formData.title,
      formData.tags,
      formData.category
    );
    actions.setConsistency(result);
  };



  return (
    <div className="min-h-screen bg-[#0F0F12] text-white">
      <div className="flex h-screen overflow-hidden">
        <CMSSidebar
          onCreateNew={handleCreate}
          onDelete={handleDelete}
          onGenerateSuggestions={handleGenerateSuggestions}
          generatingSuggestions={state.generatingSuggestions}
          onLoadSitePages={handleLoadSitePages}
          loadingSitePages={state.loadingSitePages}
          selectedCategory={state.selectedCategory}
          setSelectedCategory={actions.setSelectedCategory}
          toast={toast}
        />

        <SuggestedPostsModal
          isOpen={!!state.suggestedPosts}
          suggestions={state.suggestedPosts}
          onClose={() => actions.setSuggestions(null)}
          onSelect={handleUseSuggestion}
        />

        {/* Main Editor */}
        <div className="flex-1 flex flex-col h-full">
          {isDirty && (
            <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-2 text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">You have unsaved changes</span>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {!isEditing ? (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                <FileText className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg mb-2">Welcome to the CMS Workstation</p>
                <p className="text-sm text-zinc-600">Select a file from the library or create a new entry</p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    {selectedFile?.type === 'prompts' ? 'System Prompt' : `${selectedFile?.filename ? 'Edit' : 'Create'} ${selectedFile?.type}`}
                  </h2>
                  <EditorToolbar
                    onAIWriter={() => actions.setShowAIWriter(true)}
                    onMetadata={actions.toggleMetadata}
                    onPreview={actions.togglePreview}
                    onCancel={() => {
                      if (canNavigate()) {
                        resetEditor();
                      }
                    }}
                    onSave={handleSave}
                    loading={loading}
                    selectedFile={selectedFile}
                  />
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Metadata Panel */}
                    {(selectedFile?.type === 'blog' || selectedFile?.type === 'pages' || selectedFile?.type === 'fragments') && (
                      <div className="w-full">
                        <MetadataPanel
                          formData={formData}
                          setFormData={setFormData}
                          selectedFile={selectedFile}
                          onAnalyzeAlignment={handleAnalyzePilarAlignment}
                          analyzingContent={state.analyzingContent}
                          aiAnalysis={state.aiAnalysis}
                          setAiAnalysis={(val) => actions.setAnalysis(val)}
                          onCheckConsistency={handleCheckConsistency}
                          checkingConsistency={state.checkingConsistency}
                          consistencyCheck={state.consistencyCheck}
                          setConsistencyCheck={(val) => actions.setConsistency(val)}
                          onAnalyzeBlog={handleAnalyzeBlog}
                          analyzingBlog={state.analyzingBlog}
                          blogAnalysis={state.blogAnalysis}
                          setBlogAnalysis={(val) => actions.setBlogAnalysis(val)}
                          showPanel={state.showMetadataPanel}
                          onClose={actions.toggleMetadata}
                          toast={toast}
                        />
                      </div>
                    )}

                    {/* System Prompts View */}
                    {selectedFile?.type === 'prompts' ? (
                      <div className="w-full">
                        <div className="mb-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                          <h3 className="text-sm font-semibold text-indigo-300 mb-2">{formData.name}</h3>
                          <p className="text-xs text-indigo-200/70">Applies to: {formData.appliesTo}</p>
                        </div>
                        <div className="flex items-center justify-between mb-2 px-1">
                          <h3 className="text-sm font-semibold text-zinc-400">System Prompt</h3>
                          <span className="text-xs text-zinc-500">{formData.prompt?.length || 0} chars</span>
                        </div>
                        <Textarea
                          value={formData.prompt || ''}
                          readOnly
                          className="w-full h-96 bg-[#1a1a1f] border-white/10 font-mono text-sm resize-none leading-relaxed opacity-80"
                          style={{
                            fontSize: '13px',
                            lineHeight: '1.8',
                            padding: '16px',
                            letterSpacing: '0.01em'
                          }}
                        />
                      </div>
                    ) : selectedFile?.type === 'pages' ? (
                      <div className="w-full">
                        <SiteNarrativeEditor
                          formData={formData}
                          setFormData={setFormData}
                        />
                        <div className="flex justify-end mt-3">
                          <Button
                            onClick={handlePublish}
                            disabled={loading}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            {formData.status === 'published' ? 'Update & Keep Published' : 'Publish'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <h3 className="text-sm font-semibold text-zinc-400">Markdown Editor</h3>
                          <span className="text-xs text-zinc-500">{formData.content?.length || 0} chars</span>
                        </div>
                        <Textarea
                          value={formData.content || ''}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          className="w-full h-96 bg-[#1a1a1f] border-white/10 font-mono text-sm resize-none leading-relaxed"
                          style={{
                            fontSize: '13px',
                            lineHeight: '1.8',
                            padding: '16px',
                            letterSpacing: '0.01em'
                          }}
                          placeholder="Write your content in Markdown...&#10;&#10;Use # for headers, **bold**, *italic*, > for quotes..."
                        />
                        {selectedFile?.type !== 'fragments' && (
                          <div className="flex justify-end mt-3">
                            <Button
                              onClick={handlePublish}
                              disabled={loading}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                              {formData.status === 'published' ? 'Update & Keep Published' : 'Publish'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <AIWriterModal
                    isOpen={state.showAIWriter}
                    onClose={() => {
                      actions.setShowAIWriter(false);
                      aiAuthor.reset();
                    }}
                    onUseContent={(content) => {
                      setFormData({ ...formData, content });
                      actions.setShowAIWriter(false);
                      aiAuthor.reset();
                    }}
                    toast={toast}
                    aiAuthor={aiAuthor}
                  />

                  <PreviewPopover
                    isOpen={state.showPreviewPopover}
                    content={formData.content}
                    onClose={actions.togglePreview}
                  />


                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProgressModal 
        isOpen={loading} 
        message={loadingMessage} 
        progress={loadingProgress} 
      />
      
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function CMS() {
  return (
    <AdminRoute>
      <CMSContent />
    </AdminRoute>
  );
}