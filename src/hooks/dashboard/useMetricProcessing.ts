
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
  
  // Calculate KPI metrics based on actual metrics in the selected department
  const kpiData = useMemo(() => {
    // Default values - ensure this always returns the correct KpiData type
    const defaultKpiData = {
      salesTotal: 0,
      newCustomers: 0,
      conversionRate: 0,
      openProjects: 0,
      hasSalesData: false,
      hasCustomerData: false,
      hasConversionData: false,
      hasProjectData: false
    };
    
    // Only process metrics if we're viewing a specific department or all departments
    const metricsToProcess = selectedDepartment === 'all' ? filteredMetrics : 
      filteredMetrics.filter(metric => metric.department_id === selectedDepartment);
    
    // Map specific metrics by their actual names and departments
    metricsToProcess.forEach((metric) => {
      const metricName = metric.name.toLowerCase();
      const deptName = metric.department_name?.toLowerCase() || '';
      
      // Sales/Revenue - only from Financial or Commercial departments
      if ((metricName.includes('receita') || metricName.includes('faturamento')) && 
          (deptName.includes('financeiro') || deptName.includes('comercial'))) {
        defaultKpiData.salesTotal += metric.current;
        defaultKpiData.hasSalesData = true;
      }
      
      // Conversion Rate - only from Commercial department
      if (metricName.includes('conversão') && deptName.includes('comercial')) {
        defaultKpiData.conversionRate = metric.current;
        defaultKpiData.hasConversionData = true;
      }
      
      // Customer metrics - only from Commercial or Marketing departments
      if ((metricName.includes('cliente') || metricName.includes('cac')) && 
          (deptName.includes('comercial') || deptName.includes('marketing'))) {
        defaultKpiData.newCustomers += Math.round(metric.current);
        defaultKpiData.hasCustomerData = true;
      }
      
      // Project metrics - only from specific departments that track projects
      if ((metricName.includes('projeto') || metricName.includes('tarefa')) && 
          !deptName.includes('financeiro')) {
        defaultKpiData.openProjects += Math.round(metric.current);
        defaultKpiData.hasProjectData = true;
      }
    });
    
    return defaultKpiData;
  }, [filteredMetrics, selectedDepartment]);
  
  // Create monthly revenue data - only if there are actual revenue metrics in the selected department
  const monthlyRevenue = useMemo(() => {
    const metricsToProcess = selectedDepartment === 'all' ? filteredMetrics : 
      filteredMetrics.filter(metric => metric.department_id === selectedDepartment);
    
    // Find actual revenue metrics
    const revenueMetrics = metricsToProcess.filter((metric) => {
      const metricName = metric.name.toLowerCase();
      const deptName = metric.department_name?.toLowerCase() || '';
      return (metricName.includes('receita') || metricName.includes('faturamento')) && 
             (deptName.includes('financeiro') || deptName.includes('comercial')) &&
             metric.unit.includes('R$');
    });
    
    if (revenueMetrics.length === 0) {
      return [];
    }
    
    // Create chart data based on actual revenue metrics
    // For now, we'll use current values - this could be enhanced with historical data
    return revenueMetrics.slice(0, 6).map((metric, index) => {
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
      return {
        name: months[index % months.length],
        value: Math.round(metric.current),
      };
    });
  }, [filteredMetrics, selectedDepartment]);

  // Check if charts should be shown based on selected department and actual data
  const shouldShowCharts = useMemo(() => {
    const isAllDepartments = selectedDepartment === 'all';
    const hasRevenueData = monthlyRevenue.length > 0;
    const hasDepartmentData = departmentPerformance.length > 0;
    
    return {
      // Department performance chart only in "all departments" view
      departmentPerformance: isAllDepartments && hasDepartmentData,
      // Monthly revenue chart only if there are actual revenue metrics in the department
      monthlyRevenue: hasRevenueData
    };
  }, [selectedDepartment, monthlyRevenue.length, departmentPerformance.length]);

  return {
    filteredMetrics,
    departmentPerformance,
    kpiData,
    monthlyRevenue,
    shouldShowCharts
  };
};
