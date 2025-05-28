
import { useMemo } from 'react';
import { MetricDefinition } from '@/integrations/supabase/types/metric';

export const useMetricProcessing = (
  metrics: MetricDefinition[], 
  viewMode: 'all' | 'favorites', 
  selectedMetrics: string[],
  isAdmin: boolean,
  selectedDepartment: string
) => {
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
  
  // Calculate KPI metrics with availability flags
  const kpiData = useMemo(() => {
    // Default values
    let salesTotal = 0;
    let newCustomers = 0;
    let conversionRate = 0;
    let openProjects = 0;
    
    // Track which KPIs have actual data from metrics
    let hasSalesData = false;
    let hasCustomerData = false;
    let hasConversionData = false;
    let hasProjectData = false;
    
    // Find specific metrics by name or type
    filteredMetrics.forEach((metric) => {
      if (metric.name.toLowerCase().includes('venda') || metric.name.toLowerCase().includes('receita')) {
        salesTotal += metric.current;
        hasSalesData = true;
      } else if (metric.name.toLowerCase().includes('cliente') || metric.name.toLowerCase().includes('usuário')) {
        newCustomers += Math.round(metric.current);
        hasCustomerData = true;
      } else if (metric.name.toLowerCase().includes('conversão') || metric.name.toLowerCase().includes('taxa')) {
        conversionRate = metric.current;
        hasConversionData = true;
      } else if (metric.name.toLowerCase().includes('projeto') || metric.name.toLowerCase().includes('tarefa')) {
        openProjects += Math.round(metric.current);
        hasProjectData = true;
      }
    });
    
    return {
      salesTotal,
      newCustomers,
      conversionRate,
      openProjects,
      // Availability flags for each KPI
      hasSalesData,
      hasCustomerData,
      hasConversionData,
      hasProjectData
    };
  }, [filteredMetrics]);
  
  // Create monthly revenue data - only if there are revenue metrics
  const monthlyRevenue = useMemo(() => {
    // Find revenue metrics
    const revenueMetrics = filteredMetrics.filter((metric) => 
      metric.name.toLowerCase().includes('receita') && 
      metric.unit === 'R$'
    );
    
    if (revenueMetrics.length === 0) {
      return [];
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

  // Check if charts should be shown based on selected department
  const shouldShowCharts = useMemo(() => {
    const isAllDepartments = selectedDepartment === 'all';
    const hasRevenueData = monthlyRevenue.length > 0;
    const hasDepartmentData = departmentPerformance.length > 0;
    
    return {
      departmentPerformance: isAllDepartments && hasDepartmentData,
      monthlyRevenue: hasRevenueData,
      // Show KPIs only if we're viewing all departments OR if there's actual data for the specific department
      showKpis: isAllDepartments || (
        kpiData.hasSalesData || 
        kpiData.hasCustomerData || 
        kpiData.hasConversionData || 
        kpiData.hasProjectData
      )
    };
  }, [selectedDepartment, monthlyRevenue.length, departmentPerformance.length, kpiData]);

  return {
    filteredMetrics,
    departmentPerformance,
    kpiData,
    monthlyRevenue,
    shouldShowCharts
  };
};
