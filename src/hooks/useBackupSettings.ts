
import { useState, useEffect } from 'react';
import { getBackupSettings, updateBackupSettings, BackupSettings } from '@/services/backupService';

export const useBackupSettings = () => {
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBackupSettings();
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (autoBackupEnabled: boolean) => {
    try {
      const success = await updateBackupSettings(autoBackupEnabled);
      if (success) {
        setSettings(prev => prev ? {
          ...prev,
          auto_backup_enabled: autoBackupEnabled,
          updated_at: new Date().toISOString()
        } : null);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configurações');
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    refreshSettings: fetchSettings
  };
};
