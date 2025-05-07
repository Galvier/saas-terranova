
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllDepartments } from '@/integrations/supabase';

import PageHeader from '@/components/PageHeader';
import DateFilter, { DateRangeType } from '@/components/filters/DateFilter';
import { Card } from '@/components/ui/card';
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
  const { data: departments = [] } = useQuery({
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
    kpiData,
    departmentPerformance,
    monthlyRevenue,
    handleMetricSelectionChange
  } = useDashboardMetrics(selectedDepartment, selectedDate, dateRangeType, viewMode);

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
      ) : metrics.length === 0 && (viewMode === 'favorites' ? selectedMetrics.length > 0 : false) ? (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Nenhuma métrica encontrada</h3>
          <p className="text-muted-foreground">
            {viewMode === 'favorites' ? (
              <>
                As métricas selecionadas não estão disponíveis para o departamento e período selecionados.
                <button 
                  className="text-primary underline ml-1"
                  onClick={() => setIsMetricSelectionOpen(true)}
                >
                  Configurar dashboard
                </button>
              </>
            ) : (
              'Não há métricas disponíveis para o departamento e período selecionados.'
            )}
          </p>
        </Card>
      ) : (
        <>
          {viewMode === 'favorites' && isAdmin && (
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
          metrics={metrics}
          selectedMetrics={selectedMetrics}
          onSelectionChange={handleMetricSelectionChange}
        />
      )}
    </div>
  );
};

export default Dashboard;
