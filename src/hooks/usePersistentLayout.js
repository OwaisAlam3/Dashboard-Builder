import { useEffect } from 'react';
import useDashboardStore from '../store/dashboardStore';

export const usePersistentLayout = () => {
  const loadFromLocalStorage = useDashboardStore((state) => state.loadFromLocalStorage);
  const saveToLocalStorage = useDashboardStore((state) => state.saveToLocalStorage);

  useEffect(() => {
    // Load on mount
    loadFromLocalStorage();

    // Save on unmount or before page unload
    const handleBeforeUnload = () => {
      saveToLocalStorage();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveToLocalStorage();
    };
  }, [loadFromLocalStorage, saveToLocalStorage]);

  return { saveToLocalStorage };
};