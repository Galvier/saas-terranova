
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart3, FileText, ShoppingCart, Settings, Users, Star } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAllDepartments, getMetricsByDepartment, getAdminDashboardConfig } from '@/integrations/supabase';

import PageHeader from '@/components/PageHeader';
import KpiCard from '@/components/KpiCard';
import PerformanceChart from '@/components/PerformanceChart';
import { useToast } from '@/hooks/use-toast';
import DepartmentFilter from '@/components/filters/DepartmentFilter';
import DateFilter, { DateRangeType } from '@/components/filters/DateFilter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import UserProfileIndicator from '@/components/UserProfileIndicator';
import DashboardToggle from '@/components/dashboard/DashboardToggle';
import MetricSelectionDialog from '@/components/dashboard/MetricSelectionDialog';
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard';
import { useAuth } from '@/hooks/useAuth';

const Dashboard = () => {
  const { toast } = useToast();
  const { user, isAdmin, userDepartmentId } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>(isAdmin ? "all" : userDepartmentId || "");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('month');
  
  // Admin dashboard customization
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
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
  
  // Load admin dashboard configuration
  const { data: dashboardConfig, isLoading: isLoadingConfig } = useQuery({
    queryKey: ['admin-dashboard-config', user?.id],
    queryFn: async () => {
      if (!user?.id || !isAdmin) return null;
      
      try {
        console.log("Loading dashboard config for user ID:", user.id);
        const result = await getAdminDashboardConfig(user.id);
        console.log("Dashboard config result:", result);
        
        if (result.error) throw new Error(result.message);
        
        return result.data;
      } catch (error) {
        console.error("Error loading admin dashboard config:", error);
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
      // If we have saved metrics, automatically set the view mode to favorites
      if (dashboardConfig.metric_ids.length > 0 && viewMode !== 'favorites') {
        console.log("Automatically switching to favorites view");
        setViewMode('favorites');
      }
    }
  }, [dashboardConfig]);
  
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
    staleTime: 0, // Don't maintain in cache to always fetch updated data
  });
  
  // Function to update selected metrics
  const handleMetricSelectionChange = (newSelectedMetrics: string[]) => {
    console.log("Updating selected metrics:", newSelectedMetrics);
    setSelectedMetrics(newSelectedMetrics);
    
    if (user?.id) {
      // Save to Supabase
      saveAdminDashboardConfig(user.id, newSelectedMetrics);
    }
    
    // Invalidate the query to force a new load
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-config'] });
  };
  
  // Save dashboard configuration to Supabase
  const saveAdminDashboardConfig = async (userId: string, metricIds: string[]) => {
    try {
      console.log("Saving admin dashboard config:", { userId, metricIds });
      const result = await getAdminDashboardConfig.saveAdminDashboardConfig(metricIds, userId);
      
      if (result.error) {
        throw new Error(result.message);
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
  
  // Filter metrics based on view mode and selected metrics
  const filteredMetrics = React.useMemo(() => {
    if (!isAdmin || viewMode === 'all') {
      return metrics;
    }
    
    // For favorites view, only show metrics that are in the selectedMetrics array
    return metrics.filter(metric => selectedMetrics.includes(metric.id));
  }, [metrics, isAdmin, viewMode, selectedMetrics]);

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

  // Process department performance data
  const departmentPerformance = React.useMemo(() => {
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
  const kpiData = React.useMemo(() => {
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
  const monthlyRevenue = React.useMemo(() => {
    // Use sample data if no metrics are available
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

  // Function to render metric cards for selected favorites
  const renderFavoriteMetricCards = () => {
    if (viewMode !== 'favorites' || !selectedMetrics.length) return null;
    
    // Get only metrics that are in the selected favorites list
    const favoriteMetrics = filteredMetrics.filter(metric => 
      selectedMetrics.includes(metric.id)
    );
    
    if (favoriteMetrics.length === 0) {
      return (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Nenhuma métrica encontrada</h3>
          <p className="text-muted-foreground">
            As métricas selecionadas não estão disponíveis para o departamento e período selecionados.
            <Button 
              variant="link" 
              className="p-0 h-auto ml-1"
              onClick={() => setIsMetricSelectionOpen(true)}
            >
              Configurar dashboard
            </Button>
          </p>
        </Card>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        {favoriteMetrics.map(metric => (
          <KpiCard
            key={metric.id}
            title={metric.name}
            value={`${metric.current}${metric.unit ? ` ${metric.unit}` : ''}`}
            status={metric.status as 'success' | 'warning' | 'danger'}
            changeLabel={metric.department_name ? `${metric.department_name}` : ''}
            icon={null}
          />
        ))}
      </div>
    );
  };

  // Function to render metric cards based on priority and visualization type
  const renderMetricCards = () => {
    // Only render these cards in 'all' view mode
    if (viewMode === 'favorites') return null;
    
    // Filter metrics that are not already displayed in main KPI cards
    const additionalMetrics = filteredMetrics.filter(metric => 
      !metric.name.toLowerCase().includes('venda') &&
      !metric.name.toLowerCase().includes('receita') &&
      !metric.name.toLowerCase().includes('cliente') &&
      !metric.name.toLowerCase().includes('usuário') &&
      !metric.name.toLowerCase().includes('conversão') &&
      !metric.name.toLowerCase().includes('taxa') &&
      !metric.name.toLowerCase().includes('projeto') &&
      !metric.name.toLowerCase().includes('tarefa')
    );
    
    if (additionalMetrics.length === 0) return null;
    
    // Sort metrics by priority
    const sortedMetrics = [...additionalMetrics].sort((a, b) => {
      const priorityOrder = { 'critical': 0, 'high': 1, 'normal': 2 };
      const aPriority = a.priority ? priorityOrder[a.priority as keyof typeof priorityOrder] || 2 : 2;
      const bPriority = b.priority ? priorityOrder[b.priority as keyof typeof priorityOrder] || 2 : 2;
      
      // First sort by priority
      if (aPriority !== bPriority) return aPriority - bPriority;
      
      // Then sort by status (critical statuses first)
      const statusOrder = { 'danger': 0, 'warning': 1, 'success': 2 };
      return (statusOrder[a.status as keyof typeof statusOrder] || 2) - 
             (statusOrder[b.status as keyof typeof statusOrder] || 2);
    });
    
    // Group metrics by visualization type
    const cardMetrics = sortedMetrics.filter(m => !m.visualization_type || m.visualization_type === 'card');
    const chartMetrics = sortedMetrics.filter(m => m.visualization_type && m.visualization_type !== 'card');
    
    return (
      <>
        {/* Render card metrics in a grid */}
        {cardMetrics.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-8">Métricas adicionais</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cardMetrics.map(metric => (
                <KpiCard
                  key={metric.id}
                  title={metric.name}
                  value={`${metric.current}${metric.unit ? ` ${metric.unit}` : ''}`}
                  status={metric.status as 'success' | 'warning' | 'danger'}
                  change={Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)} // Mock change data
                  changeLabel="vs. período anterior"
                />
              ))}
            </div>
          </>
        )}
        
        {/* Render chart metrics in a different layout */}
        {chartMetrics.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4 mt-8">Análises de desempenho</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {chartMetrics.map(metric => (
                <PerformanceChart
                  key={metric.id}
                  title={metric.name}
                  data={[
                    { name: 'Atual', value: metric.current },
                    { name: 'Meta', value: metric.target }
                  ]}
                  type={metric.visualization_type === 'bar' ? 'bar' : 'line'}
                  status={metric.status as 'success' | 'warning' | 'danger'}
                  trend={Math.random() * 10 * (Math.random() > 0.5 ? 1 : -1)} // Mock trend data
                />
              ))}
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral dos indicadores de desempenho da empresa"
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
          <DepartmentFilter
            departments={departments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={setSelectedDepartment}
            className="w-full sm:w-[280px]"
          />
          
          <UserProfileIndicator 
            selectedDepartment={selectedDepartment}
            departmentName={departmentName}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
          {isAdmin && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsMetricSelectionOpen(true)}
                className="flex items-center gap-1"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configurar dashboard</span>
              </Button>
              
              <DashboardToggle 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </>
          )}
        </div>
      </div>
      
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
      ) : filteredMetrics.length === 0 && (viewMode === 'favorites' ? selectedMetrics.length > 0 : false) ? (
        <Card className="p-8 text-center">
          <h3 className="text-xl font-medium mb-2">Nenhuma métrica encontrada</h3>
          <p className="text-muted-foreground">
            {viewMode === 'favorites' ? (
              <>
                As métricas selecionadas não estão disponíveis para o departamento e período selecionados.
                <Button 
                  variant="link" 
                  className="p-0 h-auto ml-1"
                  onClick={() => setIsMetricSelectionOpen(true)}
                >
                  Configurar dashboard
                </Button>
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
            renderFavoriteMetricCards()
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard
                  title="Vendas totais"
                  value={`R$ ${kpiData.salesTotal.toLocaleString('pt-BR')}`}
                  change={12.5}
                  changeLabel="vs. período anterior"
                  status="success"
                  icon={<ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                />
                
                <KpiCard
                  title="Novos clientes"
                  value={kpiData.newCustomers.toString()}
                  change={-3.2}
                  changeLabel="vs. período anterior"
                  status="warning"
                  icon={<Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                />
                
                <KpiCard
                  title="Taxa de conversão"
                  value={`${kpiData.conversionRate}%`}
                  change={0.5}
                  changeLabel="vs. período anterior"
                  status="success"
                  icon={<BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                />
                
                <KpiCard
                  title="Projetos abertos"
                  value={kpiData.openProjects.toString()}
                  change={-1}
                  changeLabel="vs. período anterior"
                  status="danger"
                  icon={<FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <PerformanceChart
                  title="Desempenho por departamento"
                  data={departmentPerformance.length > 0 ? departmentPerformance : [{ name: 'Carregando...', value: 0 }]}
                  type="bar"
                  percentage={true}
                  status="success"
                  trend={5.2}
                />
                
                <PerformanceChart
                  title="Receita mensal (R$)"
                  data={monthlyRevenue}
                  color="#10b981"
                  type="line"
                  status="success"
                  trend={3.8}
                />
              </div>
              
              {renderMetricCards()}
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
