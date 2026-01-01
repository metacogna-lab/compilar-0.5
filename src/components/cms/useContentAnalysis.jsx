import { base44 } from '@/api/base44Client';

/**
 * Hook for content analysis operations
 * Centralizes validation, consistency checks, and PILAR alignment analysis
 */
export function useContentAnalysis(toast) {
  const analyzePilarAlignment = async (content, title) => {
    if (!content) {
      toast?.warning('Please add content before analyzing');
      return null;
    }

    try {
      const response = await base44.functions.invoke('analyzePilarAlignment', {
        content,
        title
      });

      if (response.data.success) {
        toast?.success('Alignment analysis complete');
        return response.data.analysis;
      } else {
        toast?.error('Analysis failed');
        return null;
      }
    } catch (error) {
      console.error('Error analyzing content:', error);
      toast?.error('Failed to analyze content');
      return null;
    }
  };

  const checkConsistency = async (content, title, tags, category) => {
    if (!content) {
      toast?.warning('Please add content before checking consistency');
      return null;
    }

    try {
      const response = await base44.functions.invoke('checkContentConsistency', {
        content,
        title,
        existingTags: tags || '',
        category: category || ''
      });

      if (response.data.success) {
        toast?.success('Consistency check complete');
        return response.data.suggestions;
      } else {
        toast?.error('Consistency check failed');
        return null;
      }
    } catch (error) {
      console.error('Error checking consistency:', error);
      toast?.error('Failed to check consistency');
      return null;
    }
  };

  const analyzeBlog = async (content, title, tags, category, excerpt) => {
    if (!content || !title) {
      toast?.warning('Please add title and content before analysis');
      return null;
    }

    try {
      const response = await base44.functions.invoke('analyzeBlogPost', {
        content,
        title,
        tags,
        category,
        excerpt
      });

      if (response.data.success) {
        toast?.success('Analysis complete');
        return response.data.analysis;
      } else {
        toast?.error('Analysis failed');
        return null;
      }
    } catch (error) {
      console.error('Error analyzing blog:', error);
      toast?.error('Analysis failed: ' + error.message);
      return null;
    }
  };

  return {
    analyzePilarAlignment,
    checkConsistency,
    analyzeBlog
  };
}