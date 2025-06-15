
import { useState, useCallback } from 'react';
import { UserSettings } from './useUserSettings';

export interface PendingChanges {
  hasChanges: boolean;
  changedFields: Set<string>;
}

export function usePendingSettings(initialSettings: UserSettings) {
  const [pendingSettings, setPendingSettings] = useState<UserSettings>(initialSettings);
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({
    hasChanges: false,
    changedFields: new Set()
  });

  const updatePendingSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setPendingSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Track which fields changed
      const changedFields = new Set<string>();
      Object.keys(newSettings).forEach(key => {
        if (JSON.stringify(prev[key as keyof UserSettings]) !== JSON.stringify(newSettings[key as keyof UserSettings])) {
          changedFields.add(key);
        }
      });
      
      setPendingChanges(prevChanges => ({
        hasChanges: prevChanges.hasChanges || changedFields.size > 0,
        changedFields: new Set([...prevChanges.changedFields, ...changedFields])
      }));
      
      return updated;
    });
  }, []);

  const clearPendingChanges = useCallback(() => {
    setPendingChanges({
      hasChanges: false,
      changedFields: new Set()
    });
  }, []);

  const resetPendingSettings = useCallback((settings: UserSettings) => {
    setPendingSettings(settings);
    clearPendingChanges();
  }, [clearPendingChanges]);

  return {
    pendingSettings,
    pendingChanges,
    updatePendingSettings,
    clearPendingChanges,
    resetPendingSettings
  };
}
