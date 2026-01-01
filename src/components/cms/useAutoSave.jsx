import { useEffect, useRef } from 'react';

export function useAutoSave(formData, isDirty, selectedFile, setFormData, toast) {
  const debounceTimerRef = useRef(null);
  const hasCheckedRecoveryRef = useRef(false);

  // Check for recovery data on mount (only once)
  useEffect(() => {
    if (hasCheckedRecoveryRef.current) return;
    hasCheckedRecoveryRef.current = true;
    
    try {
      const saved = localStorage.getItem('cms_autosave');
      if (!saved) return;

      const { formData: savedFormData, timestamp } = JSON.parse(saved);
      
      // Only offer recovery if it's less than 24 hours old
      const ageInHours = (Date.now() - timestamp) / (1000 * 60 * 60);
      if (ageInHours > 24) {
        localStorage.removeItem('cms_autosave');
        return;
      }

      // Prompt user to recover
      const shouldRecover = window.confirm(
        `Found unsaved changes from ${new Date(timestamp).toLocaleString()}.\n\nRecover this draft?`
      );

      if (shouldRecover) {
        setFormData(savedFormData);
        toast.success('Draft recovered from auto-save');
      } else {
        localStorage.removeItem('cms_autosave');
      }
    } catch (error) {
      console.error('Failed to check auto-save:', error);
      localStorage.removeItem('cms_autosave');
    }
  }, [setFormData, toast]);

  // Auto-save to localStorage (debounced)
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (isDirty && selectedFile) {
      debounceTimerRef.current = setTimeout(() => {
        try {
          const autoSaveData = {
            formData,
            selectedFile,
            timestamp: Date.now()
          };
          localStorage.setItem('cms_autosave', JSON.stringify(autoSaveData));
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 3000);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData, isDirty, selectedFile]);
}