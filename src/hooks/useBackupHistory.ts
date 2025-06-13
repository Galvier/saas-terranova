
import { useState, useEffect } from 'react';
import { getBackupHistory, BackupHistory } from '@/services/backupService';

export const useBackupHistory = () => {
  const [history, setHistory] = useState<BackupHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getBackupHistory();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshHistory = () => {
    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    isLoading,
    error,
    refreshHistory
  };
};
