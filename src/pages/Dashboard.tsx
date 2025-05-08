
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Star, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllDepartments } from '@/integrations/supabase';

import PageHeader from '@/components/PageHeader';
import DateFilter, { DateRangeType } from '@/components/filters/DateFilter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MetricSelectionDialog from '@/components/dashboard/MetricSelectionDialog';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics';

// Import the refactored components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardKpis from '@/components/dashboard/DashboardKpis';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import FavoriteMetricsGrid from '@/components/dashboard/FavoriteMetricsGrid';
import AdditionalMetricsGrid from '@/components/dashboard/AdditionalMetricsGrid';

const Dashboard = () => {
  const { user, isAdmin, userDepartmentId } = useAuth();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>(isAdmin ? "all" : userDepartmentId || "");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('month');
  
  // Admin dashboard customization
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [isMetricSelectionOpen, setIsMetricSelectionOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState<string>("");
  
  // Determine if we should show the analytics dashboard
  const showAnalyticsDashboard = viewMode === 'all' && selectedDepartment === 'all' && isAdmin;
  
  // Load departments
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.message);
      return result.data || [];
    }
  });
  
  // Set department name when department is selected
  useEffect(() => {
    if (selectedDepartment === 'all') {
      setDepartmentName("Todos os departamentos");
    } else {
      const dept = departments.find(d => d.id === selectedDepartment);
      setDepartmentName(dept?.name || "");
    }
  }, [selectedDepartment, departments]);

  // Load user preferences
  useEffect(() => {
    try {
      const savedPrefs = localStorage.getItem('dashboardPreferences');
      if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        
        if (prefs.dateType) setDateRangeType(prefs.dateType);
        if (prefs.viewMode && isAdmin) setViewMode(prefs.viewMode);
      }
    } catch (error) {
      console.error("Error loading preferences", error);
    }
  }, [isAdmin]);

  // Use custom hook for dashboard metrics
  const {
    metrics,
    isLoading,
    isLoadingConfig,
    selectedMetrics,
    hasError,
    errorMessage,
    kpiData,
    departmentPerformance,
    monthlyRevenue,
    handleMetricSelectionChange
  } = useDashboardMetrics(selectedDepartment, selectedDate, dateRangeType, viewMode);

  console.log("Dashboard rendering - metrics count:", metrics?.length || 0);
  console.log("Selected metrics:", selectedMetrics);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos indicadores de desempenho da empresa"
      />
      
      <DashboardHeader 
        departments={departments}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        departmentName={departmentName}
        isAdmin={isAdmin}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenMetricSelection={() => setIsMetricSelectionOpen(true)}
      />
      
      <div className="mb-6">
        <DateFilter
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          dateRangeType={dateRangeType}
          onDateRangeTypeChange={setDateRangeType as (type: DateRangeType) => void}
        />
      </div>
      
      {isLoading || isLoadingConfig ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Carregando indicadores...</p>
        </div>
      ) : hasError ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-xl font-medium mb-2">Erro ao carregar métricas</h3>
            <p className="text-muted-foreground mb-6">
              {errorMessage || "Não foi possível carregar os dados de desempenho"}
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        </Card>
      ) : metrics.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Nenhuma métrica encontrada</h3>
            <p className="text-muted-foreground mb-6">
              {viewMode === 'favorites' ? (
                <>
                  Você ainda não selecionou métricas favoritas ou não há métricas disponíveis para o período selecionado.
                </>
              ) : (
                'Não há métricas disponíveis para o departamento e período selecionados.'
              )}
            </p>
            {isAdmin && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant={viewMode === 'favorites' ? "outline" : "default"}
                  onClick={() => setIsMetricSelectionOpen(true)}
                >
                  Configurar dashboard
                </Button>
                <Button 
                  variant="default"
                  onClick={() => {
                    // Redirecionar para a página de criar métricas
                    window.location.href = '/admin/metricas';
                  }}
                >
                  Criar nova métrica
                </Button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <>
          {viewMode === 'favorites' && isAdmin && selectedMetrics.length > 0 && (
            <div className="flex items-center gap-2 mb-4 bg-primary/5 p-2 rounded-md">
              <Star className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                Dashboard personalizado: Métricas principais ({selectedMetrics.length} métricas)
              </span>
            </div>
          )}
          
          {/* Conditional rendering of dashboards based on viewMode and selectedDepartment */}
          {showAnalyticsDashboard ? (
            <AnalyticsDashboard metrics={metrics} />
          ) : viewMode === 'favorites' ? (
            /* Only show selected metrics in favorites view */
            <FavoriteMetricsGrid 
              metrics={metrics} 
              selectedMetrics={selectedMetrics} 
              viewMode={viewMode}
              onConfigureClick={() => setIsMetricSelectionOpen(true)}
            />
          ) : (
            <>
              <DashboardKpis kpiData={kpiData} />
              
              <DashboardCharts 
                departmentPerformance={departmentPerformance}
                monthlyRevenue={monthlyRevenue}
              />
              
              <AdditionalMetricsGrid 
                metrics={metrics} 
                viewMode={viewMode} 
              />
            </>
          )}
        </>
      )}
      
      {/* Metric selection dialog for admin dashboard customization */}
      {isAdmin && (
        <MetricSelectionDialog
          open={isMetricSelectionOpen}
          onOpenChange={setIsMetricSelectionOpen}
          metrics={metrics} // Pass all metrics (not filtered) to the dialog
          selectedMetrics={selectedMetrics}
          onSelectionChange={handleMetricSelectionChange}
        />
      )}
    </div>
  );
};

export default Dashboard;
