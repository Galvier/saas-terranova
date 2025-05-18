
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

  // Load admin dashboard configuration - ensure this runs on initial load and login
  const { data: dashboardConfig, isLoading: isLoadingConfig, isError: isConfigError } = useQuery({
    queryKey: ['admin-dashboard-config', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAdmin) return null;
      
      try {
        console.log("Loading dashboard config for user ID:", user.id);
        const result = await getAdminDashboardConfig(user.id);
        console.log("Dashboard config result:", result);
        
        if (result.error) {
          setHasError(true);
          setErrorMessage("Erro ao carregar configuração do dashboard");
          throw new Error(result.message);
        }
        
        return result.data;
      } catch (error) {
        console.error("Error loading admin dashboard config:", error);
        setHasError(true);
        setErrorMessage("Erro ao carregar configuração do dashboard");
        return null;
      }
    },
    enabled: !!user?.id && isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Update selectedMetrics whenever dashboardConfig changes
  useEffect(() => {
    if (dashboardConfig && dashboardConfig.metric_ids && dashboardConfig.metric_ids.length > 0) {
      console.log("Setting selected metrics from dashboard config:", dashboardConfig.metric_ids);
      // Convert UUID array to string array if needed
      setSelectedMetrics(dashboardConfig.metric_ids.map(id => String(id)));
    }
  }, [dashboardConfig]);

  // Save dashboard configuration to Supabase
  const saveAdminDashboardConfigToSupabase = async (userId: string, metricIds: string[]) => {
    try {
      console.log("Saving admin dashboard config:", { userId, metricIds });
      setHasError(false);
      
      const result = await saveAdminDashboardConfig(metricIds, userId);
      
      if (result.error) {
        setHasError(true);
        setErrorMessage(result.message || "Erro ao salvar configuração");
        throw new Error(result.message || "Erro ao salvar configuração");
      }
      
      toast({
        title: "Configuração salva",
        description: "Seu dashboard personalizado foi atualizado com sucesso",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error saving dashboard config:", error);
      setHasError(true);
      setErrorMessage(error.message || "Ocorreu um erro ao salvar suas preferências");
      
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
      saveAdminDashboardConfigToSupabase(user.id, newSelectedMetrics)
        .then(success => {
          if (success) {
            // Invalidate the query to force a fresh load on next access
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard-config'] });
          }
        });
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar configurações",
        variant: "destructive"
      });
    }
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
