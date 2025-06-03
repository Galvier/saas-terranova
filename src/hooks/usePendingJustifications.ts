
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPendingJustifications, PendingJustification } from '@/integrations/supabase/metrics/metricJustifications';
import { useRealTimeSubscription } from '@/hooks/useRealTimeSubscription';

export const usePendingJustifications = () => {
  const [count, setCount] = useState(0);

  const { data: justifications = [], isLoading, error } = useQuery({
    queryKey: ['pending-justifications'],
    queryFn: async () => {
      const result = await getPendingJustifications();
      if (result.error) {
        throw new Error(result.message || 'Erro ao carregar justificativas');
      }
      return result.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Update count when data changes
  useEffect(() => {
    setCount(justifications.length);
  }, [justifications]);

  // Real-time subscription for metric_justifications table
  useRealTimeSubscription(
    {
      table: 'metric_justifications',
      event: '*',
    },
    () => {
      // Invalidate and refetch when there are changes
      // This will be handled by React Query's automatic refetch
    }
  );

  return {
    count,
    justifications,
    isLoading,
    error,
  };
};
