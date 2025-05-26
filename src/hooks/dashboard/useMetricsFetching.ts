
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { MetricDefinition, getMetricsByDepartment } from '@/integrations/supabase';
import { DateRangeType } from '@/components/filters/DateFilter';
import { useAuth } from '@/hooks/useAuth';

export const useMetricsFetching = (
  selectedDepartment: string,
  selectedDate: Date,
  dateRangeType: DateRangeType
) => {
  const { toast } = useToast();
  const { isAdmin, userDepartmentId } = useAuth();
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Force department selection to user's department if not admin
  const effectiveDepartment = !isAdmin && userDepartmentId 
    ? userDepartmentId 
    : selectedDepartment;

  // Load metrics data with filters
  const { data: metrics = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard-metrics', effectiveDepartment, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      try {
        setHasError(false);
        setErrorMessage("");
        console.log("Fetching metrics for department:", effectiveDepartment, "date:", format(selectedDate, 'yyyy-MM-dd'));
        const result = await getMetricsByDepartment(
          effectiveDepartment === "all" ? undefined : effectiveDepartment,
          format(selectedDate, 'yyyy-MM-dd')
        );
        
        if (result.error) {
          setHasError(true);
          setErrorMessage("Erro ao carregar métricas");
          throw new Error(result.message);
        }
        
        console.log("Metrics fetched:", result.data?.length || 0, "metrics");
        
        // Se não tiver métricas, exibir uma mensagem amigável
        if (result.data?.length === 0) {
          console.log("No metrics found for the selected criteria");
        }
        
        return result.data || [];
      } catch (error) {
        console.error("Error fetching metrics:", error);
        setHasError(true);
        setErrorMessage("Não foi possível carregar os dados de desempenho");
        toast({
          title: "Erro ao carregar métricas",
          description: "Não foi possível carregar os dados de desempenho",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 0, // Don't maintain in cache to always fetch updated data
  });

  return {
    metrics,
    isLoading,
    isError,
    hasError,
    errorMessage
  };
};
