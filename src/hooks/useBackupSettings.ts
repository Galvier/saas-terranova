
import { useState, useEffect } from 'react';
import { getBackupSettings, updateBackupSettings, BackupSettings } from '@/services/backupService';

export const useBackupSettings = () => {
  const [settings, setSettings] = useState<BackupSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    console.log('[useBackupSettings] === CARREGANDO CONFIGURAÇÕES ===');
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBackupSettings();
      console.log('[useBackupSettings] Configurações carregadas:', data);
      setSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar configurações';
      console.error('[useBackupSettings] ERRO ao carregar:', err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      console.log('[useBackupSettings] === CARREGAMENTO FINALIZADO ===');
    }
  };

  const updateSettings = async (autoBackupEnabled: boolean) => {
    console.log('[useBackupSettings] === ATUALIZANDO CONFIGURAÇÕES ===');
    console.log('[useBackupSettings] Nova configuração:', { autoBackupEnabled });
    console.log('[useBackupSettings] Configuração atual:', settings);
    
    try {
      const success = await updateBackupSettings(autoBackupEnabled);
      console.log('[useBackupSettings] Resultado da atualização:', success);
      
      if (success) {
        setSettings(prev => prev ? {
          ...prev,
          auto_backup_enabled: autoBackupEnabled,
          updated_at: new Date().toISOString()
        } : null);
        console.log('[useBackupSettings] Estado local atualizado');
        return true;
      } else {
        console.error('[useBackupSettings] Falha na atualização - success = false');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar configurações';
      console.error('[useBackupSettings] ERRO na atualização:', err);
      setError(errorMessage);
      return false;
    } finally {
      console.log('[useBackupSettings] === ATUALIZAÇÃO FINALIZADA ===');
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
