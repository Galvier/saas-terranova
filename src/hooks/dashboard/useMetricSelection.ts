
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getAdminDashboardConfig, saveAdminDashboardConfig } from '@/integrations/supabase';

export const useMetricSelection = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Load admin dashboard configuration
  const { data: dashboardConfig, isLoading: isLoadingConfig, isError: isConfigError } = useQuery({
    queryKey: ['admin-dashboard-config', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAdmin) return null;
      
      try {
        console.log("Loading dashboard config for user ID:", user.id);
        const result = await getAdminDashboardConfig(user.id);
        console.log("Dashboard config result:", result);
        
        if (result.error) {
          setErrorMessage("Erro ao carregar configuração do dashboard");
          throw new Error(result.message);
        }
        
        return result.data;
      } catch (error) {
        console.error("Error loading admin dashboard config:", error);
        setErrorMessage("Erro ao carregar configuração do dashboard");
        return null;
      }
    },
    enabled: !!user?.id && isAdmin,
    staleTime: 0, // Always fetch updated data
    gcTime: 0, // Don't keep in cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Update selectedMetrics whenever dashboardConfig changes
  useEffect(() => {
    if (dashboardConfig && dashboardConfig.metric_ids && dashboardConfig.metric_ids.length > 0) {
      console.log("Setting selected metrics from dashboard config:", dashboardConfig.metric_ids);
      setSelectedMetrics(dashboardConfig.metric_ids);
    }
  }, [dashboardConfig]);

  // Save dashboard configuration to Supabase
  const saveAdminDashboardConfigToSupabase = async (userId: string, metricIds: string[]) => {
    try {
      console.log("Saving admin dashboard config:", { userId, metricIds });
      const result = await saveAdminDashboardConfig(metricIds, userId);
      
      if (result.error) {
        throw new Error(result.message || "Erro ao salvar configuração");
      }
      
      toast({
        title: "Configuração salva",
        description: "Seu dashboard personalizado foi atualizado com sucesso",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error saving dashboard config:", error);
      toast({
        title: "Erro ao salvar configuração",
        description: error.message || "Ocorreu um erro ao salvar suas preferências",
        variant: "destructive",
      });
      return false;
    }
  };

  // Function to update selected metrics
  const handleMetricSelectionChange = (newSelectedMetrics: string[]) => {
    console.log("Updating selected metrics:", newSelectedMetrics);
    setSelectedMetrics(newSelectedMetrics);
    
    if (user?.id) {
      // Save to Supabase
      saveAdminDashboardConfigToSupabase(user.id, newSelectedMetrics);
    }
    
    // Invalidate the query to force a new load
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-config'] });
  };

  return {
    selectedMetrics,
    isLoadingConfig,
    isConfigError,
    handleMetricSelectionChange,
    hasError,
    errorMessage
  };
};
