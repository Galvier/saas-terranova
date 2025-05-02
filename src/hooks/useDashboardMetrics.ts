
import { useMemo } from 'react';
import { MetricDefinition } from '@/integrations/supabase/types/metric';

export const useDashboardMetrics = (metrics: MetricDefinition[]) => {
  // Process department performance data
  const departmentPerformance = useMemo(() => {
    if (!metrics.length) return [];
    
    // Group metrics by department and calculate average performance
    const depPerformance = new Map<string, { total: number, count: number }>();
    
    metrics.forEach((metric) => {
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
  }, [metrics]);
  
  // Create monthly revenue data
  const monthlyRevenue = useMemo(() => {
    // Use sample data if no metrics are available
    if (!metrics.length) {
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
    const revenueMetrics = metrics.filter((metric) => 
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
  }, [metrics]);
  
  return {
    departmentPerformance,
    monthlyRevenue
  };
};
