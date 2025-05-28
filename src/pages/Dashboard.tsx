
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
import ManagerDashboard from '@/components/dashboard/ManagerDashboard';

const Dashboard = () => {
  const { user, isAdmin, userDepartmentId } = useAuth();
  
  // Initialize selectedDepartment correctly based on user role
  const [selectedDepartment, setSelectedDepartment] = useState<string>(() => {
    return isAdmin ? "all" : userDepartmentId || "";
  });
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('month');
  
  // Admin dashboard customization
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [isMetricSelectionOpen, setIsMetricSelectionOpen] = useState(false);
  const [departmentName, setDepartmentName] = useState<string>("");
  
  // Determine if we should show the analytics dashboard
  const showAnalyticsDashboard = viewMode === 'all' && selectedDepartment === 'all' && isAdmin;
  
  // Check if we're viewing a specific department
  const isSpecificDepartment = selectedDepartment !== 'all';
  
  // Load departments
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getAllDepartments();
      if (result.error) throw new Error(result.error.message || 'Failed to load departments');
      return result.data || [];
    }
  });

  // Fix initial department synchronization for admin users
  useEffect(() => {
    console.log('[Dashboard] User role synchronization:', {
      isAdmin,
      userDepartmentId,
      currentSelectedDepartment: selectedDepartment
    });
    
    if (isAdmin && selectedDepartment !== "all") {
      console.log('[Dashboard] Fixing admin department selection to "all"');
      setSelectedDepartment("all");
    } else if (!isAdmin && userDepartmentId && selectedDepartment !== userDepartmentId) {
      console.log('[Dashboard] Fixing manager department selection to their department');
      setSelectedDepartment(userDepartmentId);
    }
  }, [isAdmin, userDepartmentId]);
  
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
    shouldShowCharts,
    handleMetricSelectionChange
  } = useDashboardMetrics(selectedDepartment, selectedDate, dateRangeType, viewMode);

  console.log("Dashboard rendering - metrics count:", metrics?.length || 0);
  console.log("Selected metrics:", selectedMetrics);
  console.log("Dashboard state:", {
    selectedDepartment,
    isAdmin,
    userDepartmentId,
    showAnalyticsDashboard,
    isSpecificDepartment
  });

  return (
    <div className="animate-fade-in space-y-4 md:space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos indicadores de desempenho da empresa"
      />
      
      <div className="space-y-4 md:space-y-6">
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
        
        <div className="w-full">
          <DateFilter
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            dateRangeType={dateRangeType}
            onDateRangeTypeChange={setDateRangeType as (type: DateRangeType) => void}
          />
        </div>
        
        {isLoading || isLoadingConfig ? (
          <div className="flex justify-center items-center h-32 md:h-64">
            <p className="text-muted-foreground">Carregando indicadores...</p>
          </div>
        ) : hasError ? (
          <Card className="p-4 md:p-8 text-center">
            <div className="flex flex-col items-center justify-center py-4 md:py-8">
              <AlertCircle className="h-8 w-8 md:h-12 md:w-12 text-destructive mb-4" />
              <h3 className="text-lg md:text-xl font-medium mb-2">Erro ao carregar métricas</h3>
              <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base">
                {errorMessage || "Não foi possível carregar os dados de desempenho"}
              </p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        ) : metrics.length === 0 ? (
          <Card className="p-4 md:p-8 text-center">
            <div className="flex flex-col items-center justify-center py-4 md:py-8">
              <AlertCircle className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg md:text-xl font-medium mb-2">Nenhuma métrica encontrada</h3>
              <p className="text-muted-foreground mb-4 md:mb-6 text-sm md:text-base px-4">
                {viewMode === 'favorites' ? (
                  <>
                    Você ainda não selecionou métricas favoritas ou não há métricas disponíveis para o período selecionado.
                  </>
                ) : (
                  'Não há métricas disponíveis para o departamento e período selecionados.'
                )}
              </p>
              {isAdmin && (
                <div className="flex flex-col space-y-2 w-full max-w-xs">
                  <Button 
                    variant={viewMode === 'favorites' ? "outline" : "default"}
                    onClick={() => setIsMetricSelectionOpen(true)}
                    className="w-full"
                  >
                    Configurar dashboard
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {viewMode === 'favorites' && isAdmin && selectedMetrics.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-md">
                <Star className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">
                  Dashboard personalizado: Métricas principais ({selectedMetrics.length} métricas)
                </span>
              </div>
            )}
            
            {/* Conditional rendering based on user role and view mode */}
            {!isAdmin ? (
              /* Manager Dashboard - Only show their department metrics */
              <ManagerDashboard 
                metrics={metrics} 
                departmentName={departmentName}
              />
            ) : showAnalyticsDashboard ? (
              /* Admin Analytics Dashboard - only for "all departments" view */
              <AnalyticsDashboard metrics={metrics} />
            ) : viewMode === 'favorites' ? (
              /* Admin Favorites View */
              <FavoriteMetricsGrid 
                metrics={metrics} 
                selectedMetrics={selectedMetrics} 
                viewMode={viewMode}
                onConfigureClick={() => setIsMetricSelectionOpen(true)}
              />
            ) : (
              /* Admin Dashboard - differentiate between "all departments" and specific department */
              <div className="space-y-4 md:space-y-6">
                {/* Show generic KPIs and Charts only for "all departments" view */}
                {!isSpecificDepartment && (
                  <>
                    <DashboardKpis 
                      kpiData={kpiData} 
                      showAllKpis={selectedDepartment === 'all'}
                      selectedDepartment={selectedDepartment}
                    />
                    
                    <DashboardCharts 
                      departmentPerformance={departmentPerformance}
                      monthlyRevenue={monthlyRevenue}
                      shouldShowCharts={shouldShowCharts}
                      selectedDepartment={selectedDepartment}
                    />
                  </>
                )}
                
                {/* Always show the real metrics for any department */}
                <AdditionalMetricsGrid 
                  metrics={metrics} 
                  viewMode={viewMode} 
                  isAdmin={isAdmin}
                  selectedDepartment={selectedDepartment}
                />
              </div>
            )}
          </div>
        )}
      </div>
      
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
