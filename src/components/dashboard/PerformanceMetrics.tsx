
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
}

const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  departmentPerformance,
  monthlyRevenue,
  selectedMetrics,
  metrics
}) => {
  // Only show department performance chart if at least one department metric is selected
  const shouldShowDepartmentChart = () => {
    if (!selectedMetrics || !selectedMetrics.length || !metrics) return false;
    
    // Check if any selected metric is associated with a department
    return metrics.some(metric => 
      selectedMetrics.includes(metric.id) && 
      metric.department_id !== null
    );
  };
  
  // Only show revenue chart if at least one revenue metric is selected
  const shouldShowRevenueChart = () => {
    if (!selectedMetrics || !selectedMetrics.length || !metrics) return false;
    
    // Check if any selected metric contains "receita" in its name and is in the selected metrics list
    return metrics.some(metric => 
      selectedMetrics.includes(metric.id) && 
      (metric.name.toLowerCase().includes('receita') || metric.unit === 'R$')
    );
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
