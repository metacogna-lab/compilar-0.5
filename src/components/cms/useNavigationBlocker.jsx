import { useEffect } from 'react';

/**
 * Hook to block navigation when there are unsaved changes
 * Works with standard BrowserRouter setup
 */
export function useNavigationBlocker(isDirty, message = 'You have unsaved changes. Are you sure you want to leave?') {
  
  // Block browser navigation (back button, refresh, close tab)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message]);

  return { shouldBlock: isDirty };
}