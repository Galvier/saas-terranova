
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllDepartments, getMetricsByDepartment, getAdminDashboardConfig, saveAdminDashboardConfig } from '@/integrations/supabase';

import PageHeader from '@/components/PageHeader';
import { useToast } from '@/hooks/use-toast';
import DateFilter from '@/components/filters/DateFilter';
import MetricSelectionDialog from '@/components/dashboard/MetricSelectionDialog';
import { useAuth } from '@/hooks/useAuth';

// Refactored components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import FavoriteMetricsView from '@/components/dashboard/FavoriteMetricsView';
import StandardMetricsView from '@/components/dashboard/StandardMetricsView';
import PerformanceMetrics from '@/components/dashboard/PerformanceMetrics';

// Refactored hooks
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';
import { useDepartmentName } from '@/hooks/useDepartmentName';
import { useDashboardPreferences } from '@/hooks/useDashboardPreferences';
import { useInitialDepartment } from '@/hooks/useInitialDepartment';

// Define constants for chart IDs
const DEPARTMENT_PERFORMANCE_CHART_ID = 'department_performance_chart';
const MONTHLY_REVENUE_CHART_ID = 'monthly_revenue_chart';

const DEFAULT_METRIC_ID = 'conversion_rate'; // ID of a default metric to show for new users

const Dashboard = () => {
  const { toast } = useToast();
  const { user, isAdmin, userDepartmentId } = useAuth();
  
  // Dashboard state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMetricSelectionOpen, setIsMetricSelectionOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  
  // Custom hooks for dashboard functionality
  const { dateRangeType, setDateRangeType, viewMode, setViewMode } = useDashboardPreferences(isAdmin);
  const { selectedDepartment, setSelectedDepartment } = useInitialDepartment(isAdmin, userDepartmentId);
  
  // Load departments
  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });
  
  // Get department name
  const departmentName = useDepartmentName(selectedDepartment, departments);
  
  // Load admin dashboard configuration
  const { data: dashboardConfig } = useQuery({
    queryKey: ['admin-dashboard-config', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAdmin) return null;
      
      try {
        const result = await getAdminDashboardConfig(user.id);
        if (result.error) throw new Error(result.message || "Erro ao carregar configuração");
        
        if (result.data) {
          // Set the selected metrics from saved configuration
          const savedMetrics = result.data.metric_ids || [];
          setSelectedMetrics(savedMetrics.length > 0 ? savedMetrics : [DEFAULT_METRIC_ID]);
        } else {
          // For new users with no configuration, set a default metric
          setSelectedMetrics([DEFAULT_METRIC_ID]);
        }
        
        return result.data;
      } catch (error: any) {
        console.error("Erro ao carregar configuração do dashboard:", error);
        return null;
      }
    },
    enabled: !!user?.id && isAdmin,
  });
  
  // Load metrics data with filters
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['dashboard-metrics', selectedDepartment, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      try {
        const result = await getMetricsByDepartment(
          selectedDepartment === "all" ? undefined : selectedDepartment,
          format(selectedDate, 'yyyy-MM-dd')
        );
        if (result.error) throw new Error(result.message);
        return result.data || [];
      } catch (error) {
        console.error("Error fetching metrics:", error);
        toast({
          title: "Erro ao carregar métricas",
          description: "Não foi possível carregar os dados de desempenho",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
  
  // Save changes to selected metrics
  const handleSaveMetricsSelection = async (newSelectedMetrics: string[]) => {
    if (!user?.id) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para salvar configurações",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await saveAdminDashboardConfig(newSelectedMetrics, user.id);
      
      if (result.error) {
        throw new Error(result.message || "Erro ao salvar configuração");
      }
      
      setSelectedMetrics(newSelectedMetrics);
      
      toast({
        title: "Configuração salva",
        description: "Seu dashboard personalizado foi atualizado com sucesso",
      });
    } catch (error: any) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro ao salvar configuração",
        description: error.message || "Ocorreu um erro ao salvar a configuração",
        variant: "destructive"
      });
    }
  };
  
  // Get performance metrics
  const { departmentPerformance, monthlyRevenue } = useDashboardMetrics(metrics);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos indicadores de desempenho da empresa"
      />
      
      <DashboardHeader
        departments={departments}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        departmentName={departmentName}
        isAdmin={isAdmin}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onConfigClick={() => setIsMetricSelectionOpen(true)}
      />
      
      <div className="mb-6">
        <DateFilter
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          dateRangeType={dateRangeType}
          onDateRangeTypeChange={setDateRangeType}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Carregando indicadores...</p>
        </div>
      ) : (
        <>
          {viewMode === 'favorites' && isAdmin && (
            <div className="flex items-center gap-2 mb-4 bg-primary/5 p-2 rounded-md">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Dashboard personalizado: Métricas principais
              </span>
            </div>
          )}
          
          {/* Conditional rendering based on view mode */}
          {viewMode === 'favorites' && isAdmin ? (
            <FavoriteMetricsView 
              metrics={metrics} 
              isLoading={isLoading}
              dateFilter={format(selectedDate, 'yyyy-MM-dd')}
              departmentFilter={selectedDepartment}
              selectedMetrics={selectedMetrics}
            />
          ) : (
            <StandardMetricsView filteredMetrics={metrics} />
          )}
          
          {/* Performance charts section - with proper conditional rendering */}
          <PerformanceMetrics
            departmentPerformance={departmentPerformance}
            monthlyRevenue={monthlyRevenue}
            selectedMetrics={selectedMetrics}
            metrics={metrics}
            viewMode={viewMode}
          />
        </>
      )}
      
      {/* Metric selection dialog for admin dashboard customization */}
      {isAdmin && (
        <MetricSelectionDialog
          open={isMetricSelectionOpen}
          onOpenChange={setIsMetricSelectionOpen}
          metrics={metrics}
          selectedMetrics={selectedMetrics}
          onSelectionChange={handleSaveMetricsSelection}
          includeCharts={true} // Enable chart selection
          chartIds={{
            departmentPerformance: DEPARTMENT_PERFORMANCE_CHART_ID,
            monthlyRevenue: MONTHLY_REVENUE_CHART_ID
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
