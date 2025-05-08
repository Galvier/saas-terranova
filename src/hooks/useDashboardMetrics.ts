import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { MetricDefinition, getAdminDashboardConfig, getMetricsByDepartment, saveAdminDashboardConfig } from '@/integrations/supabase';
import { DateRangeType } from '@/components/filters/DateFilter';

export const useDashboardMetrics = (
  selectedDepartment: string, 
  selectedDate: Date,
  dateRangeType: DateRangeType,
  viewMode: 'all' | 'favorites'
) => {
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

  // Load metrics data with filters
  const { data: metrics = [], isLoading, isError } = useQuery({
    queryKey: ['dashboard-metrics', selectedDepartment, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      try {
        setHasError(false);
        setErrorMessage("");
        console.log("Fetching metrics for department:", selectedDepartment, "date:", format(selectedDate, 'yyyy-MM-dd'));
        const result = await getMetricsByDepartment(
          selectedDepartment === "all" ? undefined : selectedDepartment,
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

  // Save dashboard configuration to Supabase
  const saveAdminDashboardConfigToSupabase = async (userId: string, metricIds: string[]) => {
    try {
      console.log("Saving admin dashboard config:", { userId, metricIds });
      const timestamp = new Date().getTime();
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

  // Filter metrics based on view mode and selected metrics
  const filteredMetrics = useMemo(() => {
    if (!isAdmin || viewMode === 'all') {
      return metrics;
    }
    
    // For favorites view, only show metrics that are in the selectedMetrics array
    return metrics.filter(metric => selectedMetrics.includes(metric.id));
  }, [metrics, isAdmin, viewMode, selectedMetrics]);

  // Process department performance data
  const departmentPerformance = useMemo(() => {
    if (!filteredMetrics.length) return [];
    
    // Group metrics by department and calculate average performance
    const depPerformance = new Map<string, { total: number, count: number }>();
    
    filteredMetrics.forEach((metric) => {
      if (!metric.department_name) return;
      
      // Calculate performance percentage against target
      let perfValue;
      if (metric.lower_is_better) {
        // Lower values are better (target is maximum)
        perfValue = metric.target > 0 ? (1 - Math.min(metric.current / metric.target, 1)) * 100 : 0;
      } else {
        // Higher values are better (target is goal)
        perfValue = metric.target > 0 ? Math.min(metric.current / metric.target, 1) * 100 : 0;
      }
      
      const existing = depPerformance.get(metric.department_name);
      if (existing) {
        existing.total += perfValue;
        existing.count += 1;
      } else {
        depPerformance.set(metric.department_name, { total: perfValue, count: 1 });
      }
    });
    
    // Convert to array format for the chart
    return Array.from(depPerformance.entries()).map(([name, { total, count }]) => ({
      name,
      value: Math.round(total / count),
    }));
  }, [filteredMetrics]);
  
  // Calculate KPI metrics
  const kpiData = useMemo(() => {
    // Default values
    let salesTotal = 0;
    let newCustomers = 0;
    let conversionRate = 0;
    let openProjects = 0;
    
    // Find specific metrics by name or type
    filteredMetrics.forEach((metric) => {
      if (metric.name.toLowerCase().includes('venda') || metric.name.toLowerCase().includes('receita')) {
        salesTotal += metric.current;
      } else if (metric.name.toLowerCase().includes('cliente') || metric.name.toLowerCase().includes('usuário')) {
        newCustomers += Math.round(metric.current);
      } else if (metric.name.toLowerCase().includes('conversão') || metric.name.toLowerCase().includes('taxa')) {
        conversionRate = metric.current;
      } else if (metric.name.toLowerCase().includes('projeto') || metric.name.toLowerCase().includes('tarefa')) {
        openProjects += Math.round(metric.current);
      }
    });
    
    return {
      salesTotal,
      newCustomers,
      conversionRate,
      openProjects
    };
  }, [filteredMetrics]);
  
  // Create monthly revenue data
  const monthlyRevenue = useMemo(() => {
    if (!filteredMetrics.length) {
      return [
        { name: 'Jan', value: 120000 },
        { name: 'Fev', value: 140000 },
        { name: 'Mar', value: 160000 },
        { name: 'Abr', value: 180000 },
        { name: 'Mai', value: 190000 },
        { name: 'Jun', value: 170000 },
      ];
    }
    
    // Find revenue metrics
    const revenueMetrics = filteredMetrics.filter((metric) => 
      metric.name.toLowerCase().includes('receita') && 
      metric.unit === 'R$'
    );
    
    if (revenueMetrics.length === 0) {
      // Use sample data if no revenue metrics available
      return [
        { name: 'Jan', value: 120000 },
        { name: 'Fev', value: 140000 },
        { name: 'Mar', value: 160000 },
        { name: 'Abr', value: 180000 },
        { name: 'Mai', value: 190000 },
        { name: 'Jun', value: 170000 },
      ];
    }
    
    // Process actual revenue data if available
    // This would need to be expanded with real historical data
    return revenueMetrics.slice(0, 6).map((metric, index) => {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      return {
        name: months[index % months.length],
        value: Math.round(metric.current),
      };
    });
  }, [filteredMetrics]);

  // Save preferences
  useEffect(() => {
    try {
      localStorage.setItem('dashboardPreferences', JSON.stringify({
        dateType: dateRangeType,
        viewMode: viewMode,
      }));
    } catch (error) {
      console.error("Error saving preferences", error);
    }
  }, [dateRangeType, viewMode]);

  return {
    metrics, // This now contains all unfiltered metrics for the selection dialog
    isLoading,
    isLoadingConfig,
    selectedMetrics,
    hasError,
    errorMessage,
    isError: isError || isConfigError,
    kpiData,
    departmentPerformance,
    monthlyRevenue,
    handleMetricSelectionChange
  };
};
