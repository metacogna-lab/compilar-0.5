import { create } from 'zustand';
import { base44 } from '@/api/base44Client';

export const useEditorStore = create((set, get) => ({
  // State
  formData: {
    title: '',
    content: '',
    excerpt: '',
    tags: '',
    category: '',
    published: false
  },
  selectedFile: null,
  library: [],
  loading: false,
  isDirty: false,

  // Actions
  setFormData: (data) => set({ formData: data, isDirty: true }),
  
  updateField: (field, value) => set((state) => ({
    formData: { ...state.formData, [field]: value },
    isDirty: true
  })),

  setSelectedFile: (file) => set({ selectedFile: file }),
  
  setLibrary: (library) => set({ library }),
  
  setLoading: (loading) => set({ loading }),

  resetEditor: () => set({
    formData: {
      title: '',
      content: '',
      excerpt: '',
      tags: '',
      category: '',
      published: false
    },
    selectedFile: null,
    isDirty: false
  }),

  markClean: () => set({ isDirty: false }),

  // API Actions
  loadLibrary: async (type, toast) => {
    set({ loading: true });
    try {
      const contents = await base44.entities.CmsContent.filter(
        { content_type: type },
        '-updated_date',
        100
      );
      set({ library: contents || [] });
    } catch (error) {
      console.error('Failed to load library:', error);
      toast.error('Failed to load content library');
      set({ library: [] });
    } finally {
      set({ loading: false });
    }
  },

  save: async (toast) => {
    const { formData, selectedFile } = get();
    
    if (!formData.title || !formData.content) {
      toast.warning('Title and content are required');
      return false;
    }

    // Optimistic UI: Mark as saved immediately
    set({ isDirty: false });
    const previousState = { ...formData };

    try {
      const contentData = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt || '',
        tags: formData.tags || '',
        category: formData.category || '',
        published: formData.published || false,
        content_type: selectedFile?.type || 'blog',
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      };

      if (selectedFile?.id) {
        await base44.entities.CmsContent.update(selectedFile.id, contentData);
        toast.success('Content updated');
      } else {
        const created = await base44.entities.CmsContent.create(contentData);
        set({ selectedFile: { ...selectedFile, id: created.id } });
        toast.success('Content created');
      }

      await get().loadLibrary(selectedFile?.type || 'blog', toast);
      
      // Clear auto-save after successful save
      localStorage.removeItem('cms_autosave');
      
      return true;
    } catch (error) {
      // Revert optimistic update on failure
      console.error('Failed to save content:', error);
      toast.error('Failed to save content');
      set({ isDirty: true, formData: previousState });
      return false;
    }
  },

  publish: async (toast) => {
    const { formData, selectedFile } = get();
    
    if (!selectedFile?.id) {
      toast.warning('Save the content first before publishing');
      return false;
    }

    set({ loading: true });
    try {
      await base44.entities.CmsContent.update(selectedFile.id, {
        published: true
      });
      
      set((state) => ({
        formData: { ...state.formData, published: true },
        isDirty: false
      }));
      
      toast.success('Content published successfully');
      await get().loadLibrary(selectedFile.type, toast);
      return true;
    } catch (error) {
      console.error('Failed to publish:', error);
      toast.error('Failed to publish content');
      return false;
    } finally {
      set({ loading: false });
    }
  },

  deleteContent: async (contentId, type, toast) => {
    set({ loading: true });
    try {
      await base44.entities.CmsContent.delete(contentId);
      toast.success('Content deleted successfully');
      await get().loadLibrary(type, toast);
      get().resetEditor();
      return true;
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Failed to delete content');
      return false;
    } finally {
      set({ loading: false });
    }
  }
}));