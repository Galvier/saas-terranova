
import React from 'react';
import PerformanceChart from '@/components/PerformanceChart';
import { MetricDefinition } from '@/integrations/supabase/types/metric';

interface ChartData {
  name: string;
  value: number;
}

interface PerformanceMetricsProps {
  departmentPerformance: ChartData[];
  monthlyRevenue: ChartData[];
  selectedMetrics: string[];
  metrics: MetricDefinition[];
  viewMode: 'all' | 'favorites';
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  departmentPerformance,
  monthlyRevenue,
  selectedMetrics,
  metrics,
  viewMode
}) => {
  // In "all" mode, always show both charts
  // In "favorites" mode, only show charts that have been explicitly selected
  
  const shouldShowDepartmentChart = () => {
    // Always show in "all" mode
    if (viewMode === 'all') return true;
    
    // In favorites mode, check if any performance chart metric is explicitly selected
    if (!selectedMetrics || !selectedMetrics.length) return false;
    
    // Check if there's a specific metric ID for department performance
    return selectedMetrics.includes('department_performance_chart');
  };
  
  const shouldShowRevenueChart = () => {
    // Always show in "all" mode
    if (viewMode === 'all') return true;
    
    // In favorites mode, check if revenue chart is explicitly selected
    if (!selectedMetrics || !selectedMetrics.length) return false;
    
    // Check if there's a specific metric ID for monthly revenue
    return selectedMetrics.includes('monthly_revenue_chart');
  };
  
  // If no charts should be shown, return null
  if (!shouldShowDepartmentChart() && !shouldShowRevenueChart()) {
    return null;
  }
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {shouldShowDepartmentChart() && (
        <PerformanceChart
          title="Desempenho por departamento"
          data={departmentPerformance.length > 0 ? departmentPerformance : [{ name: 'Carregando...', value: 0 }]}
          type="bar"
          percentage={true}
          status="success"
          trend={5.2}
        />
      )}
      
      {shouldShowRevenueChart() && (
        <PerformanceChart
          title="Receita mensal (R$)"
          data={monthlyRevenue}
          color="#10b981"
          type="line"
          status="success"
          trend={3.8}
        />
      )}
    </div>
  );
};

export default PerformanceMetrics;
